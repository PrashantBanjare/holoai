import { useAppStore } from '../store/useAppStore'
import { useExplodeStore } from '../store/useExplodeStore'
import type { GestureFrame } from './GestureRecognizer'
import type { MotionFrame } from './MotionTracker'

const ROTATE_GAIN = 6 // radians per full camera width
const ROLL_GAIN = 1
const MOVE_GAIN = 6 // scene units per full camera width
const ZOOM_GAIN = 4
const ENGAGE_FRAMES = 3 // ignore motion right after a gesture starts
const RESET_HOLD_MS = 1000
const RESET_COOLDOWN_MS = 1500
const EXPLODE_SPREAD = 0.1 // how far the hands must move apart/together (fraction of camera width)
const EXPLODE_COOLDOWN_MS = 1200

export class GestureMapper {
  private prevMode = 'Idle'
  private engaged = 0
  private fistSince: number | null = null
  private lastReset = 0
  private spread = 0
  private lastExplode = 0

  update(frame: GestureFrame, motion: MotionFrame, now: number) {
    const st = useAppStore.getState()
    const hands = frame.hands
    let mode = 'Idle'

    const bothPinch = hands.length === 2 && hands.every((h) => h.gesture === 'pinch')
    const bothPalm = hands.length === 2 && hands.every((h) => h.gesture === 'open_palm')
    const pinchIdx = hands.findIndex((h) => h.gesture === 'pinch')
    const anyFist = hands.some((h) => h.gesture === 'fist')

    if (hands.some((h) => h.gesture === 'point')) {
      mode = 'Pointing'
    } else if (bothPinch) {
      mode = 'Zoom mode'
    } else if (bothPalm) {
      mode = 'Explode gesture'
    } else if (pinchIdx >= 0) {
      mode = st.pinchMode === 'rotate' ? 'Rotate mode' : 'Move mode'
    }

    // Reset the engage counter whenever the mode changes
    if (mode !== this.prevMode) this.engaged = 0
    this.prevMode = mode
    if (mode !== 'Idle') this.engaged++

    const ready = this.engaged > ENGAGE_FRAMES

    if (mode === 'Zoom mode' && ready && motion.twoHandDelta !== 0) {
      st.zoomBy(Math.exp(motion.twoHandDelta * ZOOM_GAIN))
    } else if (mode === 'Rotate mode' && ready) {
      const m = motion.hands[pinchIdx]
      if (m) st.rotateBy(m.dy * ROTATE_GAIN, m.dx * ROTATE_GAIN, -m.droll * ROLL_GAIN)
    } else if (mode === 'Move mode' && ready) {
      const m = motion.hands[pinchIdx]
      if (m) st.moveBy(m.dx * MOVE_GAIN, -m.dy * MOVE_GAIN)
    }

    // Two open palms: spread apart = explode, together = return
    if (mode === 'Explode gesture') {
      if (ready) this.spread += motion.twoHandDelta
      if (now - this.lastExplode > EXPLODE_COOLDOWN_MS) {
        if (this.spread > EXPLODE_SPREAD) {
          useExplodeStore.setState({ exploded: true, openCount: 0 })
          this.lastExplode = now
          this.spread = 0
        } else if (this.spread < -EXPLODE_SPREAD) {
          useExplodeStore.getState().returnToOriginal()
          this.lastExplode = now
          this.spread = 0
        }
      }
    } else {
      this.spread = 0
    }

    // Swipe with one open palm: step through parts
    if (motion.swipe && mode === 'Idle') {
      if (!useExplodeStore.getState().sequential) useExplodeStore.getState().setSequential(true)
      if (motion.swipe === 'right') useExplodeStore.getState().next()
      else useExplodeStore.getState().prev()
    }

    // Fist held = reset everything
    if (mode === 'Idle' && anyFist) {
      if (this.fistSince === null) this.fistSince = now
      mode = 'Hold fist to reset'
      if (now - this.fistSince >= RESET_HOLD_MS && now - this.lastReset > RESET_COOLDOWN_MS) {
        st.reset()
        useExplodeStore.getState().returnToOriginal()
        this.lastReset = now
        this.fistSince = null
        mode = 'Reset'
      }
    } else {
      this.fistSince = null
    }

    if (st.interactionMode !== mode) st.setInteractionMode(mode)
  }
}