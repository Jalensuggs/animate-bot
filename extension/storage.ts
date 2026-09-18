import { DEFAULT_SETTINGS, STORAGE_KEY, type PetSettings } from './types'

function mergeSettings(partial: Partial<PetSettings> | undefined): PetSettings {
  return { ...DEFAULT_SETTINGS, ...partial }
}

export function readSettings(): Promise<PetSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (bag) => {
      resolve(mergeSettings(bag[STORAGE_KEY] as Partial<PetSettings> | undefined))
    })
  })
}

export function writeSettings(patch: Partial<PetSettings>): Promise<PetSettings> {
  return readSettings().then((current) => {
    const next = { ...current, ...patch }
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: next }, () => resolve(next))
    })
  })
}

export function onSettingsChanged(listener: (settings: PetSettings) => void) {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area !== 'local' || !changes[STORAGE_KEY]) return
    listener(mergeSettings(changes[STORAGE_KEY].newValue as Partial<PetSettings>))
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}
