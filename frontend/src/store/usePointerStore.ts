import { create } from 'zustand'

type PointerState = {
  active: boolean
  x: number // -1..1 (screen space, like Three.js NDC)
  y: number
  dwell: number // 0..1 progress of hold-to-select
  trigger: number // increases by 1 each time a select is requested
  publish: (p: { active: boolean; x: number; y: number; dwell: number; trigger: boolean }) => void
  clear: () => void
}

export const usePointerStore = create<PointerState>((set) => ({
  active: false,
  x: 0,
  y: 0,
  dwell: 0,
  trigger: 0,
  publish: (p) =>
    set((s) => ({
      active: p.active,
      x: p.x,
      y: p.y,
      dwell: p.dwell,
      trigger: p.trigger ? s.trigger + 1 : s.trigger,
    })),
  clear: () => set({ active: false, dwell: 0 }),
}))