import { createEnvelope } from '../envelopes/EnvelopeFactory'
import { BUILDING } from '../../../shared/types.js'

class TransactionQueue {
  constructor() {
    this.queue = []
    this.currentIndex = 0
    this.spawnX = BUILDING.WIDTH / 2 - 2
  }

  load(envelopes) {
    this.queue = envelopes.sort((a, b) => a.gameTime - b.gameTime)
    this.currentIndex = 0
  }

  getSpawnsDue(gameTime) {
    const spawns = []
    while (
      this.currentIndex < this.queue.length &&
      this.queue[this.currentIndex].gameTime <= gameTime
    ) {
      const txnData = this.queue[this.currentIndex]
      const envelope = createEnvelope(txnData, {
        x: this.spawnX,
        y: 0.85,
        z: (Math.random() - 0.5) * 2,
      })
      spawns.push(envelope)
      this.currentIndex++
    }
    return spawns
  }

  isComplete() {
    return this.currentIndex >= this.queue.length
  }

  getTotal() {
    return this.queue.length
  }

  getProcessed() {
    return this.currentIndex
  }

  reset() {
    this.currentIndex = 0
  }
}

export default new TransactionQueue()
