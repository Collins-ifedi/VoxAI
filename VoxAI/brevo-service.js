import { getApiUrl, debugLog, config } from "./config.js"

export class BrevoService {
  constructor() {
    // This client-side service now acts as a proxy to your backend's email endpoints.
    // The actual Brevo API key is handled securely on your server.
    debugLog("BrevoService initialized.")
  }

  async sendVerificationEmail(email) {
    try {
      debugLog(`Attempting to send verification email to ${email} via backend.`)
      const response = await fetch(getApiUrl(config.API_ENDPOINTS.SEND_VERIFICATION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend email sending error: ${errorData.error || response.statusText}`)
      }

      debugLog(`Verification email request successful for ${email}.`)
      return await response.json()
    } catch (error) {
      console.error("BrevoService: Failed to send verification email via backend:", error)
      throw error
    }
  }

  async verifyCode(email, code) {
    try {
      debugLog(`Attempting to verify code for ${email} via backend.`)
      const response = await fetch(getApiUrl(config.API_ENDPOINTS.VERIFY_CODE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, code: code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend code verification error: ${errorData.error || response.statusText}`)
      }

      debugLog(`Code verification successful for ${email}.`)
      return await response.json()
    } catch (error) {
      console.error("BrevoService: Failed to verify code via backend:", error)
      throw error
    }
  }

  // The welcome email is also handled by the backend, so this client-side method
  // would typically trigger a backend endpoint for sending it.
  // For now, we'll keep it as a placeholder or remove if not used.
  async sendWelcomeEmail(email, username) {
    debugLog(`Simulating welcome email for ${username} to ${email}. This should ideally be triggered by backend.`)
    // In a real app, you'd likely have a backend endpoint like /api/send-welcome-email
    // that your frontend calls after successful registration.
    return true // Simulate success
  }
}
