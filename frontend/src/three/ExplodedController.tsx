import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useComponentStore } from '../store/useComponentStore'
import { useExplodeStore } from '../store/useExplodeStore'

type Part = {
  mesh: THREE.Mesh
  id: string
  origin: THREE.Vector3 // original local position
  offset: THREE.Vector3 // full-distance offset, in the mesh's parent space
  dist: number
  amount: number // 0 = home, 1 = fully exploded (smoothed)
}

export default function ExplodedController() {
  const { scene } = useThree()
  const nodes = useComponentStore((s) => s.nodes)
  const parts = useRef<Part[]>([])

  // Build the part list whenever a model finishes loading
  useEffect(() => {
    if (nodes.length === 0) {
      parts.current = []
      useExplodeStore.getState().setTotal(0)
      return
    }

    const found: THREE.Object3D[] = []
    scene.traverse((o) => {
      if (o.userData.normalized) found.push(o)
    })
    const root = found[0]
    if (!root) return

    scene.updateMatrixWorld(true)
    const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert()

    const meshes: THREE.Mesh[] = []
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.userData.componentChain) meshes.push(o as THREE.Mesh)
    })
    if (meshes.length === 0) return

    // Part centers in the model's own coordinate space
    const box = new THREE.Box3()
    const centers = meshes.map((m) => {
      box.setFromObject(m)
      return box.getCenter(new THREE.Vector3()).applyMatrix4(rootInv)
    })

    const bounds = new THREE.Box3().setFromPoints(centers)
    const modelCenter = bounds.getCenter(new THREE.Vector3())
    const radius = Math.max(bounds.getSize(new THREE.Vector3()).length() / 2, 1e-6)

    const list: Part[] = meshes.map((mesh, i) => {
      const dir = centers[i].clone().sub(modelCenter)
      const len = dir.length()
      if (len < radius * 0.02) dir.set(0, 1, 0)
      else dir.normalize()

      // Far parts travel further, every part gets a minimum push
      const magnitude = radius * 0.2 + len * 0.8

      // Convert the direction into the mesh's parent space so nested transforms work
      const toRoot = new THREE.Matrix4().multiplyMatrices(rootInv, mesh.parent!.matrixWorld)
      const inverseLinear = new THREE.Matrix3().setFromMatrix4(toRoot).invert()
      const offset = dir.multiplyScalar(magnitude).applyMatrix3(inverseLinear)

      return {
        mesh,
        id: (mesh.userData.componentChain as string[])[0],
        origin: mesh.position.clone(),
        offset,
        dist: len,
        amount: 0,
      }
    })

    // Sequential order: outermost parts open first
    list.sort((a, b) => b.dist - a.dist)

    parts.current = list
    useExplodeStore.getState().setTotal(list.length)

    return () => {
      list.forEach((p) => p.mesh.position.copy(p.origin))
      parts.current = []
    }
  }, [scene, nodes])

  // In sequential mode, select each part as it opens
  useEffect(() => {
    return useExplodeStore.subscribe((s, prev) => {
      if (s.sequential && s.exploded && s.openCount > 0 && s.openCount !== prev.openCount) {
        const p = parts.current[s.openCount - 1]
        if (p) useComponentStore.getState().select(p.id)
      }
    })
  }, [])

  useFrame((_, delta) => {
    const { exploded, distance, sequential, openCount } = useExplodeStore.getState()
    const list = parts.current

    for (let i = 0; i < list.length; i++) {
      const p = list[i]
      const target = exploded && (!sequential || i < openCount) ? 1 : 0
      p.amount = THREE.MathUtils.damp(p.amount, target, 5, delta)
      if (Math.abs(p.amount - target) < 0.0005) p.amount = target
      p.mesh.position.copy(p.origin).addScaledVector(p.offset, p.amount * distance)
    }
  })

  return null
}