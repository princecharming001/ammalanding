import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCurrentSession, logout } from '../sessionManager'
import './Profile.css'

function DoctorProfile() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Doctor')
  const [userEmail, setUserEmail] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [patientEmail, setPatientEmail] = useState('')

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  const checkSessionAndLoadData = async () => {
    console.log('👨‍⚕️ DoctorProfile: Checking session...')
    
    try {
      const session = await getCurrentSession()
      console.log('👨‍⚕️ Session data:', session)
      
      if (!session || session.userType !== 'doctor') {
        console.log('❌ No valid doctor session')
        alert('⚠️ No active session found! Please log in.')
        navigate('/login')
        return
      }
      
      console.log('✅ Valid doctor session found')
      console.log('📧 Doctor Data:', { userName: session.name, userEmail: session.email })
      setUserName(session.name)
      setUserEmail(session.email)
      loadPatients(session.email)
    } catch (error) {
      console.error('❌ Error checking session:', error)
      alert('Error loading profile: ' + error.message)
      navigate('/login')
    }
    }

  const loadPatients = async (email) => {
    try {
      const { data, error } = await supabase
        .from('doctor_patients')
        .select('*')
        .eq('doctor_email', email)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading patients:', error)
      } else if (data) {
        setPatients(data.map(p => ({
          email: p.patient_email,
          name: p.patient_name,
          avatar: p.patient_avatar
        })))
      }
    } catch (error) {
      console.log('Error loading patients:', error)
    }
    setLoading(false)
  }

  const addPatient = async () => {
    if (!patientEmail.trim()) {
      alert('Please enter a patient email')
      return
    }
    
    // Check if already added
    if (patients.some(p => p.email === patientEmail.trim())) {
      alert('Patient already added!')
      return
    }

    const newPatient = {
      doctor_email: userEmail,
      patient_email: patientEmail.trim(),
      patient_name: patientEmail.split('@')[0],
      patient_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${patientEmail}`
    }

    const { data, error } = await supabase
      .from('doctor_patients')
      .insert([newPatient])
    
    if (error) {
      console.error('Error adding patient:', error)
      alert('❌ Error syncing patient: ' + error.message)
      return
    }

    // Reload patients from database
    await loadPatients(userEmail)
    
    setPatientEmail('')
    setShowModal(false)
    alert('Patient synced successfully! ✅')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}><div>Loading...</div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '2rem 6%', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #E879F9 0%, #F472B6 50%, #A855F7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome, Dr. {userName}! 👨‍⚕️
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>Clinical Dashboard</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                color: '#666',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              ← Home
            </button>
            <button 
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Patients Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          minHeight: '400px'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2rem', color: '#1a1a1a' }}>
            My Patients
          </h3>

          {patients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#999'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No patients yet</p>
              <p style={{ fontSize: '0.95rem' }}>Click the + button to sync with a patient</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '2rem',
              padding: '1rem'
            }}>
              {patients.map((patient, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div 
            style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #E879F9',
                      boxShadow: '0 4px 12px rgba(232, 121, 249, 0.2)',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/patient-files', { 
                      state: { 
                        patientEmail: patient.email, 
                        patientName: patient.name
                      } 
                    })}
                  >
                    <img 
                      src={patient.avatar} 
                      alt={patient.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                      fontWeight: '600', 
                      fontSize: '0.95rem',
                      color: '#1a1a1a',
                      marginBottom: '0.25rem'
                    }}>
                      {patient.name}
                    </p>
                    <p style={{ 
                      fontSize: '0.8rem',
                      color: '#999',
                      marginBottom: '0.5rem'
                    }}>
                      {patient.email}
                    </p>
          <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/patient-files', { 
                          state: { 
                            patientEmail: patient.email, 
                            patientName: patient.name
                          } 
                        })
                      }}
            style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
              color: 'white',
              border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
                      📁 Manage Files
          </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Button (Bottom Right) */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
          border: 'none',
          color: 'white',
          fontSize: '2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(232, 121, 249, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        +
      </button>

      {/* Modal Popup */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a1a' }}>
              Sync with Patient
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1.5rem' }}>
              Enter patient's email to sync with their account
            </p>
            <input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="patient@email.com"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '1rem',
                fontFamily: 'inherit'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addPatient()}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  color: '#666',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
          </button>
              <button
                onClick={addPatient}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(232, 121, 249, 0.3)'
                }}
              >
                Sync Patient
          </button>
        </div>
      </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfile
