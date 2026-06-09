import { useEffect } from 'react'
import { useAppStore } from '@/store'
import type { AppState } from '@/types'
import LobbyWindow from '@/windows/LobbyWindow'
import CharacterWindow from '@/windows/CharacterWindow'
import RoomWindow from '@/windows/RoomWindow'
import TaskWindow from '@/windows/TaskWindow'
import HintWindow from '@/windows/HintWindow'
import PlaybackWindow from '@/windows/PlaybackWindow'
import FriendsWindow from '@/windows/FriendsWindow'
import AchievementWindow from '@/windows/AchievementWindow'

const windowComponents: Record<string, React.ComponentType> = {
  lobby: LobbyWindow,
  character: CharacterWindow,
  room: RoomWindow,
  task: TaskWindow,
  hint: HintWindow,
  playback: PlaybackWindow,
  friends: FriendsWindow,
  achievement: AchievementWindow,
}

function App() {
  const windowName = window.electronAPI.getWindowName()
  const WindowComponent = windowComponents[windowName] || LobbyWindow

  useEffect(() => {
    const unsubscribe = window.electronAPI.onStateSync(({ key, value }) => {
      useAppStore.setState({ [key]: value } as Partial<AppState>)
    })
    return unsubscribe
  }, [])

  return (
    <div className="app-container">
      <WindowComponent />
    </div>
  )
}

export default App
