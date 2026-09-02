// @vitest-environment happy-dom
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import GamePlayer from '@/components/GamePlayer.vue'

const mounted: Array<() => void> = []

afterEach(() => {
  while (mounted.length) mounted.pop()!()
})

describe('rendu du joueur', () => {
  it('repercute la hauteur simulee sur le groupe SVG', async () => {
    const y = ref(478)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(
      defineComponent(() => () =>
        h(GamePlayer, {
          x: 90,
          y: y.value,
          time: 0,
          state: 'idle',
          shape: 'cercle',
          color: 'encre',
          expression: 'neutre',
          facing: 1,
          invulnerable: false
        })
      )
    )
    app.mount(host)
    mounted.push(() => {
      app.unmount()
      host.remove()
    })

    const player = host.firstElementChild
    expect(player?.getAttribute('transform')).toBe('translate(90 478)')

    y.value = 397
    await nextTick()
    expect(player?.getAttribute('transform')).toBe('translate(90 397)')
  })
})
