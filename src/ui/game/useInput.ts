import type { GameInput } from '@/game/types'

export interface GameInputController {
  attach: () => void
  detach: () => void
  read: () => GameInput
  direction: (name: 'left' | 'right', pressed: boolean) => void
  jump: () => void
  skill: () => void
  restart: () => void
}

export function createInputController(): GameInputController {
  const held = new Set<string>()
  const pressed = new Set<string>()

  const onKeyDown = (event: KeyboardEvent) => {
    const code = event.code
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'Space',
        'KeyA',
        'KeyD',
        'KeyW',
        'KeyZ',
        'KeyX',
        'KeyR'
      ].includes(code)
    ) {
      event.preventDefault()
    }
    if (!held.has(code)) pressed.add(code)
    held.add(code)
  }

  const onKeyUp = (event: KeyboardEvent) => held.delete(event.code)
  const active = (...codes: string[]) => codes.some((code) => held.has(code))
  const once = (...codes: string[]) => codes.some((code) => pressed.has(code))

  return {
    attach() {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
    },
    detach() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      held.clear()
      pressed.clear()
    },
    read() {
      const input = {
        left: active('ArrowLeft', 'KeyA', 'TouchLeft'),
        right: active('ArrowRight', 'KeyD', 'TouchRight'),
        jumpPressed: once('ArrowUp', 'Space', 'KeyW', 'TouchJump'),
        skillPressed: once('KeyZ', 'KeyX', 'TouchSkill'),
        restartPressed: once('KeyR', 'TouchRestart')
      }
      pressed.clear()
      return input
    },
    direction(name, isPressed) {
      const code = name === 'left' ? 'TouchLeft' : 'TouchRight'
      if (isPressed) held.add(code)
      else held.delete(code)
    },
    jump() {
      pressed.add('TouchJump')
    },
    skill() {
      pressed.add('TouchSkill')
    },
    restart() {
      pressed.add('TouchRestart')
    }
  }
}
