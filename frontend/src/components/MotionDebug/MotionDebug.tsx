import type { CSSProperties } from 'react'
import { useMotionStore } from '../../store/useMotionStore'

const panel: CSSProperties = {
  position: 'absolute',
  top: 290,
  right: 16,
  width: 220,
  padding: 12,
  background: 'rgba(2, 20, 32, 0.7)',
  border: '1px solid rgba(56, 232, 255, 0.4)',
  borderRadius: 8,
  backdropFilter: 'blur(6px)',
  fontSize: 12,
  fontFamily: 'Consolas, monospace',
}

const fmt = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(3)

export default function MotionDebug() {
  const m = useMotionStore()

  return (
    <div style={panel}>
      <div style={{ letterSpacing: 2, textTransform: 'uppercase', color: '#38e8ff', marginBottom: 8 }}>
        Motion (debug)
      </div>
      <div>move x: {fmt(m.dx)}</div>
      <div>move y: {fmt(m.dy)}</div>
      <div>roll: {fmt(m.droll)}</div>
      <div>2-hand: {fmt(m.twoHandDelta)}</div>
      <div style={{ marginTop: 6, color: '#ffffff' }}>
        swipe: {m.lastSwipe} ({m.swipeCount})
      </div>
    </div>
  )
}