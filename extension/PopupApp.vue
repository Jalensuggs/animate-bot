<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BloubBot from '@/components/BloubBot.vue'
import { EXPRESSIONS } from '@/bot/expressions'
import { COLORS, SHAPES } from '@/bot/skins'
import type { ExpressionId } from '@/bot/expressions'
import type { ColorId, ShapeId } from '@/bot/skins'
import { colorLabel, expressionLabel, L, shapeLabel } from './labels'
import { readSettings, writeSettings } from './storage'
import type { PetSettings } from './types'

const settings = ref<PetSettings | null>(null)
const blockedPage = ref(false)
const PREVIEW_AT = 1

function isBlockedUrl(url: string) {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:')
  )
}

onMounted(async () => {
  settings.value = await readSettings()
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  blockedPage.value = isBlockedUrl(tab?.url ?? '')
})

async function patch(partial: Partial<PetSettings>) {
  settings.value = await writeSettings(partial)
}

function toggleEnabled() {
  if (!settings.value) return
  patch({ enabled: !settings.value.enabled })
}
</script>

<template>
  <div v-if="settings" class="popup">
    <header class="popup__head">
      <h1 class="popup__title">{{ L.title }}</h1>
      <label class="popup__toggle">
        <input type="checkbox" :checked="settings.enabled" @change="toggleEnabled" />
        <span>{{ L.enabled }}</span>
      </label>
    </header>

    <p v-if="blockedPage" class="popup__warn">{{ L.blocked }}</p>
    <p class="popup__hint">{{ L.hint }}</p>

    <section class="popup__section">
      <h2>{{ L.shape }}</h2>
      <div class="popup__grid popup__grid--4">
        <button
          v-for="s in SHAPES"
          :key="s.id"
          type="button"
          class="popup__tile"
          :class="settings.shape === s.id && 'popup__tile--on'"
          :aria-label="shapeLabel(s.id)"
          :aria-pressed="settings.shape === s.id"
          @click="patch({ shape: s.id as ShapeId })"
        >
          <BloubBot
            :size="52"
            :shape="s.id"
            :color="settings.color"
            :expression="settings.expression"
            :frozen-at="PREVIEW_AT"
          />
          <span>{{ shapeLabel(s.id) }}</span>
        </button>
      </div>
    </section>

    <section class="popup__section">
      <h2>{{ L.expression }}</h2>
      <div class="popup__grid popup__grid--4">
        <button
          v-for="e in EXPRESSIONS"
          :key="e.id"
          type="button"
          class="popup__tile"
          :class="settings.expression === e.id && 'popup__tile--on'"
          :aria-label="expressionLabel(e.id)"
          :aria-pressed="settings.expression === e.id"
          @click="patch({ expression: e.id as ExpressionId })"
        >
          <BloubBot
            :size="52"
            :shape="settings.shape"
            :color="settings.color"
            :expression="e.id"
            :frozen-at="PREVIEW_AT"
          />
          <span>{{ expressionLabel(e.id) }}</span>
        </button>
      </div>
    </section>

    <section class="popup__section">
      <h2>{{ L.color }}</h2>
      <div class="popup__grid popup__grid--6">
        <button
          v-for="c in COLORS"
          :key="c.id"
          type="button"
          class="popup__swatch"
          :class="settings.color === c.id && 'popup__swatch--on'"
          :aria-label="colorLabel(c.id)"
          :aria-pressed="settings.color === c.id"
          @click="patch({ color: c.id as ColorId })"
        >
          <span class="popup__dot" :style="{ background: c.hex }" />
        </button>
      </div>
    </section>

    <section class="popup__section">
      <h2>{{ L.size }}</h2>
      <input
        class="popup__range"
        type="range"
        min="80"
        max="200"
        step="4"
        :value="settings.size"
        @input="patch({ size: Number(($event.target as HTMLInputElement).value) })"
      />
      <span class="popup__size">{{ settings.size }} px</span>
    </section>
  </div>
</template>

<style>
.popup {
  width: 360px;
  max-height: 580px;
  overflow-y: auto;
  padding: 12px 14px 16px;
  box-sizing: border-box;
}

.popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.popup__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.popup__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}

.popup__warn {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff3cd;
  color: #664d03;
  font-size: 11px;
  line-height: 1.4;
}

.popup__hint {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: #666;
}

.popup__section {
  margin-top: 14px;
}

.popup__section h2 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
}

.popup__grid {
  display: grid;
  gap: 6px;
}

.popup__grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.popup__grid--6 {
  grid-template-columns: repeat(6, 1fr);
}

.popup__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 2px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 9px;
  line-height: 1.2;
  color: #555;
}

.popup__tile--on {
  border-color: #0a0a0c;
}

.popup__tile span {
  text-align: center;
}

.popup__swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}

.popup__swatch--on {
  border-color: #0a0a0c;
}

.popup__dot {
  display: block;
  width: 78%;
  height: 78%;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
}

.popup__range {
  width: calc(100% - 52px);
  vertical-align: middle;
}

.popup__size {
  display: inline-block;
  width: 48px;
  font-size: 11px;
  text-align: right;
  color: #666;
}
</style>
