export class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isInitialized = false
  }

  init() {
    this.connect()
  }

  connect() {
    try {
      // Use the configured WebSocket URL
      const wsUrl = "wss://voxai-umxl.onrender.com/ws"

      console.log(`Connecting to WebSocket: ${wsUrl}`)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        this.initializeSession()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`)
        this.isInitialized = false
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
      this.attemptReconnect()
    }
  }

  async initializeSession() {
    // Send initialization message exactly as your Server.py expects
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const initMessage = {
      type: "init",
      userId: Number.parseInt(user.id) || 1, // Your server expects integer userId
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(initMessage))
      this.isInitialized = true
      console.log("WebSocket session initialized with userId:", initMessage.userId)
    }
  }

  handleMessage(data) {
    console.log("WebSocket message received:", data)

    switch (data.type) {
      case "new_message":
        // Handle messages from your Server.py format
        if (data.sender === "assistant" && window.chatManager) {
          window.chatManager.addTypingMessage("assistant", data.text, 20)
        }
        break

      case "typing":
        // Handle typing indicators if implemented
        this.showTypingIndicator(data.isTyping)
        break

      case "error":
        console.error("WebSocket error:", data.message)
        break

      default:
        console.log("Unknown message type:", data.type)
    }
  }

  sendMessage(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isInitialized) {
      // Send message in the format your Server.py expects
      const message = {
        type: "send_message",
        text: text,
      }
      this.ws.send(JSON.stringify(message))
      console.log("Message sent via WebSocket:", message)
    } else {
      console.warn("WebSocket not ready or not initialized")
    }
  }

  showTypingIndicator(isTyping) {
    const indicator = document.getElementById("loadingIndicator")
    if (isTyping) {
      indicator.classList.remove("hidden")
    } else {
      indicator.classList.add("hidden")
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isInitialized = false
    }
  }
}
