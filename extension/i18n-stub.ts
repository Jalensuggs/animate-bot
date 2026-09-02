/** Remplacement minimal pour `@/i18n` dans le bundle extension. */
export function t(cle: string): string {
  if (cle === 'app.botAria') return 'Animate Bot browser companion'
  return cle
}
