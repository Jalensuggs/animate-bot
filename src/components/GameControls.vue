<script setup lang="ts">
import { t } from '@/i18n'

const emit = defineEmits<{
  direction: [name: 'left' | 'right', pressed: boolean]
  jump: []
  skill: []
}>()

function direction(event: PointerEvent, name: 'left' | 'right', pressed: boolean) {
  event.preventDefault()
  if (pressed) (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('direction', name, pressed)
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-end justify-between px-4 lg:hidden">
    <div class="pointer-events-auto flex gap-2">
      <button
        type="button"
        class="game-touch"
        :aria-label="t('game.left')"
        @pointerdown="direction($event, 'left', true)"
        @pointerup="direction($event, 'left', false)"
        @pointercancel="direction($event, 'left', false)"
      >
        ←
      </button>
      <button
        type="button"
        class="game-touch"
        :aria-label="t('game.right')"
        @pointerdown="direction($event, 'right', true)"
        @pointerup="direction($event, 'right', false)"
        @pointercancel="direction($event, 'right', false)"
      >
        →
      </button>
    </div>
    <div class="pointer-events-auto flex items-end gap-2">
      <button type="button" class="game-touch game-touch--skill" @pointerdown.prevent="emit('skill')">
        {{ t('game.skill') }}
      </button>
      <button type="button" class="game-touch game-touch--jump" @pointerdown.prevent="emit('jump')">
        {{ t('game.jump') }}
      </button>
    </div>
  </div>
</template>
