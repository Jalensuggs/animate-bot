import type { ShapeId } from '@/bot/skins'
import type { StateId } from '@/bot/states'
import { inflate, intersects, playerRect, pointNearPlayer } from './collision'
import { levelById } from './levels'
import type { GameInput, GameState, Platform, PlayerState, Rect } from './types'

export const MOVE_SPEED = 270
export const JUMP_SPEED = 550
export const GRAVITY = 1500
export const DASH_SPEED = 720

const SHAPE_SIZE: Record<ShapeId, { width: number; height: number }> = {
  cercle: { width: 46, height: 46 },
  galet: { width: 48, height: 44 },
  squircle: { width: 48, height: 46 },
  capsule: { width: 58, height: 34 },
  triangle: { width: 44, height: 48 },
  hexagone: { width: 48, height: 44 },
  nuage: { width: 50, height: 42 },
  goutte: { width: 42, height: 50 }
}

function montre(player: PlayerState, state: StateId, duration: number) {
  player.state = state
  player.stateTime = 0
  player.abilityTime = duration
}

function solids(state: GameState): Platform[] {
  return [
    ...state.level.platforms,
    ...state.level.breakables.filter((wall) => !state.broken.includes(wall.id)),
    ...state.level.gates.filter((gate) => !state.activated.includes(gate.id))
  ]
}

function overlapHorizontal(player: PlayerState, rect: Rect) {
  const left = player.x - player.width / 2
  const right = player.x + player.width / 2
  return right > rect.x && left < rect.x + rect.width
}

function resetAtCheckpoint(state: GameState) {
  state.player.x = state.checkpoint.x
  state.player.y = state.checkpoint.y
  state.player.vx = 0
  state.player.vy = 0
  state.player.grounded = false
  state.player.coyoteTime = 0
  state.player.jumpBuffer = 0
}

function toucheDanger(state: GameState) {
  const player = state.player
  if (player.invulnerable > 0) return
  if (player.state === 'hexagon' && player.abilityTime > 0) {
    player.invulnerable = 0.45
    return
  }
  player.lives -= 1
  if (player.lives <= 0) {
    state.status = 'gameover'
    montre(player, 'sleep', 10)
    return
  }
  resetAtCheckpoint(state)
  player.invulnerable = 1
  montre(player, 'alert', 0.7)
}

export function createGame(levelId: number, shape: ShapeId): GameState {
  const level = levelById(levelId)
  const size = SHAPE_SIZE[shape]
  return {
    level,
    shape,
    player: {
      ...level.spawn,
      vx: 0,
      vy: 0,
      width: size.width,
      height: size.height,
      facing: 1,
      grounded: false,
      coyoteTime: 0,
      jumpBuffer: 0,
      lives: 3,
      invulnerable: 0,
      abilityTime: 0.75,
      state: 'exclaim',
      stateTime: 0
    },
    checkpoint: { ...level.spawn },
    collected: [],
    broken: [],
    activated: [],
    status: 'running',
    elapsed: 0
  }
}

export function stepGame(source: GameState, input: GameInput, rawDt: number): GameState {
  if (input.restartPressed) return createGame(source.level.id, source.shape)
  if (source.status !== 'running') return source

  const dt = Math.max(0, Math.min(rawDt, 0.064))
  const state: GameState = {
    ...source,
    player: { ...source.player },
    checkpoint: { ...source.checkpoint },
    collected: [...source.collected],
    broken: [...source.broken],
    activated: [...source.activated]
  }
  const player = state.player
  state.elapsed += dt
  player.stateTime += dt
  player.invulnerable = Math.max(0, player.invulnerable - dt)
  player.coyoteTime = player.grounded ? 0.1 : Math.max(0, player.coyoteTime - dt)
  player.jumpBuffer = input.jumpPressed ? 0.12 : Math.max(0, player.jumpBuffer - dt)
  player.abilityTime = Math.max(0, player.abilityTime - dt)
  if (player.abilityTime === 0 && player.state !== 'idle') {
    player.state = 'idle'
    player.stateTime = 0
  }

  let actionVisuelle = false
  const nearWall = state.level.breakables.find(
    (wall) => !state.broken.includes(wall.id) && intersects(playerRect(player), inflate(wall, 42))
  )
  if (input.skillPressed && nearWall) {
    state.broken.push(nearWall.id)
    montre(player, 'burst', 0.72)
    actionVisuelle = true
  } else if (input.skillPressed && state.level.ability === 'dash') {
    player.vx = player.facing * DASH_SPEED
    montre(player, 'play', 0.3)
    actionVisuelle = true
  } else if (input.skillPressed && state.level.ability === 'shield') {
    montre(player, 'hexagon', 0.85)
    actionVisuelle = true
  } else if (input.skillPressed && state.level.ability === 'orbit') {
    const target = state.level.switches.find(
      (trigger) => !state.activated.includes(trigger.id) && intersects(playerRect(player), trigger)
    )
    if (target) state.activated.push(target.id)
    montre(player, 'orbit', 0.9)
    actionVisuelle = true
  }

  if (player.state !== 'play') {
    const direction = Number(input.right) - Number(input.left)
    player.vx = direction * MOVE_SPEED
    if (direction) player.facing = direction < 0 ? -1 : 1
  }
  if (player.jumpBuffer > 0 && player.coyoteTime > 0) {
    player.vy = -JUMP_SPEED
    player.grounded = false
    player.coyoteTime = 0
    player.jumpBuffer = 0
  }

  const obstacles = solids(state)
  player.x += player.vx * dt
  player.x = Math.max(player.width / 2, Math.min(state.level.width - player.width / 2, player.x))
  for (const wall of obstacles) {
    if (!intersects(playerRect(player), wall)) continue
    if (player.vx > 0) player.x = wall.x - player.width / 2
    else if (player.vx < 0) player.x = wall.x + wall.width + player.width / 2
    player.vx = 0
  }

  const oldY = player.y
  player.vy += GRAVITY * dt
  player.y += player.vy * dt
  player.grounded = false
  for (const platform of obstacles) {
    if (!overlapHorizontal(player, platform)) continue
    const oldBottom = oldY + player.height / 2
    const newBottom = player.y + player.height / 2
    const oldTop = oldY - player.height / 2
    const newTop = player.y - player.height / 2
    const bottom = platform.y + platform.height
    if (player.vy >= 0 && oldBottom <= platform.y + 2 && newBottom >= platform.y) {
      player.y = platform.y - player.height / 2
      player.vy = 0
      player.grounded = true
    } else if (player.vy < 0 && oldTop >= bottom - 2 && newTop <= bottom) {
      player.y = bottom + player.height / 2
      player.vy = 0
    }
  }
  // Une pression juste avant l'atterrissage est gardee quelques images : le
  // tactile et le clavier n'exigent pas de viser l'image exacte du contact.
  if (player.grounded && player.jumpBuffer > 0) {
    player.vy = -JUMP_SPEED
    player.grounded = false
    player.jumpBuffer = 0
  }

  for (const item of state.level.collectibles) {
    if (state.collected.includes(item.id) || !pointNearPlayer(player, item, 42)) continue
    state.collected.push(item.id)
    if (!actionVisuelle) montre(player, 'wink', 0.48)
  }
  for (const checkpoint of state.level.checkpoints) {
    if (!intersects(playerRect(player), checkpoint)) continue
    state.checkpoint = {
      x: checkpoint.x + checkpoint.width / 2,
      y: checkpoint.y - player.height / 2
    }
  }

  if (
    state.level.hazards.some((hazard) => intersects(playerRect(player), hazard)) ||
    player.y > state.level.height + 100
  ) {
    toucheDanger(state)
  }
  const goalIntersects = intersects(playerRect(player), state.level.goal)
  if (goalIntersects) {
    state.status = 'won'
    montre(player, 'notify', 10)
  }

  return state
}
