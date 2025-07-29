import { BrevoService } from "./brevo-service.js"
import { debugLog } from "./config.js"

export class VerificationManager {
  constructor() {
    this.emailTimer = null
    this.phoneTimer = null
    this.emailTimeLeft = 300 // 5 minutes
    this.phoneTimeLeft = 300 // 5 minutes
    this.brevoService = new BrevoService()
    debugLog("VerificationManager initialized.")
  }

  // Email Verification
  async sendEmailVerification(email) {
    try {
      debugLog(`VerificationManager: Requesting email verification for ${email}.`)
      // Call the BrevoService which now proxies to your backend
      await this.brevoService.sendVerificationEmail(email)

      // The backend generates and stores the code, so we don't need to store it locally anymore.
      // We just need to know that the request was sent.
      debugLog("VerificationManager: Email verification request sent successfully.")
      return true
    } catch (error) {
      console.error("VerificationManager: Email verification error:", error)
      // Even if real service fails, we might want to proceed in demo mode for development
      // or show a specific error to the user.
      throw new Error("Failed to send verification email. Please check your email address and try again.")
    }
  }

  async sendPhoneVerification(phone) {
    try {
      // For now, still demo mode for phone as backend doesn't have a real SMS integration
      debugLog(`VerificationManager: Simulating phone verification for ${phone}.`)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      localStorage.setItem("phoneVerificationCode", verificationCode)
      localStorage.setItem("phoneVerificationExpiry", Date.now() + 300000) // 5 minutes
      console.log(`📱 Demo: Phone verification code for ${phone} is ${verificationCode}`)
      return true
    } catch (error) {
      console.error("VerificationManager: Phone verification error:", error)
      throw new Error("Failed to send verification SMS. Please try again.")
    }
  }

  async verifyEmailCode(email, code) {
    try {
      debugLog(`VerificationManager: Verifying email code ${code} for ${email}.`)
      // Call the BrevoService which now proxies to your backend
      await this.brevoService.verifyCode(email, code)

      // Backend handles code validation and expiry.
      debugLog("VerificationManager: Email code verified successfully by backend.")
      return true
    } catch (error) {
      console.error("VerificationManager: Email code verification error:", error)
      throw error // Re-throw the error from BrevoService (which contains backend error message)
    }
  }

  async verifyPhoneCode(code) {
    const storedCode = localStorage.getItem("phoneVerificationCode")
    const expiry = localStorage.getItem("phoneVerificationExpiry")

    if (!storedCode || !expiry) {
      throw new Error("No phone verification code found or it has expired. Please resend.")
    }

    if (Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("phoneVerificationCode")
      localStorage.removeItem("phoneVerificationExpiry")
      throw new Error("Phone verification code has expired. Please resend.")
    }

    if (code !== storedCode) {
      throw new Error("Invalid phone verification code.")
    }

    // Clean up
    localStorage.removeItem("phoneVerificationCode")
    localStorage.removeItem("phoneVerificationExpiry")
    debugLog("VerificationManager: Phone code verified successfully locally.")
    return true
  }

  // Timer functions (unchanged, as they manage UI state)
  startEmailTimer() {
    this.emailTimeLeft = 300
    this.updateEmailTimer()
    if (this.emailTimer) clearInterval(this.emailTimer) // Clear existing timer
    this.emailTimer = setInterval(() => {
      this.emailTimeLeft--
      this.updateEmailTimer()
      if (this.emailTimeLeft <= 0) {
        clearInterval(this.emailTimer)
        this.handleEmailTimerExpiry()
      }
    }, 1000)
    debugLog("Email timer started.")
  }

  startPhoneTimer() {
    this.phoneTimeLeft = 300
    this.updatePhoneTimer()
    if (this.phoneTimer) clearInterval(this.phoneTimer) // Clear existing timer
    this.phoneTimer = setInterval(() => {
      this.phoneTimeLeft--
      this.updatePhoneTimer()
      if (this.phoneTimeLeft <= 0) {
        clearInterval(this.phoneTimer)
        this.handlePhoneTimerExpiry()
      }
    }, 1000)
    debugLog("Phone timer started.")
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
    console.warn("Email verification code expired.")
  }

  handlePhoneTimerExpiry() {
    const resendBtn = document.getElementById("resendPhoneCode")
    if (resendBtn) {
      resendBtn.textContent = "Code Expired - Resend"
      resendBtn.classList.add("text-red-500")
    }
    console.warn("Phone verification code expired.")
  }

  stopTimers() {
    if (this.emailTimer) {
      clearInterval(this.emailTimer)
      this.emailTimer = null
      debugLog("Email timer stopped.")
    }
    if (this.phoneTimer) {
      clearInterval(this.phoneTimer)
      this.phoneTimer = null
      debugLog("Phone timer stopped.")
    }
  }

  // Utility functions (unchanged)
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
    // This validation is basic; intl-tel-input provides more robust validation
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone)
  }
}
