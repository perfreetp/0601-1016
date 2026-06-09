import { useAppStore, languages, themes, difficulties } from '@/store'
import type { Language, Theme, Difficulty, Room } from '@/types'

const sampleRooms: Room[] = [
  { id: 'r1', name: '英语角-日常对话', language: 'en', theme: 'daily', difficulty: 'beginner', capacity: 6, current: 4, host: 'Alice' },
  { id: 'r2', name: '餐厅点餐模拟', language: 'en', theme: 'restaurant', difficulty: 'intermediate', capacity: 4, current: 3, host: 'Mike' },
  { id: 'r3', name: '日语入门-五十音', language: 'ja', theme: 'daily', difficulty: 'beginner', capacity: 8, current: 5, host: 'Sakura' },
  { id: 'r4', name: '商务英语-谈判技巧', language: 'en', theme: 'business', difficulty: 'advanced', capacity: 4, current: 2, host: 'David' },
  { id: 'r5', name: '韩语旅行会话', language: 'ko', theme: 'travel', difficulty: 'intermediate', capacity: 6, current: 6, host: 'Jihoon' },
  { id: 'r6', name: '法语咖啡时光', language: 'fr', theme: 'restaurant', difficulty: 'beginner', capacity: 4, current: 1, host: 'Pierre' },
]

function LobbyWindow() {
  const {
    selectedLanguage,
    selectedTheme,
    selectedDifficulty,
    profile,
    favoriteRooms,
  } = useAppStore()

  const setLanguage = (lang: Language) => {
    useAppStore.setState({ selectedLanguage: lang })
    window.electronAPI.updateState('selectedLanguage', lang)
  }

  const setTheme = (theme: Theme) => {
    useAppStore.setState({ selectedTheme: theme })
    window.electronAPI.updateState('selectedTheme', theme)
  }

  const setDifficulty = (diff: Difficulty) => {
    useAppStore.setState({ selectedDifficulty: diff })
    window.electronAPI.updateState('selectedDifficulty', diff)
  }

  const enterRoom = (room: Room) => {
    useAppStore.setState({ currentRoom: room })
    window.electronAPI.updateState('currentRoom', room)
    window.electronAPI.openWindow('room')
  }

  const filteredRooms = sampleRooms.filter(
    (r) =>
      r.language === selectedLanguage &&
      r.theme === selectedTheme &&
      r.difficulty === selectedDifficulty
  )

  const displayRooms = filteredRooms.length > 0 ? filteredRooms : sampleRooms

  const getThemeLabel = (t: Theme) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: Theme) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: Difficulty) => difficulties.find((x) => x.value === d)?.label || d
  const getDiffColor = (d: Difficulty) => difficulties.find((x) => x.value === d)?.color || '#666'
  const getLangLabel = (l: Language) => languages.find((x) => x.value === l)?.label || l
  const getLangFlag = (l: Language) => languages.find((x) => x.value === l)?.flag || '🌍'

  return (
    <div>
      <div className="window-header">
        <div className="flex flex-center gap-12">
          <div className="avatar" style={{ background: profile.avatar.color }}>
            {profile.avatar.emoji}
          </div>
          <div>
            <h1 className="window-title">元宇宙语言大厅</h1>
            <p className="text-secondary text-sm mt-8">
              Lv.{profile.level} · {profile.nickname} · 今日已练习 45 分钟
            </p>
          </div>
        </div>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('character')}>
            👤 角色
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('task')}>
            📋 任务
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('friends')}>
            👥 好友
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('achievement')}>
            🏆 成就
          </button>
        </div>
      </div>

      <div className="card mb-24">
        <h3 className="text-lg font-bold mb-16">🌐 选择语言</h3>
        <div className="grid grid-3 gap-12">
          {languages.map((lang) => (
            <button
              key={lang.value}
              className={`card text-left ${selectedLanguage === lang.value ? 'card-active' : ''}`}
              onClick={() => setLanguage(lang.value)}
              style={{
                borderColor: selectedLanguage === lang.value ? 'var(--primary)' : undefined,
                boxShadow: selectedLanguage === lang.value ? '0 0 20px var(--glow)' : undefined,
              }}
            >
              <div className="flex flex-center gap-12">
                <span style={{ fontSize: 36 }}>{lang.flag}</span>
                <div>
                  <div className="font-bold">{lang.label}</div>
                  <div className="text-muted text-sm">128 个房间</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="divider" />

        <h3 className="text-lg font-bold mb-16">🎯 选择主题</h3>
        <div className="grid grid-3 gap-12">
          {themes.map((theme) => (
            <button
              key={theme.value}
              className="card text-left"
              onClick={() => setTheme(theme.value)}
              style={{
                borderColor: selectedTheme === theme.value ? 'var(--secondary)' : undefined,
                boxShadow: selectedTheme === theme.value ? '0 0 20px rgba(0, 206, 201, 0.3)' : undefined,
              }}
            >
              <div className="flex flex-center gap-12">
                <span style={{ fontSize: 32 }}>{theme.icon}</span>
                <div className="font-bold">{theme.label}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="divider" />

        <h3 className="text-lg font-bold mb-16">📊 选择难度</h3>
        <div className="grid grid-3 gap-12">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className="card text-center"
              onClick={() => setDifficulty(diff.value)}
              style={{
                borderColor: selectedDifficulty === diff.value ? diff.color : undefined,
                boxShadow: selectedDifficulty === diff.value ? `0 0 20px ${diff.color}40` : undefined,
              }}
            >
              <div
                className="text-2xl font-bold mb-4"
                style={{ color: diff.color }}
              >
                {diff.label}
              </div>
              <div className="text-muted text-sm">
                {diff.value === 'beginner' && '适合初学者，基础词汇与句型'}
                {diff.value === 'intermediate' && '适合进阶者，情景对话练习'}
                {diff.value === 'advanced' && '适合高阶者，深度话题讨论'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-between mb-12">
        <h2 className="text-xl font-bold">
          {getLangFlag(selectedLanguage)} {getLangLabel(selectedLanguage)} · {getThemeIcon(selectedTheme)} {getThemeLabel(selectedTheme)} ·{' '}
          <span style={{ color: getDiffColor(selectedDifficulty) }}>{getDiffLabel(selectedDifficulty)}</span> 房间
        </h2>
        <button className="btn">+ 创建房间</button>
      </div>

      <div className="grid grid-2 gap-16">
        {displayRooms.map((room) => (
          <div key={room.id} className="room-card" onClick={() => enterRoom(room)}>
            <div className="flex flex-between mb-12">
              <div>
                <h3 className="font-bold text-lg mb-4">{room.name}</h3>
                <div className="flex gap-8">
                  <span className="badge badge-blue">{getLangFlag(room.language)} {getLangLabel(room.language)}</span>
                  <span className="badge badge-purple">{getThemeIcon(room.theme)} {getThemeLabel(room.theme)}</span>
                  <span className="badge" style={{ background: `${getDiffColor(room.difficulty)}20`, color: getDiffColor(room.difficulty) }}>
                    {getDiffLabel(room.difficulty)}
                  </span>
                </div>
              </div>
              <button
                className="btn-small"
                style={{
                  background: favoriteRooms.includes(room.id) ? 'var(--warning)' : 'transparent',
                  border: `1px solid ${favoriteRooms.includes(room.id) ? 'var(--warning)' : 'var(--border)'}`,
                  color: favoriteRooms.includes(room.id) ? '#2D3436' : 'var(--text-secondary)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {favoriteRooms.includes(room.id) ? '⭐ 已收藏' : '☆ 收藏'}
              </button>
            </div>
            <div className="flex flex-between">
              <div className="text-muted text-sm">
                👤 房主: {room.host}
              </div>
              <div className="text-secondary">
                👥 {room.current}/{room.capacity} 人
              </div>
            </div>
            <div className="progress-bar mt-12">
              <div
                className="progress-fill"
                style={{ width: `${(room.current / room.capacity) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LobbyWindow
