import { create } from 'zustand'

type Status = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'error'

export type LibraryItem = {
  id: string
  name: string
  keywords: string[]
  url: string // absolute or site-relative URL of the GLB
  source: string
}

export const DEFAULT_MODEL = { url: '/models/engine.glb', name: 'Engine', source: 'local' }

// Shown when the backend is unreachable, so the demo always has something to pick.
export const LOCAL_LIBRARY: LibraryItem[] = [
  { id: 'engine', name: 'Engine', keywords: ['engine', 'motor', 'cylinder'], url: '/models/engine.glb', source: 'local' },
  { id: 'truck', name: 'Truck', keywords: ['truck', 'lorry', 'car', 'vehicle'], url: '/models/truck.glb', source: 'local' },
]

type ModelState = {
  url: string
  name: string
  source: string
  status: Status
  message: string
  library: LibraryItem[]
  loadingModel: boolean
  setModel: (m: { url: string; name: string; source: string }) => void
  setStatus: (status: Status, message?: string) => void
  setLibrary: (items: LibraryItem[]) => void
}

export const useModelStore = create<ModelState>((set) => ({
  ...DEFAULT_MODEL,
  status: 'idle',
  message: '',
  library: LOCAL_LIBRARY,
  loadingModel: false,
  setModel: (m) => set(m),
  setStatus: (status, message = '') => set({ status, message }),
  setLibrary: (items) => set({ library: items }),
}))
