import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import ModelLoader from '../ModelLoader/ModelLoader'
import ModelManager from '../../three/ModelManager'
import HandPicker from '../../three/HandPicker'
import ExplodedController from '../../three/ExplodedController'
import { useComponentStore } from '../../store/useComponentStore'
import { useModelStore } from '../../store/useModelStore'

export default function HologramViewer() {
  const modelUrl = useModelStore((s) => s.url)

  return (
    <Canvas
      camera={{ position: [4, 2.5, 5], fov: 45 }}
      onPointerMissed={() => useComponentStore.getState().select(null)}
    >
      <color attach="background" args={['#02060d']} />
      <fog attach="fog" args={['#02060d', 8, 20]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />

      <Suspense fallback={null}>
        <ModelManager>
          <ModelLoader key={modelUrl} url={modelUrl} />
        </ModelManager>
      </Suspense>

      <Grid
        position={[0, -1, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1b7f95"
        sectionSize={2.5}
        sectionThickness={1.2}
        sectionColor="#38e8ff"
        fadeDistance={14}
        fadeStrength={1.5}
        infiniteGrid
      />

      <ExplodedController />
      <HandPicker />
      <OrbitControls enableDamping target={[0, 0, 0]} />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}