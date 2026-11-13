import type { CSSProperties } from 'react'

export const C = {
  accent: '#38e8ff',
  text: '#cfeeff',
  muted: '#7fb8c8',
  dim: '#4d7a88',
  white: '#ffffff',
  danger: '#ff6b81',
  ok: '#5dffb0',
  warn: '#ffb347',
  bg: 'rgba(2, 20, 32, 0.78)',
  border: 'rgba(56, 232, 255, 0.4)',
}

export const label: CSSProperties = {
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: C.accent,
}

export const btn = (active = false, disabled = false): CSSProperties => ({
  flex: 1,
  padding: '7px 6px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: disabled ? C.dim : active ? '#02060d' : C.text,
  background: active ? C.accent : 'transparent',
  border: `1px solid ${disabled ? 'rgba(56,232,255,0.2)' : 'rgba(56,232,255,0.6)'}`,
  borderRadius: 4,
  cursor: disabled ? 'default' : 'pointer',
})

export const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  background: 'rgba(0, 0, 0, 0.35)',
  color: C.white,
  border: '1px solid rgba(56, 232, 255, 0.5)',
  borderRadius: 4,
  outline: 'none',
  fontSize: 13,
}
