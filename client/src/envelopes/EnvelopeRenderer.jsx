import useGameStore from '../store/gameStore'
import Envelope from './Envelope'

export default function EnvelopeRenderer() {
  const activeEnvelopes = useGameStore((s) => s.activeEnvelopes)

  return (
    <group>
      {activeEnvelopes.map((env) => (
        <Envelope key={env.id} data={env} />
      ))}
    </group>
  )
}
