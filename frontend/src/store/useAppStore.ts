import { create } from 'zustand'

type Vec3 = [number, number, number]

const MIN_SCALE = 0.3
const MAX_SCALE = 3

const initialTransform = {
  rotation: [0, 0, 0] as Vec3,
  position: [0, 0, 0] as Vec3,
  scale: 1,
}

type TrackerStatus = 'idle' | 'loading' | 'ready' | 'error'
type PinchMode = 'rotate' | 'move'

type AppState = {
  rotation: Vec3
  position: Vec3
  scale: number
  rotateBy: (dx: number, dy: number, dz?: number) => void
  moveBy: (dx: number, dy: number) => void
  zoomBy: (factor: number) => void
  reset: () => void

  handControlEnabled: boolean
  handsDetected: number
  trackerStatus: TrackerStatus
  gestureLabel: string
  gestureConfidence: number
  pinchMode: PinchMode
  interactionMode: string
  setHandControlEnabled: (v: boolean) => void
  setHandsDetected: (n: number) => void
  setTrackerStatus: (s: TrackerStatus) => void
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

  handControlEnabled: false,
  handsDetected: 0,
  trackerStatus: 'idle',
  gestureLabel: 'No hand',
  gestureConfidence: 0,
  pinchMode: 'rotate',
  interactionMode: 'Idle',
  setHandControlEnabled: (v) => set({ handControlEnabled: v }),
  setHandsDetected: (n) => set({ handsDetected: n }),
  setTrackerStatus: (s) => set({ trackerStatus: s }),
  setGesture: (label, confidence) => set({ gestureLabel: label, gestureConfidence: confidence }),
  setPinchMode: (m) => set({ pinchMode: m }),
  setInteractionMode: (m) => set({ interactionMode: m }),
}))