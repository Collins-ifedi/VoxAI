import { BrevoService } from "./brevo-service.js"

export class VerificationManager {
  constructor() {
    this.emailTimer = null
    this.phoneTimer = null
    this.emailTimeLeft = 300 // 5 minutes
    this.phoneTimeLeft = 300 // 5 minutes
    this.brevoService = new BrevoService()
    this.useRealServices = true // Enable real email sending with Brevo
    // Don't access DOM elements in constructor
  }

  // Email Verification
  async sendEmailVerification(email) {
    try {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      if (this.useRealServices && process.env.EMAIL_API_KEY) {
        // Send real email via Brevo
        await this.brevoService.sendVerificationEmail(email, verificationCode)
        console.log("✅ Verification email sent via Brevo")
      } else {
        // Demo mode - just log the code
        console.log(`Demo: Email verification code is ${verificationCode}`)
        console.log(`📧 In production, this code would be sent to: ${email}`)
      }

      // Store code locally for verification
      localStorage.setItem("emailVerificationCode", verificationCode)
      localStorage.setItem("emailVerificationExpiry", Date.now() + 300000) // 5 minutes

      return true
    } catch (error) {
      console.error("Email verification error:", error)

      // Fallback to demo mode if real service fails
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      localStorage.setItem("emailVerificationCode", verificationCode)
      localStorage.setItem("emailVerificationExpiry", Date.now() + 300000)
      console.log(`Demo fallback: Email verification code is ${verificationCode}`)

      return true
    }
  }

  async sendPhoneVerification(phone) {
    try {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // For now, just demo mode for phone (can integrate Twilio later)
      console.log(`Demo: Phone verification code is ${verificationCode}`)
      console.log(`📱 In production, this code would be sent to: ${phone}`)

      // Store code locally for verification
      localStorage.setItem("phoneVerificationCode", verificationCode)
      localStorage.setItem("phoneVerificationExpiry", Date.now() + 300000) // 5 minutes

      return true
    } catch (error) {
      console.error("Phone verification error:", error)

      // Fallback to demo mode
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      localStorage.setItem("phoneVerificationCode", verificationCode)
      localStorage.setItem("phoneVerificationExpiry", Date.now() + 300000)
      console.log(`Demo fallback: Phone verification code is ${verificationCode}`)

      return true
    }
  }

  async verifyEmailCode(code) {
    const storedCode = localStorage.getItem("emailVerificationCode")
    const expiry = localStorage.getItem("emailVerificationExpiry")

    if (!storedCode || !expiry) {
      throw new Error("No verification code found")
    }

    if (Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("emailVerificationCode")
      localStorage.removeItem("emailVerificationExpiry")
      throw new Error("Verification code has expired")
    }

    if (code !== storedCode) {
      throw new Error("Invalid verification code")
    }

    // Clean up
    localStorage.removeItem("emailVerificationCode")
    localStorage.removeItem("emailVerificationExpiry")

    return true
  }

  async verifyPhoneCode(code) {
    const storedCode = localStorage.getItem("phoneVerificationCode")
    const expiry = localStorage.getItem("phoneVerificationExpiry")

    if (!storedCode || !expiry) {
      throw new Error("No verification code found")
    }

    if (Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("phoneVerificationCode")
      localStorage.removeItem("phoneVerificationExpiry")
      throw new Error("Verification code has expired")
    }

    if (code !== storedCode) {
      throw new Error("Invalid verification code")
    }

    // Clean up
    localStorage.removeItem("phoneVerificationCode")
    localStorage.removeItem("phoneVerificationExpiry")

    return true
  }

  // Timer functions
  startEmailTimer() {
    this.emailTimeLeft = 300
    this.updateEmailTimer()

    this.emailTimer = setInterval(() => {
      this.emailTimeLeft--
      this.updateEmailTimer()

      if (this.emailTimeLeft <= 0) {
        clearInterval(this.emailTimer)
        this.handleEmailTimerExpiry()
      }
    }, 1000)
  }

  startPhoneTimer() {
    this.phoneTimeLeft = 300
    this.updatePhoneTimer()

    this.phoneTimer = setInterval(() => {
      this.phoneTimeLeft--
      this.updatePhoneTimer()

      if (this.phoneTimeLeft <= 0) {
        clearInterval(this.phoneTimer)
        this.handlePhoneTimerExpiry()
      }
    }, 1000)
  }

  updateEmailTimer() {
    const timerElement = document.getElementById("emailTimer")
    if (timerElement) {
      const minutes = Math.floor(this.emailTimeLeft / 60)
      const seconds = this.emailTimeLeft % 60
      timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
  }

  updatePhoneTimer() {
    const timerElement = document.getElementById("phoneTimer")
    if (timerElement) {
      const minutes = Math.floor(this.phoneTimeLeft / 60)
      const seconds = this.phoneTimeLeft % 60
      timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
  }

  handleEmailTimerExpiry() {
    const resendBtn = document.getElementById("resendEmailCode")
    if (resendBtn) {
      resendBtn.textContent = "Code Expired - Resend"
      resendBtn.classList.add("text-red-500")
    }
  }

  handlePhoneTimerExpiry() {
    const resendBtn = document.getElementById("resendPhoneCode")
    if (resendBtn) {
      resendBtn.textContent = "Code Expired - Resend"
      resendBtn.classList.add("text-red-500")
    }
  }

  stopTimers() {
    if (this.emailTimer) {
      clearInterval(this.emailTimer)
      this.emailTimer = null
    }
    if (this.phoneTimer) {
      clearInterval(this.phoneTimer)
      this.phoneTimer = null
    }
  }

  // Utility functions
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone)
  }
}
