import { useProgress } from '@react-three/drei'
import { C } from '../../ui/theme'

/** Shows model download progress, and any load error message. */
export default function LoadingOverlay() {
  const { active, progress } = useProgress()

  if (!active) return null
  return (
    <div
      style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        background: 'rgba(2,20,32,0.85)',
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        color: C.accent,
        letterSpacing: 2,
        fontSize: 12,
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}
    >
      Loading model {Math.round(progress)}%
    </div>
  )
}
