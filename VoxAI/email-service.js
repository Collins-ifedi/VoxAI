export class EmailService {
  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || "your-email-service-api-key"
    this.baseUrl = "https://api.emailservice.com" // Replace with your email service
  }

  async sendVerificationEmail(email, code) {
    try {
      // Example using SendGrid, Mailgun, or similar service
      const response = await fetch(`${this.baseUrl}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          from: "noreply@voxaroid.com",
          subject: "Voxaroid - Email Verification",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px;">
                <h1 style="color: #8b5cf6;">Voxaroid</h1>
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; color: #06b6d4; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">
                  ${code}
                </div>
                <p>This code will expire in 5 minutes.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
              </div>
            </div>
          `,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      return await response.json()
    } catch (error) {
      console.error("Email sending failed:", error)
      throw error
    }
  }

  async sendPhoneVerification(phone, code) {
    try {
      // Example using Twilio or similar SMS service
      const response = await fetch(`${this.baseUrl}/sms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phone,
          from: "+1234567890", // Your Twilio phone number
          body: `Your Voxaroid verification code is: ${code}. This code expires in 5 minutes.`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send SMS")
      }

      return await response.json()
    } catch (error) {
      console.error("SMS sending failed:", error)
      throw error
    }
  }
}
