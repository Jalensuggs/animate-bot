import { readSettings, writeSettings } from './storage'

chrome.runtime.onInstalled.addListener(() => {
  readSettings().then((s) => writeSettings(s))
})
