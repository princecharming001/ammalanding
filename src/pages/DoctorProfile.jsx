import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { getCurrentSession, logout } from '../utils/sessionManager'
import { isValidPatientKey, unformatPatientKey, formatPatientKey } from '../utils/keyGenerator'
import EpicConnect from '../components/EpicConnect'
import { FiUsers, FiLogOut, FiPlus, FiSearch, FiFileText, FiUser, FiSettings, FiX } from 'react-icons/fi'
import '../components/Profile.css'

// Demo patients with diverse names and realistic profile pictures
const DEMO_PATIENTS = [
  {
    email: 'anish.polakala@example.com',
    name: 'Anish Polakala',
    patientKey: '630651557',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'priya.venkatesh@example.com',
    name: 'Priya Venkatesh',
    patientKey: '847291536',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'kwame.asante@example.com',
    name: 'Kwame Asante',
    patientKey: '562839147',
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'mei.tanaka@example.com',
    name: 'Mei Tanaka',
    patientKey: '391847562',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'adaeze.okonkwo@example.com',
    name: 'Adaeze Okonkwo',
    patientKey: '725183946',
    profilePicture: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'raj.malhotra@example.com',
    name: 'Raj Malhotra',
    patientKey: '483926175',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'hana.kim@example.com',
    name: 'Hana Kim',
    patientKey: '619284753',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'chidi.eze@example.com',
    name: 'Chidi Eze',
    patientKey: '258374916',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'sunita.sharma@example.com',
    name: 'Sunita Sharma',
    patientKey: '847162935',
    profilePicture: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'tunde.williams@example.com',
    name: 'Tunde Williams',
    patientKey: '936582714',
    profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'yuki.nakamura@example.com',
    name: 'Yuki Nakamura',
    patientKey: '174629385',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'amara.diallo@example.com',
    name: 'Amara Diallo',
    patientKey: '593847261',
    profilePicture: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'vikram.patel@example.com',
    name: 'Vikram Patel',
    patientKey: '628174953',
    profilePicture: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'nneka.uche@example.com',
    name: 'Nneka Uche',
    patientKey: '481726395',
    profilePicture: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150&h=150&fit=crop&crop=face'
  }
]

function DoctorProfile() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Doctor')
  const [userEmail, setUserEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [patientKey, setPatientKey] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  const checkSessionAndLoadData = async () => {
    try {
      const session = await getCurrentSession()
      if (!session || session.userType !== 'doctor') {
        alert('⚠️ No active session found! Please log in.')
        navigate('/login')
        return
      }
      
      setUserEmail(session.email)
      setProfilePicture(session.profilePicture || '')
      await loadDoctorName(session.email, session.name)
      loadPatients(session.email)
    } catch (error) {
      console.error('❌ Error checking session:', error)
      alert('Error loading profile: ' + error.message)
      navigate('/login')
    }
  }

  const loadDoctorName = async (email, fallbackName) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('email', email)
        .eq('user_type', 'doctor')
        .single()

      if (error) throw error
      if (data && (data.first_name || data.last_name)) {
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
        setUserName(fullName || fallbackName)
      } else {
        setUserName(fallbackName)
      }
    } catch (error) {
      console.log('Error loading doctor name:', error)
      setUserName(fallbackName)
    }
  }

  const loadPatients = async (docEmail) => {
    try {
      const { data: patientLinks, error: linkError } = await supabase
        .from('doctor_patients')
        .select('patient_email, patient_key')
        .eq('doctor_email', docEmail)

      if (linkError) {
        console.error('Error loading patient links:', linkError)
        // Still show demo patients even if there's an error
        setPatients(DEMO_PATIENTS)
        setLoading(false)
        return
      }

      let patientsWithInfo = []

      if (patientLinks && patientLinks.length > 0) {
        const patientEmails = patientLinks.map(link => link.patient_email)
        
        let patientData = null
        try {
          const result = await supabase
            .from('users')
            .select('email, first_name, last_name, profile_picture')
            .in('email', patientEmails)
            .eq('user_type', 'patient')
          patientData = result.data
        } catch (err) {
          const result = await supabase
            .from('users')
            .select('email, first_name, last_name')
            .in('email', patientEmails)
            .eq('user_type', 'patient')
          patientData = result.data
        }

        patientsWithInfo = patientLinks.map(link => {
          const patientInfo = patientData?.find(p => p.email === link.patient_email)
          const firstName = patientInfo?.first_name || link.patient_email.split('@')[0]
          const lastName = patientInfo?.last_name || ''
          const fullName = `${firstName} ${lastName}`.trim()
          const profilePic = patientInfo?.profile_picture || null
          
          return {
            email: link.patient_email,
            name: fullName || link.patient_email,
            patientKey: link.patient_key,
            profilePicture: profilePic
          }
        })
      }

      // Merge with demo patients, avoiding duplicates
      const realEmails = new Set(patientsWithInfo.map(p => p.email))
      const demoToAdd = DEMO_PATIENTS.filter(demo => !realEmails.has(demo.email))
      
      // Put Anish Polakala first, then real patients, then other demo patients
      const anish = DEMO_PATIENTS.find(p => p.name === 'Anish Polakala')
      const otherDemo = demoToAdd.filter(p => p.name !== 'Anish Polakala')
      
      const finalPatients = [
        ...(anish && !realEmails.has(anish.email) ? [anish] : []),
        ...patientsWithInfo.filter(p => p.email !== 'anish.polakala@example.com'),
        ...otherDemo
      ]

      setPatients(finalPatients)
    } catch (error) {
      console.error('Error in loadPatients:', error)
      // Show demo patients on error
      setPatients(DEMO_PATIENTS)
    }
    setLoading(false)
  }

  const handleAddPatient = async () => {
    if (!patientKey.trim()) {
      alert('Please enter a patient ID')
      return
    }

    const cleanKey = unformatPatientKey(patientKey)
    if (!isValidPatientKey(cleanKey)) {
      alert('❌ Invalid Patient ID format. Please check and try again.')
      return
    }

    try {
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select('email, first_name, last_name, patient_key, profile_picture')
        .eq('patient_key', cleanKey)
        .eq('user_type', 'patient')
        .single()

      if (patientError || !patientData) {
        alert('❌ No patient found with this ID. Please check the ID and try again.')
        return
      }

      const { data: existingLink } = await supabase
        .from('doctor_patients')
        .select('*')
        .eq('doctor_email', userEmail)
        .eq('patient_email', patientData.email)
        .single()

      if (existingLink) {
        alert('⚠️ This patient is already in your roster!')
        setShowModal(false)
        setPatientKey('')
        return
      }

      const { error: insertError } = await supabase
        .from('doctor_patients')
        .insert([{
          doctor_email: userEmail,
          patient_email: patientData.email,
          patient_key: cleanKey
        }])

      if (insertError) {
        console.error('Error linking patient:', insertError)
        alert('❌ Error adding patient: ' + insertError.message)
        return
      }

      alert('✅ Patient added successfully!')
      setShowModal(false)
      setPatientKey('')
      loadPatients(userEmail)
    } catch (error) {
      console.error('Error adding patient:', error)
      alert('❌ Error adding patient: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.patientKey && patient.patientKey.includes(searchQuery))
  )

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
          <p style={{ color: '#525252', fontSize: '0.875rem' }}>Loading dashboard...</p>
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
                Clinical Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#A3A3A3' }}>
                Welcome, Dr. {userName.split(' ')[0]}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <EpicConnect doctorEmail={userEmail} />
            
            <button
              onClick={() => navigate('/doctor/settings')}
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
              <FiSettings size={14} />
              Settings
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
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0A0A0A', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
              Patient Roster
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#A3A3A3', margin: 0 }}>
              Manage your patients and access their medical records
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#0A0A0A',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <FiPlus size={18} />
            Sync Patient
          </button>
        </div>

        {/* Search Bar */}
        {patients.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <FiSearch size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'white',
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
        )}

        {/* Patient List */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          {filteredPatients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px dashed rgba(0, 0, 0, 0.08)'
            }}>
              <FiUsers size={40} color="#A3A3A3" style={{ opacity: 0.5 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#525252', marginTop: '1rem', marginBottom: '0.5rem' }}>
                {searchQuery ? 'No Patients Found' : 'No Patients Yet'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#A3A3A3', maxWidth: '400px', margin: '0 auto 1rem' }}>
                {searchQuery 
                  ? `No patients match "${searchQuery}".`
                  : 'Start by clicking "Add Patient" to sync with a patient using their ID.'
                }
              </p>
              {!searchQuery && (
                <div style={{
                  padding: '0.5rem 1rem',
                  background: '#F0F0F0',
                  borderRadius: '6px',
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#525252'
                }}>
                  💡 Patients share their 9-digit ID with you
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredPatients.map((patient, index) => (
                <div 
                  key={index} 
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease-out',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => navigate('/patient-files', { 
                    state: { patientEmail: patient.email, patientName: patient.name }
                  })}
                >
                  {/* Profile Picture */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    flexShrink: 0
                  }}>
                    {patient.profilePicture ? (
                      <img src={patient.profilePicture} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FiUser size={20} color="#A3A3A3" />
                      </div>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#0A0A0A',
                      margin: 0,
                      letterSpacing: '-0.01em'
                    }}>
                      {patient.name}
                    </h3>
                  </div>

                  {/* Patient ID Badge */}
                  <div style={{
                    background: '#F5F5F5',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#525252',
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                    flexShrink: 0
                  }}>
                    {patient.patientKey ? formatPatientKey(patient.patientKey) : 'No ID'}
                  </div>

                  {/* Manage Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/patient-files', { state: { patientEmail: patient.email, patientName: patient.name }})
                    }}
                    style={{
                      padding: '0.5rem 0.875rem',
                      background: '#0A0A0A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontFamily: 'inherit',
                      transition: 'opacity 0.15s ease-out',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <FiFileText size={14} />
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Patient Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(250, 250, 250, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem',
            animation: 'fadeIn 0.15s ease-out'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              animation: 'slideUp 0.2s ease-out',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: '#A3A3A3',
                transition: 'color 0.15s ease-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0A0A0A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A3A3A3'}
            >
              <FiX size={20} />
            </button>
            
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#0A0A0A',
              letterSpacing: '-0.02em'
            }}>
              Sync with Patient
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#A3A3A3',
              marginBottom: '1.5rem'
            }}>
              Enter the patient's 9-digit ID to connect
            </p>
            
            <input
              type="text"
              value={patientKey}
              onChange={(e) => setPatientKey(e.target.value)}
              placeholder="123-456-789"
              maxLength="11"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1.125rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                marginBottom: '0.75rem',
                fontFamily: 'monospace',
                textAlign: 'center',
                letterSpacing: '0.1em',
                fontWeight: '600',
                outline: 'none',
                transition: 'border-color 0.15s ease-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPatient()}
              autoFocus
            />
            <p style={{
              fontSize: '0.75rem',
              color: '#A3A3A3',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Ask your patient for their ID from their profile
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  color: '#525252',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease-out'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#0A0A0A',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s ease-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Sync Patient
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default DoctorProfile
