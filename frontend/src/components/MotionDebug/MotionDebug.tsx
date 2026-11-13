import { useMotionStore } from '../../store/useMotionStore'
import Panel from '../../ui/Panel'

const fmt = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(3)

export default function MotionDebug() {
  const m = useMotionStore()

  return (
    <Panel title="Motion (debug)" defaultOpen={false}>
      <div style={{ fontFamily: 'Consolas, monospace' }}>
      <div>move x: {fmt(m.dx)}</div>
      <div>move y: {fmt(m.dy)}</div>
      <div>roll: {fmt(m.droll)}</div>
      <div>2-hand: {fmt(m.twoHandDelta)}</div>
      <div style={{ marginTop: 6, color: '#ffffff' }}>
        swipe: {m.lastSwipe} ({m.swipeCount})
      </div>
      </div>
    </Panel>
  )
}
