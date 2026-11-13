import { create } from 'zustand'

type PartState = {
  dx: number // pending hand movement, fraction of camera width (+ = right)
  dy: number // + = down
  resetCount: number
  push: (dx: number, dy: number) => void
  take: () => [number, number]
  resetParts: () => void
}

export const usePartStore = create<PartState>((set, get) => ({
  dx: 0,
  dy: 0,
  resetCount: 0,

  push: (dx, dy) => set((s) => ({ dx: s.dx + dx, dy: s.dy + dy })),

  take: () => {
    const { dx, dy } = get()
    if (dx !== 0 || dy !== 0) set({ dx: 0, dy: 0 })
    return [dx, dy]
  },

  resetParts: () => set((s) => ({ resetCount: s.resetCount + 1, dx: 0, dy: 0 })),
}))
