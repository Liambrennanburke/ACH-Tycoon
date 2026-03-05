import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import Player from './Player'
import Building from './Building'
import SortingBins from '../equipment/SortingBins'

function LoadingFallback() {
  return (
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#00ff88" wireframe />
    </mesh>
  )
}

export default function Scene({ children }) {
  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#c4d4ff" />
      <directionalLight
        position={[20, 30, 10]}
        intensity={0.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Warehouse interior lighting — warm fluorescent tone */}
      <hemisphereLight
        args={['#ffeecc', '#334455', 0.2]}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a0f', 25, 55]} />

      <Suspense fallback={<LoadingFallback />}>
        <Player />
        <Building />
        <SortingBins />
        {children}
      </Suspense>
    </Canvas>
  )
}
