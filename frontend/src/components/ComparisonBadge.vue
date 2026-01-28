<template>
  <div v-if="showBadge" class="flex items-center gap-1 mt-1">
    <span
      class="text-xs font-medium flex items-center gap-0.5"
      :class="badgeClass"
    >
      <svg
        v-if="direction !== 'equal'"
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          v-if="direction === 'up'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 15l7-7 7 7"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
      <span v-else class="w-3 text-center">=</span>
      {{ formattedDiff }}
    </span>
    <span class="text-xs text-gray-500">vs anterior</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  previous: {
    type: Number,
    default: 0
  },
  suffix: {
    type: String,
    default: ''
  },
  invert: {
    type: Boolean,
    default: false
  }
})

const showBadge = computed(() => {
  return props.previous !== null && props.previous !== undefined
})

const diff = computed(() => {
  const curr = props.current || 0
  const prev = props.previous || 0
  return curr - prev
})

const percentChange = computed(() => {
  if (!props.previous) return 0
  return Math.round((diff.value / props.previous) * 100)
})

const direction = computed(() => {
  if (diff.value > 0) return 'up'
  if (diff.value < 0) return 'down'
  return 'equal'
})

const isPositive = computed(() => {
  if (props.invert) {
    return diff.value < 0
  }
  return diff.value > 0
})

const badgeClass = computed(() => {
  if (direction.value === 'equal') return 'text-gray-400'
  return isPositive.value ? 'text-green-400' : 'text-red-400'
})

const formattedDiff = computed(() => {
  const absPercent = Math.abs(percentChange.value)
  if (absPercent === 0) return '0%'
  return `${absPercent}%`
})
</script>
