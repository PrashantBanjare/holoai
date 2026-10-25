import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createHologramMaterial } from '../../three/HologramMaterial'
import { useComponentStore, type ComponentNode } from '../../store/useComponentStore'
 
type Props = { url: string }

type Holo = {
  mat: THREE.ShaderMaterial
  edgeMat: THREE.LineBasicMaterial
  amount: number
}

const EDGE_BASE = new THREE.Color('#9ff7ff')
const EDGE_HIGHLIGHT = new THREE.Color('#ff3355')

const isMesh = (o: THREE.Object3D) => (o as THREE.Mesh).isMesh === true

const hasMesh = (o: THREE.Object3D): boolean => {
  let found = false
  o.traverse((c) => {
    if (isMesh(c)) found = true
  })
  return found
}

const prettify = (raw: string, fallback: string) =>
  raw.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim() || fallback

/**
 * Walks the scene graph and registers every node that contains meshes.
 * Pass-through wrapper nodes (one child, no mesh of their own) are skipped.
 * Each mesh remembers its "chain": its own component id plus its ancestors',
 * which is how selecting a group highlights all of its parts.
 */
function buildRegistry(root: THREE.Object3D): ComponentNode[] {
  const nodes: ComponentNode[] = []
  let counter = 0

  const visit = (obj: THREE.Object3D, parentId: string | null, ancestors: string[], depth: number) => {
    if (!hasMesh(obj)) return
    const kids = obj.children.filter(hasMesh)
    const own = isMesh(obj)

    if (!own && kids.length === 1) {
      visit(kids[0], parentId, ancestors, depth)
      return
    }

    const id = `c${counter++}`
    const chain = [id, ...ancestors]
    const fallback = own ? `Part ${counter}` : `Group ${counter}`
    const name =
      depth === 0 && (!obj.name || obj.name === 'Scene') ? 'Model' : prettify(obj.name, fallback)

    nodes.push({ id, name, parentId, depth, kind: own ? 'part' : 'assembly' })
    if (own) obj.userData.componentChain = chain

    for (const k of kids) visit(k, id, chain, depth + 1)
  }

  visit(root, null, [], 0)
  return nodes
}

const pick = (intersections: THREE.Intersection[]) => {
  const hit = intersections.find((i) => i.object.visible && i.object.userData.componentChain)
  return hit ? (hit.object.userData.componentChain as string[])[0] : null
}

export default function ModelLoader({ url }: Props) {
  const { scene } = useGLTF(url)
  const meshes = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    // Center and scale only once (React dev mode runs effects twice)
    if (!scene.userData.normalized) {
      const box = new THREE.Box3().setFromObject(scene)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const scale = 3 / Math.max(size.x, size.y, size.z)
      scene.scale.setScalar(scale)
      scene.position.copy(center).multiplyScalar(-scale)
      scene.userData.normalized = true
    }

    const nodes = buildRegistry(scene)

    const list: THREE.Mesh[] = []
    scene.traverse((obj) => {
      if (!isMesh(obj)) return
      const mesh = obj as THREE.Mesh
      if (!mesh.userData.holo) {
        const mat = createHologramMaterial()
        const edgeMat = new THREE.LineBasicMaterial({
          color: EDGE_BASE.clone(),
          transparent: true,
          opacity: 0.85,
        })
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), edgeMat)
        edges.raycast = () => {} // outlines must not block mouse picking
        mesh.add(edges)
        mesh.userData.holo = { mat, edgeMat, amount: 0 } as Holo
      }
      mesh.material = (mesh.userData.holo as Holo).mat
      list.push(mesh)
    })

    meshes.current = list
    useComponentStore.getState().setNodes(nodes)
    return () => useComponentStore.getState().setNodes([])
  }, [scene])

  useFrame(({ clock }, delta) => {
    const { selectedId, hoveredId, isolatedId } = useComponentStore.getState()
    const t = clock.getElapsedTime()

    for (const mesh of meshes.current) {
      const holo = mesh.userData.holo as Holo
      const chain = mesh.userData.componentChain as string[] | undefined
      if (!chain) continue

      mesh.visible = isolatedId === null || chain.includes(isolatedId)

      const target =
        selectedId && chain.includes(selectedId) ? 1 : hoveredId && chain.includes(hoveredId) ? 0.45 : 0
      holo.amount = THREE.MathUtils.damp(holo.amount, target, 12, delta)

      holo.mat.uniforms.uTime.value = t
      holo.mat.uniforms.uHighlight.value = holo.amount
      holo.edgeMat.color.copy(EDGE_BASE).lerp(EDGE_HIGHLIGHT, holo.amount)
    }
  })

  return (
    <primitive
      object={scene}
      onClick={(e: { stopPropagation: () => void; intersections: THREE.Intersection[] }) => {
        e.stopPropagation()
        const id = pick(e.intersections)
        if (id) useComponentStore.getState().select(id)
      }}
      onPointerMove={(e: { stopPropagation: () => void; intersections: THREE.Intersection[] }) => {
        e.stopPropagation()
        useComponentStore.getState().hover(pick(e.intersections))
      }}
      onPointerOut={() => useComponentStore.getState().hover(null)}
    />
  )
}