import { create } from 'zustand'

type VoiceState = {
  supported: boolean
  listening: boolean
  transcript: string
  feedback: string
  setSupported: (v: boolean) => void
  setListening: (v: boolean) => void
  setTranscript: (t: string) => void
  setFeedback: (f: string) => void
}

export const useVoiceStore = create<VoiceState>((set) => ({
  supported: false,
  listening: false,
  transcript: '',
  feedback: '',
  setSupported: (supported) => set({ supported }),
  setListening: (listening) => set({ listening }),
  setTranscript: (transcript) => set({ transcript }),
  setFeedback: (feedback) => set({ feedback }),
}))
