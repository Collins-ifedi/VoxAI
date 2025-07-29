export class ChatManager {
  constructor() {
    this.chats = JSON.parse(localStorage.getItem("chats") || "[]")
    this.currentChatId = null
    this.currentChat = null
  }

  init() {
    this.loadChatHistory()
    if (this.chats.length === 0) {
      this.startNewChat()
    } else {
      this.loadChat(this.chats[0].id)
    }
  }

  startNewChat() {
    const chatId = Date.now().toString()
    const newChat = {
      id: chatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    }

    this.chats.unshift(newChat)
    this.currentChatId = chatId
    this.currentChat = newChat

    this.saveChats()
    this.loadChatHistory()
    this.displayMessages()
  }

  loadChat(chatId) {
    const chat = this.chats.find((c) => c.id === chatId)
    if (chat) {
      this.currentChatId = chatId
      this.currentChat = chat
      this.displayMessages()
      this.updateChatHistorySelection()
    }
  }

  addMessage(role, content) {
    if (!this.currentChat) {
      this.startNewChat()
    }

    const message = {
      id: Date.now().toString(),
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    }

    this.currentChat.messages.push(message)

    // Update chat title if it's the first user message
    if (role === "user" && this.currentChat.messages.length === 1) {
      this.currentChat.title = content.substring(0, 30) + (content.length > 30 ? "..." : "")
    }

    this.saveChats()
    this.displayMessages()
    this.loadChatHistory()
  }

  async addTypingMessage(role, content, typingSpeed = 30) {
    if (!this.currentChat) {
      this.startNewChat()
    }

    const message = {
      id: Date.now().toString(),
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    }

    this.currentChat.messages.push(message)

    // Update chat title if it's the first user message
    if (role === "user" && this.currentChat.messages.length === 1) {
      this.currentChat.title = content.substring(0, 30) + (content.length > 30 ? "..." : "")
    }

    this.saveChats()

    // For user messages, display immediately
    if (role === "user") {
      this.displayMessages()
      this.loadChatHistory()
      return
    }

    // For AI messages, show typing animation
    await this.displayTypingMessage(message, typingSpeed)
    this.loadChatHistory()
  }

  async displayTypingMessage(message, typingSpeed) {
    const container = document.getElementById("chatContainer")

    // Create the message structure
    const messageDiv = document.createElement("div")
    messageDiv.className = "flex justify-start mb-4"
    messageDiv.innerHTML = `
      <div class="flex max-w-3xl flex-row items-start space-x-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 mr-3 flex items-center justify-center">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="flex-1">
          <div class="bg-gray-100 dark:bg-chat-dark text-gray-900 dark:text-white rounded-lg p-3 rounded-bl-none">
            <span id="typing-content"></span>
            <span id="typing-cursor" class="animate-pulse">|</span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
            ${new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `

    // Remove empty state if it exists
    const emptyState = container.querySelector(".text-center")
    if (emptyState && emptyState.textContent.includes("Start a conversation")) {
      emptyState.remove()
    }

    container.appendChild(messageDiv)
    container.scrollTop = container.scrollHeight

    const typingContent = document.getElementById("typing-content")
    const typingCursor = document.getElementById("typing-cursor")

    // Type out the message character by character
    const content = this.formatMessage(message.content)
    let displayedContent = ""

    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = content
    const textContent = tempDiv.textContent || tempDiv.innerText || ""

    for (let i = 0; i < textContent.length; i++) {
      displayedContent += textContent[i]

      // For HTML content, we need to rebuild the formatted version
      let formattedDisplay = displayedContent

      // Apply basic formatting to the displayed content
      formattedDisplay = formattedDisplay.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      formattedDisplay = formattedDisplay.replace(/\*(.*?)\*/g, "<em>$1</em>")
      formattedDisplay = formattedDisplay.replace(
        /`(.*?)`/g,
        '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>',
      )
      formattedDisplay = formattedDisplay.replace(/\n/g, "<br>")

      typingContent.innerHTML = formattedDisplay

      // Scroll to bottom as we type
      container.scrollTop = container.scrollHeight

      // Add some randomness to typing speed for more natural feel
      const randomDelay = typingSpeed + Math.random() * 20 - 10
      await new Promise((resolve) => setTimeout(resolve, randomDelay))
    }

    // Remove cursor after typing is complete
    if (typingCursor) {
      typingCursor.remove()
    }

    // Final formatting with full content
    typingContent.innerHTML = this.formatMessage(message.content)
  }

  displayMessages() {
    const container = document.getElementById("chatContainer")

    if (!this.currentChat || this.currentChat.messages.length === 0) {
      container.innerHTML = `
  <div class="text-center text-gray-500 dark:text-gray-400 mt-20">
    <div class="w-16 h-16 mx-auto mb-4">
      <svg viewBox="0 0 80 80" class="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- V shape (left side) -->
        <path d="M15 20 L25 50 L35 20" 
              fill="none" stroke="url(#logoGradient)" stroke-width="3" 
              stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
        
        <!-- X shape (right side) -->
        <path d="M45 20 L65 50 M65 20 L45 50" 
              fill="none" stroke="url(#logoGradient)" stroke-width="3" 
              stroke-linecap="round" opacity="0.7"/>
        
        <!-- Decorative elements -->
        <circle cx="25" cy="15" r="1.5" fill="url(#logoGradient)" opacity="0.8"/>
        <circle cx="55" cy="15" r="1.5" fill="url(#logoGradient)" opacity="0.8"/>
        <circle cx="40" cy="60" r="2" fill="url(#logoGradient)" opacity="0.5"/>
        
        <!-- Connecting arc -->
        <path d="M35 35 Q40 30, 45 35" 
              fill="none" stroke="url(#logoGradient)" stroke-width="2" 
              opacity="0.4" stroke-linecap="round"/>
      </svg>
    </div>
    <p>Start a conversation with Voxaroid</p>
  </div>
`
      return
    }

    // Only display messages that are not currently being typed
    const messagesToDisplay = this.currentChat.messages.filter(
      (msg) => !document.getElementById("typing-content") || msg.role === "user",
    )

    container.innerHTML = messagesToDisplay
      .map((message) => {
        const isUser = message.role === "user"
        return `
        <div class="flex ${isUser ? "justify-end" : "justify-start"} mb-4">
          <div class="flex max-w-3xl ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full ${isUser ? "bg-blue-500 ml-3" : "bg-green-500 mr-3"} flex items-center justify-center">
              <i class="fas ${isUser ? "fa-user" : "fa-robot"} text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="bg-${isUser ? "blue-500 text-white" : "gray-100 dark:bg-chat-dark text-gray-900 dark:text-white"} rounded-lg p-3 ${isUser ? "rounded-br-none" : "rounded-bl-none"}">
                ${this.formatMessage(message.content)}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? "text-right" : "text-left"}">
                ${new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      `
      })
      .join("")

    // Scroll to bottom
    container.scrollTop = container.scrollHeight
  }

  formatMessage(content) {
    // Handle images
    if (content.includes("<img")) {
      return content
    }

    // Convert markdown-like formatting
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>")
    content = content.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>')

    // Convert line breaks
    content = content.replace(/\n/g, "<br>")

    return content
  }

  loadChatHistory() {
    const historyContainer = document.getElementById("chatHistory")

    if (this.chats.length === 0) {
      historyContainer.innerHTML = '<p class="text-gray-500 text-sm">No chat history</p>'
      return
    }

    historyContainer.innerHTML = this.chats
      .map(
        (chat) => `
            <div class="chat-item p-3 rounded-lg cursor-pointer hover:bg-chat-dark transition-colors ${chat.id === this.currentChatId ? "bg-chat-dark" : ""}" data-chat-id="${chat.id}">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">${chat.title}</p>
                        <p class="text-xs text-gray-400">${new Date(chat.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button class="delete-chat ml-2 p-1 hover:bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity" data-chat-id="${chat.id}">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `,
      )
      .join("")

    // Add event listeners
    historyContainer.querySelectorAll(".chat-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".delete-chat")) {
          this.loadChat(item.dataset.chatId)
        }
      })
    })

    historyContainer.querySelectorAll(".delete-chat").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.deleteChat(btn.dataset.chatId)
      })
    })
  }

  updateChatHistorySelection() {
    document.querySelectorAll(".chat-item").forEach((item) => {
      item.classList.toggle("bg-chat-dark", item.dataset.chatId === this.currentChatId)
    })
  }

  deleteChat(chatId) {
    this.chats = this.chats.filter((chat) => chat.id !== chatId)

    if (this.currentChatId === chatId) {
      if (this.chats.length > 0) {
        this.loadChat(this.chats[0].id)
      } else {
        this.startNewChat()
      }
    }

    this.saveChats()
    this.loadChatHistory()
  }

  saveChats() {
    localStorage.setItem("chats", JSON.stringify(this.chats))
  }
}
