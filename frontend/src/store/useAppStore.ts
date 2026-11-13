import { create } from 'zustand'

type Vec3 = [number, number, number]

const MIN_SCALE = 0.3
const MAX_SCALE = 3

const initialTransform = {
  rotation: [0, 0, 0] as Vec3,
  position: [0, 0, 0] as Vec3,
  scale: 1,
}

export type TrackerStatus = 'idle' | 'loading' | 'ready' | 'error'
export type PinchMode = 'rotate' | 'move'
export type ViewMode = 'hologram' | 'solid'

type AppState = {
  rotation: Vec3
  position: Vec3
  scale: number
  rotateBy: (dx: number, dy: number, dz?: number) => void
  moveBy: (dx: number, dy: number) => void
  zoomBy: (factor: number) => void
  reset: () => void

  locked: boolean // gestures cannot change the model while locked
  toggleLock: () => void
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void

  handControlEnabled: boolean
  handsDetected: number
  trackerStatus: TrackerStatus
  trackerMessage: string
  gestureLabel: string
  gestureConfidence: number
  pinchMode: PinchMode
  interactionMode: string
  setHandControlEnabled: (v: boolean) => void
  setHandsDetected: (n: number) => void
  setTrackerStatus: (s: TrackerStatus, message?: string) => void
  setGesture: (label: string, confidence: number) => void
  setPinchMode: (m: PinchMode) => void
  setInteractionMode: (m: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  ...initialTransform,

  rotateBy: (dx, dy, dz = 0) =>
    set((s) => ({
      rotation: [s.rotation[0] + dx, s.rotation[1] + dy, s.rotation[2] + dz],
    })),

  moveBy: (dx, dy) =>
    set((s) => ({
      position: [s.position[0] + dx, s.position[1] + dy, s.position[2]],
    })),

  zoomBy: (factor) =>
    set((s) => ({
      scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale * factor)),
    })),

  reset: () => set({ ...initialTransform }),

  locked: false,
  toggleLock: () => set((s) => ({ locked: !s.locked })),
  viewMode: 'hologram',
  setViewMode: (m) => set({ viewMode: m }),

  handControlEnabled: false,
  handsDetected: 0,
  trackerStatus: 'idle',
  trackerMessage: '',
  gestureLabel: 'No hand',
  gestureConfidence: 0,
  pinchMode: 'rotate',
  interactionMode: 'Idle',
  setHandControlEnabled: (v) => set({ handControlEnabled: v }),
  setHandsDetected: (n) => set({ handsDetected: n }),
  setTrackerStatus: (s, message = '') => set({ trackerStatus: s, trackerMessage: message }),
  setGesture: (label, confidence) => set({ gestureLabel: label, gestureConfidence: confidence }),
  setPinchMode: (m) => set({ pinchMode: m }),
  setInteractionMode: (m) => set({ interactionMode: m }),
}))
