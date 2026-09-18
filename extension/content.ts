import { createApp } from 'vue'
import PetShell from './PetShell.vue'
import { readSettings } from './storage'

const HOST_ID = 'animate-bot-pet-host'

async function mount() {
  if (document.getElementById(HOST_ID)) return

  const settings = await readSettings()
  if (!settings.enabled) return

  const host = document.createElement('div')
  host.id = HOST_ID
  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: 'closed' })
  const root = document.createElement('div')
  shadow.appendChild(root)

  createApp(PetShell, { initial: settings }).mount(root)
}

async function unmount() {
  document.getElementById(HOST_ID)?.remove()
}

async function sync() {
  const settings = await readSettings()
  if (!settings.enabled) {
    unmount()
    return
  }
  if (!document.getElementById(HOST_ID)) mount()
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' && area !== 'sync') return
  if (changes['animate-bot-pet']) sync()
})

sync()
