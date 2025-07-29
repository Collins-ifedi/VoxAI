import { SoundManager } from "./sounds.js"

export class SettingsManager {
  constructor() {
    this.settings = JSON.parse(localStorage.getItem("settings") || "{}")
    this.defaultSettings = {
      theme: "light",
      fontStyle: "font-sans",
      fontColor: "#000000",
      soundsEnabled: true,
      soundVolume: 0.5,
    }

    // Merge with defaults
    this.settings = { ...this.defaultSettings, ...this.settings }
    this.soundManager = new SoundManager()
  }

  init() {
    this.applySettings()
    this.setupEventListeners()
    this.updateUI()
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Font style
    document.getElementById("fontStyle").addEventListener("change", (e) => {
      this.updateSetting("fontStyle", e.target.value)
    })

    // Font color
    document.getElementById("fontColor").addEventListener("change", (e) => {
      this.updateSetting("fontColor", e.target.value)
    })

    // Sound settings
    document.getElementById("soundToggle")?.addEventListener("click", () => {
      this.toggleSounds()
    })

    document.getElementById("soundVolume")?.addEventListener("input", (e) => {
      this.updateSetting("soundVolume", Number.parseFloat(e.target.value))
    })
  }

  toggleTheme() {
    const newTheme = this.settings.theme === "light" ? "dark" : "light"
    this.updateSetting("theme", newTheme)
  }

  toggleSounds() {
    const newSoundsEnabled = !this.settings.soundsEnabled
    this.updateSetting("soundsEnabled", newSoundsEnabled)
  }

  updateSetting(key, value) {
    this.settings[key] = value
    this.saveSettings()
    this.applySettings()
    this.updateUI()
  }

  applySettings() {
    const html = document.documentElement

    // Apply theme
    if (this.settings.theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }

    // Apply font style
    document.body.className = document.body.className.replace(/font-\w+/g, "")
    document.body.classList.add(this.settings.fontStyle)

    // Apply font color (only in light mode)
    if (this.settings.theme === "light") {
      document.body.style.color = this.settings.fontColor
    } else {
      document.body.style.color = ""
    }

    // Apply sound settings
    this.soundManager.setEnabled(this.settings.soundsEnabled)
    this.soundManager.setVolume(this.settings.soundVolume)

    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent("themeChanged"))
  }

  updateUI() {
    // Update theme toggle
    const themeToggle = document.getElementById("themeToggle")
    const toggleSpan = themeToggle?.querySelector("span")

    if (themeToggle && toggleSpan) {
      if (this.settings.theme === "dark") {
        toggleSpan.classList.add("translate-x-6")
        themeToggle.classList.add("bg-blue-500")
        themeToggle.classList.remove("bg-gray-200")
      } else {
        toggleSpan.classList.remove("translate-x-6")
        themeToggle.classList.remove("bg-blue-500")
        themeToggle.classList.add("bg-gray-200")
      }
    }

    // Update font style select
    const fontStyleSelect = document.getElementById("fontStyle")
    if (fontStyleSelect) {
      fontStyleSelect.value = this.settings.fontStyle
    }

    // Update font color
    const fontColorInput = document.getElementById("fontColor")
    if (fontColorInput) {
      fontColorInput.value = this.settings.fontColor
    }

    // Update sound toggle
    const soundToggle = document.getElementById("soundToggle")
    const soundToggleSpan = soundToggle?.querySelector("span")

    if (soundToggle && soundToggleSpan) {
      if (this.settings.soundsEnabled) {
        soundToggleSpan.classList.add("translate-x-6")
        soundToggle.classList.add("bg-blue-500")
        soundToggle.classList.remove("bg-gray-200")
      } else {
        soundToggleSpan.classList.remove("translate-x-6")
        soundToggle.classList.remove("bg-blue-500")
        soundToggle.classList.add("bg-gray-200")
      }
    }

    // Update sound volume
    const soundVolumeSlider = document.getElementById("soundVolume")
    if (soundVolumeSlider) {
      soundVolumeSlider.value = this.settings.soundVolume
    }

    // Update about section
    const aboutText = document.getElementById("aboutText")
    if (aboutText) {
      aboutText.textContent = "Voxaroid AI Chat v1.0"
    }

    // Update copyright text
    const copyrightText = document.getElementById("copyrightText")
    if (copyrightText) {
      copyrightText.textContent = "© 2024 Voxaroid. All rights reserved."
    }
  }

  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings))
  }
}
