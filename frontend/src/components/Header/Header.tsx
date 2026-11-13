import { useAppStore } from '../../store/useAppStore'
import { useModelStore } from '../../store/useModelStore'
import { C } from '../../ui/theme'

const pill = (active: boolean, color = C.accent) => ({
  padding: '6px 12px',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  cursor: 'pointer',
  color: active ? '#02060d' : C.text,
  background: active ? color : 'transparent',
  border: `1px solid ${color}`,
  borderRadius: 4,
})

export default function Header() {
  const camera = useAppStore((s) => s.handControlEnabled)
  const trackerStatus = useAppStore((s) => s.trackerStatus)
  const setCamera = useAppStore((s) => s.setHandControlEnabled)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const locked = useAppStore((s) => s.locked)
  const toggleLock = useAppStore((s) => s.toggleLock)
  const modelName = useModelStore((s) => s.name)

  const cameraLabel =
    trackerStatus === 'loading' ? 'Camera starting...' : camera ? 'Camera ON' : 'Camera OFF'

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        background: 'rgba(2, 12, 20, 0.85)',
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(6px)',
        zIndex: 5,
      }}
    >
      <div style={{ fontSize: 18, letterSpacing: 4, color: C.accent, fontWeight: 600 }}>HOLOAI</div>
      <div style={{ color: C.muted, fontSize: 12 }}>
        Model: <span style={{ color: C.white }}>{modelName}</span>
      </div>

      <div style={{ flex: 1 }} />

      <button style={pill(viewMode === 'solid')} onClick={() => setViewMode(viewMode === 'solid' ? 'hologram' : 'solid')}>
        View: {viewMode === 'solid' ? 'Solid' : 'Hologram'}
      </button>
      <button style={pill(locked, C.warn)} onClick={toggleLock}>
        {locked ? '🔒 Locked' : 'Unlocked'}
      </button>
      <button
        style={pill(camera, trackerStatus === 'error' ? C.danger : C.ok)}
        disabled={trackerStatus === 'loading'}
        onClick={() => setCamera(!camera)}
      >
        {cameraLabel}
      </button>
    </header>
  )
}
