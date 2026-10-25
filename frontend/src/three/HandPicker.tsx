import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePointerStore } from '../store/usePointerStore'
import { useComponentStore } from '../store/useComponentStore'

export default function HandPicker() {
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const lastTrigger = useRef(0)
  const owns = useRef(false)

  useFrame(({ camera, scene }) => {
    const p = usePointerStore.getState()
    const comp = useComponentStore.getState()

    if (!p.active) {
      if (owns.current) {
        comp.hover(null)
        owns.current = false
      }
      lastTrigger.current = p.trigger
      return
    }

    ndc.set(p.x, p.y)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster
      .intersectObjects(scene.children, true)
      .find((i) => i.object.visible && i.object.userData.componentChain)
    const id = hit ? (hit.object.userData.componentChain as string[])[0] : null

    comp.hover(id)
    owns.current = true

    if (p.trigger !== lastTrigger.current) {
      lastTrigger.current = p.trigger
      if (id) comp.select(id)
    }
  })

  return null
}