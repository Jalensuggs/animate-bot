import { STATES, type StateId } from '@/bot/states'

/**
 * Mode « pastille OBS » : la scene seule, sur un fond transparent, pensee comme
 * source navigateur d'OBS (ou de tout logiciel de capture) pour poser le bot en
 * animal de bureau par-dessus un stream ou un enregistrement.
 *
 * Tout est lu dans le fragment, comme le reste des vues (`#planche`, `#etat=`) :
 * l'URL est fixe une fois collee dans OBS, donc elle doit tout decrire.
 */
export interface OptionsObs {
  /** `#obs` present : on rend la pastille au lieu de l'application. */
  obs: boolean
  /**
   * Un etat precis a jouer en boucle (`#obs&etat=orbit`), ou `null` pour rejouer
   * le montage courant de l'utilisateur.
   *
   * Comme partout, on ne fait jamais confiance a l'URL : un id inconnu retombe
   * sur `null` (donc sur le montage) plutot que d'injecter un etat qui n'existe
   * pas dans le moteur.
   */
  etat: StateId | null
  /** Lecture en cours. `&stop` fige la pastille sur son etat de repos. */
  playing: boolean
}

/** Relit les options du mode OBS dans un fragment d'URL. */
export function litObs(fragment: string): OptionsObs {
  const params = new URLSearchParams(fragment.replace(/^#/, ''))
  // on ne fait jamais confiance a l'URL : l'etat doit exister (meme garde que `readHash`)
  const demande = params.get('etat')
  const etat = demande && STATES.some((s) => s.id === demande) ? (demande as StateId) : null
  return {
    obs: params.has('obs'),
    etat,
    playing: !params.has('stop')
  }
}
