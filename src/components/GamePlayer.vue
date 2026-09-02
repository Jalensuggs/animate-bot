<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import BloubBot from '@/components/BloubBot.vue'
import type { StateId } from '@/bot/states'
import { debugLog } from '@/ui/game/debugLog'

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
const root = ref<SVGGElement | null>(null)
let lastBand = Math.floor(props.y / 25)

watch(
  () => props.y,
  async (y) => {
    const band = Math.floor(y / 25)
    if (band === lastBand) return
    lastBand = band
    await nextTick()
    // #region agent log
    debugLog('F', 'GamePlayer.vue:y-watch', 'player position reached rendered SVG', {
      propY: y,
      propX: props.x,
      domTransform: root.value?.getAttribute('transform') ?? null
    })
    // #endregion
  },
  { flush: 'post' }
)
</script>

<template>
  <g
    ref="root"
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
