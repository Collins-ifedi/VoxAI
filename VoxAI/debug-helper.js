// Debug helper to check if all elements exist
export function debugLoginPage() {
  console.log("=== LOGIN PAGE DEBUG ===")

  const elements = ["showSignup", "showLogin", "googleLogin", "appleLogin", "guestLogin", "loginForm", "signupForm"]

  elements.forEach((id) => {
    const element = document.getElementById(id)
    console.log(`${id}:`, element ? "✅ Found" : "❌ Missing")
  })

  // Check if auth.js is loaded
  console.log("AuthManager available:", typeof window.AuthManager !== "undefined")

  // Check localStorage
  console.log("Existing user:", localStorage.getItem("user"))

  console.log("=== END DEBUG ===")
}

// Call this function in browser console to debug
window.debugLoginPage = debugLoginPage
