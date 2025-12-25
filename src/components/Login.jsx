import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '../utils/supabaseClient'
import { createSession } from '../utils/sessionManager'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [showBetaModal, setShowBetaModal] = useState(true)
  const [demoName, setDemoName] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoOrganization, setDemoOrganization] = useState('')
  const [demoSubmitting, setDemoSubmitting] = useState(false)
  
  const handleDemoRequest = async () => {
    if (!demoEmail || !demoName) {
      alert('Please enter your name and email')
      return
    }
    
    setDemoSubmitting(true)
    try {
      const { error } = await supabase
        .from('demo_requests')
        .insert([{
          name: demoName,
          email: demoEmail,
          organization: demoOrganization,
          requested_at: new Date().toISOString()
        }])
      
      if (error) {
        console.error('Error submitting demo request:', error)
        alert('Error submitting demo request. Please try again.')
      } else {
        alert('✅ Demo request submitted! We\'ll be in touch soon.')
        setShowBetaModal(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error submitting demo request.')
    } finally {
      setDemoSubmitting(false)
    }
  }
  
  const createOrUpdateUser = async (email, name, userType, profilePicture = null) => {
    try {
      console.log('🔐 Creating user:', { email, name, userType, profilePicture })
      
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]
      
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking user:', selectError)
      }
      
      if (!existingUser) {
        console.log('📝 Creating new user...')
        
        // Generate patient key for new patients
        let patientKey = null
        if (userType === 'patient') {
          patientKey = Math.floor(100000000 + Math.random() * 900000000).toString()
          console.log('🔑 Generated patient key:', patientKey)
        }
        
        // Try to create user with profile_picture
        let userData = { 
          email, 
          first_name: firstName, 
          last_name: lastName, 
          user_type: userType,
          patient_key: patientKey,
          profile_picture: profilePicture
        }
        
        let { error } = await supabase
          .from('users')
          .insert([userData])
        
        // If error due to profile_picture column, retry without it
        if (error && error.message?.includes('profile_picture')) {
          console.log('⚠️ profile_picture column not found, creating user without it...')
          const { email: e, first_name, last_name, user_type, patient_key } = userData
          const { error: retryError } = await supabase
            .from('users')
            .insert([{ email: e, first_name, last_name, user_type, patient_key }])
          
          if (retryError) {
            console.error('❌ Error creating user (retry):', retryError)
            alert('Error creating account: ' + retryError.message)
            return false
          }
        } else if (error) {
          console.error('❌ Error creating user:', error)
          alert('Error creating account: ' + error.message)
          return false
        }
        console.log('✅ User created', profilePicture ? 'with profile picture' : '')
      } else {
        console.log('✅ User already exists')
        
        // Update profile picture if provided (backward compatible)
        if (profilePicture) {
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({ profile_picture: profilePicture })
              .eq('email', email)
            
            if (updateError && !updateError.message?.includes('profile_picture')) {
              console.error('⚠️ Error updating profile picture:', updateError)
            } else if (!updateError) {
              console.log('✅ Profile picture updated')
            }
          } catch (err) {
            console.log('⚠️ Could not update profile picture (column may not exist)')
          }
        }
        
        // Check if existing patient needs a patient_key
        if (userType === 'patient' && !existingUser.patient_key) {
          console.log('🔑 Existing patient missing patient_key, generating one...')
          const patientKey = Math.floor(100000000 + Math.random() * 900000000).toString()
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ patient_key: patientKey })
            .eq('email', email)
          
          if (updateError) {
            console.error('❌ Error updating patient_key:', updateError)
            // Don't fail login, but log the error
          } else {
            console.log('✅ Patient key generated and saved:', patientKey)
          }
        }
      }
      
      // Create session in Supabase
      console.log('🔑 Creating session...')
      const sessionId = await createSession(email, name, userType, profilePicture)
      if (!sessionId) {
        console.error('❌ Session creation failed')
        alert('Error creating session. Please try again.')
        return false
      }
      console.log('✅ Session created:', sessionId)
      
      return true
    } catch (error) {
      console.error('❌ Login error:', error)
      alert('Login failed: ' + error.message)
      return false
    }
  }




  return (
    <div className="login-page">
      {/* Beta Access Modal - Minimal Design */}
      {showBetaModal && (
        <div style={{
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
          zIndex: 9999,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            animation: 'slideUp 0.25s ease-out'
          }}>
            {/* Logo */}
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/images/Black Elephant Flat Illustrative Company Logo.png" 
                alt="Amma Logo" 
                style={{ 
                  width: '48px', 
                  height: '48px',
                  objectFit: 'contain'
                }} 
              />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.375rem',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
              color: '#0A0A0A'
            }}>
              Beta Access
            </h2>

            {/* Message */}
            <p style={{
              fontSize: '0.9375rem',
              color: '#525252',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '2rem',
              letterSpacing: '-0.01em'
            }}>
              We're in private beta with select healthcare providers.
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              marginBottom: '2rem',
              padding: '1.25rem 0',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#0A0A0A' }}>100+</div>
                <div style={{ fontSize: '0.75rem', color: '#A3A3A3', marginTop: '0.125rem', letterSpacing: '-0.01em' }}>Clinicians</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#0A0A0A' }}>5K+</div>
                <div style={{ fontSize: '0.75rem', color: '#A3A3A3', marginTop: '0.125rem', letterSpacing: '-0.01em' }}>Videos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', color: '#0A0A0A' }}>50%</div>
                <div style={{ fontSize: '0.75rem', color: '#A3A3A3', marginTop: '0.125rem', letterSpacing: '-0.01em' }}>Faster</div>
              </div>
            </div>

            {/* Demo Request Form */}
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Name"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.625rem',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.15s ease-out',
                  outline: 'none',
                  background: '#FAFAFA'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0A0A0A'
                  e.target.style.background = '#FFFFFF'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                  e.target.style.background = '#FAFAFA'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.625rem',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.15s ease-out',
                  outline: 'none',
                  background: '#FAFAFA'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0A0A0A'
                  e.target.style.background = '#FFFFFF'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                  e.target.style.background = '#FAFAFA'
                }}
              />
              <input
                type="text"
                placeholder="Organization (optional)"
                value={demoOrganization}
                onChange={(e) => setDemoOrganization(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.15s ease-out',
                  outline: 'none',
                  background: '#FAFAFA'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0A0A0A'
                  e.target.style.background = '#FFFFFF'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                  e.target.style.background = '#FAFAFA'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <button
                onClick={handleDemoRequest}
                disabled={demoSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: demoSubmitting ? '#A3A3A3' : '#0A0A0A',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  cursor: demoSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease-out',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => !demoSubmitting && (e.target.style.opacity = '0.85')}
                onMouseLeave={(e) => !demoSubmitting && (e.target.style.opacity = '1')}
              >
                {demoSubmitting ? 'Submitting...' : 'Request Access'}
              </button>
              
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  color: '#525252',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#0A0A0A'
                  e.target.style.color = '#0A0A0A'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                  e.target.style.color = '#525252'
                }}
              >
                ← Go Back to Home
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
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="login-container">
        <h1 className="login-title">Welcome to Amma</h1>
        <p className="login-subtitle">Sign in or create an account to get started</p>

        <div className="login-options">
          <div className="login-section">
            <h2>I'm a Patient</h2>
            <p>Access your personalized health information</p>
            <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('✅ Patient login successful:', {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture
                  })
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'patient', decoded.picture)
                  if (success) {
                    navigate('/patient')
                  }
                }}
                onError={() => {
                  console.error('❌ Google login failed')
                  alert('Login failed. Please try again.')
                }}
              />
            </div>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="login-section">
            <h2>I'm a Doctor</h2>
            <p>Manage your practice and patients</p>
            <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('✅ Doctor login successful:', {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture
                  })
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'doctor', decoded.picture)
                  if (success) {
                    navigate('/doctor')
                  }
                }}
                onError={() => {
                  console.error('❌ Google login failed')
                  alert('Login failed. Please try again.')
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login

