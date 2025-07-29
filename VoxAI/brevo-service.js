export class BrevoService {
  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || ""
    this.baseUrl = "https://api.brevo.com/v3"
  }

  async sendVerificationEmail(email, code) {
    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Voxaroid",
            email: "noreply@voxaroid.com",
          },
          to: [
            {
              email: email,
              name: "User",
            },
          ],
          subject: "Voxaroid - Email Verification",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 20px;">
                  <svg width="60" height="60" viewBox="0 0 80 80">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <path d="M15 20 L25 50 L35 20" fill="none" stroke="url(#logoGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M45 20 L65 50 M65 20 L45 50" fill="none" stroke="url(#logoGradient)" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="25" cy="15" r="2" fill="url(#logoGradient)"/>
                    <circle cx="55" cy="15" r="2" fill="url(#logoGradient)"/>
                    <circle cx="40" cy="60" r="3" fill="url(#logoGradient)" opacity="0.7"/>
                    <path d="M35 35 Q40 30, 45 35" fill="none" stroke="url(#logoGradient)" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
                  </svg>
                </div>
                <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Voxaroid</h1>
                <p style="color: #666; margin: 10px 0 0 0;">AI-Powered Communication Platform</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; text-align: center;">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">Email Verification</h2>
                <p style="color: #475569; margin-bottom: 25px;">Please use the following code to verify your email address:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e2e8f0;">
                  <div style="font-size: 36px; font-weight: bold; color: #06b6d4; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${code}
                  </div>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">
                  This code will expire in <strong>5 minutes</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  If you didn't request this verification, please ignore this email.
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
                  © 2024 Voxaroid. All rights reserved.
                </p>
              </div>
            </div>
          `,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Brevo API error: ${errorData.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Brevo email sending failed:", error)
      throw error
    }
  }

  async sendWelcomeEmail(email, username) {
    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Voxaroid Team",
            email: "welcome@voxaroid.com",
          },
          to: [
            {
              email: email,
              name: username,
            },
          ],
          subject: "Welcome to Voxaroid! 🎉",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Welcome to Voxaroid!</h1>
                <p style="color: #666; margin: 10px 0;">Hi ${username}, you're all set to start chatting with AI!</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0;">🎁 Your Free Tier Includes:</h3>
                <ul style="color: #475569; padding-left: 20px;">
                  <li>5 messages per day</li>
                  <li>Basic AI chat features</li>
                  <li>Text-based conversations</li>
                </ul>
                
                <h3 style="color: #1e293b; margin: 25px 0 15px 0;">🚀 Upgrade to Pro ($10/month):</h3>
                <ul style="color: #475569; padding-left: 20px;">
                  <li>Unlimited messages</li>
                  <li>Voice chat with Speech-to-Text</li>
                  <li>Text-to-Speech responses</li>
                  <li>Priority support</li>
                </ul>
                
                <div style="text-align: center; margin-top: 25px;">
                  <a href="#" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Start Chatting Now
                  </a>
                </div>
              </div>
            </div>
          `,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Welcome email failed:", error)
      return false
    }
  }
}
