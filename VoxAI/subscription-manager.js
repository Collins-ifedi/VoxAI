import { StripeService } from "./stripe-service.js"

export class SubscriptionManager {
  constructor() {
    this.stripeService = new StripeService()
    this.user = JSON.parse(localStorage.getItem("user") || "{}")
    this.subscription = JSON.parse(localStorage.getItem("subscription") || "{}")
    this.messageCount = JSON.parse(localStorage.getItem("messageCount") || "{}")
    this.init()
  }

  init() {
    this.resetDailyCountIfNeeded()
    this.updateUI()
  }

  resetDailyCountIfNeeded() {
    const today = new Date().toDateString()
    if (this.messageCount.date !== today) {
      this.messageCount = {
        date: today,
        count: 0,
      }
      this.saveMessageCount()
    }
  }

  canSendMessage() {
    if (this.isProUser()) {
      return { allowed: true, remaining: "unlimited" }
    }

    const remaining = 5 - this.messageCount.count
    return {
      allowed: remaining > 0,
      remaining: remaining,
      limit: 5,
    }
  }

  incrementMessageCount() {
    if (!this.isProUser()) {
      this.messageCount.count++
      this.saveMessageCount()
      this.updateUI()
    }
  }

  isProUser() {
    return (
      this.subscription.status === "active" &&
      this.subscription.plan === "pro" &&
      new Date(this.subscription.expiresAt) > new Date()
    )
  }

  async subscribeToPro() {
    try {
      await this.stripeService.createCheckoutSession("price_pro_monthly", this.user.id)
    } catch (error) {
      console.error("Subscription error:", error)
      throw error
    }
  }

  async manageSubscription() {
    if (this.subscription.customerId) {
      await this.stripeService.createPortalSession(this.subscription.customerId)
    }
  }

  updateSubscription(subscriptionData) {
    this.subscription = {
      ...this.subscription,
      ...subscriptionData,
    }
    localStorage.setItem("subscription", JSON.stringify(this.subscription))
    this.updateUI()
  }

  updateUI() {
    this.updateMessageCounter()
    this.updateSubscriptionStatus()
  }

  updateMessageCounter() {
    const counterElement = document.getElementById("messageCounter")
    if (counterElement) {
      const status = this.canSendMessage()
      if (this.isProUser()) {
        counterElement.innerHTML = `
          <div class="flex items-center space-x-2 text-green-600">
            <i class="fas fa-crown"></i>
            <span class="text-sm">Pro - Unlimited</span>
          </div>
        `
      } else {
        counterElement.innerHTML = `
          <div class="flex items-center space-x-2 ${status.allowed ? "text-blue-600" : "text-red-600"}">
            <i class="fas fa-message"></i>
            <span class="text-sm">${status.remaining}/5 messages today</span>
          </div>
        `
      }
    }
  }

  updateSubscriptionStatus() {
    const statusElement = document.getElementById("subscriptionStatus")
    if (statusElement) {
      if (this.isProUser()) {
        statusElement.innerHTML = `
          <div class="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-crown"></i>
                <span class="font-semibold">Pro Member</span>
              </div>
              <button id="manageSubscription" class="text-sm underline hover:no-underline">
                Manage
              </button>
            </div>
          </div>
        `

        document.getElementById("manageSubscription")?.addEventListener("click", () => {
          this.manageSubscription()
        })
      } else {
        statusElement.innerHTML = `
          <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">Free Tier</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">5 messages per day</div>
              </div>
              <button id="upgradeButton" class="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
                Upgrade $10/mo
              </button>
            </div>
          </div>
        `

        document.getElementById("upgradeButton")?.addEventListener("click", () => {
          this.showUpgradeModal()
        })
      }
    }
  }

  showUpgradeModal() {
    const modal = document.getElementById("upgradeModal")
    if (modal) {
      // Update modal content to reflect Web Speech features
      const modalContent = modal.querySelector(".space-y-4")
      if (modalContent) {
        modalContent.innerHTML = `
          <div class="flex items-center space-x-3">
            <i class="fas fa-infinity text-green-500"></i>
            <span>Unlimited messages per day</span>
          </div>
          <div class="flex items-center space-x-3">
            <i class="fas fa-volume-up text-purple-500"></i>
            <span>Text-to-Speech responses</span>
          </div>
          <div class="flex items-center space-x-3">
            <i class="fas fa-headset text-orange-500"></i>
            <span>Priority support</span>
          </div>
          <div class="flex items-center space-x-3">
            <i class="fas fa-star text-yellow-500"></i>
            <span>Advanced features & settings</span>
          </div>
        `
      }
      modal.classList.remove("hidden")
    }
  }

  hideUpgradeModal() {
    const modal = document.getElementById("upgradeModal")
    if (modal) {
      modal.classList.add("hidden")
    }
  }

  saveMessageCount() {
    localStorage.setItem("messageCount", JSON.stringify(this.messageCount))
  }
}
