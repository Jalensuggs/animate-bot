<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BloubBot from '@/components/BloubBot.vue'
import { makeBlock } from '@/bot/cycles'
import type { ExpressionId } from '@/bot/expressions'
import type { ColorId, ShapeId } from '@/bot/skins'
import { onSettingsChanged, writeSettings } from './storage'
import type { PetSettings } from './types'
import { usePetInteractions } from './petInteractions'

const props = defineProps<{ initial: PetSettings }>()

const shape = ref<ShapeId>(props.initial.shape)
const color = ref<ColorId>(props.initial.color)
const expression = ref<ExpressionId>(props.initial.expression)
const size = ref(props.initial.size)
const x = ref<number | null>(props.initial.x)
const y = ref<number | null>(props.initial.y)

const playing = ref(true)
const block = ref(0)
const idle = [makeBlock('idle')]

const { scrollExpression, clickCycle, onAvatarClick, onBlockChange } = usePetInteractions({
  playing,
  block
})

watch(block, onBlockChange)

const displayedCycle = computed(() => clickCycle.value ?? idle)
const displayedExpression = computed(
  () => scrollExpression.value ?? expression.value
)

const hostStyle = computed(() => {
  const px = x.value ?? window.innerWidth - size.value - 24
  const py = y.value ?? window.innerHeight - size.value - 24
  return {
    left: `${px}px`,
    top: `${py}px`,
    width: `${size.value}px`,
    height: `${size.value}px`
  }
})

let drag: { ox: number; oy: number; sx: number; sy: number } | null = null
let moved = false

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  drag = {
    ox: x.value ?? window.innerWidth - size.value - 24,
    oy: y.value ?? window.innerHeight - size.value - 24,
    sx: e.clientX,
    sy: e.clientY
  }
  moved = false
}

function onPointerMove(e: PointerEvent) {
  if (!drag) return
  const dx = e.clientX - drag.sx
  const dy = e.clientY - drag.sy
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true
  x.value = Math.max(8, Math.min(window.innerWidth - size.value - 8, drag.ox + dx))
  y.value = Math.max(8, Math.min(window.innerHeight - size.value - 8, drag.oy + dy))
}

function onPointerUp() {
  if (!drag) return
  if (!moved) onAvatarClick()
  else writeSettings({ x: x.value, y: y.value })
  drag = null
}

function applySettings(s: PetSettings) {
  shape.value = s.shape
  color.value = s.color
  expression.value = s.expression
  size.value = s.size
  if (s.x !== null) x.value = s.x
  if (s.y !== null) y.value = s.y
}

onSettingsChanged(applySettings)
</script>

<template>
  <div
    class="pet"
    :style="hostStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <BloubBot
      class="pet__bot"
      v-model:block="block"
      v-model:playing="playing"
      :cycle="displayedCycle"
      :size="size"
      :shape="shape"
      :color="color"
      :expression="displayedExpression"
      :follow="true"
      look-style="libre"
      paper="transparent"
    />
  </div>
</template>

<style>
.pet {
  position: fixed;
  z-index: 2147483646;
  touch-action: none;
  cursor: grab;
  user-select: none;
  pointer-events: auto;
}

.pet:active {
  cursor: grabbing;
}

.pet__bot {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}
</style>
