import { create } from 'zustand';

interface AuthUIState {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  showLocationOnboarding: boolean;
  setShowLocationOnboarding: (show: boolean) => void;
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  authMode: 'login',
  setAuthMode: (mode) => set({ authMode: mode }),
  showLocationOnboarding: false,
  setShowLocationOnboarding: (show) => set({ showLocationOnboarding: show }),
}));
