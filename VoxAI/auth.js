import { VerificationManager } from "./verification.js"
import { PhoneInputManager } from "./phone-input.js"
import { SoundManager } from "./sounds.js"

class AuthManager {
  constructor() {
    // Create instances but don't initialize them yet
    this.verificationManager = new VerificationManager()
    this.phoneInputManager = new PhoneInputManager()
    this.soundManager = new SoundManager()
    this.currentUser = null

    console.log("AuthManager constructor completed")
    this.init()
  }

  init() {
    console.log("AuthManager init started")

    try {
      this.setupEventListeners()
      this.loadTheme()

      // Only initialize phone input manager if we're on signup form
      // This will be called when showing signup form

      this.setupKeystrokeSounds()
      console.log("AuthManager init completed successfully")
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

      console.log(`Found ${inputs.length} input fields for keystroke sounds`)

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
    console.log("Setting up event listeners...")

    try {
      // Form toggles
      const showSignupBtn = document.getElementById("showSignup")
      if (showSignupBtn) {
        console.log("✅ showSignup button found")
        showSignupBtn.addEventListener("click", (e) => {
          console.log("showSignup clicked")
          e.preventDefault()
          this.showSignupForm()
        })
      } else {
        console.log("❌ showSignup button not found")
      }

      const showLoginBtn = document.getElementById("showLogin")
      if (showLoginBtn) {
        console.log("✅ showLogin button found")
        showLoginBtn.addEventListener("click", (e) => {
          console.log("showLogin clicked")
          e.preventDefault()
          this.showLoginForm()
        })
      } else {
        console.log("❌ showLogin button not found")
      }

      // Social login buttons
      const googleLoginBtn = document.getElementById("googleLogin")
      if (googleLoginBtn) {
        console.log("✅ googleLogin button found")
        googleLoginBtn.addEventListener("click", (e) => {
          console.log("googleLogin clicked")
          e.preventDefault()
          this.handleGoogleLogin()
        })
      } else {
        console.log("❌ googleLogin button not found")
      }

      const appleLoginBtn = document.getElementById("appleLogin")
      if (appleLoginBtn) {
        console.log("✅ appleLogin button found")
        appleLoginBtn.addEventListener("click", (e) => {
          console.log("appleLogin clicked")
          e.preventDefault()
          this.handleAppleLogin()
        })
      } else {
        console.log("❌ appleLogin button not found")
      }

      // Guest login
      const guestLoginBtn = document.getElementById("guestLogin")
      if (guestLoginBtn) {
        console.log("✅ guestLogin button found")
        guestLoginBtn.addEventListener("click", (e) => {
          console.log("guestLogin clicked")
          e.preventDefault()
          this.handleGuestLogin()
        })
      } else {
        console.log("❌ guestLogin button not found")
      }

      // Form submissions
      const loginForm = document.getElementById("loginForm")
      if (loginForm) {
        console.log("✅ loginForm found")
        loginForm.addEventListener("submit", (e) => {
          console.log("loginForm submitted")
          e.preventDefault()
          this.handleLogin()
        })
      } else {
        console.log("❌ loginForm not found")
      }

      const signupForm = document.getElementById("signupForm")
      if (signupForm) {
        console.log("✅ signupForm found")
        signupForm.addEventListener("submit", (e) => {
          console.log("signupForm submitted")
          e.preventDefault()
          this.handleSignup()
        })
      } else {
        console.log("❌ signupForm not found")
      }

      // Email verification
      const emailVerifyForm = document.getElementById("emailVerifyForm")
      if (emailVerifyForm) {
        emailVerifyForm.addEventListener("submit", (e) => {
          e.preventDefault()
          this.handleEmailVerification()
        })
      }

      // Phone verification
      const phoneVerifyForm = document.getElementById("phoneVerifyForm")
      if (phoneVerifyForm) {
        phoneVerifyForm.addEventListener("submit", (e) => {
          e.preventDefault()
          this.handlePhoneVerification()
        })
      }

      // Resend codes
      const resendEmailCode = document.getElementById("resendEmailCode")
      if (resendEmailCode) {
        resendEmailCode.addEventListener("click", () => {
          this.resendEmailCode()
        })
      }

      const resendPhoneCode = document.getElementById("resendPhoneCode")
      if (resendPhoneCode) {
        resendPhoneCode.addEventListener("click", () => {
          this.resendPhoneCode()
        })
      }

      // Skip phone verification
      const skipPhoneVerification = document.getElementById("skipPhoneVerification")
      if (skipPhoneVerification) {
        skipPhoneVerification.addEventListener("click", () => {
          this.completeRegistration()
        })
      }

      // Theme toggle
      const themeToggleLogin = document.getElementById("themeToggleLogin")
      if (themeToggleLogin) {
        themeToggleLogin.addEventListener("click", () => {
          this.toggleTheme()
        })
      }

      console.log("Event listeners setup completed")
    } catch (error) {
      console.error("Error setting up event listeners:", error)
    }
  }

  showSignupForm() {
    console.log("Showing signup form")
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
      setTimeout(() => {
        this.phoneInputManager.init()
      }, 100)
    } catch (error) {
      console.error("Error showing signup form:", error)
    }
  }

  showLoginForm() {
    console.log("Showing login form")
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
      this.phoneInputManager.destroy()
    } catch (error) {
      console.error("Error showing login form:", error)
    }
  }

  async handleGoogleLogin() {
    console.log("Handling Google login")
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
        console.log("Google login successful, redirecting...")
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      console.error("Google login error:", error)
      this.showError("Google login failed. Please try again.")
    }
  }

  async handleAppleLogin() {
    console.log("Handling Apple login")
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
        console.log("Apple login successful, redirecting...")
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      console.error("Apple login error:", error)
      this.showError("Apple login failed. Please try again.")
    }
  }

  async handleLogin() {
    console.log("Handling login")
    const usernameInput = document.getElementById("loginUsername")
    const passwordInput = document.getElementById("loginPassword")

    if (!usernameInput || !passwordInput) {
      this.showError("Login form elements not found")
      return
    }

    const username = usernameInput.value.trim()
    const password = passwordInput.value

    if (!username || !password) {
      this.showError("Please fill in all fields")
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
      console.log("Login successful, redirecting...")
      window.location.href = "index.html"
    } catch (error) {
      console.error("Login error:", error)
      this.showError("Login failed. Please try again.")
    }
  }

  handleGuestLogin() {
    console.log("Handling guest login")
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
      console.log("Guest login successful, redirecting...")
      window.location.href = "index.html"
    }, 500)
  }

  async handleSignup() {
    console.log("Handling signup")
    const usernameInput = document.getElementById("signupUsername")
    const emailInput = document.getElementById("signupEmail")
    const passwordInput = document.getElementById("signupPassword")
    const confirmPasswordInput = document.getElementById("confirmPassword")

    if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
      this.showError("Signup form elements not found")
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
      this.showError("Please fill in all required fields")
      return
    }

    if (!this.verificationManager.validateEmail(email)) {
      this.showError("Please enter a valid email address")
      return
    }

    if (phone && phoneData && !phoneData.isValid) {
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
      console.error("Signup error:", error)
      this.showError("Signup failed. Please try again.")
    }
  }

  async startEmailVerification() {
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
      console.error("Email verification error:", error)
      this.showError("Failed to send verification email. Please try again.")
    }
  }

  async handleEmailVerification() {
    const codeInput = document.getElementById("emailCode")
    if (!codeInput) {
      this.showError("Email code input not found")
      return
    }

    const code = codeInput.value.trim()

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
      console.error("Email verification error:", error)
      this.showError(error.message)
    }
  }

  async startPhoneVerification() {
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
      console.error("Phone verification error:", error)
      this.showError("Failed to send verification SMS. Please try again.")
    }
  }

  async handlePhoneVerification() {
    const codeInput = document.getElementById("phoneCode")
    if (!codeInput) {
      this.showError("Phone code input not found")
      return
    }

    const code = codeInput.value.trim()

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
      console.error("Phone verification error:", error)
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
      console.log("Registration complete, redirecting...")
      window.location.href = "index.html"
    }, 1500)
  }

  async resendEmailCode() {
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
      this.showError("Failed to resend code. Please try again.")
    }
  }

  async resendPhoneCode() {
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
      this.showError("Failed to resend code. Please try again.")
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
  console.log("DOM loaded, initializing AuthManager")
  try {
    new AuthManager()
  } catch (error) {
    console.error("Failed to initialize AuthManager:", error)
  }
})
