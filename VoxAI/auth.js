import { VerificationManager } from "./verification.js"
import { PhoneInputManager } from "./phone-input.js"
import { SoundManager } from "./sounds.js"

class AuthManager {
  constructor() {
    // Managers are initialized to null to prevent errors on script load.
    // They will be instantiated in the init() method after the DOM is ready.
    this.verificationManager = null
    this.phoneInputManager = null
    this.soundManager = null
    this.currentUser = null
    this.init()
  }

  init() {
    // **FIX:** Instantiate managers here (lazy initialization).
    // This ensures the DOM is fully loaded before the manager classes,
    // which may interact with the DOM, are created.
    this.verificationManager = new VerificationManager()
    this.phoneInputManager = new PhoneInputManager()
    this.soundManager = new SoundManager()

    // Comment out this redirect check that's preventing login
    // if (localStorage.getItem("user")) {
    //   window.location.href = "index.html"
    //   return
    // }

    this.setupEventListeners()
    this.loadTheme()
    this.phoneInputManager.init()
    this.setupKeystrokeSounds()
  }

  setupKeystrokeSounds() {
    // Add keystroke sounds to all input fields
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], textarea',
    )

    inputs.forEach((input) => {
      input.addEventListener("keydown", (e) => {
        // Don't play sound for special keys
        if (e.key.length === 1) {
          this.soundManager.playKeystroke()
        }
      })
    })
  }

  setupEventListeners() {
    // Form toggles
    const showSignupBtn = document.getElementById("showSignup")
    if (showSignupBtn) {
      showSignupBtn.addEventListener("click", () => {
        this.showSignupForm()
      })
    }

    const showLoginBtn = document.getElementById("showLogin")
    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", () => {
        this.showLoginForm()
      })
    }

    // Social login buttons
    const googleLoginBtn = document.getElementById("googleLogin")
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener("click", () => {
        this.handleGoogleLogin()
      })
    }

    const appleLoginBtn = document.getElementById("appleLogin")
    if (appleLoginBtn) {
      appleLoginBtn.addEventListener("click", () => {
        this.handleAppleLogin()
      })
    }

    // Guest login
    const guestLoginBtn = document.getElementById("guestLogin")
    if (guestLoginBtn) {
      guestLoginBtn.addEventListener("click", () => {
        this.handleGuestLogin()
      })
    }

    // Rest of the event listeners remain the same...
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleLogin()
      })
    }

    const signupForm = document.getElementById("signupForm")
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleSignup()
      })
    }

    // Email verification
    document.getElementById("emailVerifyForm")?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleEmailVerification()
    })

    // Phone verification
    document.getElementById("phoneVerifyForm")?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handlePhoneVerification()
    })

    // Resend codes
    document.getElementById("resendEmailCode")?.addEventListener("click", () => {
      this.resendEmailCode()
    })

    document.getElementById("resendPhoneCode")?.addEventListener("click", () => {
      this.resendPhoneCode()
    })

    // Skip phone verification
    document.getElementById("skipPhoneVerification")?.addEventListener("click", () => {
      this.completeRegistration()
    })

    // Theme toggle
    document.getElementById("themeToggleLogin")?.addEventListener("click", () => {
      this.toggleTheme()
    })
  }

  showSignupForm() {
    document.getElementById("loginForm").classList.add("hidden")
    document.getElementById("signupForm").classList.remove("hidden")
    document.getElementById("emailVerificationForm").classList.add("hidden")
    document.getElementById("phoneVerificationForm").classList.add("hidden")

    // Reinitialize phone input for the signup form
    setTimeout(() => {
      this.phoneInputManager.init()
    }, 100)
  }

  showLoginForm() {
    document.getElementById("loginForm").classList.remove("hidden")
    document.getElementById("signupForm").classList.add("hidden")
    document.getElementById("emailVerificationForm").classList.add("hidden")
    document.getElementById("phoneVerificationForm").classList.add("hidden")
    this.verificationManager.stopTimers()
    this.phoneInputManager.destroy()
  }

  async handleGoogleLogin() {
    this.soundManager.playNotification()

    try {
      this.showSuccess("Signing in with Google...")

      // Simulate successful Google login
      setTimeout(() => {
        const user = {
          id: "google_" + Date.now(),
          username: "Google User",
          email: "user@gmail.com",
          phone: null,
          emailVerified: true,
          phoneVerified: false,
          loginTime: new Date().toISOString(),
          provider: "google",
        }

        localStorage.setItem("user", JSON.stringify(user))
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      this.showError("Google login failed. Please try again.")
    }
  }

  async handleAppleLogin() {
    this.soundManager.playNotification()

    try {
      this.showSuccess("Signing in with Apple...")

      // Simulate successful Apple login
      setTimeout(() => {
        const user = {
          id: "apple_" + Date.now(),
          username: "Apple User",
          email: "user@icloud.com",
          phone: null,
          emailVerified: true,
          phoneVerified: false,
          loginTime: new Date().toISOString(),
          provider: "apple",
        }

        localStorage.setItem("user", JSON.stringify(user))
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      this.showError("Apple login failed. Please try again.")
    }
  }

  async handleLogin() {
    const username = document.getElementById("loginUsername").value.trim()
    const password = document.getElementById("loginPassword").value

    if (!username || !password) {
      this.showError("Please fill in all fields")
      return
    }

    this.soundManager.playMessageSent()

    try {
      // For demo purposes, we'll accept any username/password
      // In a real app, you'd validate against your backend
      const user = {
        id: Date.now().toString(),
        username: username,
        email: null,
        phone: null,
        emailVerified: false,
        phoneVerified: false,
        loginTime: new Date().toISOString(),
        provider: "local",
      }

      localStorage.setItem("user", JSON.stringify(user))
      this.soundManager.playMessageReceived()
      window.location.href = "index.html"
    } catch (error) {
      this.showError("Login failed. Please try again.")
    }
  }

  async handleSignup() {
    const username = document.getElementById("signupUsername").value.trim()
    const email = document.getElementById("signupEmail").value.trim()
    const password = document.getElementById("signupPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Get phone number from international input
    const phoneData = this.phoneInputManager.getPhoneNumber()
    const phone = phoneData ? phoneData.number : null

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      this.showError("Please fill in all required fields")
      return
    }

    if (!this.verificationManager.validateEmail(email)) {
      this.showError("Please enter a valid email address")
      return
    }

    if (phone && !phoneData.isValid) {
      this.showError("Please enter a valid phone number")
      return
    }

    if (password.length < 6) {
      this.showError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      this.showError("Passwords do not match")
      return
    }

    this.soundManager.playMessageSent()

    try {
      // Store user data temporarily
      this.currentUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        phone: phone,
        emailVerified: false,
        phoneVerified: false,
        signupTime: new Date().toISOString(),
        provider: "local",
      }

      // Start email verification process
      await this.startEmailVerification()
    } catch (error) {
      this.showError("Signup failed. Please try again.")
    }
  }

  async startEmailVerification() {
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)

      // Show email verification form
      document.getElementById("signupForm").classList.add("hidden")
      document.getElementById("emailVerificationForm").classList.remove("hidden")
      document.getElementById("verificationEmail").textContent = this.currentUser.email

      this.verificationManager.startEmailTimer()
      this.soundManager.playNotification()
      this.showSuccess("Verification code sent to your email!")
    } catch (error) {
      this.showError("Failed to send verification email. Please try again.")
    }
  }

  async handleEmailVerification() {
    const code = document.getElementById("emailCode").value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code")
      return
    }

    this.soundManager.playMessageSent()

    try {
      await this.verificationManager.verifyEmailCode(code)
      this.currentUser.emailVerified = true
      this.soundManager.playMessageReceived()

      // If phone number provided, start phone verification
      if (this.currentUser.phone) {
        await this.startPhoneVerification()
      } else {
        this.completeRegistration()
      }
    } catch (error) {
      this.showError(error.message)
    }
  }

  async startPhoneVerification() {
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)

      // Show phone verification form
      document.getElementById("emailVerificationForm").classList.add("hidden")
      document.getElementById("phoneVerificationForm").classList.remove("hidden")
      document.getElementById("verificationPhone").textContent = this.currentUser.phone

      this.verificationManager.startPhoneTimer()
      this.soundManager.playNotification()
      this.showSuccess("Verification code sent to your phone!")
    } catch (error) {
      this.showError("Failed to send verification SMS. Please try again.")
    }
  }

  async handlePhoneVerification() {
    const code = document.getElementById("phoneCode").value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code")
      return
    }

    this.soundManager.playMessageSent()

    try {
      await this.verificationManager.verifyPhoneCode(code)
      this.currentUser.phoneVerified = true
      this.soundManager.playMessageReceived()
      this.completeRegistration()
    } catch (error) {
      this.showError(error.message)
    }
  }

  completeRegistration() {
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(this.currentUser))

    // Clean up
    this.verificationManager.stopTimers()
    this.phoneInputManager.destroy()

    // Show success and redirect
    this.soundManager.playNotification()
    this.showSuccess("Account created successfully!")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  }

  async resendEmailCode() {
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)
      this.verificationManager.startEmailTimer()

      const resendBtn = document.getElementById("resendEmailCode")
      resendBtn.textContent = "Resend Code"
      resendBtn.classList.remove("text-red-500")

      this.soundManager.playNotification()
      this.showSuccess("New verification code sent!")
    } catch (error) {
      this.showError("Failed to resend code. Please try again.")
    }
  }

  async resendPhoneCode() {
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)
      this.verificationManager.startPhoneTimer()

      const resendBtn = document.getElementById("resendPhoneCode")
      resendBtn.textContent = "Resend Code"
      resendBtn.classList.remove("text-red-500")

      this.soundManager.playNotification()
      this.showSuccess("New verification code sent!")
    } catch (error) {
      this.showError("Failed to resend code. Please try again.")
    }
  }

  handleGuestLogin() {
    this.soundManager.playMessageSent()

    const user = {
      id: "guest_" + Date.now(),
      username: "Guest",
      email: null,
      phone: null,
      emailVerified: false,
      phoneVerified: false,
      loginTime: new Date().toISOString(),
      provider: "guest",
    }

    localStorage.setItem("user", JSON.stringify(user))
    this.soundManager.playMessageReceived()
    this.showSuccess("Signing in as guest...")

    setTimeout(() => {
      window.location.href = "index.html"
    }, 500)
  }

  showError(message) {
    this.showMessage(message, "error")
  }

  showSuccess(message) {
    this.showMessage(message, "success")
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector(".auth-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    // Create new message
    const messageDiv = document.createElement("div")
    messageDiv.className = `auth-message fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white z-50 ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    }`
    messageDiv.textContent = message

    document.body.appendChild(messageDiv)

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove()
    }, 5000)
  }

  toggleTheme() {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")

    if (isDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }

    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent("themeChanged"))

    // Update phone input styling
    setTimeout(() => {
      this.phoneInputManager.applyThemeStyles()
    }, 100)
  }

  loadTheme() {
    const theme = localStorage.getItem("theme") || "light"
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    }

    // Dispatch theme change event after loading
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("themeChanged"))
    }, 100)
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AuthManager()
})