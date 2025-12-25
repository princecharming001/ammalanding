import { useState, useEffect } from 'react';
import { isEpicConnected, disconnectEpic } from '../utils/epicClient';

function EpicConnect({ doctorEmail }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [doctorEmail]);

  const checkConnection = async () => {
    try {
      const isConnected = await isEpicConnected(doctorEmail);
      setConnected(isConnected);
    } catch (error) {
      console.error('Error checking Epic connection:', error);
    }
    setLoading(false);
  };

  // Demo mode - just connect locally without redirect
  const handleConnect = async () => {
    setConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      sessionStorage.setItem('epic_connected', 'true');
      sessionStorage.setItem('epic_connected_at', new Date().toISOString());
      setConnected(true);
      setConnecting(false);
    }, 800);
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect from FHIR? You will need to reconnect to access patient data.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await disconnectEpic(doctorEmail);
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect: ' + error.message);
    }
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        color: '#A3A3A3',
        letterSpacing: '-0.01em'
      }}>
        Checking...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      {/* Status indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.625rem',
        background: connected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
        borderRadius: '4px',
        border: connected ? 'none' : '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: connected ? '#10B981' : '#A3A3A3'
        }} />
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: '500',
          color: connected ? '#059669' : '#525252',
          letterSpacing: '-0.01em'
        }}>
          {connected ? 'FHIR Connected' : 'FHIR'}
        </span>
      </div>

      {/* Action Button */}
      {connected ? (
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          style={{
            padding: '0.375rem 0.625rem',
            background: 'transparent',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '4px',
            color: '#525252',
            fontSize: '0.75rem',
            fontWeight: '500',
            letterSpacing: '-0.01em',
            cursor: disconnecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease-out',
            fontFamily: 'inherit',
            opacity: disconnecting ? 0.5 : 1
          }}
          onMouseOver={(e) => {
            if (!disconnecting) {
              e.target.style.borderColor = '#0A0A0A';
              e.target.style.color = '#0A0A0A';
            }
          }}
          onMouseOut={(e) => {
            if (!disconnecting) {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
              e.target.style.color = '#525252';
            }
          }}
        >
          {disconnecting ? '...' : 'Disconnect'}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            padding: '0.375rem 0.625rem',
            background: '#0A0A0A',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '500',
            letterSpacing: '-0.01em',
            cursor: connecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease-out',
            fontFamily: 'inherit',
            opacity: connecting ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!connecting) e.target.style.opacity = '0.85';
          }}
          onMouseOut={(e) => {
            if (!connecting) e.target.style.opacity = '1';
          }}
        >
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  );
}

export default EpicConnect;
