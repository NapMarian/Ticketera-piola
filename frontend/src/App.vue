<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  authStore.checkAuth()
  themeStore.init()
})
</script>
