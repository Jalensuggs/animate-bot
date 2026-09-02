import type { GameInput } from '@/game/types'
import { debugLog } from './debugLog'

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
    const heldBefore = held.has(code)
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
    if (['ArrowUp', 'Space', 'KeyW'].includes(code)) {
      // #region agent log
      debugLog('A', 'useInput.ts:onKeyDown', 'jump keydown received', {
        code,
        repeat: event.repeat,
        heldBefore,
        defaultPrevented: event.defaultPrevented
      })
      // #endregion
    }
    if (!held.has(code)) pressed.add(code)
    held.add(code)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    if (['ArrowUp', 'Space', 'KeyW'].includes(event.code)) {
      // #region agent log
      debugLog('B', 'useInput.ts:onKeyUp', 'jump keyup received', {
        code: event.code,
        heldBefore: held.has(event.code)
      })
      // #endregion
    }
    held.delete(event.code)
  }
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
      if (input.jumpPressed) {
        // #region agent log
        debugLog('A', 'useInput.ts:read', 'jump edge consumed by game loop', {
          heldJump: active('ArrowUp', 'Space', 'KeyW'),
          heldCount: held.size
        })
        // #endregion
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
