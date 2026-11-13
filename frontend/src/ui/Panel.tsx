import { useState, type ReactNode } from 'react'
import { C, label } from './theme'

type Props = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  right?: ReactNode
  grow?: boolean // lets the panel shrink and scroll inside a column
}

/** Collapsible side-panel section used by every sidebar widget. */
export default function Panel({ title, children, defaultOpen = true, right, grow = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: grow && open ? '1 1 auto' : '0 0 auto',
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        backdropFilter: 'blur(6px)',
        fontSize: 12,
        textAlign: 'left',
        color: C.text,
      }}
    >
      <header
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={label}>
          {open ? '▾' : '▸'} {title}
        </span>
        <span onClick={(e) => e.stopPropagation()}>{right}</span>
      </header>
      {open && (
        <div style={{ padding: '0 12px 12px', overflowY: 'auto', minHeight: 0, flex: '1 1 auto' }}>
          {children}
        </div>
      )}
    </section>
  )
}
