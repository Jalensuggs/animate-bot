import { clampDuration, makeBlock, type Block } from '@/bot/cycles'
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
  /**
   * Un montage complet encode DANS le lien (`#obs&suite=orbit,wink:1,idle:5`) :
   * une suite d'etats separes par des virgules, chacun avec une duree en secondes
   * optionnelle apres `:`. C'est ce qui rend une sequence sur mesure partageable —
   * le montage « par defaut » vit dans le localStorage, donc il ne suit pas le
   * lien d'une machine a l'autre. `null` = aucune suite donnee, on retombe sur
   * `etat` puis sur le montage stocke.
   */
  suite: Block[] | null
  /** Lecture en cours. `&stop` fige la pastille sur son etat de repos. */
  playing: boolean
}

/** true si l'etat existe : on ne fait jamais confiance a l'URL (meme garde que `readHash`). */
function connu(id: string): id is StateId {
  return STATES.some((s) => s.id === id)
}

/**
 * Relit une suite `etat[:duree]` separee par des virgules. Un etat inconnu est
 * saute plutot que de faire echouer le lien entier ; une duree absente ou non
 * numerique retombe sur la duree mesuree de l'etat, et une duree donnee est
 * ramenee dans ses bornes par `clampDuration`.
 */
function litSuite(brut: string | null): Block[] | null {
  if (!brut) return null
  const blocs: Block[] = []
  for (const morceau of brut.split(',')) {
    const [id, duree] = morceau.split(':')
    const etat = id?.trim() ?? ''
    if (!connu(etat)) continue
    const secondes = duree !== undefined ? Number(duree) : NaN
    blocs.push(
      Number.isFinite(secondes)
        ? { state: etat, duration: clampDuration(etat, secondes) }
        : makeBlock(etat)
    )
  }
  return blocs.length ? blocs : null
}

/** Relit les options du mode OBS dans un fragment d'URL. */
export function litObs(fragment: string): OptionsObs {
  const params = new URLSearchParams(fragment.replace(/^#/, ''))
  const demande = params.get('etat')
  return {
    obs: params.has('obs'),
    etat: demande && connu(demande) ? demande : null,
    suite: litSuite(params.get('suite')),
    playing: !params.has('stop')
  }
}
