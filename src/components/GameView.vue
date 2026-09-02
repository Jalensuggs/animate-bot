<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import GameControls from '@/components/GameControls.vue'
import GamePlayer from '@/components/GamePlayer.vue'
import { cameraFor, VIEW_HEIGHT, VIEW_WIDTH } from '@/game/camera'
import { LEVELS } from '@/game/levels'
import { createGame, stepGame } from '@/game/step'
import type { Ability, GameState } from '@/game/types'
import type { ShapeId } from '@/bot/skins'
import { t, type Cle } from '@/i18n'
import { createInputController } from '@/ui/game/useInput'
import { useGameLoop } from '@/ui/game/useGameLoop'

const props = defineProps<{
  shape: ShapeId
  color: string
  expression: string
  initialLevel: number
  unlocked: number
}>()

const emit = defineEmits<{
  exit: []
  level: [id: number]
  complete: [id: number]
}>()

const levelKeys = ['game.level1', 'game.level2', 'game.level3', 'game.level4', 'game.level5'] as const
const hintKeys = ['game.hint1', 'game.hint2', 'game.hint3', 'game.hint4', 'game.hint5'] as const
const abilityKeys: Record<Ability, Cle> = {
  none: 'game.ability_none',
  dash: 'game.ability_dash',
  shield: 'game.ability_shield',
  burst: 'game.ability_burst',
  orbit: 'game.ability_orbit'
}

const game = shallowRef<GameState>(createGame(props.initialLevel, props.shape))
const input = createInputController()
const camera = computed(() => cameraFor(game.value.player, game.value.level))
const title = computed(() => t(levelKeys[game.value.level.id - 1]!))
const hint = computed(() => t(hintKeys[game.value.level.id - 1]!))
const remaining = computed(
  () => game.value.level.collectibles.length - game.value.collected.length
)

function startLevel(id: number) {
  game.value = createGame(id, props.shape)
  emit('level', id)
}

function togglePause() {
  if (game.value.status === 'won' || game.value.status === 'gameover') return
  game.value = {
    ...game.value,
    status: game.value.status === 'paused' ? 'running' : 'paused'
  }
}

function onKey(event: KeyboardEvent) {
  if (event.code === 'Escape') togglePause()
}

let announcedWin = false
useGameLoop((dt) => {
  const before = game.value.status
  if (before === 'running') game.value = stepGame(game.value, input.read(), dt)
  else input.read()
  if (game.value.status === 'won' && !announcedWin) {
    announcedWin = true
    emit('complete', game.value.level.id)
  }
})

watch(
  () => props.shape,
  () => startLevel(game.value.level.id)
)
watch(
  () => game.value.level.id,
  () => {
    announcedWin = false
  }
)

onMounted(() => {
  input.attach()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  input.detach()
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <section class="game-view" :aria-label="t('game.title')">
    <header class="game-hud">
      <button type="button" class="game-chip game-chip--button" @click="emit('exit')">
        ← {{ t('game.exit') }}
      </button>
      <div class="min-w-0">
        <p class="text-[10px] tracking-[0.18em] text-white/55 uppercase">
          {{ t('game.level', { n: game.level.id }) }}
        </p>
        <h1 class="truncate text-sm font-semibold text-white">{{ title }}</h1>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <span class="game-chip" :aria-label="t('game.lives')">● {{ game.player.lives }}</span>
        <span class="game-chip" :aria-label="t('game.collectibles')">
          ✦ {{ game.collected.length }}/{{ game.level.collectibles.length }}
        </span>
        <button
          type="button"
          class="game-chip game-chip--button"
          :aria-label="game.status === 'paused' ? t('game.resume') : t('game.pause')"
          @click="togglePause"
        >
          {{ game.status === 'paused' ? '▶' : 'Ⅱ' }}
        </button>
      </div>
    </header>

    <div class="game-levels" :aria-label="t('game.chooseLevel')">
      <button
        v-for="level in LEVELS"
        :key="level.id"
        type="button"
        class="game-level-button"
        :class="level.id === game.level.id && 'game-level-button--active'"
        :disabled="level.id > unlocked"
        :aria-label="t('game.level', { n: level.id })"
        @click="startLevel(level.id)"
      >
        {{ level.id }}
      </button>
    </div>

    <div class="game-stage">
      <svg
        class="h-full w-full"
        :viewBox="`${camera.x} ${camera.y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="t('game.scene', { level: game.level.id })"
      >
        <defs>
          <linearGradient id="game-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#111a35" />
            <stop offset="1" stop-color="#22345d" />
          </linearGradient>
          <linearGradient id="game-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6f7ff1" />
            <stop offset="1" stop-color="#4756b8" />
          </linearGradient>
          <pattern id="game-grid" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M54 0H0V54" fill="none" stroke="#fff" stroke-opacity=".035" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#game-sky)" />
        <rect :width="game.level.width" :height="game.level.height" fill="url(#game-grid)" />
        <circle
          v-for="i in 18"
          :key="`star-${i}`"
          :cx="i * 177 % game.level.width"
          :cy="55 + (i * 83) % 260"
          :r="i % 3 === 0 ? 3 : 1.5"
          fill="#fff"
          :opacity="0.16 + (i % 4) * 0.08"
        />

        <g fill="url(#game-ground)">
          <rect
            v-for="platform in game.level.platforms"
            :key="platform.id"
            v-bind="platform"
            rx="8"
          />
          <rect
            v-for="wall in game.level.breakables.filter((item) => !game.broken.includes(item.id))"
            :key="wall.id"
            v-bind="wall"
            rx="8"
            fill="#dc7896"
          />
          <rect
            v-for="gate in game.level.gates.filter((item) => !game.activated.includes(item.id))"
            :key="gate.id"
            v-bind="gate"
            rx="8"
            fill="#efb25b"
          />
        </g>

        <g fill="#ff6f86">
          <path
            v-for="(hazard, i) in game.level.hazards"
            :key="`hazard-${i}`"
            :d="`M${hazard.x} ${hazard.y + hazard.height} L${hazard.x + hazard.width / 2} ${hazard.y} L${hazard.x + hazard.width} ${hazard.y + hazard.height}Z`"
          />
        </g>

        <g v-for="checkpoint in game.level.checkpoints" :key="checkpoint.id">
          <path
            :d="`M${checkpoint.x} ${checkpoint.y + checkpoint.height}V${checkpoint.y}`"
            stroke="#8cf2d1"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            :d="`M${checkpoint.x + 2} ${checkpoint.y}h34l-9 14 9 14h-34Z`"
            fill="#8cf2d1"
          />
        </g>

        <g v-for="trigger in game.level.switches" :key="trigger.id">
          <circle
            :cx="trigger.x + trigger.width / 2"
            :cy="trigger.y + trigger.height / 2"
            r="34"
            fill="none"
            :stroke="game.activated.includes(trigger.id) ? '#8cf2d1' : '#efb25b'"
            stroke-width="7"
            stroke-dasharray="10 8"
          />
        </g>

        <g
          v-for="item in game.level.collectibles.filter((star) => !game.collected.includes(star.id))"
          :key="item.id"
          :transform="`translate(${item.x} ${item.y})`"
        >
          <circle r="18" fill="#ffe27a" opacity=".2" />
          <path d="M0-13 4-4 13 0 4 4 0 13-4 4-13 0-4-4Z" fill="#ffe27a" />
        </g>

        <g :transform="`translate(${game.level.goal.x} ${game.level.goal.y})`">
          <rect
            :width="game.level.goal.width"
            :height="game.level.goal.height"
            rx="34"
            fill="#8cf2d1"
            opacity=".18"
          />
          <rect
            x="10"
            y="10"
            :width="game.level.goal.width - 20"
            :height="game.level.goal.height - 10"
            rx="25"
            fill="none"
            stroke="#8cf2d1"
            stroke-width="6"
          />
        </g>

        <GamePlayer
          :x="game.player.x"
          :y="game.player.y"
          :time="game.player.stateTime"
          :state="game.player.state"
          :shape="shape"
          :color="color"
          :expression="expression"
          :invulnerable="game.player.invulnerable > 0"
        />
      </svg>
    </div>

    <div class="game-tip">
      <strong>{{ hint }}</strong>
      <span>
        {{ t('game.ability') }}:
        {{ t(abilityKeys[game.level.ability]) }}
      </span>
    </div>

    <GameControls
      @direction="input.direction"
      @jump="input.jump"
      @skill="input.skill"
    />

    <div v-if="game.status !== 'running'" class="game-overlay">
      <div class="game-card">
        <template v-if="game.status === 'paused'">
          <p class="game-kicker">{{ t('game.paused') }}</p>
          <h2>{{ title }}</h2>
          <button type="button" class="game-primary" @click="togglePause">
            {{ t('game.resume') }}
          </button>
        </template>
        <template v-else-if="game.status === 'won'">
          <p class="game-kicker">{{ t('game.completed') }}</p>
          <h2>{{ remaining ? t('game.missed', { n: remaining }) : t('game.perfect') }}</h2>
          <button
            v-if="game.level.id < LEVELS.length"
            type="button"
            class="game-primary"
            @click="startLevel(game.level.id + 1)"
          >
            {{ t('game.next') }}
          </button>
          <button v-else type="button" class="game-primary" @click="emit('exit')">
            {{ t('game.finish') }}
          </button>
          <button type="button" class="game-secondary" @click="startLevel(game.level.id)">
            {{ t('game.replay') }}
          </button>
        </template>
        <template v-else>
          <p class="game-kicker">{{ t('game.gameover') }}</p>
          <h2>{{ t('game.tryAgain') }}</h2>
          <button type="button" class="game-primary" @click="startLevel(game.level.id)">
            {{ t('game.restart') }}
          </button>
        </template>
      </div>
    </div>
  </section>
</template>
