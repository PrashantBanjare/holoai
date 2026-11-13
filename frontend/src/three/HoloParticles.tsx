import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 350
const HEIGHT = 4 // particles rise from the floor (y = -1) up to this height, then restart

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  uniform float uSize;
  uniform float uPx;
  attribute float aSpeed;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float h = mod(position.y + uTime * aSpeed, uHeight);
    p.y = h - 1.0;
    p.x += sin(uTime * 0.5 + aSeed * 6.28) * 0.08;
    p.z += cos(uTime * 0.4 + aSeed * 6.28) * 0.08;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPx * (0.5 + aSeed) / -mv.z;

    float f = h / uHeight;
    float twinkle = 0.45 + 0.55 * sin(uTime * 2.0 + aSeed * 40.0) * 0.5 + 0.275;
    vAlpha = smoothstep(0.0, 0.15, f) * (1.0 - smoothstep(0.7, 1.0, f)) * twinkle;

    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`

export default function HoloParticles() {
  const gl = useThree((s) => s.gl)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    const seeds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.3 + Math.random() * 2.7
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * HEIGHT
      positions[i * 3 + 2] = Math.sin(angle) * radius
      speeds[i] = 0.08 + Math.random() * 0.18
      seeds[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uHeight: { value: HEIGHT },
        uSize: { value: 26 },
        uPx: { value: gl.getPixelRatio() },
        uColor: { value: new THREE.Color('#7ff3ff') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry, material }
  }, [gl])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
