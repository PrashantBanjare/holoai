import type { CSSProperties } from 'react'
import { useExplodeStore } from '../../store/useExplodeStore'

const panel: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 16,
  transform: 'translateX(-50%)',
  width: 300,
  padding: 12,
  background: 'rgba(2, 20, 32, 0.7)',
  border: '1px solid rgba(56, 232, 255, 0.4)',
  borderRadius: 8,
  backdropFilter: 'blur(6px)',
  fontSize: 12,
}

const title: CSSProperties = {
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#38e8ff',
  marginBottom: 8,
}

const btn = (active = false, disabled = false): CSSProperties => ({
  flex: 1,
  padding: '7px 6px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: disabled ? '#4d7a88' : active ? '#02060d' : '#cfeeff',
  background: active ? '#38e8ff' : 'transparent',
  border: `1px solid ${disabled ? 'rgba(56,232,255,0.2)' : 'rgba(56,232,255,0.6)'}`,
  borderRadius: 4,
  cursor: disabled ? 'default' : 'pointer',
})

export default function ExplodedView() {
  const s = useExplodeStore()
  const noModel = s.totalParts === 0

  return (
    <div style={panel}>
      <div style={title}>Exploded view</div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button style={btn(s.exploded, noModel)} disabled={noModel} onClick={s.toggle}>
          {s.exploded ? 'Exploded' : 'Explode'}
        </button>
        <button style={btn(false, !s.exploded)} disabled={!s.exploded} onClick={s.returnToOriginal}>
          Return
        </button>
      </div>

      <div style={{ marginTop: 10, color: '#7fb8c8' }}>Distance: {s.distance.toFixed(2)}</div>
      <input
        type="range"
        min={0}
        max={2}
        step={0.05}
        value={s.distance}
        onChange={(e) => s.setDistance(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#38e8ff' }}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={s.sequential}
          onChange={(e) => s.setSequential(e.target.checked)}
          style={{ accentColor: '#38e8ff' }}
        />
        Open parts one by one
      </label>

      {s.sequential && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={btn(false, s.openCount === 0)} disabled={s.openCount === 0} onClick={s.prev}>
              ◀ Prev
            </button>
            <div style={{ minWidth: 56, textAlign: 'center', color: '#ffffff' }}>
              {s.openCount} / {s.totalParts}
            </div>
            <button
              style={btn(false, s.openCount >= s.totalParts)}
              disabled={s.openCount >= s.totalParts}
              onClick={s.next}
            >
              Next ▶
            </button>
          </div>
          <div style={{ marginTop: 4, color: '#7fb8c8' }}>Turn Explode on first, then press Next.</div>
        </div>
      )}
    </div>
  )
}