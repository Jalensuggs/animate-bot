import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { ExpressionId } from '@/bot/expressions'
import type { Block } from '@/bot/cycles'
import type { ViewId } from '@/ui/views'
import {
  CLICK_CYCLE,
  expressionFromScroll,
  expressionFromScrollDelta,
  interactionForView,
  SCROLL_HOLD_MS,
  scrollRatio,
  type InteractionMode,
  type LookStyle
} from './reactions'

export interface BotInteractionOptions {
  view: Ref<ViewId>
  playing: Ref<boolean>
  preview: Ref<boolean>
  intro: Ref<boolean>
  block: Ref<number>
}

/**
 * Branche les entrees utilisateur (curseur, defilement, clic) sur le bot.
 * Retourne ce qu'`App.vue` doit passer a `BloubBot` et les gestionnaires d'evenements.
 */
export function useBotInteractions(opts: BotInteractionOptions) {
  const scrollExpression = ref<ExpressionId | null>(null)
  const clickCycle = ref<Block[] | null>(null)
  let scrollTimer: ReturnType<typeof setTimeout> | undefined
  let lastScrollY = 0
  let savedBlock = 0
  let savedPlaying = false

  const mode = computed<InteractionMode>(() =>
    interactionForView(opts.view.value, opts.playing.value, opts.preview.value, opts.intro.value)
  )

  const follow = computed(() => mode.value.follow)
  const lookStyle = computed<LookStyle>(() => mode.value.lookStyle)
  const overlayExpression = computed(() => scrollExpression.value)
  const cycleOverride = computed(() => clickCycle.value)

  function holdScrollExpression(expr: ExpressionId) {
    scrollExpression.value = expr
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      scrollExpression.value = null
    }, SCROLL_HOLD_MS)
  }

  function onScroll() {
    if (!mode.value.scroll) return
    const y = window.scrollY
    const delta = y - lastScrollY
    lastScrollY = y
    applyScrollReaction(delta)
  }

  /** Molette sur le panneau lateraux (desktop) ou la page (mobile). */
  function onWheel(e: WheelEvent) {
    if (!mode.value.scroll) return
    applyScrollReaction(e.deltaY)
  }

  function applyScrollReaction(delta: number) {
    const jolt = expressionFromScrollDelta(delta)
    holdScrollExpression(jolt ?? expressionFromScroll(scrollRatio()))
  }

  function onAvatarClick() {
    if (!mode.value.click || opts.intro.value) return
    savedBlock = opts.block.value
    savedPlaying = opts.playing.value
    opts.block.value = 0
    clickCycle.value = CLICK_CYCLE
    opts.playing.value = true
  }

  /** Le montage de clic se termine sur le bloc de repos. */
  watch(
    () => opts.block.value,
    (i) => {
      const cycle = clickCycle.value
      if (!cycle || i < cycle.length - 1) return
      opts.playing.value = savedPlaying
      opts.block.value = savedBlock
      clickCycle.value = null
    }
  )

  watch(opts.view, () => {
    scrollExpression.value = null
    clickCycle.value = null
  })

  onMounted(() => {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('wheel', onWheel)
    clearTimeout(scrollTimer)
  })

  return {
    follow,
    lookStyle,
    overlayExpression,
    cycleOverride,
    onAvatarClick,
    mode
  }
}
