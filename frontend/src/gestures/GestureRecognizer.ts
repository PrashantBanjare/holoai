import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import type { TrackedHand } from './HandTracker'
import { Debouncer, Ema } from './filters'

export type Gesture = 'none' | 'pinch' | 'open_palm' | 'fist' | 'point'

export type HandInfo = {
  gesture: Gesture
  confidence: number // 0..1, smoothed
  pinchRatio: number // thumb-index distance relative to hand size
  center: { x: number; y: number } // palm center, normalized 0..1
  tip: { x: number; y: number } // index fingertip, normalized 0..1
}

export type GestureFrame = {
  hands: HandInfo[]
  twoHandDistance: number | null // smoothed distance between palm centers
  label: string
}

// Landmark indices
const WRIST = 0
const THUMB_TIP = 4
const INDEX_TIP = 8
const MIDDLE_MCP = 9

// [tip, pip] for index, middle, ring, pinky
const FINGERS: [number, number][] = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
]

const PINCH_ENTER = 0.25 // pinch starts below this ratio
const PINCH_EXIT = 0.4 // pinch ends above this ratio (gap = hysteresis, prevents flicker)
const EXTENDED_RATIO = 1.2
const FRAMES_TO_SWITCH = 4
const FRAMES_BEFORE_HAND_LOST = 8

const dist = (a: NormalizedLandmark, b: NormalizedLandmark) =>
  Math.hypot(a.x - b.x, a.y - b.y)

class HandSlot {
  pinching = false
  debouncer = new Debouncer<Gesture>('none', FRAMES_TO_SWITCH)
  confidence = new Ema(0.4)
  missing = 0
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export class GestureRecognizer {
  private slots: HandSlot[] = [new HandSlot(), new HandSlot()]
  private twoHandEma = new Ema(0.3)

  update(hands: TrackedHand[]): GestureFrame {
    // Sort left-to-right in the image so slot 0 / slot 1 stay consistent between frames
    const sorted = [...hands].sort((a, b) => a.landmarks[WRIST].x - b.landmarks[WRIST].x)

    const infos: HandInfo[] = []

    this.slots.forEach((slot, i) => {
      const hand = sorted[i]
      if (!hand) {
        slot.missing++
        if (slot.missing > FRAMES_BEFORE_HAND_LOST) this.slots[i] = new HandSlot()
        return
      }
      slot.missing = 0
      infos.push(this.classify(hand.landmarks, slot))
    })

    let twoHandDistance: number | null = null
    if (infos.length === 2) {
      twoHandDistance = this.twoHandEma.next(
        Math.hypot(infos[0].center.x - infos[1].center.x, infos[0].center.y - infos[1].center.y),
      )
    } else {
      this.twoHandEma.reset()
    }

    return { hands: infos, twoHandDistance, label: this.makeLabel(infos) }
  }

  private classify(lm: NormalizedLandmark[], slot: HandSlot): HandInfo {
    const handSize = dist(lm[WRIST], lm[MIDDLE_MCP]) || 1e-6

    // Pinch with hysteresis
    const pinchRatio = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / handSize
    if (slot.pinching) {
      if (pinchRatio > PINCH_EXIT) slot.pinching = false
    } else if (pinchRatio < PINCH_ENTER) {
      slot.pinching = true
    }

    // Which fingers are extended? Compare tip vs. middle joint distance from the wrist,
    // so it works at any hand rotation.
    const extended: boolean[] = []
    let clarity = 0
    for (const [tip, pip] of FINGERS) {
      const r = dist(lm[tip], lm[WRIST]) / (dist(lm[pip], lm[WRIST]) || 1e-6)
      extended.push(r > EXTENDED_RATIO)
      clarity += clamp01(Math.abs(r - EXTENDED_RATIO) / 0.3)
    }
    clarity /= FINGERS.length

    const [index, middle, ring, pinky] = extended
    const count = extended.filter(Boolean).length

    let raw: Gesture = 'none'
    let confidence = clarity

    if (slot.pinching) {
      raw = 'pinch'
      confidence = clamp01(1 - pinchRatio / PINCH_EXIT)
    } else if (count === 4) {
      raw = 'open_palm'
    } else if (count === 0) {
      raw = 'fist'
    } else if (index && !middle && !ring && !pinky) {
      raw = 'point'
    }

    return {
      gesture: slot.debouncer.update(raw),
      confidence: slot.confidence.next(confidence),
      pinchRatio,
      center: { x: lm[MIDDLE_MCP].x, y: lm[MIDDLE_MCP].y },
      tip: { x: lm[INDEX_TIP].x, y: lm[INDEX_TIP].y },
    }
  }

  private makeLabel(infos: HandInfo[]): string {
    if (infos.length === 0) return 'No hand'
    if (infos.length === 2) {
      return infos.every((h) => h.gesture === 'pinch') ? 'Two-hand pinch' : 'Two hands detected'
    }
    switch (infos[0].gesture) {
      case 'pinch':
        return 'Pinch detected'
      case 'open_palm':
        return 'Open palm'
      case 'fist':
        return 'Fist'
      case 'point':
        return 'Pointing'
      default:
        return 'Hand detected'
    }
  }
}