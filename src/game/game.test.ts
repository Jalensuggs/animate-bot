import { describe, expect, it } from 'vitest'
import { cameraFor } from './camera'
import { intersects } from './collision'
import { LEVELS } from './levels'
import { createGame, DASH_SPEED, GRAVITY, JUMP_SPEED, stepGame } from './step'
import type { GameInput } from './types'

const rien: GameInput = {
  left: false,
  right: false,
  jumpPressed: false,
  skillPressed: false,
  restartPressed: false
}

describe('geometrie du jeu', () => {
  it('distingue contact et chevauchement', () => {
    expect(
      intersects(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 9, y: 2, width: 10, height: 3 }
      )
    ).toBe(true)
    expect(
      intersects(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 0, width: 4, height: 4 }
      )
    ).toBe(false)
  })

  it('borne la camera aux deux bords du niveau', () => {
    const level = LEVELS[0]!
    expect(cameraFor({ x: 10, y: 200 }, level).x).toBe(0)
    expect(cameraFor({ x: level.width, y: 200 }, level).x).toBe(level.width - 1000)
  })
})

describe('niveaux', () => {
  it('fournit cinq parcours avec depart, sol et arrivee valides', () => {
    expect(LEVELS).toHaveLength(5)
    for (const level of LEVELS) {
      expect(level.spawn.x).toBeGreaterThanOrEqual(0)
      expect(level.spawn.x).toBeLessThan(level.width)
      expect(level.platforms.some((platform) => platform.id === 'sol')).toBe(true)
      expect(level.goal.x + level.goal.width).toBeLessThanOrEqual(level.width)
      expect(level.collectibles.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('garde les marches du premier niveau dans le saut', () => {
    const level = LEVELS[0]!
    const sol = level.platforms.find((platform) => platform.id === 'sol')!
    const marches = level.platforms
      .filter((platform) => platform.id !== 'sol')
      .sort((a, b) => a.x - b.x)
    const hauteurMax = (JUMP_SPEED * JUMP_SPEED) / (2 * GRAVITY)
    let support = sol.y
    for (const marche of marches) {
      const montee = support - marche.y
      expect(montee).toBeLessThanOrEqual(hauteurMax * 0.7)
      support = Math.min(support, marche.y)
    }
  })
})

describe('simulation', () => {
  it('fait tomber le joueur sur le sol de maniere deterministe', () => {
    let game = createGame(1, 'cercle')
    for (let i = 0; i < 60; i++) game = stepGame(game, rien, 1 / 60)
    expect(game.player.grounded).toBe(true)
    expect(game.player.y).toBe(477)
  })

  it('saute uniquement depuis le sol', () => {
    let game = createGame(1, 'cercle')
    for (let i = 0; i < 30; i++) game = stepGame(game, rien, 1 / 60)
    game = stepGame(game, { ...rien, jumpPressed: true }, 1 / 60)
    expect(game.player.vy).toBeLessThan(0)
    const vy = game.player.vy
    game = stepGame(game, { ...rien, jumpPressed: true }, 1 / 60)
    expect(game.player.vy).toBeGreaterThan(vy)
  })

  it('atteint la premiere marche du tutoriel depuis le sol', () => {
    let game = createGame(1, 'cercle')
    for (let i = 0; i < 20; i++) game = stepGame(game, rien, 1 / 60)
    game = stepGame(game, { ...rien, jumpPressed: true, right: true }, 1 / 60)
    for (let i = 0; i < 45; i++) game = stepGame(game, { ...rien, right: true }, 1 / 60)
    expect(game.player.grounded).toBe(true)
    expect(game.player.y).toBeLessThan(460)
    expect(game.player.x).toBeGreaterThan(280)
  })

  it('declenche le sprint du troisieme niveau', () => {
    const game = stepGame(createGame(3, 'cercle'), { ...rien, skillPressed: true }, 0)
    expect(game.player.state).toBe('play')
    expect(game.player.vx).toBe(DASH_SPEED)
  })

  it('active un interrupteur orbital et retire sa porte', () => {
    const source = createGame(4, 'cercle')
    source.player.x = 790
    source.player.y = 340
    const game = stepGame(source, { ...rien, skillPressed: true }, 0)
    expect(game.activated).toContain('anneau')
    expect(game.player.state).toBe('orbit')
  })

  it('brise un mur quand la competence est utilisee a proximite', () => {
    const source = createGame(4, 'cercle')
    source.player.x = 1770
    source.player.y = 450
    const game = stepGame(source, { ...rien, skillPressed: true }, 0)
    expect(game.broken).toContain('mur-eclat')
    expect(game.player.state).toBe('burst')
  })

  it('perd une vie sur un danger et repart au checkpoint', () => {
    const source = createGame(2, 'cercle')
    source.player.x = 920
    source.player.y = 470
    source.player.invulnerable = 0
    const game = stepGame(source, rien, 0)
    expect(game.player.lives).toBe(2)
    expect(game.player.x).toBe(source.checkpoint.x)
    expect(game.player.state).toBe('alert')
  })
})
