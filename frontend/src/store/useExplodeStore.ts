import { create } from 'zustand'

type ExplodeState = {
  exploded: boolean
  distance: number // 0..2, multiplier on how far parts travel
  sequential: boolean // open parts one at a time
  openCount: number // how many parts are open in sequential mode
  totalParts: number
  toggle: () => void
  setDistance: (d: number) => void
  setSequential: (v: boolean) => void
  next: () => void
  prev: () => void
  setTotal: (n: number) => void
  returnToOriginal: () => void
}

export const useExplodeStore = create<ExplodeState>((set) => ({
  exploded: false,
  distance: 1,
  sequential: false,
  openCount: 0,
  totalParts: 0,

  toggle: () => set((s) => ({ exploded: !s.exploded, openCount: 0 })),
  setDistance: (d) => set({ distance: d }),
  setSequential: (v) => set({ sequential: v, openCount: 0 }),

  next: () =>
    set((s) => ({
      exploded: true,
      openCount: Math.min(s.totalParts, s.openCount + 1),
    })),
  prev: () => set((s) => ({ openCount: Math.max(0, s.openCount - 1) })),

  setTotal: (n) => set({ totalParts: n, openCount: 0 }),
  returnToOriginal: () => set({ exploded: false, openCount: 0 }),
}))