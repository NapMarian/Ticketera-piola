import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: true // Always dark mode
  }),

  actions: {
    init() {
      // Force dark mode always
      this.isDark = true
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.classList.add('dark')
    },

    toggle() {
      // No-op - always dark
    },

    setDark(value) {
      // No-op - always dark
    }
  }
})
