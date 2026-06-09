export {}

declare global {
  interface Window {
    electronAPI: {
      updateState: (key: string, value: unknown) => void
      onStateSync: (callback: (data: { key: string; value: unknown }) => void) => () => void
      openWindow: (name: string) => void
      closeWindow: (name: string) => void
      getWindowName: () => string
    }
  }
}
