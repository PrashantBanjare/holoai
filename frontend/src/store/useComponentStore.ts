import { create } from 'zustand'

export type ComponentNode = {
  id: string
  name: string
  parentId: string | null
  depth: number
  kind: 'part' | 'assembly'
}

type ComponentState = {
  nodes: ComponentNode[]
  selectedId: string | null
  hoveredId: string | null
  isolatedId: string | null
  setNodes: (nodes: ComponentNode[]) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  isolate: (id: string | null) => void
}

export const useComponentStore = create<ComponentState>((set, get) => ({
  nodes: [],
  selectedId: null,
  hoveredId: null,
  isolatedId: null,

  setNodes: (nodes) => set({ nodes, selectedId: null, hoveredId: null, isolatedId: null }),
  select: (id) => {
    if (get().selectedId !== id) set({ selectedId: id })
  },
  hover: (id) => {
    if (get().hoveredId !== id) set({ hoveredId: id })
  },
  isolate: (id) => set({ isolatedId: id }),
}))