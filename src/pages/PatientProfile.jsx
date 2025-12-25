import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { getCurrentSession, logout } from '../utils/sessionManager'
import { formatPatientKey, copyToClipboard } from '../utils/keyGenerator'
import { FiVideo, FiMessageCircle, FiCalendar, FiLogOut, FiCopy, FiCheck, FiSend, FiUser, FiHelpCircle, FiHome } from 'react-icons/fi'
import '../components/Profile.css'

function PatientProfile() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Patient')
  const [userEmail, setUserEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [patientKey, setPatientKey] = useState('')
  const [keyCopied, setKeyCopied] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Tab state - 'diagnosis', 'chat', 'recovery'
  const [activeTab, setActiveTab] = useState('diagnosis')
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  
  // Patient medical data for AI chat
  const [patientMedicalData, setPatientMedicalData] = useState(null)
  const [uploadedFilesData, setUploadedFilesData] = useState([])
  
  // Recovery plan state
  const [recoveryVideos, setRecoveryVideos] = useState([])
  const [selectedRecoveryVideo, setSelectedRecoveryVideo] = useState(null)

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  const checkSessionAndLoadData = async () => {
    try {
      const session = await getCurrentSession()
      if (!session || session.userType !== 'patient') {
        alert('⚠️ No active session found! Please log in.')
        navigate('/login')
        return
      }
      
      setUserName(session.name)
      setUserEmail(session.email)
      setProfilePicture(session.profilePicture || '')
      await loadPatientKey(session.email)
      await loadFiles(session.email)
      await loadPatientMedicalData(session.email)
      await loadUploadedFiles(session.email)
      loadRecoveryPlan()
    } catch (error) {
      console.error('❌ Error checking session:', error)
      alert('Error loading profile: ' + error.message)
      navigate('/login')
    }
  }

  const loadPatientKey = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('patient_key, first_name, last_name')
        .eq('email', email)
        .eq('user_type', 'patient')
        .single()

      if (error) throw error
      if (data) {
        if (data.patient_key) setPatientKey(data.patient_key)
        if (data.first_name || data.last_name) {
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
          if (fullName) setUserName(fullName)
        }
      }
    } catch (error) {
      console.log('Error loading patient data:', error)
    }
  }

  const loadFiles = async (email) => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_email', email)
        .eq('file_type', 'video')
        .order('uploaded_at', { ascending: false })
      
      if (error) {
        console.error('Error loading files:', error)
        // Show demo video as fallback
        setVideoUrl('/images/diagnosis-video.mp4')
      } else if (data && data.length > 0) {
        setVideoUrl(data[0].file_url)
      } else {
        // No video yet - show placeholder or demo
        // Video will appear when doctor generates it
      }
    } catch (error) {
      console.log('Error loading files:', error)
      // Show demo video as fallback
      setVideoUrl('/images/diagnosis-video.mp4')
    }
    setLoading(false)
  }

  const loadPatientMedicalData = async (email) => {
    try {
      const { data: epicData, error: epicError } = await supabase
        .from('epic_patient_data')
        .select('*')
        .eq('patient_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (epicError && epicError.code !== 'PGRST116') {
        console.error('Error loading Epic data:', epicError)
      }
      setPatientMedicalData(epicData)
    } catch (error) {
      console.log('Error loading patient medical data:', error)
    }
  }

  const loadUploadedFiles = async (email) => {
    try {
      const { data: filesData, error: filesError } = await supabase
        .from('patient_files')
        .select('extracted_text, file_name')
        .eq('patient_email', email)
        .eq('file_type', 'file')
        .order('created_at', { ascending: false })

      if (filesError) {
        console.error('Error loading uploaded files:', filesError)
      } else {
        setUploadedFilesData(filesData || [])
      }
    } catch (error) {
      console.log('Error loading uploaded files:', error)
    }
  }

  const loadRecoveryPlan = () => {
    const milestones = [1, 3, 5, 7, 10, 14, 17, 21, 24, 30]
    const videos = milestones.map((day) => ({
      day,
      title: `Day ${day} Recovery Checkpoint`,
      description: getRecoveryDescription(day),
      videoUrl: '/images/chatbot-diet-video.mp4',
      locked: day > getCurrentDay()
    }))
    setRecoveryVideos(videos)
  }

  const getRecoveryDescription = (day) => {
    const descriptions = {
      1: 'Initial assessment and care instructions',
      3: 'Early recovery progress check',
      5: 'Wound healing and medication review',
      7: 'First week milestone - mobility assessment',
      10: 'Pain management and physical therapy',
      14: 'Two-week checkup and activity guidance',
      17: 'Mid-recovery wellness check',
      21: 'Three-week progress and independence',
      24: 'Advanced recovery exercises',
      30: 'Final milestone and long-term care plan'
    }
    return descriptions[day] || 'Recovery progress checkpoint'
  }

  const getCurrentDay = () => 7

  const handleCopyKey = async () => {
    const success = await copyToClipboard(patientKey)
    if (success) {
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a friendly AI health assistant helping Anish understand his health. ALWAYS use very simple words a 10-year-old could understand. Be warm and caring.

ABOUT ANISH:
- 32 years old
- Has a brain tumor called "glioblastoma" (GBM) in the right side of his brain
- Found in June 2024 when he had seizures
- Had brain surgery in June 2024 - the doctor removed the tumor
- Now taking medicine (chemotherapy) to make sure no bad cells come back
- On round 4 of 6 medicine rounds - more than halfway done!
- Doing really well!

HIS MEDICINES (explain what each does simply):
1. Temozolomide - The main cancer-fighting medicine. Takes it 5 days, then rests 23 days.
2. Dexamethasone - Keeps brain swelling down. Take with food, 2 times a day.
3. Keppra - Stops seizures. Very important to never miss a dose!
4. Omeprazole - Protects the tummy from other medicines. Take in morning.
5. Ondansetron - Helps when feeling sick to stomach. Take when needed.

ALLERGIC TO: A special dye used in some scans (causes itchy bumps)

COMING UP:
- January 8: Brain scan to check how things look
- January 12: Start round 5 of medicine

HOW HE FEELS: A bit tired sometimes, a little queasy - both normal and being managed well.

RULES FOR YOUR RESPONSES:
- Use VERY simple words, like talking to a child
- Be warm and encouraging  
- Keep answers short (2-4 sentences max)
- Use examples and comparisons to explain things
- Say "Would you like a video that explains this?" when helpful
- If emergency symptoms, say CALL 911 or doctor right away`
            },
            ...chatMessages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      const aiResponseContent = data.choices[0].message.content

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to local response
      const aiResponseContent = generateAIResponse(userMessage, patientMedicalData, uploadedFilesData)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      }])
    }
      setChatLoading(false)
  }

  const handleGenerateVideoFromChat = async (messageIndex) => {
    const medsVideoPath = '/images/chatbot-meds-video.mp4'
    const videoMessage = {
      role: 'assistant',
      content: `Here's a video that explains this in simple terms:`,
      videoUrl: medsVideoPath,
      timestamp: new Date().toISOString()
    }
    setChatMessages(prev => [...prev, videoMessage])
    setVideoUrl(medsVideoPath)

    try {
      await supabase
        .from('patient_files')
        .insert([{
          doctor_email: 'system@amma.health',
          patient_email: userEmail,
          file_type: 'video',
          file_url: demoVideoPath,
          file_name: `ai_generated_video_${new Date().getTime()}.mp4`
        }])
    } catch (error) {
      console.error('Error saving video:', error)
    }
  }

  // Anish Polakala's preloaded medical data for the demo
  const ANISH_DATA = {
    condition: 'glioblastoma multiforme (GBM)',
    conditionSimple: 'a type of brain tumor',
    location: 'right temporal lobe',
    diagnosisDate: 'June 2024',
    surgery: 'craniotomy (brain surgery) on June 18, 2024',
    treatment: 'chemotherapy with temozolomide',
    currentCycle: 'cycle 4 of 6',
    medications: [
      { name: 'Temozolomide', purpose: 'chemotherapy medicine that fights cancer cells', dose: '140mg, days 1-5 every 28 days' },
      { name: 'Dexamethasone', purpose: 'reduces brain swelling', dose: '4mg twice daily' },
      { name: 'Levetiracetam (Keppra)', purpose: 'prevents seizures', dose: '500mg twice daily' },
      { name: 'Omeprazole', purpose: 'protects your stomach from other medications', dose: '20mg daily' },
      { name: 'Ondansetron', purpose: 'helps with nausea from chemo', dose: '8mg as needed' }
    ],
    sideEffects: ['mild tiredness', 'occasional nausea'],
    nextSteps: 'MRI scan on January 8, 2025 and cycle 5 starting January 12, 2025',
    allergies: 'iodinated contrast (causes hives)'
  }

  const generateAIResponse = (userMessage, medicalData, filesData) => {
    const lowerMessage = userMessage.toLowerCase()
    const isAnish = userName.toLowerCase().includes('anish') || userEmail.toLowerCase().includes('anish')
    
    // Use Anish's data for demo
    if (isAnish || true) { // Always use for demo purposes
      
      // Diagnosis questions
      if (lowerMessage.includes('diagnosis') || lowerMessage.includes('condition') || lowerMessage.includes('what do i have') || lowerMessage.includes('what is wrong')) {
        return `You have been diagnosed with ${ANISH_DATA.conditionSimple} called ${ANISH_DATA.condition}, located in the ${ANISH_DATA.location} of your brain. It was found in ${ANISH_DATA.diagnosisDate} after you had seizures. The good news is your doctors caught it early and you've already had successful surgery to remove it. Now you're doing chemotherapy to make sure any remaining cancer cells are gone.`
      }
      
      // Brain tumor specific
      if (lowerMessage.includes('brain') || lowerMessage.includes('tumor') || lowerMessage.includes('gbm') || lowerMessage.includes('glioblastoma') || lowerMessage.includes('cancer')) {
        return `Your brain tumor is called glioblastoma (GBM). Think of it like unwanted cells that grew in your brain. Your surgeon, Dr. Martinez, removed the main tumor in June 2024. Now you're taking medicine (temozolomide) to catch any tiny cells that might still be there. Your latest scans show the treatment is working well!`
      }
      
      // Medication questions
      if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('pill') || lowerMessage.includes('drug') || lowerMessage.includes('taking')) {
        let response = `You're taking 5 medications. Here's what each one does:\n\n`
        ANISH_DATA.medications.forEach(med => {
          response += `• **${med.name}**: ${med.purpose}\n`
        })
        response += `\nTake them exactly as your doctor prescribed. Would you like a video explaining more about any of these?`
        return response
      }
      
      // Temozolomide specific
      if (lowerMessage.includes('temozolomide') || lowerMessage.includes('temodar') || lowerMessage.includes('chemo')) {
        return `Temozolomide is your chemotherapy medicine. It works by damaging the DNA of cancer cells so they can't grow. You take it for 5 days, then get 23 days off to let your body recover. You're on cycle 4 of 6, which means you're more than halfway done! Common side effects are tiredness and nausea - that's why you also have ondansetron for the nausea.`
      }
      
      // Seizure / Keppra questions
      if (lowerMessage.includes('seizure') || lowerMessage.includes('keppra') || lowerMessage.includes('levetiracetam')) {
        return `You take Keppra (levetiracetam) to prevent seizures. Brain tumors can sometimes cause seizures, but this medicine helps control them. You've been seizure-free since starting it! It's very important to take this medicine at the same times every day and never skip a dose. If you ever have a seizure, call 911 right away.`
      }
      
      // Side effects
      if (lowerMessage.includes('side effect') || lowerMessage.includes('tired') || lowerMessage.includes('fatigue') || lowerMessage.includes('nausea') || lowerMessage.includes('sick')) {
        return `The tiredness and occasional nausea you're feeling are normal side effects of chemotherapy. Here's what helps:\n\n• **For tiredness**: Rest when you need to, take short walks when you feel up to it, and don't push yourself too hard.\n\n• **For nausea**: Take your ondansetron as soon as you feel queasy. Eat small, bland meals. Ginger tea can also help.\n\nIf side effects get worse, let Dr. Wilson know right away.`
      }
      
      // Recovery / prognosis
      if (lowerMessage.includes('recovery') || lowerMessage.includes('heal') || lowerMessage.includes('better') || lowerMessage.includes('prognosis')) {
        return `Your recovery is going well! Here's what's ahead:\n\n• **Now**: You're in cycle 4 of chemotherapy\n• **January 8**: MRI scan to check progress\n• **January 12**: Start cycle 5\n• **After cycle 6**: Your doctor will discuss next steps\n\nFocus on rest, eating well, taking your meds on time, and going to all your appointments. Your body is healing every day!`
      }
      
      // Next appointment
      if (lowerMessage.includes('appointment') || lowerMessage.includes('next') || lowerMessage.includes('when') || lowerMessage.includes('schedule')) {
        return `Your upcoming appointments:\n\n• **January 8, 2025**: MRI brain scan to see how treatment is working\n• **January 12, 2025**: Start chemotherapy cycle 5\n\nMake sure to get blood work done a few days before your next chemo cycle so your doctor can check your blood counts are safe for treatment.`
      }
      
      // Diet / eating
      if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
        return `Good nutrition helps your body fight and recover. Here's what helps during chemo:\n\n• **Eat protein**: chicken, fish, eggs, beans help repair your body\n• **Stay hydrated**: drink 8+ glasses of water daily\n• **Small meals**: eat 5-6 small meals instead of 3 big ones\n• **Avoid**: raw fish, unwashed produce (your immune system is weaker right now)\n\nIf food tastes different or you have no appetite, that's normal. Try bland foods like crackers, toast, or soup.`
      }
      
      // Exercise / activity
      if (lowerMessage.includes('exercise') || lowerMessage.includes('activity') || lowerMessage.includes('walk') || lowerMessage.includes('workout')) {
        return `Light activity is good for you! But take it easy:\n\n✅ **OK to do**: Short walks, gentle stretching, light housework\n❌ **Avoid for now**: Heavy lifting, intense workouts, contact sports\n\nListen to your body - if you feel tired, rest. Start with 10-15 minute walks and increase slowly. Exercise can actually help reduce fatigue!`
      }
      
      // Allergy
      if (lowerMessage.includes('allergy') || lowerMessage.includes('allergic') || lowerMessage.includes('contrast')) {
        return `You have a mild allergy to iodinated contrast dye (used in some CT scans). It causes hives. This is in your medical record, but always remind any doctor or technician before you have imaging done. For MRI scans, a different type of contrast is used that is safe for you.`
      }
      
      // Emergency / when to call
      if (lowerMessage.includes('emergency') || lowerMessage.includes('call') || lowerMessage.includes('help') || lowerMessage.includes('worried')) {
        return `Call your doctor or go to the ER if you have:\n\n🚨 **Call 911**: Seizure, sudden severe headache, confusion, trouble speaking or moving\n\n📞 **Call Dr. Wilson**: Fever over 100.4°F, severe nausea/vomiting, unusual bleeding or bruising, signs of infection\n\nYou can also message through the patient portal for non-urgent questions.`
      }

      // Default response for Anish
      return `Hi! I'm here to help you understand your health. You can ask me about:\n\n• Your brain tumor diagnosis\n• Your medications and what they do\n• Managing side effects like tiredness or nausea\n• Your treatment schedule and next steps\n• Diet and activity during treatment\n• When to call your doctor\n\nWhat would you like to know?`
    }
    
    // Fallback for other patients
    return "Hello! I'm your AI health assistant. I can help answer questions about your diagnosis, medications, and recovery. What would you like to know?"
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#FAFAFA'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E5E5',
            borderTopColor: '#0A0A0A',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#525252', fontSize: '0.875rem' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Minimal Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/images/Black Elephant Flat Illustrative Company Logo.png" 
              alt="Amma" 
              style={{ height: '32px', width: '32px', objectFit: 'contain' }}
            />
            <div>
          <h1 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#0A0A0A',
                letterSpacing: '-0.02em'
              }}>
                Patient Portal
          </h1>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#A3A3A3' }}>
                Welcome, {userName.split(' ')[0]}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {patientKey && (
              <button
                onClick={handleCopyKey}
              style={{
                  background: '#F5F5F5',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0A0A0A'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'}
              >
                <span style={{ fontSize: '0.6875rem', color: '#A3A3A3', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'monospace', color: '#0A0A0A' }}>{formatPatientKey(patientKey)}</span>
                {keyCopied ? <FiCheck size={14} color="#059669" /> : <FiCopy size={14} color="#A3A3A3" />}
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.5rem 0.875rem',
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                color: '#525252',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease-out',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
            >
              <FiHome size={14} />
              Home
            </button>

            <button 
              onClick={handleLogout}
              style={{
                padding: '0.5rem 0.875rem',
                background: '#0A0A0A',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease-out',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <FiLogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
          <div style={{
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex',
          gap: '0.25rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          {[
            { id: 'diagnosis', label: 'Diagnosis Video', icon: FiVideo },
            { id: 'chat', label: 'AI Assistant', icon: FiMessageCircle },
            { id: 'recovery', label: 'Recovery Plan', icon: FiCalendar }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? '#0A0A0A' : 'transparent'}`,
                  color: isActive ? '#0A0A0A' : '#A3A3A3',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#525252' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#A3A3A3' }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Diagnosis Video Tab */}
        {activeTab === 'diagnosis' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#0A0A0A',
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                Your Personalized Video
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#A3A3A3', margin: 0 }}>
                Watch to understand your diagnosis and treatment plan
              </p>
            </div>

            {videoUrl ? (
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000'
              }}>
                <video 
                  controls 
                  style={{ width: '100%', maxHeight: '500px', display: 'block' }}
                  src={videoUrl}
                />
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px dashed rgba(0, 0, 0, 0.1)'
              }}>
                <FiVideo size={40} color="#A3A3A3" style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#525252', margin: '1rem 0 0.5rem' }}>
                  No Video Available Yet
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#A3A3A3', maxWidth: '400px', margin: '0 auto' }}>
                  Your doctor will generate a personalized video explanation of your diagnosis. 
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#0A0A0A',
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                AI Health Assistant
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#A3A3A3', margin: 0 }}>
                Ask questions about your condition, medications, and recovery
              </p>
            </div>

            {/* Chat Messages */}
            <div style={{
              minHeight: '350px',
              maxHeight: '450px',
              overflowY: 'auto',
              marginBottom: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '2.5rem' }}>
                  <FiHelpCircle size={36} color="#A3A3A3" style={{ opacity: 0.5 }} />
                  <p style={{ color: '#A3A3A3', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                    Start by asking a question below
                  </p>
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', margin: '1.25rem auto 0' }}>
                    {['What is my diagnosis?', 'Tell me about my medications', 'How long will recovery take?'].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(suggestion)}
                        style={{
                          padding: '0.625rem 0.875rem',
                          background: 'white',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '6px',
                          color: '#525252',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-out',
                          textAlign: 'left',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                          maxWidth: '70%',
                          padding: '0.75rem 1rem',
                          borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          background: msg.role === 'user' ? '#0A0A0A' : 'white',
                          color: msg.role === 'user' ? 'white' : '#0A0A0A',
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                          fontSize: '0.875rem',
                          lineHeight: '1.5'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                      
                      {msg.videoUrl && (
                        <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', maxWidth: '70%' }}>
                          <video controls style={{ width: '100%', display: 'block' }} src={msg.videoUrl} />
                        </div>
                      )}
                      
                      {msg.role === 'assistant' && !msg.videoUrl && (
                        <div style={{ marginTop: '0.375rem' }}>
                          <button
                            onClick={() => handleGenerateVideoFromChat(idx)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#0A0A0A',
                              border: 'none',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontFamily: 'inherit',
                              transition: 'opacity 0.15s ease-out'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <FiVideo size={12} />
                            Generate Video
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', color: '#A3A3A3' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A0A0A', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A0A0A', animation: 'pulse 1.5s ease-in-out 0.2s infinite' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A0A0A', animation: 'pulse 1.5s ease-in-out 0.4s infinite' }} />
                      <span style={{ marginLeft: '0.375rem', fontSize: '0.8125rem' }}>Thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                  placeholder="Ask a question about your health..."
                  style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                  minHeight: '48px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-out'
                  }}
                onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'}
                />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: chatInput.trim() && !chatLoading ? '#0A0A0A' : '#E5E5E5',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s ease-out'
                }}
              >
                <FiSend size={14} />
                Send
              </button>
            </div>
          </div>
        )}

        {/* Recovery Plan Tab */}
        {activeTab === 'recovery' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#0A0A0A',
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                30-Day Recovery Plan
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#A3A3A3', margin: 0 }}>
                Your personalized recovery milestones and educational videos
              </p>
              </div>

            {/* Recovery Timeline */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              {recoveryVideos.map((video, idx) => {
                const currentDay = getCurrentDay()
                const isUnlocked = video.day <= currentDay
                const isCurrent = video.day === currentDay
                
                return (
                  <div 
                    key={idx}
                    onClick={() => isUnlocked && setSelectedRecoveryVideo(video)}
                    style={{
                      background: isCurrent ? '#0A0A0A' : (isUnlocked ? 'white' : '#F9FAFB'),
                      borderRadius: '10px',
                      padding: '1.25rem',
                      border: isUnlocked ? '1px solid rgba(0, 0, 0, 0.06)' : '1px dashed rgba(0, 0, 0, 0.1)',
                      opacity: isUnlocked ? 1 : 0.5,
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease-out',
                      color: isCurrent ? 'white' : '#0A0A0A'
                    }}
                    onMouseEnter={(e) => { if (isUnlocked && !isCurrent) { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
                    onMouseLeave={(e) => { if (isUnlocked && !isCurrent) { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)' } }}
                  >
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      marginBottom: '0.5rem',
                      color: isCurrent ? 'white' : '#0A0A0A'
                    }}>
                      Day {video.day}
                    </div>
                    <h3 style={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: '600',
                      marginBottom: '0.375rem',
                      color: isCurrent ? 'white' : '#0A0A0A'
                    }}>
                      {video.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.8125rem',
                      color: isCurrent ? 'rgba(255, 255, 255, 0.8)' : '#A3A3A3',
                      lineHeight: '1.4',
                      marginBottom: '0.75rem'
                    }}>
                      {video.description}
                    </p>
                    {isUnlocked ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: isCurrent ? 'white' : '#0A0A0A'
                      }}>
                        <FiVideo size={14} />
                        {isCurrent ? 'Watch Now' : 'Available'}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#A3A3A3', fontWeight: '500' }}>
                        🔒 Unlocks Day {video.day}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#F9FAFB', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0A0A0A' }}>Recovery Progress</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0A0A0A' }}>Day {getCurrentDay()} of 30</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#E5E5E5',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(getCurrentDay() / 30) * 100}%`,
                  height: '100%',
                  background: '#0A0A0A',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Recovery Video Modal */}
        {selectedRecoveryVideo && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '2rem',
              animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={() => setSelectedRecoveryVideo(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '800px',
                overflow: 'hidden',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
                animation: 'slideUp 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video Player */}
              <div style={{ background: '#000' }}>
                <video 
                  controls 
                  autoPlay
                  style={{ width: '100%', maxHeight: '450px', display: 'block' }}
                  src={selectedRecoveryVideo.videoUrl}
                />
      </div>

              {/* Video Info */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: '#0A0A0A',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  Day {selectedRecoveryVideo.day}
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#0A0A0A',
                  margin: '0 0 0.5rem 0',
                  letterSpacing: '-0.02em'
                }}>
                  {selectedRecoveryVideo.title}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#525252',
                  margin: '0 0 1rem 0',
                  lineHeight: '1.5'
                }}>
                  {selectedRecoveryVideo.description}
                </p>
                <button
                  onClick={() => setSelectedRecoveryVideo(null)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#0A0A0A',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.15s ease-out'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PatientProfile
