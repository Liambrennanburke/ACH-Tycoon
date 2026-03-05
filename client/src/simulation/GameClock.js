import { TIME_COMPRESSION } from '../../../shared/types.js'

class GameClock {
  constructor() {
    this.elapsed = 0
    this.running = false
    this.speed = 1
    this.listeners = []
    this.quarterDuration = TIME_COMPRESSION.TOTAL_GAME_DURATION_SEC / TIME_COMPRESSION.QUARTERS
  }

  start() {
    this.running = true
  }

  pause() {
    this.running = false
  }

  reset() {
    this.elapsed = 0
    this.running = false
    this.speed = 1
  }

  tick(delta) {
    if (!this.running) return
    this.elapsed += delta * this.speed
    this.listeners.forEach((fn) => fn(this.elapsed, delta * this.speed))
  }

  getCurrentQuarter() {
    return Math.floor(this.elapsed / this.quarterDuration)
  }

  getProgress() {
    return Math.min(this.elapsed / TIME_COMPRESSION.TOTAL_GAME_DURATION_SEC, 1)
  }

  isFinished() {
    return this.elapsed >= TIME_COMPRESSION.TOTAL_GAME_DURATION_SEC
  }

  onTick(fn) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn)
    }
  }
}

export default new GameClock()
