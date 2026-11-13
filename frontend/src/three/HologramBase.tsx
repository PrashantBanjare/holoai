import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float r = length(vUv - 0.5) * 2.0;

    float pool = smoothstep(1.0, 0.0, r);
    float pulse = fract(uTime * 0.25);
    float ring = smoothstep(0.035, 0.0, abs(r - pulse)) * (1.0 - pulse);
    float rim = smoothstep(0.02, 0.0, abs(r - 0.92)) * 0.6;
    float fade = smoothstep(1.0, 0.85, r);

    float a = (pool * 0.16 + ring * 0.55 + rim) * fade;
    gl_FragColor = vec4(uColor, a);
  }
`

export default function HologramBase() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#38e8ff') },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.995, 0]} material={material}>
      <planeGeometry args={[5, 5]} />
    </mesh>
  )
}
