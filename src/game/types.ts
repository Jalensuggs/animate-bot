import type { ShapeId } from '@/bot/skins'
import type { StateId } from '@/bot/states'

export interface Point {
  x: number
  y: number
}

export interface Rect extends Point {
  width: number
  height: number
}

export interface Platform extends Rect {
  id: string
}

export interface Collectible extends Point {
  id: string
}

export interface Trigger extends Rect {
  id: string
}

export type Ability = 'none' | 'dash' | 'shield' | 'burst' | 'orbit'

export interface LevelDef {
  id: number
  name: string
  hint: string
  width: number
  height: number
  spawn: Point
  ability: Ability
  platforms: Platform[]
  hazards: Rect[]
  collectibles: Collectible[]
  checkpoints: Trigger[]
  breakables: Platform[]
  switches: Trigger[]
  gates: Platform[]
  goal: Rect
}

export interface GameInput {
  left: boolean
  right: boolean
  jumpPressed: boolean
  skillPressed: boolean
  restartPressed: boolean
}

export type GameStatus = 'running' | 'paused' | 'won' | 'gameover'

export interface PlayerState extends Point {
  vx: number
  vy: number
  width: number
  height: number
  facing: -1 | 1
  grounded: boolean
  lives: number
  invulnerable: number
  abilityTime: number
  state: StateId
  stateTime: number
}

export interface GameState {
  level: LevelDef
  shape: ShapeId
  player: PlayerState
  checkpoint: Point
  collected: string[]
  broken: string[]
  activated: string[]
  status: GameStatus
  elapsed: number
}
