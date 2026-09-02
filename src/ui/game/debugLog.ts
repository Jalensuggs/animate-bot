export type DebugHypothesis = 'A' | 'B' | 'C' | 'D' | 'E'

export function debugLog(
  hypothesisId: DebugHypothesis,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return
  const entry = JSON.stringify({
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now()
  })
  navigator.sendBeacon('/__debug-log', new Blob([entry], { type: 'application/json' }))
}
