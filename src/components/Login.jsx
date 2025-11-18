import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '../supabaseClient'
import { createSession } from '../sessionManager'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  
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

