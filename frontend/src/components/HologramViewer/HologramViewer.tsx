import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import ModelLoader from '../ModelLoader/ModelLoader'
import ModelErrorBoundary from '../ModelLoader/ModelErrorBoundary'
import ModelManager from '../../three/ModelManager'
import HandPicker from '../../three/HandPicker'
import ExplodedController from '../../three/ExplodedController'
import HoloParticles from '../../three/HoloParticles'
import HologramBase from '../../three/HologramBase'
import { useComponentStore } from '../../store/useComponentStore'
import { useModelStore } from '../../store/useModelStore'
import { useAppStore } from '../../store/useAppStore'

export default function HologramViewer() {
  const modelUrl = useModelStore((s) => s.url)
  const solid = useAppStore((s) => s.viewMode === 'solid')
  const bg = solid ? '#0d1522' : '#02060d'

  return (
    <Canvas
      shadows
      camera={{ position: [4, 2.5, 5], fov: 45 }}
      onPointerMissed={() => useComponentStore.getState().select(null)}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 8, 20]} />

      <ambientLight intensity={solid ? 0.35 : 0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={solid ? 2.2 : 1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      {/* Solid view: a procedural studio "HDR" built from light panels, so it works offline */}
      {solid && (
        <Environment resolution={256} environmentIntensity={0.9}>
          <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={2} position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[6, 1, -3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="ring" color="#9fe8ff" intensity={2} position={[0, 3, -6]} scale={5} />
        </Environment>
      )}

      <ModelErrorBoundary key={modelUrl}>
        <Suspense fallback={null}>
          <ModelManager>
            <ModelLoader url={modelUrl} />
          </ModelManager>
        </Suspense>
      </ModelErrorBoundary>

      {/* Receives the model's shadow in solid view */}
      {solid && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -1.001, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.45} />
        </mesh>
      )}

      <Grid
        position={[0, -1, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor={solid ? '#2a3a52' : '#1b7f95'}
        sectionSize={2.5}
        sectionThickness={1.2}
        sectionColor={solid ? '#4a6080' : '#38e8ff'}
        fadeDistance={14}
        fadeStrength={1.5}
        infiniteGrid
      />

      {!solid && (
        <>
          <HologramBase />
          <HoloParticles />
        </>
      )}

      <ExplodedController />
      <HandPicker />
      <OrbitControls enableDamping target={[0, 0, 0]} />

      <EffectComposer>
        <Bloom
          intensity={solid ? 0.12 : 0.5}
          luminanceThreshold={solid ? 0.9 : 0.6}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
