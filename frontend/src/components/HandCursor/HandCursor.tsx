import { usePointerStore } from '../../store/usePointerStore'

export default function HandCursor() {
  const active = usePointerStore((s) => s.active)
  const x = usePointerStore((s) => s.x)
  const y = usePointerStore((s) => s.y)
  const dwell = usePointerStore((s) => s.dwell)

  if (!active) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: `${((x + 1) / 2) * 100}%`,
        top: `${((1 - y) / 2) * 100}%`,
        width: 34,
        height: 34,
        marginLeft: -17,
        marginTop: -17,
        borderRadius: '50%',
        pointerEvents: 'none',
        border: '2px solid #ffb347',
        background: `conic-gradient(#ffb347 ${dwell * 360}deg, rgba(255,179,71,0.12) 0deg)`,
        boxShadow: '0 0 12px rgba(255,179,71,0.8)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 12,
          borderRadius: '50%',
          background: '#02060d',
          border: '1px solid #ffb347',
        }}
      />
    </div>
  )
}