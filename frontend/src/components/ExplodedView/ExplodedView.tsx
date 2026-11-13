import { useExplodeStore } from '../../store/useExplodeStore'
import Panel from '../../ui/Panel'
import { btn } from '../../ui/theme'

export default function ExplodedView() {
  const s = useExplodeStore()
  const noModel = s.totalParts === 0

  return (
    <Panel title="Exploded view">
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
    </Panel>
  )
}
