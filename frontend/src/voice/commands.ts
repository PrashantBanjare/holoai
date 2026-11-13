import { useAppStore } from '../store/useAppStore'
import { useComponentStore } from '../store/useComponentStore'
import { useExplodeStore } from '../store/useExplodeStore'
import { usePartStore } from '../store/usePartStore'
import { findLibraryItem, loadLibraryItem } from '../model/loadModel'

const ROT = 0.5
const MOVE = 0.5

export const COMMAND_HELP = [
  'rotate left / right / up / down',
  'zoom in / zoom out',
  'explode / assemble',
  'next part / previous part',
  'select <part name>, isolate, show all',
  'reset, lock, unlock',
  'solid view, hologram view',
  'camera on / camera off',
  'load engine / truck / gearbox / saw',
]

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w))

/** Runs a spoken or typed command. Returns a short message to show the user. */
export function runCommand(raw: string): string {
  const t = raw.toLowerCase().trim().replace(/[.,!?]/g, '')
  if (!t) return ''

  const app = useAppStore.getState()
  const ex = useExplodeStore.getState()
  const comp = useComponentStore.getState()

  // Unlock must be checked before lock ("unlock" contains "lock")
  if (has(t, 'unlock')) {
    if (app.locked) app.toggleLock()
    return 'Unlocked'
  }
  if (has(t, 'lock')) {
    if (!app.locked) app.toggleLock()
    return 'Locked'
  }
  if (has(t, 'camera') || has(t, 'hand control')) {
    const off = has(t, 'off', 'stop', 'disable')
    app.setHandControlEnabled(!off)
    return off ? 'Camera off' : 'Camera on'
  }
  if (has(t, 'solid')) {
    app.setViewMode('solid')
    return 'Solid view'
  }
  if (has(t, 'hologram view', 'holo')) {
    app.setViewMode('hologram')
    return 'Hologram view'
  }

  // Everything below changes the model
  const changesModel =
    has(t, 'rotate', 'turn', 'move', 'zoom', 'explode', 'assemble', 'return', 'next', 'previous', 'back', 'isolate', 'reset', 'select', 'load', 'show')
  if (app.locked && changesModel) return 'Locked. Say "unlock" first.'

  if (has(t, 'load', 'open', 'show me', 'switch to')) {
    const item = findLibraryItem(t)
    if (item) {
      loadLibraryItem(item)
      return `Loading ${item.name}`
    }
    if (has(t, 'load')) return 'No model with that name in the library'
  }

  if (has(t, 'rotate', 'turn')) {
    if (has(t, 'left')) app.rotateBy(0, -ROT)
    else if (has(t, 'right')) app.rotateBy(0, ROT)
    else if (has(t, 'up')) app.rotateBy(-ROT, 0)
    else if (has(t, 'down')) app.rotateBy(ROT, 0)
    else return 'Say rotate left, right, up or down'
    return 'Rotating'
  }
  if (has(t, 'move')) {
    if (has(t, 'left')) app.moveBy(-MOVE, 0)
    else if (has(t, 'right')) app.moveBy(MOVE, 0)
    else if (has(t, 'up')) app.moveBy(0, MOVE)
    else if (has(t, 'down')) app.moveBy(0, -MOVE)
    else return 'Say move left, right, up or down'
    return 'Moving'
  }
  if (has(t, 'zoom in', 'bigger', 'closer')) {
    app.zoomBy(1.3)
    return 'Zoom in'
  }
  if (has(t, 'zoom out', 'smaller', 'farther')) {
    app.zoomBy(1 / 1.3)
    return 'Zoom out'
  }
  if (has(t, 'explode', 'blow')) {
    useExplodeStore.setState({ exploded: true, openCount: 0, onlyId: null, sequential: false })
    return 'Exploded view'
  }
  if (has(t, 'assemble', 'return', 'put back', 'collapse')) {
    ex.returnToOriginal()
    return 'Assembled'
  }
  if (has(t, 'next')) {
    if (!ex.sequential) ex.setSequential(true)
    useExplodeStore.getState().next()
    return 'Next part'
  }
  if (has(t, 'previous', 'back')) {
    useExplodeStore.getState().prev()
    return 'Previous part'
  }
  if (has(t, 'show all', 'unisolate', 'show everything')) {
    comp.isolate(null)
    return 'Showing all parts'
  }
  if (has(t, 'isolate')) {
    if (!comp.selectedId) return 'Select a part first'
    comp.isolate(comp.selectedId)
    return 'Isolated'
  }
  if (has(t, 'reset')) {
    app.reset()
    ex.returnToOriginal()
    usePartStore.getState().resetParts()
    comp.select(null)
    comp.isolate(null)
    return 'Reset'
  }
  if (has(t, 'select')) {
    const query = t.replace(/^.*select\s*/, '').replace(/^(the|part)\s+/, '').trim()
    if (!query) return 'Say "select" and a part name'
    const match =
      comp.nodes.find((n) => n.name.toLowerCase() === query) ??
      comp.nodes.find((n) => n.name.toLowerCase().includes(query)) ??
      comp.nodes.find((n) => query.includes(n.name.toLowerCase()))
    if (!match) return `No part called "${query}"`
    comp.select(match.id)
    return `Selected ${match.name}`
  }

  return `Not understood: "${raw}"`
}
