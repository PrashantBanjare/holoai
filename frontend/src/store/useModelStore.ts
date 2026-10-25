import { create } from 'zustand'

type Status = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'error'

type ModelState = {
  url: string
  name: string
  source: string
  status: Status
  message: string
  setModel: (m: { url: string; name: string; source: string }) => void
  setStatus: (status: Status, message?: string) => void
}

export const useModelStore = create<ModelState>((set) => ({
  url: '/models/engine.glb',
  name: 'Engine',
  source: 'local',
  status: 'idle',
  message: '',
  setModel: (m) => set(m),
  setStatus: (status, message = '') => set({ status, message }),
}))