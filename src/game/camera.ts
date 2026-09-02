import type { LevelDef, Point } from './types'

export const VIEW_WIDTH = 1000
export const VIEW_HEIGHT = 560

const borne = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function cameraFor(
  player: Point,
  level: LevelDef,
  viewWidth = VIEW_WIDTH,
  viewHeight = VIEW_HEIGHT
): Point {
  return {
    x: borne(player.x - viewWidth * 0.38, 0, Math.max(0, level.width - viewWidth)),
    y: borne(player.y - viewHeight * 0.55, 0, Math.max(0, level.height - viewHeight))
  }
}
