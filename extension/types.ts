import type { ExpressionId } from '@/bot/expressions'
import type { ColorId, ShapeId } from '@/bot/skins'
import { DEFAULT_COLOR, DEFAULT_SHAPE } from '@/bot/skins'
import { DEFAULT_EXPRESSION } from '@/bot/expressions'

/** Reglages persistes du compagnon de navigateur. */
export interface PetSettings {
  enabled: boolean
  shape: ShapeId
  color: ColorId
  expression: ExpressionId
  /** Taille affichee en pixels. */
  size: number
  /** Position en pixels depuis le coin haut-gauche ; `null` = coin bas-droit par defaut. */
  x: number | null
  y: number | null
}

export const DEFAULT_SETTINGS: PetSettings = {
  enabled: true,
  shape: DEFAULT_SHAPE,
  color: DEFAULT_COLOR,
  expression: DEFAULT_EXPRESSION,
  size: 128,
  x: null,
  y: null
}

export const STORAGE_KEY = 'animate-bot-pet'
