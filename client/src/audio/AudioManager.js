class AudioManager {
  constructor() {
    this.ctx = null
    this.initialized = false
    this.masterVolume = 0.5
    this.gainNode = null
    this.ambientNodes = null
  }

  init() {
    if (this.initialized) return
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.gainNode = this.ctx.createGain()
      this.gainNode.gain.value = this.masterVolume
      this.gainNode.connect(this.ctx.destination)
      this.initialized = true
    } catch (e) { /* Web Audio not available */ }
  }

  ensureContext() {
    if (!this.initialized) this.init()
    if (this.ctx?.state === 'suspended') this.ctx.resume()
  }

  // ═══ AMBIENT MUSIC ═══
  startAmbient() {
    this.ensureContext()
    if (!this.ctx || this.ambientNodes) return

    const g = this.ctx.createGain()
    g.gain.value = 0.06
    g.connect(this.gainNode)

    // Low drone pad
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = 55
    const osc1g = this.ctx.createGain()
    osc1g.gain.value = 0.4
    osc1.connect(osc1g)
    osc1g.connect(g)
    osc1.start()

    // Fifth harmony
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 82.5
    const osc2g = this.ctx.createGain()
    osc2g.gain.value = 0.2
    osc2.connect(osc2g)
    osc2g.connect(g)
    osc2.start()

    // Filtered noise for texture
    const bufferSize = this.ctx.sampleRate * 2
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const noise = this.ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true
    const noiseFilter = this.ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.value = 200
    noiseFilter.Q.value = 1
    const noiseGain = this.ctx.createGain()
    noiseGain.gain.value = 0.15
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(g)
    noise.start()

    // Activity layer — responds to throughput
    const actOsc = this.ctx.createOscillator()
    actOsc.type = 'triangle'
    actOsc.frequency.value = 110
    const actGain = this.ctx.createGain()
    actGain.gain.value = 0
    const actFilter = this.ctx.createBiquadFilter()
    actFilter.type = 'lowpass'
    actFilter.frequency.value = 400
    actOsc.connect(actFilter)
    actFilter.connect(actGain)
    actGain.connect(g)
    actOsc.start()

    // Elevator music — lounge jazz chord progression
    this._startElevatorMusic(g)

    this.ambientNodes = { masterGain: g, osc1, osc2, noise, noiseFilter, actOsc, actGain, actFilter }
  }

  updateAmbientActivity(envelopeCount) {
    if (!this.ambientNodes) return
    const t = Math.min(envelopeCount / 20, 1)
    const now = this.ctx.currentTime
    this.ambientNodes.actGain.gain.linearRampToValueAtTime(t * 0.3, now + 0.5)
    this.ambientNodes.actFilter.frequency.linearRampToValueAtTime(200 + t * 600, now + 0.5)
    this.ambientNodes.actOsc.frequency.linearRampToValueAtTime(110 + t * 110, now + 0.5)
  }

  setCrisisAmbient(active) {
    if (!this.ambientNodes) return
    const now = this.ctx.currentTime
    if (active) {
      this.ambientNodes.noiseFilter.frequency.linearRampToValueAtTime(800, now + 0.3)
      this.ambientNodes.masterGain.gain.linearRampToValueAtTime(0.12, now + 0.3)
    } else {
      this.ambientNodes.noiseFilter.frequency.linearRampToValueAtTime(200, now + 1)
      this.ambientNodes.masterGain.gain.linearRampToValueAtTime(0.06, now + 1)
    }
  }

  // ═══ ELEVATOR MUSIC ═══
  _startElevatorMusic(destination) {
    if (!this.ctx) return

    const musicGain = this.ctx.createGain()
    musicGain.gain.value = 0.04
    musicGain.connect(destination)

    // Jazz chord progression: Cmaj7 -> Am7 -> Dm7 -> G7 (loop)
    const chords = [
      [261.6, 329.6, 392.0, 493.9],  // Cmaj7
      [220.0, 261.6, 329.6, 392.0],  // Am7
      [293.7, 349.2, 440.0, 523.3],  // Dm7
      [196.0, 246.9, 293.7, 349.2],  // G7
    ]

    const chordDuration = 4
    let chordIndex = 0
    const oscillators = []

    // Create 4 oscillators for the chord
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = chords[0][i]

      const oscGain = this.ctx.createGain()
      oscGain.gain.value = [0.3, 0.25, 0.2, 0.15][i]

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 800
      filter.Q.value = 0.5

      osc.connect(filter)
      filter.connect(oscGain)
      oscGain.connect(musicGain)
      osc.start()
      oscillators.push({ osc, gain: oscGain, filter })
    }

    // Melody voice — plays simple lounge melody on top
    const melodyOsc = this.ctx.createOscillator()
    melodyOsc.type = 'sine'
    melodyOsc.frequency.value = 523.3
    const melodyGain = this.ctx.createGain()
    melodyGain.gain.value = 0
    const melodyFilter = this.ctx.createBiquadFilter()
    melodyFilter.type = 'lowpass'
    melodyFilter.frequency.value = 1200
    melodyOsc.connect(melodyFilter)
    melodyFilter.connect(melodyGain)
    melodyGain.connect(musicGain)
    melodyOsc.start()

    // Melody notes per chord
    const melodies = [
      [523.3, 587.3, 659.3, 587.3, 523.3, 493.9, 523.3, 0],
      [440.0, 493.9, 523.3, 493.9, 440.0, 392.0, 440.0, 0],
      [587.3, 659.3, 698.5, 659.3, 587.3, 523.3, 587.3, 0],
      [392.0, 440.0, 493.9, 523.3, 493.9, 440.0, 392.0, 0],
    ]

    // Chord + melody cycling
    const advance = () => {
      if (!this.ctx || this.ctx.state === 'closed') return
      const now = this.ctx.currentTime
      const chord = chords[chordIndex]

      oscillators.forEach((o, i) => {
        o.osc.frequency.linearRampToValueAtTime(chord[i], now + 0.5)
      })

      // Play melody notes
      const melody = melodies[chordIndex]
      const noteLen = chordDuration / melody.length
      melody.forEach((freq, i) => {
        const t = now + i * noteLen
        if (freq === 0) {
          melodyGain.gain.linearRampToValueAtTime(0, t)
        } else {
          melodyOsc.frequency.setValueAtTime(freq, t)
          melodyGain.gain.setValueAtTime(0.15, t)
          melodyGain.gain.linearRampToValueAtTime(0.02, t + noteLen * 0.8)
        }
      })

      chordIndex = (chordIndex + 1) % chords.length
      this._elevatorTimer = setTimeout(advance, chordDuration * 1000)
    }

    advance()
  }

  // ═══ SOUND EFFECTS ═══
  playTubeWhoosh() {
    this.ensureContext()
    if (!this.ctx) return
    const dur = 0.4, now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(800, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + dur); filter.Q.value = 2
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + dur)
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
    osc.connect(filter); filter.connect(gain); gain.connect(this.gainNode)
    osc.start(now); osc.stop(now + dur)
  }

  playStamp() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    osc.type = 'square'; osc.frequency.setValueAtTime(120, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1)
    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.connect(gain); gain.connect(this.gainNode); osc.start(now); osc.stop(now + 0.15)
  }

  playSeal() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15)
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain); gain.connect(this.gainNode); osc.start(now); osc.stop(now + 0.3)
  }

  playCorrectSort() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    ;[523, 659, 784].forEach((freq, i) => {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
      osc.type = 'sine'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15)
      osc.connect(gain); gain.connect(this.gainNode)
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.15)
    })
  }

  playIncorrectSort() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now)
    osc.frequency.linearRampToValueAtTime(100, now + 0.3)
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain); gain.connect(this.gainNode); osc.start(now); osc.stop(now + 0.3)
  }

  playVaultSettle() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    ;[261, 329, 392, 523].forEach((freq, i) => {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
      osc.type = 'sine'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4)
      osc.connect(gain); gain.connect(this.gainNode)
      osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.4)
    })
  }

  playEnvelopePickup() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08)
    gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain); gain.connect(this.gainNode); osc.start(now); osc.stop(now + 0.1)
  }

  playFootstep() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(60 + Math.random() * 20, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08)
    gain.gain.setValueAtTime(0.04, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain); gain.connect(this.gainNode); osc.start(now); osc.stop(now + 0.1)
  }

  playCrisisAlarm() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    ;[0, 0.15, 0.3].forEach((t) => {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
      osc.type = 'square'; osc.frequency.value = 880
      gain.gain.setValueAtTime(0.1, now + t); gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1)
      osc.connect(gain); gain.connect(this.gainNode); osc.start(now + t); osc.stop(now + t + 0.1)
    })
  }

  playAchievement() {
    this.ensureContext()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
      osc.type = 'sine'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
      osc.connect(gain); gain.connect(this.gainNode)
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3)
    })
  }

  setVolume(v) {
    this.masterVolume = v
    if (this.gainNode) this.gainNode.gain.value = v
  }
}

export default new AudioManager()
