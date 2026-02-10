// ============================================================================
// Auth Context - Estado global del onboarding
// ============================================================================

import { createContext, useContext } from 'react';

interface AuthContextType {
  onboardingCompleted: boolean;
  setOnboardingCompleted: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
