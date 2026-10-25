import type { CSSProperties } from 'react'
import { useAppStore } from '../../store/useAppStore'

const ROT = 0.3
const MOVE = 0.25

const panel: CSSProperties = {
  position: 'absolute',
  left: 16,
  bottom: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 12,
  background: 'rgba(2, 20, 32, 0.7)',
  border: '1px solid rgba(56, 232, 255, 0.4)',
  borderRadius: 8,
  backdropFilter: 'blur(6px)',
}

const row: CSSProperties = { display: 'flex', gap: 6, alignItems: 'center' }

const label: CSSProperties = {
  width: 56,
  fontSize: 12,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#38e8ff',
}

const btn: CSSProperties = {
  minWidth: 34,
  padding: '6px 10px',
  background: 'transparent',
  color: '#cfeeff',
  border: '1px solid rgba(56, 232, 255, 0.5)',
  borderRadius: 4,
  cursor: 'pointer',
}

export default function ModelControls() {
  const { rotateBy, moveBy, zoomBy, reset } = useAppStore()

  return (
    <div style={panel}>
      <div style={row}>
        <span style={label}>Rotate</span>
        <button style={btn} onClick={() => rotateBy(0, -ROT)}>◀</button>
        <button style={btn} onClick={() => rotateBy(0, ROT)}>▶</button>
        <button style={btn} onClick={() => rotateBy(-ROT, 0)}>▲</button>
        <button style={btn} onClick={() => rotateBy(ROT, 0)}>▼</button>
      </div>
      <div style={row}>
        <span style={label}>Move</span>
        <button style={btn} onClick={() => moveBy(-MOVE, 0)}>◀</button>
        <button style={btn} onClick={() => moveBy(MOVE, 0)}>▶</button>
        <button style={btn} onClick={() => moveBy(0, MOVE)}>▲</button>
        <button style={btn} onClick={() => moveBy(0, -MOVE)}>▼</button>
      </div>
      <div style={row}>
        <span style={label}>Zoom</span>
        <button style={btn} onClick={() => zoomBy(1.15)}>＋</button>
        <button style={btn} onClick={() => zoomBy(1 / 1.15)}>－</button>
      </div>
      <div style={row}>
        <button style={{ ...btn, width: '100%' }} onClick={reset}>Reset</button>
      </div>
    </div>
  )
}