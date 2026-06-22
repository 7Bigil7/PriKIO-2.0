import { create } from 'zustand'

interface AppState {
  currentStep: number;
  kioskMode: boolean;
  sessionTimeRemaining: number; // in seconds
  setStep: (step: number) => void;
  setKioskMode: (isKiosk: boolean) => void;
  setSessionTimeRemaining: (time: number) => void;
  decrementSessionTime: () => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 0,
  kioskMode: false,
  sessionTimeRemaining: 300, // Default 5 minutes
  setStep: (step) => set({ currentStep: step }),
  setKioskMode: (kioskMode) => set({ kioskMode }),
  setSessionTimeRemaining: (sessionTimeRemaining) => set({ sessionTimeRemaining }),
  decrementSessionTime: () => set((state) => ({ sessionTimeRemaining: Math.max(0, state.sessionTimeRemaining - 1) })),
  resetSession: () => set({ currentStep: 0, sessionTimeRemaining: 300 }),
}))
