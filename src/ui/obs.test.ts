import { describe, expect, it } from 'vitest'
import { clampDuration, makeBlock } from '@/bot/cycles'
import { litObs } from './obs'

describe('mode OBS', () => {
  it('reconnait le fragment de la pastille', () => {
    expect(litObs('#obs')).toEqual({ obs: true, etat: null, suite: null, playing: true })
  })

  it('ne s\'active pas sur un autre fragment', () => {
    expect(litObs('#planche').obs).toBe(false)
    expect(litObs('').obs).toBe(false)
    expect(litObs('#etat=orbit').obs).toBe(false)
  })

  it('joue un etat precis en boucle quand il est nomme', () => {
    expect(litObs('#obs&etat=orbit').etat).toBe('orbit')
  })

  it('ignore un etat inconnu et retombe sur le montage', () => {
    expect(litObs('#obs&etat=inconnu').etat).toBeNull()
  })

  it('fige la pastille avec &stop', () => {
    expect(litObs('#obs&stop').playing).toBe(false)
    expect(litObs('#obs&etat=orbit&stop')).toEqual({
      obs: true,
      etat: 'orbit',
      suite: null,
      playing: false
    })
  })

  describe('suite encodee dans le lien', () => {
    it('lit une suite d\'etats avec la duree mesuree par defaut', () => {
      expect(litObs('#obs&suite=orbit,wink').suite).toEqual([
        makeBlock('orbit'),
        makeBlock('wink')
      ])
    })

    it('respecte une duree donnee, ramenee dans ses bornes', () => {
      const suite = litObs('#obs&suite=idle:5,wink:1').suite
      expect(suite).toEqual([
        { state: 'idle', duration: clampDuration('idle', 5) },
        { state: 'wink', duration: clampDuration('wink', 1) }
      ])
    })

    it('saute les etats inconnus sans casser le reste', () => {
      expect(litObs('#obs&suite=inconnu,orbit,,zzz').suite).toEqual([makeBlock('orbit')])
    })

    it('retombe sur null quand la suite ne contient rien de valide', () => {
      expect(litObs('#obs&suite=inconnu').suite).toBeNull()
      expect(litObs('#obs').suite).toBeNull()
    })
  })
})
