import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCurrentSession, logout } from '../sessionManager'
import './Profile.css'

function PatientProfile() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('Patient')
  const [userEmail, setUserEmail] = useState('')
  const [files, setFiles] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  const checkSessionAndLoadData = async () => {
    console.log('👤 PatientProfile: Checking session...')
    
    try {
      const session = await getCurrentSession()
      console.log('👤 Session data:', session)
      
      if (!session || session.userType !== 'patient') {
        console.log('❌ No valid patient session')
        alert('⚠️ No active session found! Please log in.')
        navigate('/login')
        return
      }
      
      console.log('✅ Valid patient session found')
      setUserName(session.name)
      setUserEmail(session.email)
      loadFiles(session.email)
    } catch (error) {
      console.error('❌ Error checking session:', error)
      alert('Error loading profile: ' + error.message)
      navigate('/login')
    }
  }

  const loadFiles = async (email) => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_email', email)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading files:', error)
      } else if (data) {
        const filesList = data.filter(f => f.file_type === 'file')
        const video = data.find(f => f.file_type === 'video')
        setFiles(filesList)
        setVideoUrl(video?.file_url || '')
      }
    } catch (error) {
      console.log('Error loading files:', error)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}><div>Loading...</div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '2rem 6%' }}>
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
            Welcome, {userName}! ❤️
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>Patient Portal</p>
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

        {/* Files and Video Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left: Video */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a1a' }}>
              Your Video
            </h3>
            <div style={{
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              padding: '3rem 2rem',
              textAlign: 'center',
              background: '#fafafa',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              {videoUrl ? (
                <>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎥</div>
                  <p style={{ color: '#999', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Video available!</p>
                  <p style={{ color: '#ccc', fontSize: '0.95rem' }}>(Video player coming soon)</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📹</div>
                  <p style={{ color: '#999', fontSize: '1.125rem', marginBottom: '0.5rem' }}>No video yet</p>
                  <p style={{ color: '#ccc', fontSize: '0.95rem' }}>Your doctor will generate it</p>
                </>
              )}
            </div>
          </div>

          {/* Right: Files */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a1a' }}>
              Your Files ({files.length})
            </h3>
            
            {files.length === 0 ? (
              <div style={{
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: '#fafafa',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ color: '#999', fontSize: '1.125rem', marginBottom: '0.5rem' }}>No files uploaded yet</p>
                <p style={{ color: '#ccc', fontSize: '0.95rem' }}>Your doctor will upload files</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    padding: '1.25rem',
                    background: '#fafafa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '2rem' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: '#1a1a1a' }}>{file.file_name}</p>
                      <p style={{ fontSize: '0.85rem', color: '#999' }}>
                        Uploaded {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default PatientProfile

