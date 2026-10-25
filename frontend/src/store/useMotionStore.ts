import { create } from 'zustand'

type MotionState = {
  dx: number
  dy: number
  droll: number
  twoHandDelta: number
  lastSwipe: 'left' | 'right' | '—'
  swipeCount: number
  publish: (m: { dx: number; dy: number; droll: number; twoHandDelta: number }) => void
  registerSwipe: (dir: 'left' | 'right') => void
  clear: () => void
}

export const useMotionStore = create<MotionState>((set) => ({
  dx: 0,
  dy: 0,
  droll: 0,
  twoHandDelta: 0,
  lastSwipe: '—',
  swipeCount: 0,
  publish: (m) => set(m),
  registerSwipe: (dir) => set((s) => ({ lastSwipe: dir, swipeCount: s.swipeCount + 1 })),
  clear: () => set({ dx: 0, dy: 0, droll: 0, twoHandDelta: 0, lastSwipe: '—' }),
}))