import { describe, expect, it } from 'vitest'
import { litObs } from './obs'

describe('mode OBS', () => {
  it('reconnait le fragment de la pastille', () => {
    expect(litObs('#obs')).toEqual({ obs: true, etat: null, playing: true })
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
      playing: false
    })
  })
})
