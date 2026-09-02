<script setup lang="ts">
import BloubBot from '@/components/BloubBot.vue'
import type { StateId } from '@/bot/states'

defineProps<{
  x: number
  y: number
  time: number
  state: StateId
  shape: string
  color: string
  expression: string
  invulnerable: boolean
}>()

const TAILLE = 76
</script>

<template>
  <g
    :transform="`translate(${x} ${y})`"
    :opacity="invulnerable && Math.floor(time * 14) % 2 === 0 ? 0.38 : 1"
  >
    <BloubBot
      :size="TAILLE"
      :state="state"
      :shape="shape"
      :color="color"
      :expression="expression"
      :frozen-at="time"
      :x="-TAILLE / 2"
      :y="-TAILLE / 2"
      class="overflow-visible"
    />
  </g>
</template>
