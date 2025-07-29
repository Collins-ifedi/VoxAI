export class PhoneInputManager {
  constructor() {
    this.iti = null
    this.countries = [
      { code: "US", name: "United States", dialCode: "+1", digits: 10 },
      { code: "CA", name: "Canada", dialCode: "+1", digits: 10 },
      { code: "GB", name: "United Kingdom", dialCode: "+44", digits: 10 },
      { code: "DE", name: "Germany", dialCode: "+49", digits: 11 },
      { code: "FR", name: "France", dialCode: "+33", digits: 10 },
      { code: "IT", name: "Italy", dialCode: "+39", digits: 10 },
      { code: "ES", name: "Spain", dialCode: "+34", digits: 9 },
      { code: "AU", name: "Australia", dialCode: "+61", digits: 9 },
      { code: "JP", name: "Japan", dialCode: "+81", digits: 10 },
      { code: "KR", name: "South Korea", dialCode: "+82", digits: 10 },
      { code: "CN", name: "China", dialCode: "+86", digits: 11 },
      { code: "IN", name: "India", dialCode: "+91", digits: 10 },
      { code: "BR", name: "Brazil", dialCode: "+55", digits: 11 },
      { code: "MX", name: "Mexico", dialCode: "+52", digits: 10 },
      { code: "AR", name: "Argentina", dialCode: "+54", digits: 10 },
      { code: "ZA", name: "South Africa", dialCode: "+27", digits: 9 },
      { code: "NG", name: "Nigeria", dialCode: "+234", digits: 10 },
      { code: "EG", name: "Egypt", dialCode: "+20", digits: 10 },
      { code: "RU", name: "Russia", dialCode: "+7", digits: 10 },
      { code: "TR", name: "Turkey", dialCode: "+90", digits: 10 },
    ]
    // Don't initialize in constructor
  }

  init() {
    const phoneInput = document.getElementById("signupPhone")
    if (!phoneInput) {
      console.log("Phone input not found, skipping initialization")
      return
    }

    // Check if intlTelInput is available
    if (!window.intlTelInput) {
      console.warn("intlTelInput library not loaded")
      return
    }

    try {
      // Initialize intl-tel-input
      this.iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: (success, failure) => {
          fetch("https://ipapi.co/json/")
            .then((response) => response.json())
            .then((data) => success(data.country_code))
            .catch(() => success("US"))
        },
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        preferredCountries: ["US", "CA", "GB", "DE", "FR"],
        separateDialCode: true,
        customPlaceholder: (selectedCountryPlaceholder, selectedCountryData) => {
          const country = this.countries.find((c) => c.code === selectedCountryData.iso2.toUpperCase())
          if (country) {
            return `Enter ${country.digits} digits`
          }
          return selectedCountryPlaceholder
        },
      })

      // Apply theme-aware styling
      this.applyThemeStyles()

      // Listen for country changes
      phoneInput.addEventListener("countrychange", () => {
        this.updatePlaceholder()
        this.applyThemeStyles()
      })

      // Listen for input changes
      phoneInput.addEventListener("input", (e) => {
        this.validatePhoneNumber(e.target.value)
      })

      // Listen for theme changes
      document.addEventListener("themeChanged", () => {
        this.applyThemeStyles()
      })
    } catch (error) {
      console.error("Failed to initialize phone input:", error)
    }
  }

  applyThemeStyles() {
    if (!this.iti) return

    const isDark = document.documentElement.classList.contains("dark")
    const dropdown = document.querySelector(".iti__country-list")
    const selectedFlag = document.querySelector(".iti__selected-flag")
    const phoneInput = document.getElementById("signupPhone")

    if (dropdown) {
      if (isDark) {
        dropdown.style.backgroundColor = "#343541"
        dropdown.style.border = "1px solid #565869"
        dropdown.style.color = "#ffffff"

        // Style individual country items
        const countryItems = dropdown.querySelectorAll(".iti__country")
        countryItems.forEach((item) => {
          item.style.backgroundColor = "#343541"
          item.style.color = "#ffffff"
          item.addEventListener("mouseenter", () => {
            item.style.backgroundColor = "#565869"
          })
          item.addEventListener("mouseleave", () => {
            item.style.backgroundColor = "#343541"
          })
        })
      } else {
        dropdown.style.backgroundColor = "#ffffff"
        dropdown.style.border = "1px solid #d1d5db"
        dropdown.style.color = "#374151"

        const countryItems = dropdown.querySelectorAll(".iti__country")
        countryItems.forEach((item) => {
          item.style.backgroundColor = "#ffffff"
          item.style.color = "#374151"
          item.addEventListener("mouseenter", () => {
            item.style.backgroundColor = "#f3f4f6"
          })
          item.addEventListener("mouseleave", () => {
            item.style.backgroundColor = "#ffffff"
          })
        })
      }
    }

    if (selectedFlag) {
      if (isDark) {
        selectedFlag.style.backgroundColor = "#202123"
        selectedFlag.style.borderColor = "#565869"
      } else {
        selectedFlag.style.backgroundColor = "#ffffff"
        selectedFlag.style.borderColor = "#d1d5db"
      }
    }

    if (phoneInput) {
      if (isDark) {
        phoneInput.style.backgroundColor = "#202123"
        phoneInput.style.borderColor = "#565869"
        phoneInput.style.color = "#ffffff"
      } else {
        phoneInput.style.backgroundColor = "#ffffff"
        phoneInput.style.borderColor = "#d1d5db"
        phoneInput.style.color = "#374151"
      }
    }
  }

  updatePlaceholder() {
    if (!this.iti) return

    const selectedCountryData = this.iti.getSelectedCountryData()
    const country = this.countries.find((c) => c.code === selectedCountryData.iso2.toUpperCase())
    const phoneInput = document.getElementById("signupPhone")

    if (country && phoneInput) {
      phoneInput.placeholder = `Enter ${country.digits} digits`
    }
  }

  validatePhoneNumber(value) {
    if (!this.iti) return false

    const selectedCountryData = this.iti.getSelectedCountryData()
    const country = this.countries.find((c) => c.code === selectedCountryData.iso2.toUpperCase())

    if (!country) return false

    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Check if the number of digits matches the expected count
    const isValid = digits.length === country.digits

    // Visual feedback
    const phoneInput = document.getElementById("signupPhone")
    if (phoneInput) {
      if (value && !isValid) {
        phoneInput.style.borderColor = "#ef4444" // red
      } else {
        const isDark = document.documentElement.classList.contains("dark")
        phoneInput.style.borderColor = isDark ? "#565869" : "#d1d5db"
      }
    }

    return isValid
  }

  getPhoneNumber() {
    if (!this.iti) return null

    try {
      return {
        number: this.iti.getNumber(),
        isValid: this.iti.isValidNumber(),
        country: this.iti.getSelectedCountryData(),
      }
    } catch (error) {
      console.error("Error getting phone number:", error)
      return null
    }
  }

  destroy() {
    if (this.iti) {
      try {
        this.iti.destroy()
      } catch (error) {
        console.error("Error destroying phone input:", error)
      }
      this.iti = null
    }
  }
}
