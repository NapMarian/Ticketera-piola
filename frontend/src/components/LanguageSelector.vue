<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-gray-300 hover:text-white"
    >
      <span class="text-lg">{{ currentFlag }}</span>
      <span class="text-sm font-medium uppercase">{{ locale }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
          :class="locale === lang.code ? 'bg-primary-500/10 text-primary-400' : 'text-gray-300'"
        >
          <span class="text-lg">{{ lang.flag }}</span>
          <span class="text-sm font-medium">{{ lang.name }}</span>
          <svg
            v-if="locale === lang.code"
            class="w-4 h-4 ml-auto text-primary-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isOpen = ref(false)

const languages = [
  { code: 'es', name: 'Español', flag: '🇦🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

const currentFlag = computed(() => {
  const lang = languages.find(l => l.code === locale.value)
  return lang?.flag || '🌐'
})

function changeLanguage(code) {
  locale.value = code
  localStorage.setItem('locale', code)
  isOpen.value = false
}

function handleClickOutside(event) {
  const target = event.target
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
