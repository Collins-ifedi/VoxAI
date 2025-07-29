export class SoundManager {
  constructor() {
    this.sounds = {}
    this.isEnabled = JSON.parse(localStorage.getItem("soundsEnabled") || "true")
    this.volume = Number.parseFloat(localStorage.getItem("soundVolume") || "0.5")
    this.init()
  }

  init() {
    // Create audio contexts for different sounds
    this.sounds = {
      keystroke: this.createKeystrokeSound(),
      messageSent: this.createMessageSentSound(),
      messageReceived: this.createMessageReceivedSound(),
      notification: this.createNotificationSound(),
    }
  }

  createKeystrokeSound() {
    // Create a subtle keystroke sound using Web Audio API
    return () => {
      if (!this.isEnabled) return

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  createMessageSentSound() {
    return () => {
      if (!this.isEnabled) return

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Ascending tone for sent messages
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.2)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }

  createMessageReceivedSound() {
    return () => {
      if (!this.isEnabled) return

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Descending tone for received messages
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.3)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  }

  createNotificationSound() {
    return () => {
      if (!this.isEnabled) return

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create a more complex notification sound
      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, startTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      // Play a sequence of tones
      playTone(523, audioContext.currentTime, 0.2) // C5
      playTone(659, audioContext.currentTime + 0.2, 0.2) // E5
      playTone(784, audioContext.currentTime + 0.4, 0.3) // G5
    }
  }

  playKeystroke() {
    this.sounds.keystroke()
  }

  playMessageSent() {
    this.sounds.messageSent()
  }

  playMessageReceived() {
    this.sounds.messageReceived()
  }

  playNotification() {
    this.sounds.notification()
  }

  setEnabled(enabled) {
    this.isEnabled = enabled
    localStorage.setItem("soundsEnabled", JSON.stringify(enabled))
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem("soundVolume", this.volume.toString())
  }

  isEnabledState() {
    return this.isEnabled
  }

  getVolume() {
    return this.volume
  }
}
