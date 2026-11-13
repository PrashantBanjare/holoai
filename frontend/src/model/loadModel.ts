import { useAppStore } from '../store/useAppStore'
import { useExplodeStore } from '../store/useExplodeStore'
import { usePartStore } from '../store/usePartStore'
import { useModelStore, type LibraryItem } from '../store/useModelStore'

/** Switch the viewer to a new model and clear anything left over from the old one. */
export function showModel(m: { url: string; name: string; source: string }) {
  useModelStore.getState().setModel(m)
  useAppStore.getState().reset()
  useExplodeStore.getState().returnToOriginal()
  usePartStore.getState().resetParts()
}

export function loadLibraryItem(item: LibraryItem) {
  showModel({ url: item.url, name: item.name, source: item.source })
  useModelStore.getState().setStatus('idle', `Loaded: ${item.name}`)
}

/** Finds the library entry whose name or keywords appear in the text. */
export function findLibraryItem(text: string): LibraryItem | null {
  const t = text.toLowerCase()
  let best: LibraryItem | null = null
  let bestScore = 0
  for (const item of useModelStore.getState().library) {
    let score = 0
    if (t.includes(item.name.toLowerCase())) score += 3
    for (const k of item.keywords) if (t.includes(k.toLowerCase())) score += 1
    if (score > bestScore) {
      best = item
      bestScore = score
    }
  }
  return best
}
