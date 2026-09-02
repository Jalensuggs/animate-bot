import type { LevelDef, Platform, Rect } from './types'

const sol = (width: number): Platform => ({
  id: 'sol',
  x: 0,
  y: 500,
  width,
  height: 60
})

const plateforme = (
  id: string,
  x: number,
  y: number,
  width: number,
  height = 24
): Platform => ({ id, x, y, width, height })

const danger = (x: number, width: number): Rect => ({
  x,
  y: 482,
  width,
  height: 18
})

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'Premiers bonds',
    hint: 'Avance, saute et ramasse les trois étincelles.',
    width: 2200,
    height: 560,
    spawn: { x: 90, y: 452 },
    ability: 'none',
    platforms: [
      sol(2200),
      plateforme('p1', 380, 420, 180),
      plateforme('p2', 700, 350, 180),
      plateforme('p3', 1040, 410, 220),
      plateforme('p4', 1460, 340, 180),
      plateforme('p5', 1790, 400, 180)
    ],
    // Premiere prise en main sans punition : les dangers arrivent au niveau 2.
    hazards: [],
    collectibles: [
      { id: 'l1-a', x: 460, y: 382 },
      { id: 'l1-b', x: 790, y: 312 },
      { id: 'l1-c', x: 1550, y: 302 }
    ],
    checkpoints: [{ id: 'l1-cp', x: 1080, y: 440, width: 36, height: 60 }],
    breakables: [],
    switches: [],
    gates: [],
    goal: { x: 2070, y: 420, width: 70, height: 80 }
  },
  {
    id: 2,
    name: 'Passage secret',
    hint: 'Le corps capsule se glisse sous les plafonds bas.',
    width: 2400,
    height: 560,
    spawn: { x: 90, y: 452 },
    ability: 'none',
    platforms: [
      sol(2400),
      plateforme('toit1', 430, 435, 430, 25),
      plateforme('p1', 980, 420, 160),
      plateforme('p2', 1240, 350, 160),
      plateforme('toit2', 1510, 435, 380, 25),
      plateforme('p3', 1990, 355, 190)
    ],
    hazards: [danger(900, 65), danger(1425, 65), danger(1910, 60)],
    collectibles: [
      { id: 'l2-a', x: 620, y: 466 },
      { id: 'l2-b', x: 1320, y: 312 },
      { id: 'l2-c', x: 1710, y: 466 }
    ],
    checkpoints: [{ id: 'l2-cp', x: 1180, y: 440, width: 36, height: 60 }],
    breakables: [],
    switches: [],
    gates: [],
    goal: { x: 2250, y: 420, width: 70, height: 80 }
  },
  {
    id: 3,
    name: 'Ligne vive',
    hint: 'Utilise la compétence pour traverser les longues zones de danger.',
    width: 2700,
    height: 560,
    spawn: { x: 90, y: 452 },
    ability: 'dash',
    platforms: [
      sol(2700),
      plateforme('p1', 500, 400, 170),
      plateforme('p2', 850, 330, 170),
      plateforme('p3', 1190, 400, 170),
      plateforme('p4', 1660, 350, 210),
      plateforme('p5', 2100, 390, 190)
    ],
    hazards: [danger(700, 130), danger(1390, 230), danger(1900, 160), danger(2340, 130)],
    collectibles: [
      { id: 'l3-a', x: 585, y: 362 },
      { id: 'l3-b', x: 935, y: 292 },
      { id: 'l3-c', x: 1765, y: 312 }
    ],
    checkpoints: [{ id: 'l3-cp', x: 1260, y: 440, width: 36, height: 60 }],
    breakables: [],
    switches: [],
    gates: [],
    goal: { x: 2560, y: 420, width: 70, height: 80 }
  },
  {
    id: 4,
    name: 'Orbites et éclats',
    hint: 'Active les anneaux, puis fais éclater les murs marqués.',
    width: 2800,
    height: 560,
    spawn: { x: 90, y: 452 },
    ability: 'orbit',
    platforms: [
      sol(2800),
      plateforme('p1', 360, 400, 170),
      plateforme('p2', 700, 340, 180),
      plateforme('p3', 1110, 390, 160),
      plateforme('p4', 1530, 330, 180),
      plateforme('p5', 1940, 390, 180),
      plateforme('p6', 2320, 340, 180)
    ],
    hazards: [danger(550, 110), danger(910, 150), danger(1740, 150), danger(2160, 120)],
    collectibles: [
      { id: 'l4-a', x: 445, y: 362 },
      { id: 'l4-b', x: 790, y: 302 },
      { id: 'l4-c', x: 2410, y: 302 }
    ],
    checkpoints: [{ id: 'l4-cp', x: 1460, y: 440, width: 36, height: 60 }],
    breakables: [plateforme('mur-eclat', 1810, 410, 46, 90)],
    switches: [{ id: 'anneau', x: 760, y: 300, width: 90, height: 90 }],
    gates: [plateforme('anneau', 1320, 365, 48, 135)],
    goal: { x: 2660, y: 420, width: 70, height: 80 }
  },
  {
    id: 5,
    name: 'Grand mélange',
    hint: 'Tous les réflexes comptent. Le bouclier absorbe un choc.',
    width: 3200,
    height: 560,
    spawn: { x: 90, y: 452 },
    ability: 'shield',
    platforms: [
      sol(3200),
      plateforme('p1', 390, 410, 160),
      plateforme('p2', 720, 335, 170),
      plateforme('p3', 1060, 390, 160),
      plateforme('p4', 1480, 320, 190),
      plateforme('p5', 1900, 390, 170),
      plateforme('p6', 2300, 330, 180),
      plateforme('p7', 2700, 390, 180)
    ],
    hazards: [
      danger(580, 110),
      danger(930, 100),
      danger(1260, 180),
      danger(1710, 150),
      danger(2110, 150),
      danger(2520, 140),
      danger(2910, 130)
    ],
    collectibles: [
      { id: 'l5-a', x: 475, y: 372 },
      { id: 'l5-b', x: 805, y: 297 },
      { id: 'l5-c', x: 1575, y: 282 },
      { id: 'l5-d', x: 2390, y: 292 }
    ],
    checkpoints: [
      { id: 'l5-cp1', x: 1120, y: 440, width: 36, height: 60 },
      { id: 'l5-cp2', x: 2200, y: 440, width: 36, height: 60 }
    ],
    breakables: [plateforme('mur-final', 1830, 410, 46, 90)],
    switches: [],
    gates: [],
    goal: { x: 3060, y: 420, width: 70, height: 80 }
  }
]

export function levelById(id: number): LevelDef {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0]!
}
