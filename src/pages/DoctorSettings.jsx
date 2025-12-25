import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { getCurrentSession } from '../utils/sessionManager'
import { FiArrowLeft, FiUser, FiCamera, FiSave, FiUpload, FiMic, FiPlay, FiPause, FiTrash2 } from 'react-icons/fi'

function DoctorSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [sessionName, setSessionName] = useState('') // Name from Google login
  const [sessionPicture, setSessionPicture] = useState('') // Picture from Google login
  
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [doctorPhoto, setDoctorPhoto] = useState('')
  const [clinicLogo, setClinicLogo] = useState('')
  const [voiceClip, setVoiceClip] = useState('')
  
  // Preview state
  const [profilePreview, setProfilePreview] = useState('')
  const [doctorPhotoPreview, setDoctorPhotoPreview] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  
  // Audio ref
  const audioRef = useRef(null)

  useEffect(() => {
    loadDoctorData()
  }, [])

  const loadDoctorData = async () => {
    try {
      const session = await getCurrentSession()
      if (!session || session.userType !== 'doctor') {
        alert('⚠️ No active session found! Please log in.')
        navigate('/login')
        return
      }
      
      setUserEmail(session.email)
      setSessionName(session.name || '')
      setSessionPicture(session.profilePicture || '')
      
      // Parse name from Google login as defaults
      const nameParts = (session.name || '').trim().split(' ')
      const defaultFirstName = nameParts[0] || ''
      const defaultLastName = nameParts.slice(1).join(' ') || ''
      
      // Load doctor details from localStorage first
      const localStorageKey = `doctor_settings_${session.email}`
      const savedData = localStorage.getItem(localStorageKey)
      
      if (savedData) {
        const data = JSON.parse(savedData)
        setFirstName(data.first_name || defaultFirstName)
        setLastName(data.last_name || defaultLastName)
        setClinicName(data.clinic_name || '')
        setProfilePicture(data.profile_picture || session.profilePicture || '')
        setDoctorPhoto(data.doctor_photo || '')
        setClinicLogo(data.clinic_logo || '')
        setVoiceClip(data.voice_clip || '')
        setProfilePreview(data.profile_picture || session.profilePicture || '')
        setDoctorPhotoPreview(data.doctor_photo || '')
        setLogoPreview(data.clinic_logo || '')
      } else {
        // Try loading from database as fallback
        try {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, clinic_name, profile_picture, doctor_photo, clinic_logo, voice_clip')
            .eq('email', session.email)
            .eq('user_type', 'doctor')
            .single()
          
          if (data) {
            setFirstName(data.first_name || defaultFirstName)
            setLastName(data.last_name || defaultLastName)
            setClinicName(data.clinic_name || '')
            setProfilePicture(data.profile_picture || session.profilePicture || '')
            setDoctorPhoto(data.doctor_photo || '')
            setClinicLogo(data.clinic_logo || '')
            setVoiceClip(data.voice_clip || '')
            setProfilePreview(data.profile_picture || session.profilePicture || '')
            setDoctorPhotoPreview(data.doctor_photo || '')
            setLogoPreview(data.clinic_logo || '')
          } else {
            // No database record - use Google login defaults
            setFirstName(defaultFirstName)
            setLastName(defaultLastName)
            setProfilePicture(session.profilePicture || '')
            setProfilePreview(session.profilePicture || '')
          }
        } catch (dbError) {
          console.log('Database not available, using defaults')
          setFirstName(defaultFirstName)
          setLastName(defaultLastName)
          setProfilePicture(session.profilePicture || '')
          setProfilePreview(session.profilePicture || '')
        }
      }
    } catch (error) {
      console.error('Error loading doctor data:', error)
    }
    setLoading(false)
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result)
        setProfilePicture(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDoctorPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setDoctorPhotoPreview(reader.result)
        setDoctorPhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
        setClinicLogo(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceClipChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file (MP3, WAV, M4A, etc.)')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setVoiceClip(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePlayVoice = () => {
    if (audioRef.current) {
      if (isPlayingVoice) {
        audioRef.current.pause()
        setIsPlayingVoice(false)
      } else {
        audioRef.current.play()
        setIsPlayingVoice(true)
      }
    }
  }

  const handleRemoveVoice = () => {
    setVoiceClip('')
    setIsPlayingVoice(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage for local development
      const localStorageKey = `doctor_settings_${userEmail}`
      const dataToSave = {
        email: userEmail,
        user_type: 'doctor',
        first_name: firstName,
        last_name: lastName,
        clinic_name: clinicName,
        profile_picture: profilePicture,
        doctor_photo: doctorPhoto,
        clinic_logo: clinicLogo,
        voice_clip: voiceClip,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave))
      
      // Also try to save to Supabase in background (non-blocking)
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', userEmail)
          .eq('user_type', 'doctor')
          .single()
        
        if (existingUser) {
          await supabase
            .from('users')
            .update({
              first_name: firstName,
              last_name: lastName,
              clinic_name: clinicName,
              profile_picture: profilePicture,
              doctor_photo: doctorPhoto,
              clinic_logo: clinicLogo,
              voice_clip: voiceClip
            })
            .eq('email', userEmail)
            .eq('user_type', 'doctor')
        } else {
          await supabase
            .from('users')
            .insert([dataToSave])
        }
      } catch (dbError) {
        console.log('Database save skipped (running locally):', dbError)
      }
      
      alert('✅ Profile saved successfully!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('❌ Error saving profile: ' + error.message)
    }
    setSaving(false)
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
          <p style={{ color: '#525252', fontSize: '0.875rem' }}>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/doctor')}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                color: '#525252',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease-out'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#0A0A0A',
                letterSpacing: '-0.02em'
              }}>
                Profile Settings
              </h1>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#A3A3A3' }}>
                Manage your doctor profile
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: '#0A0A0A',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'opacity 0.15s ease-out',
              fontFamily: 'inherit',
              opacity: saving ? 0.6 : 1
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.opacity = '1' }}
          >
            <FiSave size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Account Picture Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Account Picture
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: '0 0 1.25rem 0' }}>
            Your profile picture shown in the dashboard header
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(0, 0, 0, 0.06)',
              background: '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiUser size={28} color="#A3A3A3" />
              )}
            </div>
            
            <div>
              <label
                htmlFor="profile-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  color: '#525252',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
              >
                <FiCamera size={14} />
                Upload
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: 'none' }}
              />
              {sessionPicture && profilePreview !== sessionPicture && (
                <button
                  onClick={() => { setProfilePreview(sessionPicture); setProfilePicture(sessionPicture) }}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    color: '#525252',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease-out'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
                >
                  Use Google Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Photo for AI Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Doctor Photo for AI Videos
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: '0 0 1.25rem 0' }}>
            Professional photo used in AI-generated patient video explanations
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(0, 0, 0, 0.06)',
              background: '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {doctorPhotoPreview ? (
                <img src={doctorPhotoPreview} alt="Doctor Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiUser size={40} color="#A3A3A3" />
              )}
            </div>
            
            <div>
              <label
                htmlFor="doctor-photo-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  color: '#525252',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
              >
                <FiCamera size={14} />
                Upload Doctor Photo
              </label>
              <input
                id="doctor-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleDoctorPhotoChange}
                style={{ display: 'none' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#A3A3A3', margin: '0.5rem 0 0 0' }}>
                Use a high-quality, well-lit photo. This will be used for AI video generation.
              </p>
              {doctorPhotoPreview && (
                <button
                  onClick={() => { setDoctorPhotoPreview(''); setDoctorPhoto('') }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '4px',
                    color: '#525252',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Information Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 1.25rem 0', letterSpacing: '-0.02em' }}>
            Doctor Information
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#525252', marginBottom: '0.375rem' }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-out'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#525252', marginBottom: '0.375rem' }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-out'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#525252', marginBottom: '0.375rem' }}>
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: '#F9FAFB',
                color: '#A3A3A3'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#A3A3A3', margin: '0.25rem 0 0 0' }}>
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Clinic Information Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 1.25rem 0', letterSpacing: '-0.02em' }}>
            Clinic Information
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#525252', marginBottom: '0.375rem' }}>
              Clinic Name
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Valley Medical Center"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s ease-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '500', color: '#525252', marginBottom: '0.75rem' }}>
              Clinic Logo
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '120px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Clinic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }} />
                ) : (
                  <FiUpload size={24} color="#A3A3A3" />
                )}
              </div>
              
              <div>
                <label
                  htmlFor="logo-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    color: '#525252',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-out'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
                >
                  <FiUpload size={14} />
                  Upload Logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#A3A3A3', margin: '0.5rem 0 0 0' }}>
                  Recommended: 200x100px or larger
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Clone Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Voice Sample
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: '0 0 1.25rem 0' }}>
            Upload a voice sample to personalize AI-generated video explanations
          </p>
          
          {voiceClip ? (
            <div style={{
              background: '#F9FAFB',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiMic size={20} color="white" />
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0A0A0A', margin: 0 }}>
                    Voice Sample Uploaded
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#A3A3A3', margin: '0.125rem 0 0 0' }}>
                    Ready for voice cloning
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handlePlayVoice}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#0A0A0A',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 0.15s ease-out'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {isPlayingVoice ? <FiPause size={14} /> : <FiPlay size={14} style={{ marginLeft: '2px' }} />}
                  </button>
                  
                  <button
                    onClick={handleRemoveVoice}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      color: '#525252',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease-out'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#0A0A0A' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Hidden audio element for playback */}
              <audio 
                ref={audioRef} 
                src={voiceClip} 
                onEnded={() => setIsPlayingVoice(false)}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid rgba(0, 0, 0, 0.06)',
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiMic size={28} color="#A3A3A3" />
              </div>
              
              <div>
                <label
                  htmlFor="voice-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    color: '#525252',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-out'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
                >
                  <FiUpload size={14} />
                  Upload Voice Sample
                </label>
                <input
                  id="voice-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceClipChange}
                  style={{ display: 'none' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#A3A3A3', margin: '0.5rem 0 0 0' }}>
                  MP3, WAV, M4A, or OGG. 30-60 seconds recommended.
                </p>
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem',
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#525252', margin: 0, lineHeight: '1.5' }}>
              <strong style={{ color: '#0A0A0A' }}>Tips:</strong> Record in a quiet environment. 
              Speak naturally at your normal pace. Avoid background noise.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default DoctorSettings
