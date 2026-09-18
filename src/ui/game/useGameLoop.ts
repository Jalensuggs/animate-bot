import { onBeforeUnmount, onMounted } from 'vue'

export function useGameLoop(update: (dt: number) => void) {
  let raf = 0
  let last = 0

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = last ? Math.min((now - last) / 1000, 0.064) : 0
    last = now
    update(dt)
  }

  const resetClock = () => {
    last = 0
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', resetClock)
    raf = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    document.removeEventListener('visibilitychange', resetClock)
  })
}
