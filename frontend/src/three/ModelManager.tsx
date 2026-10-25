import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'

const SMOOTHING = 8

export default function ModelManager({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const { rotation, position, scale } = useAppStore.getState()

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rotation[0], SMOOTHING, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, rotation[1], SMOOTHING, delta)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, rotation[2], SMOOTHING, delta)

    g.position.x = THREE.MathUtils.damp(g.position.x, position[0], SMOOTHING, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, position[1], SMOOTHING, delta)
    g.position.z = THREE.MathUtils.damp(g.position.z, position[2], SMOOTHING, delta)

    const s = THREE.MathUtils.damp(g.scale.x, scale, SMOOTHING, delta)
    g.scale.setScalar(s)
  })

  return <group ref={group}>{children}</group>
}