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
  
  const createOrUpdateUser = async (email, name, userType) => {
    try {
      console.log('🔐 Creating user:', { email, name, userType })
      
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
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([{ 
            email, 
            first_name: firstName, 
            last_name: lastName, 
            user_type: userType 
          }])
        
        if (error) {
          console.error('❌ Error creating user:', error)
          alert('Error creating account: ' + error.message)
          return false
        }
        console.log('✅ User created')
      } else {
        console.log('✅ User already exists')
      }
      
      // Create session in Supabase
      console.log('🔑 Creating session...')
      const sessionId = await createSession(email, name, userType)
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
      {/* Beta Access Modal */}
      {showBetaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(232, 121, 249, 0.2)',
            position: 'relative',
            animation: 'modalSlideIn 0.4s ease-out'
          }}>
            {/* Gradient accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
              borderRadius: '24px 24px 0 0'
            }} />
            
            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              boxShadow: '0 8px 24px rgba(232, 121, 249, 0.3)'
            }}>
              🚀
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Beta Access Only
            </h2>

            {/* Message */}
            <p style={{
              fontSize: '1.125rem',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              We're currently in private beta with select healthcare providers.
              <br />
              <strong style={{ color: '#1a1a1a' }}>Launching publicly soon!</strong>
            </p>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(232, 121, 249, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(232, 121, 249, 0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#A855F7' }}>200+</div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Clinicians</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#A855F7' }}>25K+</div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Videos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#A855F7' }}>50%</div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Decrease in appointment lengths</div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(232, 121, 249, 0.4)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 24px rgba(232, 121, 249, 0.5)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 16px rgba(232, 121, 249, 0.4)'
                }}
              >
                ← Back to Homepage
              </button>
              
              <button
                onClick={() => {
                  const demoSection = document.querySelector('.demo-toggle-btn')
                  navigate('/')
                  setTimeout(() => {
                    demoSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#666',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#A855F7'
                  e.target.style.color = '#A855F7'
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.color = '#666'
                }}
              >
                📅 Book a Demo
              </button>
            </div>

            {/* Footer note */}
            <p style={{
              fontSize: '0.875rem',
              color: '#999',
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #f0f0f0'
            }}>
              Interested in early access? Book a demo to learn more.
            </p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Access your personalized health information</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('Patient login:', decoded)
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'patient')
                  if (success) {
                    navigate('/patient')
                  }
                }}
                onError={() => {
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
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Manage your practice and patients</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('Doctor login:', decoded)
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'doctor')
                  if (success) {
                    navigate('/doctor')
                  }
                }}
                onError={() => {
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

