export class SpeechService {
  constructor() {
    this.isRecording = false
    this.recognition = null
    this.synthesis = window.speechSynthesis
    this.initSpeechRecognition()
  }

  initSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"

      this.recognition.onstart = () => {
        console.log("Speech recognition started")
        this.updateMicrophoneUI(true)
      }

      this.recognition.onend = () => {
        console.log("Speech recognition ended")
        this.updateMicrophoneUI(false)
        this.isRecording = false
      }

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        this.updateMicrophoneUI(false)
        this.isRecording = false

        // Show user-friendly error message
        this.showSpeechError(event.error)
      }
    }
  }

  async startRecording() {
    if (!this.recognition) {
      throw new Error("Speech recognition not supported in this browser")
    }

    if (this.isRecording) {
      this.stopRecording()
      return
    }

    try {
      this.isRecording = true

      return new Promise((resolve, reject) => {
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          const confidence = event.results[0][0].confidence

          console.log("Speech recognized:", transcript)
          console.log("Confidence:", confidence)

          resolve(transcript)
        }

        this.recognition.onerror = (event) => {
          reject(new Error(`Speech recognition error: ${event.error}`))
        }

        this.recognition.start()
      })
    } catch (error) {
      console.error("Recording error:", error)
      this.updateMicrophoneUI(false)
      this.isRecording = false
      throw error
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop()
    }
    this.isRecording = false
    this.updateMicrophoneUI(false)
  }

  async textToSpeech(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported in this browser"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure speech parameters
      utterance.rate = options.rate || 0.9
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 0.8
      utterance.lang = options.lang || "en-US"

      // Try to use a high-quality voice
      const voices = this.synthesis.getVoices()
      const preferredVoice = this.selectBestVoice(voices, options.voiceType)

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        console.log("Speech synthesis started")
        this.updateSpeechUI(true)
      }

      utterance.onend = () => {
        console.log("Speech synthesis ended")
        this.updateSpeechUI(false)
        resolve()
      }

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error)
        this.updateSpeechUI(false)
        reject(error)
      }

      // Add some delay to ensure voices are loaded
      if (voices.length === 0) {
        this.synthesis.addEventListener(
          "voiceschanged",
          () => {
            const newVoices = this.synthesis.getVoices()
            const newPreferredVoice = this.selectBestVoice(newVoices, options.voiceType)
            if (newPreferredVoice) {
              utterance.voice = newPreferredVoice
            }
            this.synthesis.speak(utterance)
          },
          { once: true },
        )
      } else {
        this.synthesis.speak(utterance)
      }
    })
  }

  selectBestVoice(voices, voiceType = "female") {
    // Filter for English voices
    const englishVoices = voices.filter((voice) => voice.lang.startsWith("en") && !voice.name.includes("eSpeak"))

    if (englishVoices.length === 0) return null

    // Prefer specific voice types
    const voicePreferences = {
      female: ["Google US English", "Microsoft Zira", "Alex", "Samantha", "Victoria"],
      male: ["Google UK English Male", "Microsoft David", "Daniel", "Tom"],
      neutral: ["Google US English", "Microsoft Mark", "Karen", "Moira"],
    }

    const preferences = voicePreferences[voiceType] || voicePreferences.female

    // Try to find preferred voices
    for (const preference of preferences) {
      const voice = englishVoices.find((v) => v.name.includes(preference))
      if (voice) return voice
    }

    // Fallback to any high-quality English voice
    const qualityVoices = englishVoices.filter(
      (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.localService === false,
    )

    return qualityVoices[0] || englishVoices[0]
  }

  updateMicrophoneUI(isActive) {
    const micButton = document.getElementById("micButton")
    const micIcon = document.getElementById("micIcon")

    if (micButton && micIcon) {
      if (isActive) {
        micButton.classList.add("bg-red-500", "animate-pulse")
        micButton.classList.remove("bg-gray-500", "hover:bg-gray-600")
        micButton.classList.add("hover:bg-red-600")
        micIcon.className = "fas fa-stop"
        micButton.title = "Stop recording"
      } else {
        micButton.classList.remove("bg-red-500", "animate-pulse", "hover:bg-red-600")
        micButton.classList.add("bg-gray-500", "hover:bg-gray-600")
        micIcon.className = "fas fa-microphone"
        micButton.title = "Start voice input"
      }
    }

    // Update status indicator
    const statusIndicator = document.getElementById("speechStatus")
    if (statusIndicator) {
      if (isActive) {
        statusIndicator.innerHTML = '<i class="fas fa-circle text-red-500 animate-pulse mr-1"></i>Listening...'
        statusIndicator.className = "text-red-500 text-sm flex items-center justify-center"
      } else {
        statusIndicator.textContent = ""
        statusIndicator.className = "text-gray-500 text-sm"
      }
    }
  }

  updateSpeechUI(isSpeaking) {
    const statusIndicator = document.getElementById("speechStatus")
    if (statusIndicator && isSpeaking) {
      statusIndicator.innerHTML = '<i class="fas fa-volume-up text-blue-500 animate-pulse mr-1"></i>Speaking...'
      statusIndicator.className = "text-blue-500 text-sm flex items-center justify-center"
    } else if (statusIndicator && !this.isRecording) {
      statusIndicator.textContent = ""
      statusIndicator.className = "text-gray-500 text-sm"
    }
  }

  showSpeechError(errorType) {
    let message = "Speech recognition failed. Please try again."

    switch (errorType) {
      case "no-speech":
        message = "No speech detected. Please speak clearly and try again."
        break
      case "audio-capture":
        message = "Microphone access denied. Please allow microphone access."
        break
      case "not-allowed":
        message = "Microphone permission denied. Please enable microphone access."
        break
      case "network":
        message = "Network error. Please check your connection and try again."
        break
      case "aborted":
        message = "Speech recognition was cancelled."
        break
    }

    // Show error message to user
    this.showUserMessage(message, "error")
  }

  showUserMessage(message, type = "info") {
    // Remove existing messages
    const existingMessage = document.querySelector(".speech-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    // Create new message
    const messageDiv = document.createElement("div")
    messageDiv.className = `speech-message fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white z-50 ${
      type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500"
    }`
    messageDiv.textContent = message

    document.body.appendChild(messageDiv)

    // Remove after 4 seconds
    setTimeout(() => {
      messageDiv.remove()
    }, 4000)
  }

  // Get available voices for user selection
  getAvailableVoices() {
    if (!this.synthesis) return []

    const voices = this.synthesis.getVoices()
    return voices
      .filter((voice) => voice.lang.startsWith("en"))
      .map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        gender: this.detectGender(voice.name),
        quality: voice.localService ? "standard" : "premium",
      }))
  }

  detectGender(voiceName) {
    const femaleNames = ["zira", "cortana", "samantha", "victoria", "karen", "moira", "female"]
    const maleName = ["david", "mark", "daniel", "tom", "male"]

    const name = voiceName.toLowerCase()

    if (femaleNames.some((f) => name.includes(f))) return "female"
    if (maleName.some((m) => name.includes(m))) return "male"
    return "neutral"
  }

  isSupported() {
    return !!(this.recognition && this.synthesis)
  }

  // Stop any ongoing speech
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.updateSpeechUI(false)
    }
  }
}
