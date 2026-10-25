import type { CSSProperties } from 'react'
import { useComponentStore } from '../../store/useComponentStore'

const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  width: 250,
  maxHeight: 'calc(100% - 280px)',
  display: 'flex',
  flexDirection: 'column',
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

const row = (selected: boolean, depth: number): CSSProperties => ({
  padding: '4px 6px',
  paddingLeft: 6 + depth * 14,
  cursor: 'pointer',
  borderRadius: 3,
  color: selected ? '#02060d' : '#cfeeff',
  background: selected ? '#ffb347' : 'transparent',
})

const btn = (disabled: boolean): CSSProperties => ({
  flex: 1,
  padding: '6px 4px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: disabled ? '#4d7a88' : '#cfeeff',
  background: 'transparent',
  border: `1px solid ${disabled ? 'rgba(56,232,255,0.2)' : 'rgba(56,232,255,0.6)'}`,
  borderRadius: 4,
  cursor: disabled ? 'default' : 'pointer',
})

export default function ComponentTree() {
  const nodes = useComponentStore((s) => s.nodes)
  const selectedId = useComponentStore((s) => s.selectedId)
  const isolatedId = useComponentStore((s) => s.isolatedId)
  const select = useComponentStore((s) => s.select)
  const hover = useComponentStore((s) => s.hover)
  const isolate = useComponentStore((s) => s.isolate)

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const inside = (id: string, ancestor: string) => {
    let cur = byId.get(id)
    while (cur) {
      if (cur.id === ancestor) return true
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    }
    return false
  }

  const sel = selectedId ? byId.get(selectedId) : undefined

  let status = '—'
  if (sel) {
    if (isolatedId === null) status = 'Visible'
    else if (inside(sel.id, isolatedId)) status = isolatedId === sel.id ? 'Isolated' : 'Visible'
    else if (inside(isolatedId, sel.id)) status = 'Partially visible'
    else status = 'Hidden'
  }

  const selectedIsIsolated = sel !== undefined && isolatedId === sel.id

  return (
    <div style={panel}>
      <div style={title}>Components</div>

      <div style={{ overflowY: 'auto', flex: 1, minHeight: 60 }}>
        {nodes.length === 0 && <div style={{ color: '#7fb8c8' }}>Loading model...</div>}
        {nodes.map((n) => (
          <div
            key={n.id}
            style={row(n.id === selectedId, n.depth)}
            onClick={() => select(n.id === selectedId ? null : n.id)}
            onMouseEnter={() => hover(n.id)}
            onMouseLeave={() => hover(null)}
          >
            {n.kind === 'assembly' ? '▾ ' : '• '}
            {n.name}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(56,232,255,0.25)' }}>
        <div style={{ color: '#7fb8c8' }}>Selected</div>
        <div style={{ fontSize: 15, color: '#ffffff', textTransform: 'uppercase', marginTop: 2 }}>
          {sel ? sel.name : 'None'}
        </div>
        {sel && (
          <div style={{ marginTop: 6, color: '#cfeeff', lineHeight: 1.6 }}>
            <div>Type: {sel.kind === 'part' ? 'Mesh part' : 'Assembly'}</div>
            <div>ID: {sel.id}</div>
            <div>Status: {status}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            style={btn(!sel)}
            disabled={!sel}
            onClick={() => sel && isolate(selectedIsIsolated ? null : sel.id)}
          >
            {selectedIsIsolated ? 'Show all' : 'Isolate'}
          </button>
          <button style={btn(isolatedId === null)} disabled={isolatedId === null} onClick={() => isolate(null)}>
            Show all
          </button>
          <button style={btn(!sel)} disabled={!sel} onClick={() => select(null)}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}