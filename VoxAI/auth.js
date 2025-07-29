console.log("auth.js script started parsing.") // Added for initial script load check

import { VerificationManager } from "./verification.js"
import { PhoneInputManager } from "./phone-input.js"
import { SoundManager } from "./sounds.js"
import { debugLog } from "./config.js" // Import debugLog

class AuthManager {
  constructor() {
    // Create instances but don't initialize them yet
    this.verificationManager = new VerificationManager()
    this.phoneInputManager = new PhoneInputManager()
    this.soundManager = new SoundManager()
    this.currentUser = null

    debugLog("AuthManager constructor completed")
    this.init()
  }

  init() {
    debugLog("AuthManager init started")

    try {
      // Initialize sound manager first, as it's used for keystroke sounds immediately
      this.soundManager.init()
      this.setupKeystrokeSounds()
      this.setupEventListeners() // Call this after soundManager and keystroke sounds are ready
      this.loadTheme()

      debugLog("AuthManager init completed successfully")
    } catch (error) {
      console.error("Error in AuthManager init:", error)
    }
  }

  setupKeystrokeSounds() {
    try {
      // Add keystroke sounds to all input fields
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], textarea',
      )

      debugLog(`Found ${inputs.length} input fields for keystroke sounds`)

      inputs.forEach((input) => {
        input.addEventListener("keydown", (e) => {
          // Don't play sound for special keys
          if (e.key.length === 1) {
            this.soundManager.playKeystroke()
          }
        })
      })
    } catch (error) {
      console.error("Error setting up keystroke sounds:", error)
    }
  }

  setupEventListeners() {
    debugLog("Setting up event listeners...")

    try {
      // Form toggles
      const showSignupBtn = document.getElementById("showSignup")
      if (showSignupBtn) {
        debugLog("✅ showSignup button found. Attaching listener.")
        showSignupBtn.addEventListener("click", (e) => {
          debugLog("showSignup clicked")
          e.preventDefault()
          this.showSignupForm()
        })
      } else {
        debugLog("❌ showSignup button not found.")
      }

      const showLoginBtn = document.getElementById("showLogin")
      if (showLoginBtn) {
        debugLog("✅ showLogin button found. Attaching listener.")
        showLoginBtn.addEventListener("click", (e) => {
          debugLog("showLogin clicked")
          e.preventDefault()
          this.showLoginForm()
        })
      } else {
        debugLog("❌ showLogin button not found.")
      }

      // Social login buttons
      const googleLoginBtn = document.getElementById("googleLogin")
      if (googleLoginBtn) {
        debugLog("✅ googleLogin button found. Attaching listener.")
        googleLoginBtn.addEventListener("click", (e) => {
          debugLog("googleLogin clicked")
          e.preventDefault()
          this.handleGoogleLogin()
        })
      } else {
        debugLog("❌ googleLogin button not found.")
      }

      const appleLoginBtn = document.getElementById("appleLogin")
      if (appleLoginBtn) {
        debugLog("✅ appleLogin button found. Attaching listener.")
        appleLoginBtn.addEventListener("click", (e) => {
          debugLog("appleLogin clicked")
          e.preventDefault()
          this.handleAppleLogin()
        })
      } else {
        debugLog("❌ appleLogin button not found.")
      }

      // Guest login
      const guestLoginBtn = document.getElementById("guestLogin")
      if (guestLoginBtn) {
        debugLog("✅ guestLogin button found. Attaching listener.")
        guestLoginBtn.addEventListener("click", (e) => {
          debugLog("guestLogin clicked")
          e.preventDefault()
          this.handleGuestLogin()
        })
      } else {
        debugLog("❌ guestLogin button not found.")
      }

      // Form submissions
      const loginForm = document.getElementById("loginForm")
      if (loginForm) {
        debugLog("✅ loginForm found. Attaching listener.")
        loginForm.addEventListener("submit", (e) => {
          debugLog("loginForm submitted")
          e.preventDefault()
          this.handleLogin()
        })
      } else {
        debugLog("❌ loginForm not found.")
      }

      const signupForm = document.getElementById("signupForm")
      if (signupForm) {
        debugLog("✅ signupForm found. Attaching listener.")
        signupForm.addEventListener("submit", (e) => {
          debugLog("signupForm submitted")
          e.preventDefault()
          this.handleSignup()
        })
      } else {
        debugLog("❌ signupForm not found.")
      }

      // Email verification
      const emailVerifyForm = document.getElementById("emailVerifyForm") // Corrected ID
      if (emailVerifyForm) {
        debugLog("✅ emailVerifyForm found. Attaching listener.")
        emailVerifyForm.addEventListener("submit", (e) => {
          e.preventDefault()
          this.handleEmailVerification()
        })
      } else {
        debugLog("❌ emailVerifyForm not found.")
      }

      // Phone verification
      const phoneVerifyForm = document.getElementById("phoneVerifyForm") // Corrected ID
      if (phoneVerifyForm) {
        debugLog("✅ phoneVerifyForm found. Attaching listener.")
        phoneVerifyForm.addEventListener("submit", (e) => {
          e.preventDefault()
          this.handlePhoneVerification()
        })
      } else {
        debugLog("❌ phoneVerifyForm not found.")
      }

      // Resend codes
      const resendEmailCode = document.getElementById("resendEmailCode")
      if (resendEmailCode) {
        debugLog("✅ resendEmailCode button found. Attaching listener.")
        resendEmailCode.addEventListener("click", () => {
          this.resendEmailCode()
        })
      } else {
        debugLog("❌ resendEmailCode button not found.")
      }

      const resendPhoneCode = document.getElementById("resendPhoneCode")
      if (resendPhoneCode) {
        debugLog("✅ resendPhoneCode button found. Attaching listener.")
        resendPhoneCode.addEventListener("click", () => {
          this.resendPhoneCode()
        })
      } else {
        debugLog("❌ resendPhoneCode button not found.")
      }

      // Skip phone verification
      const skipPhoneVerification = document.getElementById("skipPhoneVerification")
      if (skipPhoneVerification) {
        debugLog("✅ skipPhoneVerification button found. Attaching listener.")
        skipPhoneVerification.addEventListener("click", () => {
          this.completeRegistration()
        })
      } else {
        debugLog("❌ skipPhoneVerification button not found.")
      }

      // Theme toggle
      const themeToggleLogin = document.getElementById("themeToggleLogin")
      if (themeToggleLogin) {
        debugLog("✅ themeToggleLogin button found. Attaching listener.")
        themeToggleLogin.addEventListener("click", () => {
          this.toggleTheme()
        })
      } else {
        debugLog("❌ themeToggleLogin button not found.")
      }

      debugLog("Event listeners setup completed")
    } catch (error) {
      console.error("Error setting up event listeners:", error)
    }
  }

  showSignupForm() {
    debugLog("Showing signup form")
    try {
      const loginForm = document.getElementById("loginForm")
      const signupForm = document.getElementById("signupForm")
      const emailVerificationForm = document.getElementById("emailVerificationForm")
      const phoneVerificationForm = document.getElementById("phoneVerificationForm")

      if (loginForm) loginForm.classList.add("hidden")
      if (signupForm) signupForm.classList.remove("hidden")
      if (emailVerificationForm) emailVerificationForm.classList.add("hidden")
      if (phoneVerificationForm) phoneVerificationForm.classList.add("hidden")

      // Initialize phone input for the signup form
      // Use a timeout to ensure the element is visible before init
      setTimeout(() => {
        this.phoneInputManager.init()
      }, 100)
    } catch (error) {
      console.error("Error showing signup form:", error)
    }
  }

  showLoginForm() {
    debugLog("Showing login form")
    try {
      const loginForm = document.getElementById("loginForm")
      const signupForm = document.getElementById("signupForm")
      const emailVerificationForm = document.getElementById("emailVerificationForm")
      const phoneVerificationForm = document.getElementById("phoneVerificationForm")

      if (loginForm) loginForm.classList.remove("hidden")
      if (signupForm) signupForm.classList.add("hidden")
      if (emailVerificationForm) emailVerificationForm.classList.add("hidden")
      if (phoneVerificationForm) phoneVerificationForm.classList.add("hidden")

      this.verificationManager.stopTimers()
      this.phoneInputManager.destroy() // Clean up phone input instance
    } catch (error) {
      console.error("Error showing login form:", error)
    }
  }

  async handleGoogleLogin() {
    debugLog("Handling Google login")
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
        debugLog("Google login successful, redirecting...")
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      console.error("Google login error:", error)
      this.showError("Google login failed. Please try again.")
    }
  }

  async handleAppleLogin() {
    debugLog("Handling Apple login")
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
        debugLog("Apple login successful, redirecting...")
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      console.error("Apple login error:", error)
      this.showError("Apple login failed. Please try again.")
    }
  }

  async handleLogin() {
    debugLog("Handling login")
    const usernameInput = document.getElementById("loginUsername")
    const passwordInput = document.getElementById("loginPassword")

    if (!usernameInput || !passwordInput) {
      this.showError("Login form elements not found. Cannot proceed with login.")
      console.error("Login form elements missing:", { usernameInput, passwordInput })
      return
    }

    const username = usernameInput.value.trim()
    const password = passwordInput.value

    if (!username || !password) {
      this.showError("Please fill in all fields.")
      return
    }

    this.soundManager.playMessageSent()

    try {
      // For demo purposes, we'll accept any username/password
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
      debugLog("Login successful, redirecting...")
      this.showSuccess("Login successful!")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 500)
    } catch (error) {
      console.error("Login error:", error)
      this.showError("Login failed. Please try again.")
    }
  }

  handleGuestLogin() {
    debugLog("Handling guest login")
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
      debugLog("Guest login successful, redirecting...")
      window.location.href = "index.html"
    }, 500)
  }

  async handleSignup() {
    debugLog("Handling signup")
    const usernameInput = document.getElementById("signupUsername")
    const emailInput = document.getElementById("signupEmail")
    const passwordInput = document.getElementById("signupPassword")
    const confirmPasswordInput = document.getElementById("confirmPassword")

    if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
      this.showError("Signup form elements not found. Cannot proceed with signup.")
      console.error("Signup form elements missing:", { usernameInput, emailInput, passwordInput, confirmPasswordInput })
      return
    }

    const username = usernameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    // Get phone number from international input
    const phoneData = this.phoneInputManager.getPhoneNumber()
    const phone = phoneData ? phoneData.number : null

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      this.showError("Please fill in all required fields.")
      return
    }

    if (!this.verificationManager.validateEmail(email)) {
      this.showError("Please enter a valid email address.")
      return
    }

    if (phone && phoneData && !phoneData.isValid) {
      this.showError("Please enter a valid phone number.")
      return
    }

    if (password.length < 6) {
      this.showError("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      this.showError("Passwords do not match.")
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
      console.error("Signup error:", error)
      this.showError("Signup failed. Please try again.")
    }
  }

  async startEmailVerification() {
    debugLog("Starting email verification process.")
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)

      // Show email verification form
      const signupForm = document.getElementById("signupForm")
      const emailVerificationForm = document.getElementById("emailVerificationForm")
      const verificationEmail = document.getElementById("verificationEmail")

      if (signupForm) signupForm.classList.add("hidden")
      if (emailVerificationForm) emailVerificationForm.classList.remove("hidden")
      if (verificationEmail) verificationEmail.textContent = this.currentUser.email

      this.verificationManager.startEmailTimer()
      this.soundManager.playNotification()
      this.showSuccess("Verification code sent to your email!")
    } catch (error) {
      console.error("Email verification initiation error:", error)
      this.showError(error.message || "Failed to send verification email. Please try again.")
    }
  }

  async handleEmailVerification() {
    debugLog("Handling email verification.")
    const codeInput = document.getElementById("emailCode")
    if (!codeInput) {
      this.showError("Email code input not found.")
      return
    }

    const code = codeInput.value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code.")
      return
    }

    this.soundManager.playMessageSent()

    try {
      // Pass the email to verifyEmailCode as the backend needs it
      await this.verificationManager.verifyEmailCode(this.currentUser.email, code)
      this.currentUser.emailVerified = true
      this.soundManager.playMessageReceived()
      this.showSuccess("Email verified successfully!")

      // If phone number provided, start phone verification
      if (this.currentUser.phone) {
        await this.startPhoneVerification()
      } else {
        this.completeRegistration()
      }
    } catch (error) {
      console.error("Email verification error:", error)
      this.showError(error.message)
    }
  }

  async startPhoneVerification() {
    debugLog("Starting phone verification process.")
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)

      // Show phone verification form
      const emailVerificationForm = document.getElementById("emailVerificationForm")
      const phoneVerificationForm = document.getElementById("phoneVerificationForm")
      const verificationPhone = document.getElementById("verificationPhone")

      if (emailVerificationForm) emailVerificationForm.classList.add("hidden")
      if (phoneVerificationForm) phoneVerificationForm.classList.remove("hidden")
      if (verificationPhone) verificationPhone.textContent = this.currentUser.phone

      this.verificationManager.startPhoneTimer()
      this.soundManager.playNotification()
      this.showSuccess("Verification code sent to your phone!")
    } catch (error) {
      console.error("Phone verification initiation error:", error)
      this.showError(error.message || "Failed to send verification SMS. Please try again.")
    }
  }

  async handlePhoneVerification() {
    debugLog("Handling phone verification.")
    const codeInput = document.getElementById("phoneCode")
    if (!codeInput) {
      this.showError("Phone code input not found.")
      return
    }

    const code = codeInput.value.trim()

    if (!code || code.length !== 6) {
      this.showError("Please enter a valid 6-digit code.")
      return
    }

    this.soundManager.playMessageSent()

    try {
      await this.verificationManager.verifyPhoneCode(code)
      this.currentUser.phoneVerified = true
      this.soundManager.playMessageReceived()
      this.showSuccess("Phone verified successfully!")
      this.completeRegistration()
    } catch (error) {
      console.error("Phone verification error:", error)
      this.showError(error.message)
    }
  }

  completeRegistration() {
    debugLog("Completing registration.")
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(this.currentUser))

    // Clean up
    this.verificationManager.stopTimers()
    this.phoneInputManager.destroy()

    // Show success and redirect
    this.soundManager.playNotification()
    this.showSuccess("Account created successfully!")
    setTimeout(() => {
      debugLog("Registration complete, redirecting to index.html...")
      window.location.href = "index.html"
    }, 1500)
  }

  async resendEmailCode() {
    debugLog("Resending email code.")
    try {
      await this.verificationManager.sendEmailVerification(this.currentUser.email)
      this.verificationManager.startEmailTimer()

      const resendBtn = document.getElementById("resendEmailCode")
      if (resendBtn) {
        resendBtn.textContent = "Resend Code"
        resendBtn.classList.remove("text-red-500")
      }

      this.soundManager.playNotification()
      this.showSuccess("New verification code sent!")
    } catch (error) {
      console.error("Resend email error:", error)
      this.showError(error.message || "Failed to resend code. Please try again.")
    }
  }

  async resendPhoneCode() {
    debugLog("Resending phone code.")
    try {
      await this.verificationManager.sendPhoneVerification(this.currentUser.phone)
      this.verificationManager.startPhoneTimer()

      const resendBtn = document.getElementById("resendPhoneCode")
      if (resendBtn) {
        resendBtn.textContent = "Resend Code"
        resendBtn.classList.remove("text-red-500")
      }

      this.soundManager.playNotification()
      this.showSuccess("New verification code sent!")
    } catch (error) {
      console.error("Resend phone error:", error)
      this.showError(error.message || "Failed to resend code. Please try again.")
    }
  }

  showError(message) {
    this.showMessage(message, "error")
  }

  showSuccess(message) {
    this.showMessage(message, "success")
  }

  showMessage(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`)

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
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 5000)
  }

  toggleTheme() {
    debugLog("Toggling theme.")
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
    debugLog("Loading theme.")
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
  console.log("DOM loaded, initializing AuthManager")
  try {
    new AuthManager()
  } catch (error) {
    console.error("Failed to initialize AuthManager:", error)
  }
})
