import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  updateState: (key: string, value: unknown) =>
    ipcRenderer.send('state:update', { key, value }),
  onStateSync: (callback: (data: { key: string; value: unknown }) => void) => {
    const listener = (_event: unknown, data: { key: string; value: unknown }) => callback(data)
    ipcRenderer.on('state:sync', listener)
    return () => ipcRenderer.removeListener('state:sync', listener)
  },
  openWindow: (name: string) => ipcRenderer.send('window:open', name),
  closeWindow: (name: string) => ipcRenderer.send('window:close', name),
  getWindowName: () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('window') || 'lobby'
  },
})
