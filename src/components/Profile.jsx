import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = location.state?.name || 'User'
  const userEmail = location.state?.email || ''
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('📧 User Data:', { userName, userEmail })
    if (!userEmail) {
      alert('⚠️ No email found! Please log in again.')
      navigate('/login')
      return
    }
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      // Try Supabase first
      const { data, error } = await supabase.from('user_notes').select('*').eq('email', userEmail).single()
      if (error) {
        console.warn('Supabase error - using localStorage fallback:', error.message)
        // Fallback to localStorage if Supabase fails
        const localNotes = localStorage.getItem(`notes_${userEmail}`)
        if (localNotes) setNotes(localNotes)
      } else if (data) {
        setNotes(data.notes || '')
      }
    } catch (error) {
      console.log('Loading from localStorage')
      const localNotes = localStorage.getItem(`notes_${userEmail}`)
      if (localNotes) setNotes(localNotes)
    }
    setLoading(false)
  }

  const saveNotes = async () => {
    console.log('Saving for:', userEmail)
    
    // Try Supabase first
    const { data, error } = await supabase.from('user_notes').upsert({ email: userEmail, name: userName, notes })
    
    if (error) {
      console.error('Supabase save error:', error)
      // Fallback to localStorage
      localStorage.setItem(`notes_${userEmail}`, notes)
      alert('⚠️ Saved locally (Supabase blocked)\n\nFix Supabase RLS to save to cloud!\nSee YOU_MUST_DO_THIS.md')
    }
    else {
      console.log('Saved to Supabase!')
      // Also save to localStorage as backup
      localStorage.setItem(`notes_${userEmail}`, notes)
      alert('Notes saved to cloud! ✅')
    }
  }

  const handleLogout = () => {
    navigate('/login')
  }

  if (loading) return <div className="profile-page"><div className="profile-container">Loading...</div></div>








  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-welcome">Welcome, {userName}! ❤️</h1>
        <p className="profile-subtitle">You're now logged in to Amma</p>
        
        <div style={{ margin: '2rem 0' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.02em' }}>Your Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
            style={{
              width: '100%',
              minHeight: '160px',
              padding: '0.875rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              background: '#FAFAFA',
              transition: 'all 0.15s ease-out',
              resize: 'vertical'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0A0A0A'
              e.currentTarget.style.background = '#FFFFFF'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 10, 10, 0.05)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.background = '#FAFAFA'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button 
            onClick={saveNotes}
            style={{
              marginTop: '0.75rem',
              padding: '0.625rem 1.25rem',
              background: '#0A0A0A',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.15s ease-out',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Save Notes
          </button>
        </div>

        <div className="profile-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

