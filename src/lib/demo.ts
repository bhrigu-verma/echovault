// Demo mode client for bypassing Supabase auth
// Use this when NEXT_PUBLIC_DEMO_MODE=true

import { useDemoStore } from './demo-store'

// Re-export from demo-store for convenience
export const useDemoAuth = () => {
  const store = useDemoStore()
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    login: store.loginDemo,
    logout: store.logoutDemo,
  }
}

// Check if demo mode is enabled
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}
