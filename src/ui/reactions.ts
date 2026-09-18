import type { ExpressionId } from '@/bot/expressions'
import { makeBlock, type Block } from '@/bot/cycles'
import type { ViewId } from '@/ui/views'

/**
 * Reactions interactives du bot : fonctions pures qui traduisent les entrees
 * utilisateur (curseur, defilement, clic, vue) en sorties pour le moteur.
 * L'horloge et les ecouteurs vivent dans `useBotInteractions.ts`.
 */

export type LookStyle = 'reglages' | 'libre'

export interface InteractionMode {
  /** Le regard suit le pointeur */
  follow: boolean
  lookStyle: LookStyle
  /** Le defilement de page modifie brievement l'expression */
  scroll: boolean
  /** Un clic sur l'avatar declenche un clin d'oeil */
  click: boolean
}

/** Seuil de vitesse de defilement (px par evenement) pour une reaction brusque. */
export const SCROLL_JOLT = 28

/** Combien de temps garder l'expression de defilement avant de relacher. */
export const SCROLL_HOLD_MS = 900

/** Montage declenche par un clic : clin d'oeil puis retour au repos. */
export const CLICK_CYCLE: Block[] = [makeBlock('wink'), makeBlock('idle')]

/**
 * Regles d'interaction par vue et par etat de la page.
 *
 * - Personnalisation : suivi libre, defilement et clic — c'est la ou l'utilisateur
 *   juge sa forme et son expression.
 * - Reglages : suivi avec demi-tour (existant), defilement seulement — les humeurs
 *   tournent deja.
 * - Lecteur en pause sur le repos : suivi libre et clic, pour un apercu interactif.
 * - Lecteur en lecture ou arrivee : rien ne doit couper l'animation mesuree.
 */
export function interactionForView(
  view: ViewId,
  playing: boolean,
  preview: boolean,
  intro: boolean
): InteractionMode {
  if (intro) return { follow: false, lookStyle: 'libre', scroll: false, click: false }
  if (preview) return { follow: true, lookStyle: 'libre', scroll: false, click: false }
  if (view === 'personnaliser') {
    return { follow: true, lookStyle: 'libre', scroll: true, click: true }
  }
  if (view === 'reglages') {
    return { follow: true, lookStyle: 'reglages', scroll: true, click: false }
  }
  // animations : interactif seulement a l'arret
  if (!playing) {
    return { follow: true, lookStyle: 'libre', scroll: false, click: true }
  }
  return { follow: false, lookStyle: 'libre', scroll: false, click: false }
}

/**
 * Expression suggeree par la position de defilement, 0 = haut de page, 1 = bas.
 * Choix deliberes : attentif en haut, curieux au milieu, somnolent en bas.
 */
export function expressionFromScroll(ratio: number): ExpressionId {
  if (ratio < 0.2) return 'attentif'
  if (ratio < 0.45) return 'curieux'
  if (ratio < 0.7) return 'neutre'
  if (ratio < 0.88) return 'blase'
  return 'somnolent'
}

/**
 * Reaction a un coup de molette ou de glissement rapide. Retourne `null` si le
 * mouvement est trop lent pour meriter une grimace.
 */
export function expressionFromScrollDelta(delta: number): ExpressionId | null {
  if (delta > SCROLL_JOLT) return 'surpris'
  if (delta < -SCROLL_JOLT) return 'mefiant'
  return null
}

/** Ratio de defilement 0–1, ou 0 si la page ne defile pas. */
export function scrollRatio(): number {
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  if (max <= 0) return 0
  return Math.min(1, Math.max(0, window.scrollY / max))
}
