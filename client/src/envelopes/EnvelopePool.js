const POOL_SIZE = 200

class EnvelopePool {
  constructor() {
    this.pool = []
    this.active = new Map()
  }

  acquire(envelopeData) {
    let envelope
    if (this.pool.length > 0) {
      envelope = this.pool.pop()
      Object.assign(envelope, envelopeData)
    } else {
      envelope = { ...envelopeData }
    }
    this.active.set(envelope.id, envelope)
    return envelope
  }

  release(id) {
    const envelope = this.active.get(id)
    if (envelope) {
      this.active.delete(id)
      if (this.pool.length < POOL_SIZE) {
        envelope.position = { x: 0, y: -10, z: 0 }
        envelope.state = 'pooled'
        this.pool.push(envelope)
      }
    }
  }

  getActive() {
    return Array.from(this.active.values())
  }

  clear() {
    this.active.clear()
    this.pool = []
  }
}

export default new EnvelopePool()
