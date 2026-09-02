<script setup lang="ts">
import BloubBot from '@/components/BloubBot.vue'
import type { StateId } from '@/bot/states'

const props = defineProps<{
  x: number
  y: number
  time: number
  state: StateId
  shape: string
  color: string
  expression: string
  facing: -1 | 1
  invulnerable: boolean
}>()

const TAILLE = 76
</script>

<template>
  <g
    :transform="`translate(${x} ${y})`"
    :opacity="invulnerable && Math.floor(time * 14) % 2 === 0 ? 0.38 : 1"
  >
    <g
      v-if="state === 'play'"
      fill="none"
      stroke="#8cf2d1"
      stroke-linecap="round"
    >
      <path :d="`M${-facing * 70} -16H${-facing * 34}`" stroke-width="5" opacity=".35" />
      <path :d="`M${-facing * 88} 0H${-facing * 38}`" stroke-width="7" opacity=".72" />
      <path :d="`M${-facing * 64} 17H${-facing * 30}`" stroke-width="4" opacity=".28" />
    </g>
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
