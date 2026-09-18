import { describe, expect, it } from 'vitest'
import { BotEngine } from '@/bot/engine'
import { EXPRESSION_BY_ID } from '@/bot/expressions'
import { SHAPE_BY_ID } from '@/bot/skins'
import { lookFree } from './gaze'
import {
  expressionFromScroll,
  expressionFromScrollDelta,
  interactionForView,
  SCROLL_JOLT
} from './reactions'

const cercle = () => SHAPE_BY_ID.get('cercle')!.radii

describe('regard libre', () => {
  it('ne pilote rien sans pointeur', () => {
    const cible = lookFree({ nx: 0.5, ny: -0.5, pointer: false })
    expect(cible.mix).toBe(0)
    expect(cible.spin).toBe(0)
    expect(cible.wander).toBe(1)
  })

  it('suit le curseur face au spectateur', () => {
    const cible = lookFree({ nx: 1, ny: 0, pointer: true })
    expect(cible.yaw).toBeGreaterThan(0)
    expect(cible.mix).toBe(1)
    expect(cible.spin).toBe(0)
    expect(cible.wander).toBe(0)
  })

  it('garde les deux yeux visibles aux coins', () => {
    for (const nx of [-1, 0, 1]) {
      for (const ny of [-1, 0, 1]) {
        const moteur = new BotEngine(100, 'idle', cercle(), EXPRESSION_BY_ID.get('neutre')!)
        moteur.setLook(lookFree({ nx, ny, pointer: true }), 0)
        expect(moteur.sample(1).eyes, `nx=${nx} ny=${ny}`).toHaveLength(2)
      }
    }
  })
})

describe('reactions de defilement', () => {
  it('propose des expressions selon la profondeur', () => {
    expect(expressionFromScroll(0)).toBe('attentif')
    expect(expressionFromScroll(0.5)).toBe('neutre')
    expect(expressionFromScroll(1)).toBe('somnolent')
  })

  it('reagit aux coups de molette rapides', () => {
    expect(expressionFromScrollDelta(SCROLL_JOLT + 1)).toBe('surpris')
    expect(expressionFromScrollDelta(-SCROLL_JOLT - 1)).toBe('mefiant')
    expect(expressionFromScrollDelta(5)).toBeNull()
  })
})

describe('modes d interaction par vue', () => {
  it('personnalisation : suivi libre, defilement et clic', () => {
    const m = interactionForView('personnaliser', false, false, false)
    expect(m).toEqual({ follow: true, lookStyle: 'libre', scroll: true, click: true })
  })

  it('reglages : suivi avec demi-tour', () => {
    const m = interactionForView('reglages', true, false, false)
    expect(m.lookStyle).toBe('reglages')
    expect(m.follow).toBe(true)
  })

  it('lecteur en lecture : pas d interaction', () => {
    const m = interactionForView('animations', true, false, false)
    expect(m.follow).toBe(false)
    expect(m.click).toBe(false)
  })

  it('lecteur en pause : suivi et clic', () => {
    const m = interactionForView('animations', false, false, false)
    expect(m.follow).toBe(true)
    expect(m.click).toBe(true)
  })

  it('arrivee : tout coupe', () => {
    const m = interactionForView('personnaliser', false, false, true)
    expect(m.follow).toBe(false)
    expect(m.click).toBe(false)
  })
})
