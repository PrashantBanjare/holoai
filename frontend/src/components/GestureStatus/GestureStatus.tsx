import type { CSSProperties } from 'react'
import { useAppStore } from '../../store/useAppStore'

const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 220,
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

const seg = (active: boolean): CSSProperties => ({
  flex: 1,
  padding: '6px 0',
  cursor: 'pointer',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: active ? '#02060d' : '#cfeeff',
  background: active ? '#38e8ff' : 'transparent',
  border: '1px solid rgba(56, 232, 255, 0.6)',
})

export default function GestureStatus() {
  const enabled = useAppStore((s) => s.handControlEnabled)
  const hands = useAppStore((s) => s.handsDetected)
  const label = useAppStore((s) => s.gestureLabel)
  const confidence = useAppStore((s) => s.gestureConfidence)
  const mode = useAppStore((s) => s.interactionMode)
  const pinchMode = useAppStore((s) => s.pinchMode)
  const setPinchMode = useAppStore((s) => s.setPinchMode)

  return (
    <div style={panel}>
      <div style={title}>Gesture status</div>
      <div>Hand control: {enabled ? 'ON' : 'OFF'}</div>
      <div>Hands: {hands}</div>
      <div style={{ marginTop: 6, fontSize: 15, color: '#ffffff' }}>{enabled ? label : '—'}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: '#38e8ff' }}>{enabled ? mode : '—'}</div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(56,232,255,0.15)', borderRadius: 3 }}>
        <div
          style={{
            width: `${Math.round(confidence * 100)}%`,
            height: '100%',
            background: '#38e8ff',
            borderRadius: 3,
            transition: 'width 120ms',
          }}
        />
      </div>
      <div style={{ marginTop: 4, color: '#7fb8c8' }}>Confidence: {Math.round(confidence * 100)}%</div>

      <div style={{ marginTop: 10, color: '#7fb8c8' }}>Pinch drag does:</div>
      <div style={{ display: 'flex', marginTop: 4 }}>
        <button style={seg(pinchMode === 'rotate')} onClick={() => setPinchMode('rotate')}>
          Rotate
        </button>
        <button style={seg(pinchMode === 'move')} onClick={() => setPinchMode('move')}>
          Move
        </button>
      </div>
    </div>
  )
}