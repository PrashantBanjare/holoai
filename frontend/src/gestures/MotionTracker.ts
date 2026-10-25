import type { TrackedHand } from './HandTracker'
import type { GestureFrame } from './GestureRecognizer'
import { Ema } from './filters'

export type Swipe = 'left' | 'right' | null

export type HandMotion = {
  dx: number // per-frame palm movement, screen space (+ = right)
  dy: number // + = down
  droll: number // per-frame hand rotation in radians (+ = clockwise on screen)
}

export type MotionFrame = {
  hands: HandMotion[]
  twoHandDelta: number // per-frame change in distance between hands (+ = moving apart)
  swipe: Swipe
}

const WRIST = 0
const MIDDLE_MCP = 9

const MOVE_DEADZONE = 0.004
const ROLL_DEADZONE = 0.01
const SPREAD_DEADZONE = 0.003

const SWIPE_WINDOW_MS = 400
const SWIPE_MIN_MS = 100
const SWIPE_MIN_DISTANCE = 0.22 // fraction of camera width
const SWIPE_COOLDOWN_MS = 800

const deadzone = (v: number, dz: number) => (Math.abs(v) < dz ? 0 : v)

const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI
  while (a < -Math.PI) a += 2 * Math.PI
  return a
}

class Slot {
  x = new Ema(0.35)
  y = new Ema(0.35)
  prev: { x: number; y: number; roll: number } | null = null
  history: { t: number; x: number; y: number }[] = []

  reset() {
    this.x.reset()
    this.y.reset()
    this.prev = null
    this.history = []
  }
}

export class MotionTracker {
  private slots = [new Slot(), new Slot()]
  private prevTwoHand: number | null = null
  private lastSwipeAt = 0

  update(hands: TrackedHand[], frame: GestureFrame, now: number): MotionFrame {
    // Same ordering as GestureRecognizer, so slot i matches frame.hands[i]
    const sorted = [...hands].sort((a, b) => a.landmarks[WRIST].x - b.landmarks[WRIST].x)

    const motions: HandMotion[] = []
    let swipe: Swipe = null

    this.slots.forEach((slot, i) => {
      const hand = sorted[i]
      if (!hand) {
        slot.reset()
        return
      }

      const lm = hand.landmarks
      // Mirror x so everything is in the same space the user sees on screen
      const sx = slot.x.next(1 - lm[MIDDLE_MCP].x)
      const sy = slot.y.next(lm[MIDDLE_MCP].y)
      const roll = Math.atan2(lm[MIDDLE_MCP].y - lm[WRIST].y, 1 - lm[MIDDLE_MCP].x - (1 - lm[WRIST].x))

      let motion: HandMotion = { dx: 0, dy: 0, droll: 0 }
      if (slot.prev) {
        motion = {
          dx: deadzone(sx - slot.prev.x, MOVE_DEADZONE),
          dy: deadzone(sy - slot.prev.y, MOVE_DEADZONE),
          droll: deadzone(wrapAngle(roll - slot.prev.roll), ROLL_DEADZONE),
        }
      }
      slot.prev = { x: sx, y: sy, roll }
      motions.push(motion)

      // Swipe: fast, mostly horizontal sweep of an open palm
      slot.history.push({ t: now, x: sx, y: sy })
      while (slot.history.length && now - slot.history[0].t > SWIPE_WINDOW_MS) slot.history.shift()

      const isOpenPalm = frame.hands[i]?.gesture === 'open_palm'
      if (isOpenPalm && now - this.lastSwipeAt > SWIPE_COOLDOWN_MS && slot.history.length > 1) {
        const first = slot.history[0]
        const disp = sx - first.x
        const vertical = Math.abs(sy - first.y)
        if (
          now - first.t >= SWIPE_MIN_MS &&
          Math.abs(disp) > SWIPE_MIN_DISTANCE &&
          vertical < Math.abs(disp)
        ) {
          swipe = disp > 0 ? 'right' : 'left'
          this.lastSwipeAt = now
          this.slots.forEach((s) => (s.history = []))
        }
      }
    })

    let twoHandDelta = 0
    if (frame.twoHandDistance !== null) {
      if (this.prevTwoHand !== null) {
        twoHandDelta = deadzone(frame.twoHandDistance - this.prevTwoHand, SPREAD_DEADZONE)
      }
      this.prevTwoHand = frame.twoHandDistance
    } else {
      this.prevTwoHand = null
    }

    return { hands: motions, twoHandDelta, swipe }
  }
}