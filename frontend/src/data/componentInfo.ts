export type ComponentInfo = { type: string; description: string }

const RULES: { match: RegExp; info: ComponentInfo }[] = [
  {
    match: /piston/i,
    info: {
      type: 'Moving part',
      description: 'Slides inside the cylinder and turns combustion pressure into motion.',
    },
  },
  {
    match: /crank/i,
    info: {
      type: 'Rotating shaft',
      description: 'Converts the up-and-down motion of the pistons into rotation.',
    },
  },
  {
    match: /\brod\b|conn/i,
    info: {
      type: 'Linkage',
      description: 'Connects a piston to the crankshaft.',
    },
  },
  {
    match: /valve/i,
    info: {
      type: 'Flow control',
      description: 'Opens and closes to let air in and exhaust out.',
    },
  },
  {
    match: /lifter|tappet/i,
    info: {
      type: 'Valve train',
      description: 'Passes the motion of the camshaft on to a valve.',
    },
  },
  {
    match: /\bcam/i,
    info: {
      type: 'Rotating shaft',
      description: 'Its lobes push the valves open at the right moment.',
    },
  },
  {
    match: /cylinder|block/i,
    info: {
      type: 'Housing',
      description: 'Contains the pistons, where combustion takes place.',
    },
  },
  {
    match: /head/i,
    info: {
      type: 'Housing',
      description: 'Seals the top of the cylinders and holds the valves.',
    },
  },
  {
    match: /gear|cog/i,
    info: {
      type: 'Transmission part',
      description: 'Transfers rotation and torque between shafts.',
    },
  },
  {
    match: /wheel|tire|tyre/i,
    info: {
      type: 'Wheel assembly',
      description: 'Rotates to move the vehicle.',
    },
  },
  {
    match: /body|cab|truck|chassis/i,
    info: {
      type: 'Structure',
      description: 'Main structural part that other components attach to.',
    },
  },
]

export function describeComponent(name: string, kind: 'part' | 'assembly'): ComponentInfo {
  const hit = RULES.find((r) => r.match.test(name))
  if (hit) return hit.info
  return kind === 'assembly'
    ? { type: 'Assembly', description: 'A group of parts that belong together.' }
    : { type: 'Mechanical component', description: 'An individual part of the model.' }
}
