export class StripeService {
  constructor() {
    this.publishableKey = "" // Leave blank as requested
    this.stripe = null
    this.init()
  }

  async init() {
    if (this.publishableKey && window.Stripe) {
      this.stripe = window.Stripe(this.publishableKey)
    }
  }

  async createCheckoutSession(priceId, userId) {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: userId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      })

      const session = await response.json()

      if (this.stripe) {
        const { error } = await this.stripe.redirectToCheckout({
          sessionId: session.id,
        })

        if (error) {
          throw new Error(error.message)
        }
      } else {
        // Fallback: redirect to Stripe checkout URL
        window.location.href = session.url
      }
    } catch (error) {
      console.error("Stripe checkout error:", error)
      throw error
    }
  }

  async createPortalSession(customerId) {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: customerId,
        }),
      })

      const session = await response.json()
      window.location.href = session.url
    } catch (error) {
      console.error("Stripe portal error:", error)
      throw error
    }
  }
}
