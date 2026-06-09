import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'

const windows = new Map<string, BrowserWindow>()

type WindowConfig = {
  name: string
  title: string
  width: number
  height: number
  x?: number
  y?: number
}

const windowConfigs: WindowConfig[] = [
  { name: 'lobby', title: '大厅 - 选择房间', width: 900, height: 650 },
  { name: 'character', title: '角色设置', width: 700, height: 600 },
  { name: 'room', title: '会话房间', width: 1000, height: 700 },
  { name: 'task', title: '情景任务', width: 600, height: 700 },
  { name: 'hint', title: '学习提示', width: 500, height: 600 },
  { name: 'playback', title: '回放复习', width: 800, height: 600 },
  { name: 'friends', title: '好友搭子', width: 700, height: 650 },
  { name: 'achievement', title: '学习成就', width: 800, height: 650 },
]

function createWindow(config: WindowConfig, index: number) {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { workArea } = primaryDisplay

  const margin = 20
  const cols = 4
  const col = index % cols
  const row = Math.floor(index / cols)

  const x = config.x ?? workArea.x + margin + col * (config.width + margin)
  const y = config.y ?? workArea.y + margin + row * (config.height + margin + 30)

  const win = new BrowserWindow({
    width: config.width,
    height: config.height,
    x,
    y,
    title: config.title,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const url = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}?window=${config.name}`
    : new URL(`../dist/index.html?window=${config.name}`, `file://${__dirname}`).toString()

  win.loadURL(url)
  windows.set(config.name, win)

  win.on('closed', () => {
    windows.delete(config.name)
  })
}

function broadcast(channel: string, data: unknown) {
  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, data)
    }
  })
}

app.whenReady().then(() => {
  windowConfigs.forEach((config, index) => {
    createWindow(config, index)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowConfigs.forEach((config, index) => {
        createWindow(config, index)
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('state:update', (_event, { key, value }) => {
  broadcast('state:sync', { key, value })
})

ipcMain.on('window:open', (_event, name: string) => {
  const config = windowConfigs.find((c) => c.name === name)
  if (config && !windows.has(name)) {
    const idx = windowConfigs.indexOf(config)
    createWindow(config, idx)
  } else if (windows.has(name)) {
    windows.get(name)?.show()
    windows.get(name)?.focus()
  }
})

ipcMain.on('window:close', (_event, name: string) => {
  windows.get(name)?.close()
})
