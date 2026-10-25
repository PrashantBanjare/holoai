import type { GestureFrame } from './GestureRecognizer'
import { Ema } from './filters'

const GAIN = 1.3 // small hand movement reaches the screen edges
const DWELL_MS = 900
const DWELL_RADIUS = 0.07 // cursor must stay within this (screen units) to count as holding still

export type PointerFrame = {
  active: boolean
  x: number
  y: number
  dwell: number
  trigger: boolean
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

export class PointerTracker {
  private ex = new Ema(0.3)
  private ey = new Ema(0.3)
  private anchor: { x: number; y: number; t: number } | null = null
  private dwellFired = false
  private otherPinched = false

  private reset() {
    this.ex.reset()
    this.ey.reset()
    this.anchor = null
    this.dwellFired = false
    this.otherPinched = false
  }

  update(frame: GestureFrame, now: number): PointerFrame {
    const idx = frame.hands.findIndex((h) => h.gesture === 'point')
    if (idx < 0) {
      this.reset()
      return { active: false, x: 0, y: 0, dwell: 0, trigger: false }
    }

    const tip = frame.hands[idx].tip
    // Mirror x to match the mirrored camera view
    const x = clamp(this.ex.next((1 - tip.x - 0.5) * 2 * GAIN))
    const y = clamp(this.ey.next(-(tip.y - 0.5) * 2 * GAIN))

    let dwell = 0
    let trigger = false

    if (!this.anchor || Math.hypot(x - this.anchor.x, y - this.anchor.y) > DWELL_RADIUS) {
      this.anchor = { x, y, t: now }
      this.dwellFired = false
    } else if (!this.dwellFired) {
      dwell = Math.min(1, (now - this.anchor.t) / DWELL_MS)
      if (dwell >= 1) {
        trigger = true
        this.dwellFired = true
        dwell = 0
      }
    }

    // Pinch + point: the other hand pinches to select
    const other = frame.hands.length === 2 ? frame.hands[1 - idx] : undefined
    const pinched = other?.gesture === 'pinch'
    if (pinched && !this.otherPinched) trigger = true
    this.otherPinched = !!pinched

    return { active: true, x, y, dwell, trigger }
  }
}