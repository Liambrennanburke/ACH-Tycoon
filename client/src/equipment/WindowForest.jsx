export default function WindowForest({ data }) {
  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Frame */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2.5, 2, 0.12]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.6} />
      </mesh>
      {/* Misty sky */}
      <mesh position={[0, 2, 0.07]}>
        <boxGeometry args={[2.3, 1.8, 0.01]} />
        <meshStandardMaterial color="#a8c4a0" emissive="#8faa85" emissiveIntensity={0.2} />
      </mesh>
      {/* Ground */}
      <mesh position={[0, 1.2, 0.08]}>
        <boxGeometry args={[2.3, 0.2, 0.01]} />
        <meshStandardMaterial color="#3a5a30" />
      </mesh>
      {/* Trees */}
      {[-0.8, -0.3, 0.2, 0.7].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 1.6, 0.09]}>
            <boxGeometry args={[0.05, 0.5 + i * 0.08, 0.01]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          <mesh position={[x, 2.0 + i * 0.04, 0.09]}>
            <boxGeometry args={[0.3 + i * 0.04, 0.5, 0.01]} />
            <meshStandardMaterial color={i % 2 ? '#1a5c1a' : '#2d7a2d'} />
          </mesh>
          <mesh position={[x, 2.3 + i * 0.03, 0.09]}>
            <boxGeometry args={[0.2, 0.3, 0.01]} />
            <meshStandardMaterial color={i % 2 ? '#2d7a2d' : '#1a5c1a'} />
          </mesh>
        </group>
      ))}
      {/* Mist layer */}
      <mesh position={[0, 1.8, 0.1]}>
        <boxGeometry args={[2.3, 0.8, 0.01]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>
      <pointLight position={[0, 2, 0.5]} color="#88aa88" intensity={1.5} distance={3} />
      <mesh userData={{ interactable: true, equipmentType: 'window_forest', equipmentId: data.id }} position={[0, 2, 0.07]}>
        <boxGeometry args={[2.3, 1.8, 0.02]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
