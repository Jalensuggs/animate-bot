import { ref, onBeforeUnmount, onMounted } from 'vue'
import type { ExpressionId } from '@/bot/expressions'
import type { Block } from '@/bot/cycles'
import {
  CLICK_CYCLE,
  expressionFromScroll,
  expressionFromScrollDelta,
  SCROLL_HOLD_MS
} from '@/ui/reactions'

/**
 * Interactions du compagnon : regard libre, defilement, clic pour cligner.
 * Version allegee de `useBotInteractions` sans etats de vue ni lecteur.
 */
export function usePetInteractions(opts: {
  playing: { value: boolean }
  block: { value: number }
}) {
  const scrollExpression = ref<ExpressionId | null>(null)
  const clickCycle = ref<Block[] | null>(null)
  let scrollTimer: ReturnType<typeof setTimeout> | undefined
  let savedBlock = 0
  let savedPlaying = false

  function holdScrollExpression(expr: ExpressionId) {
    scrollExpression.value = expr
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      scrollExpression.value = null
    }, SCROLL_HOLD_MS)
  }

  function applyScrollReaction(delta: number) {
    const jolt = expressionFromScrollDelta(delta)
    const ratio =
      document.documentElement.scrollHeight > window.innerHeight
        ? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
        : 0
    holdScrollExpression(jolt ?? expressionFromScroll(Math.min(1, Math.max(0, ratio))))
  }

  function onWheel(e: WheelEvent) {
    applyScrollReaction(e.deltaY)
  }

  function onAvatarClick() {
    savedBlock = opts.block.value
    savedPlaying = opts.playing.value
    opts.block.value = 0
    clickCycle.value = CLICK_CYCLE
    opts.playing.value = true
  }

  function onBlockChange(i: number) {
    const cycle = clickCycle.value
    if (!cycle || i < cycle.length - 1) return
    opts.playing.value = savedPlaying
    opts.block.value = savedBlock
    clickCycle.value = null
  }

  onMounted(() => {
    window.addEventListener('wheel', onWheel, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    clearTimeout(scrollTimer)
  })

  return {
    scrollExpression,
    clickCycle,
    onAvatarClick,
    onBlockChange
  }
}
