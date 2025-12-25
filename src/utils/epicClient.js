/**
 * Epic/Plasma FHIR Client
 * Handles OAuth flow and FHIR data retrieval
 */

// Epic OAuth configuration
const EPIC_CONFIG = {
  clientId: import.meta.env.VITE_EPIC_CLIENT_ID || '64b06556-5871-4703-a7c4-095821d64e36',
  redirectUri: import.meta.env.VITE_EPIC_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/epic-callback`,
  baseUrl: import.meta.env.VITE_EPIC_BASE_URL || 'https://api.plasma.health',
  authUrl: import.meta.env.VITE_EPIC_AUTH_URL || 'https://api.plasma.health/oauth2/authorize',
  tokenUrl: import.meta.env.VITE_EPIC_TOKEN_URL || 'https://api.plasma.health/oauth2/token',
  fhirApiBase: import.meta.env.VITE_EPIC_FHIR_API_BASE || 'https://api.plasma.health/fhir/r4',
  scopes: import.meta.env.VITE_EPIC_SCOPES || 'patient/*.read launch/patient openid fhirUser',
};

/**
 * Initiates Epic OAuth authorization flow
 */
export function initiateEpicAuth() {
  const state = generateRandomState();
  sessionStorage.setItem('epic_oauth_state', state);
  
  const authUrl = new URL(EPIC_CONFIG.authUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', EPIC_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', EPIC_CONFIG.redirectUri);
  authUrl.searchParams.set('scope', EPIC_CONFIG.scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', EPIC_CONFIG.fhirApiBase);
  
  window.location.href = authUrl.toString();
}

/**
 * Handles the OAuth callback after Epic authorization
 */
export async function handleEpicCallback(code, state) {
  // Verify state to prevent CSRF
  const savedState = sessionStorage.getItem('epic_oauth_state');
  if (state !== savedState) {
    console.error('State mismatch - possible CSRF attack');
    return { success: false, error: 'State mismatch' };
  }
  
  try {
    // In a real implementation, this would exchange the code for tokens
    // For demo purposes, we'll simulate a successful connection
    console.log('Processing Epic callback with code:', code);
    
    // Clear the state
    sessionStorage.removeItem('epic_oauth_state');
    
    // Store connection status
    sessionStorage.setItem('epic_connected', 'true');
    sessionStorage.setItem('epic_connected_at', new Date().toISOString());
    
    return { success: true };
  } catch (error) {
    console.error('Epic callback error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if Epic is connected
 */
export function isEpicConnected() {
  return sessionStorage.getItem('epic_connected') === 'true';
}

/**
 * Disconnects from Epic
 */
export function disconnectEpic() {
  sessionStorage.removeItem('epic_connected');
  sessionStorage.removeItem('epic_connected_at');
  sessionStorage.removeItem('epic_oauth_state');
}

/**
 * Generates a random state string for OAuth
 */
function generateRandomState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Alias for backward compatibility
export const initEpicAuth = initiateEpicAuth;

export default {
  initiateEpicAuth,
  initEpicAuth,
  handleEpicCallback,
  isEpicConnected,
  disconnectEpic,
};
