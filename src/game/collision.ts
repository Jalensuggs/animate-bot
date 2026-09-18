import type { PlayerState, Rect } from './types'

export function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function playerRect(player: PlayerState): Rect {
  return {
    x: player.x - player.width / 2,
    y: player.y - player.height / 2,
    width: player.width,
    height: player.height
  }
}

export function pointNearPlayer(
  player: PlayerState,
  point: { x: number; y: number },
  radius = 34
): boolean {
  const dx = player.x - point.x
  const dy = player.y - point.y
  return dx * dx + dy * dy <= radius * radius
}

export function inflate(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  }
}
