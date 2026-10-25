import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = viewMatrix * worldPos;
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHighlightColor;
  uniform float uHighlight;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  void main() {
    // Rim glow: only the silhouette edges get bright
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 3.0);

    // Faint scan lines
    float scan = sin(vWorldPos.y * 40.0 - uTime * 2.0) * 0.5 + 0.5;
    scan = smoothstep(0.5, 1.0, scan);

    float flicker = 0.96 + 0.04 * sin(uTime * 25.0);

    vec3 base = mix(uColor, uHighlightColor, uHighlight);

    // Dim body, brighter rim; highlighted parts get an extra lift
    float intensity = (0.06 + fresnel * 0.5 + scan * 0.06 + uHighlight * 0.5) * flicker;
    float alpha = clamp(uOpacity * (0.25 + fresnel + uHighlight * 0.5), 0.0, 1.0);

    gl_FragColor = vec4(base * intensity, alpha);
  }
`
export function createHologramMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#38e8ff') },
      uHighlightColor: { value: new THREE.Color('#dc143c') },
      uHighlight: { value: 0 },
      uOpacity: { value: 0.6 },
    },
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}