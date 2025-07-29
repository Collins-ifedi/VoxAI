import { ChatManager } from "./chat.js"
import { SettingsManager } from "./settings.js"
import { WebSocketManager } from "./websocket.js"
import { SoundManager } from "./sounds.js"
import { SubscriptionManager } from "./subscription-manager.js"
import { SpeechService } from "./speech-service.js"
import { config, debugLog } from "./config.js"

class App {
  constructor() {
    this.chatManager = new ChatManager()
    this.settingsManager = new SettingsManager()
    this.wsManager = new WebSocketManager()
    this.soundManager = new SoundManager()
    this.subscriptionManager = new SubscriptionManager()
    this.speechService = new SpeechService()

    this.init()
  }

  init() {
    // Check authentication
    if (!this.checkAuth()) {
      console.log("Redirecting to login page")
      window.location.href = "login.html"
      return
    }

    console.log("User authenticated, initializing app")
    this.setupEventListeners()
    this.loadUserData()
    this.settingsManager.init()
    this.chatManager.init()
    this.wsManager.init()
    this.setupKeystrokeSounds()
    this.setupSpeechFeatures()
  }

  checkAuth() {
    const user = localStorage.getItem("user")
    if (!user) {
      console.log("No user found, redirecting to login")
      return false
    }
    console.log("User found:", JSON.parse(user))
    return true
  }

  setupKeystrokeSounds() {
    // Add keystroke sounds to message input
    const messageInput = document.getElementById("messageInput")
    if (messageInput) {
      messageInput.addEventListener("keydown", (e) => {
        // Don't play sound for special keys
        if (e.key.length === 1) {
          this.soundManager.playKeystroke()
        }
      })
    }
  }

  setupSpeechFeatures() {
    const micButton = document.getElementById("micButton")
    if (micButton) {
      micButton.addEventListener("click", () => {
        this.handleVoiceInput()
      })

      // Show/hide mic button based on support
      if (!this.speechService.isSupported()) {
        micButton.style.display = "none"
      }
    }
  }

  async handleVoiceInput() {
    // Voice features are now free for all users!
    try {
      const transcript = await this.speechService.startRecording()
      if (transcript && transcript.trim()) {
        // Set the transcript in the input field
        const messageInput = document.getElementById("messageInput")
        messageInput.value = transcript

        // Auto-send the message
        this.sendMessage()
      }
    } catch (error) {
      console.error("Voice input error:", error)
      this.showError("Voice input failed. Please try again.")
    }
  }

  loadUserData() {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const usernameElement = document.getElementById("username")

    if (usernameElement) {
      usernameElement.textContent = user.username || "Guest"

      // Add verification badges
      const verificationBadges = document.createElement("div")
      verificationBadges.className = "flex space-x-1 mt-1"

      if (user.emailVerified) {
        const emailBadge = document.createElement("span")
        emailBadge.className = "text-xs bg-green-500 text-white px-1 rounded"
        emailBadge.innerHTML = '<i class="fas fa-envelope"></i>'
        emailBadge.title = "Email Verified"
        verificationBadges.appendChild(emailBadge)
      }

      if (user.phoneVerified) {
        const phoneBadge = document.createElement("span")
        phoneBadge.className = "text-xs bg-blue-500 text-white px-1 rounded"
        phoneBadge.innerHTML = '<i class="fas fa-mobile-alt"></i>'
        phoneBadge.title = "Phone Verified"
        verificationBadges.appendChild(phoneBadge)
      }

      // Add provider badge
      if (user.provider && user.provider !== "local") {
        const providerBadge = document.createElement("span")
        providerBadge.className = "text-xs bg-purple-500 text-white px-1 rounded"
        if (user.provider === "google") {
          providerBadge.innerHTML = '<i class="fab fa-google"></i>'
          providerBadge.title = "Google Account"
        } else if (user.provider === "apple") {
          providerBadge.innerHTML = '<i class="fab fa-apple"></i>'
          providerBadge.title = "Apple Account"
        }
        verificationBadges.appendChild(providerBadge)
      }

      // Clear existing badges and add new ones
      const existingBadges = usernameElement.parentNode.querySelector(".verification-badges")
      if (existingBadges) {
        existingBadges.remove()
      }

      verificationBadges.className += " verification-badges"
      usernameElement.parentNode.appendChild(verificationBadges)
    }
  }

  setupEventListeners() {
    // Sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar")
      sidebar.classList.toggle("-translate-x-full")
    })

    // New chat button
    document.getElementById("newChatBtn").addEventListener("click", () => {
      this.chatManager.startNewChat()
    })

    // Settings button
    document.getElementById("settingsBtn").addEventListener("click", () => {
      document.getElementById("settingsModal").classList.remove("hidden")
    })

    // Close settings
    document.getElementById("closeSettings").addEventListener("click", () => {
      document.getElementById("settingsModal").classList.add("hidden")
    })

    // Upgrade modal events
    document.getElementById("cancelUpgrade")?.addEventListener("click", () => {
      this.subscriptionManager.hideUpgradeModal()
    })

    document.getElementById("confirmUpgrade")?.addEventListener("click", () => {
      this.handleUpgrade()
    })

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user")
      localStorage.removeItem("chats")
      localStorage.removeItem("subscription")
      localStorage.removeItem("messageCount")
      window.location.href = "login.html"
    })

    // Send message
    document.getElementById("sendBtn").addEventListener("click", () => {
      this.sendMessage()
    })

    // Enter key to send
    document.getElementById("messageInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // Auto-resize textarea
    document.getElementById("messageInput").addEventListener("input", (e) => {
      e.target.style.height = "auto"
      e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar")
      const sidebarToggle = document.getElementById("sidebarToggle")

      if (
        window.innerWidth < 768 &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target) &&
        !sidebar.classList.contains("-translate-x-full")
      ) {
        sidebar.classList.add("-translate-x-full")
      }
    })
  }

  async handleUpgrade() {
    try {
      await this.subscriptionManager.subscribeToPro()
    } catch (error) {
      console.error("Upgrade error:", error)
      this.showError("Upgrade failed. Please try again.")
    }
  }

  async sendMessage() {
    const input = document.getElementById("messageInput")
    const message = input.value.trim()

    if (!message) return

    // Check message limits
    const messageStatus = this.subscriptionManager.canSendMessage()
    if (!messageStatus.allowed) {
      this.subscriptionManager.showUpgradeModal()
      return
    }

    const sendBtn = document.getElementById("sendBtn")
    sendBtn.disabled = true
    input.value = ""
    input.style.height = "auto"

    // Play send sound
    this.soundManager.playMessageSent()

    // Add user message to chat immediately
    this.chatManager.addMessage("user", message)

    // Increment message count for free users
    this.subscriptionManager.incrementMessageCount()

    // Show loading indicator
    document.getElementById("loadingIndicator").classList.remove("hidden")

    try {
      // Send to your Render backend
      const response = await fetch("https://voxai-umxl.onrender.com/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message, // Your server expects "query"
          userId: Number.parseInt(JSON.parse(localStorage.getItem("user") || "{}").id) || 1, // Your server expects integer userId
        }),
      })

      debugLog("API Response:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Hide loading indicator before starting typing animation
      document.getElementById("loadingIndicator").classList.add("hidden")

      // Play receive sound before typing animation
      this.soundManager.playMessageReceived()

      // Use typing animation for AI response
      // Your server returns "response" field
      await this.chatManager.addTypingMessage("assistant", data.response, 25)

      // Convert response to speech for Pro users using Web Speech API
      if (this.subscriptionManager.isProUser()) {
        try {
          await this.speechService.textToSpeech(data.response, {
            rate: 0.9,
            pitch: 1,
            volume: 0.8,
            voiceType: "female",
          })
        } catch (error) {
          console.error("TTS error:", error)
        }
      }
    } catch (error) {
      debugLog("API Error:", error)
      console.error("Error sending message:", error)

      // Hide loading indicator
      document.getElementById("loadingIndicator").classList.add("hidden")

      // Use typing animation even for error messages
      await this.chatManager.addTypingMessage("assistant", "Sorry, I encountered an error. Please try again.", 30)
    } finally {
      sendBtn.disabled = false
    }
  }

  getBackendUrl() {
    return config.BACKEND_URL
  }

  showError(message) {
    // Remove existing messages
    const existingMessage = document.querySelector(".error-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    // Create new message
    const messageDiv = document.createElement("div")
    messageDiv.className =
      "error-message fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white z-50 bg-red-500"
    messageDiv.textContent = message

    document.body.appendChild(messageDiv)

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove()
    }, 5000)
  }
}

// Make chatManager available globally for WebSocket
window.chatManager = null

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new App()
  window.chatManager = app.chatManager
})
