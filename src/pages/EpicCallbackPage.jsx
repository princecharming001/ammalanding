import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleEpicCallback } from '../utils/epicClient';

function EpicCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting to Epic...');

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // Get code and state from URL parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setMessage(`Epic authorization failed: ${errorDescription || error}`);
        console.error('Epic OAuth error:', error, errorDescription);
        setTimeout(() => navigate('/doctor'), 3000);
        return;
      }

      // Validate parameters
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Epic');
        setTimeout(() => navigate('/doctor'), 3000);
        return;
      }

      if (!state) {
        setStatus('error');
        setMessage('No state parameter received - possible security issue');
        setTimeout(() => navigate('/doctor'), 3000);
        return;
      }

      setMessage('Exchanging authorization code for access token...');

      // Handle the callback and store tokens
      const result = await handleEpicCallback(code, state);

      if (result.success) {
        setStatus('success');
        setMessage('Successfully connected to Epic! Redirecting...');
        console.log('✅ Epic connection successful');
        
        // Redirect to doctor profile after 2 seconds
        setTimeout(() => navigate('/doctor'), 2000);
      } else {
        throw new Error('Callback processing failed');
      }

    } catch (error) {
      console.error('❌ Epic callback error:', error);
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
      setTimeout(() => navigate('/doctor'), 4000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAFA',
      padding: '2rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        {/* Status Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          background: status === 'processing' ? '#0A0A0A' :
                      status === 'success' ? '#059669' :
                      '#DC2626',
          color: 'white',
          animation: status === 'processing' ? 'spin 2s linear infinite' : 'none'
        }}>
          {status === 'processing' && '⏳'}
          {status === 'success' && '✓'}
          {status === 'error' && '✕'}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#0A0A0A',
          letterSpacing: '-0.02em'
        }}>
          {status === 'processing' && 'Connecting...'}
          {status === 'success' && 'Connected'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '0.875rem',
          color: '#A3A3A3',
          lineHeight: '1.6',
          marginBottom: '1.5rem',
          letterSpacing: '-0.01em'
        }}>
          {message}
        </p>

        {/* Progress indicator */}
        {status === 'processing' && (
          <div style={{
            width: '100%',
            height: '3px',
            background: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: '#0A0A0A',
              animation: 'progress 1.5s ease-in-out infinite'
            }} />
          </div>
        )}

        {/* Error - Show button to go back */}
        {status === 'error' && (
          <button
            onClick={() => navigate('/doctor')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0A0A0A',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '0.5rem',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              transition: 'all 0.15s ease-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Return to Dashboard
          </button>
        )}

        {/* Success note */}
        {status === 'success' && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(5, 150, 105, 0.06)',
            borderRadius: '6px',
            border: '1px solid rgba(5, 150, 105, 0.1)'
          }}>
            <p style={{
              fontSize: '0.8125rem',
              color: '#059669',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Epic EHR data is now accessible
            </p>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

export default EpicCallbackPage;

