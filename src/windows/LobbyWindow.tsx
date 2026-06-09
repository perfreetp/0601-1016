import { useState, useMemo } from 'react'
import { useAppStore, languages, themes, difficulties, getAllSampleRooms } from '@/store'
import type { Language, Theme, Difficulty, Room, Appointment } from '@/types'

function LobbyWindow() {
  const {
    selectedLanguage,
    selectedTheme,
    selectedDifficulty,
    profile,
    favoriteRooms,
    appointments,
    customRooms,
    enterRoom,
    enterRoomFromAppointment,
    createRoom,
  } = useAppStore()

  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomLanguage, setNewRoomLanguage] = useState<Language>('en')
  const [newRoomTheme, setNewRoomTheme] = useState<Theme>('daily')
  const [newRoomDifficulty, setNewRoomDifficulty] = useState<Difficulty>('beginner')
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(6)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

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

  const toggleFavorite = (roomId: string) => {
    const favs = favoriteRooms.includes(roomId)
      ? favoriteRooms.filter((r) => r !== roomId)
      : [...favoriteRooms, roomId]
    useAppStore.setState({ favoriteRooms: favs })
    window.electronAPI.updateState('favoriteRooms', favs)
  }

  const enterAndOpenRoom = (room: Room) => {
    enterRoom(room)
    window.electronAPI.openWindow('room')
  }

  const isWithin24Hours = (timeStr: string): boolean => {
    const apptTime = new Date(timeStr.replace(' ', 'T')).getTime()
    const now = Date.now()
    const diff = apptTime - now
    return diff >= 0 && diff <= 24 * 60 * 60 * 1000
  }

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status !== 'cancelled' && isWithin24Hours(a.time)),
    [appointments]
  )

  const handleEnterFromAppointment = (appointmentId: string) => {
    const room = enterRoomFromAppointment(appointmentId)
    if (room) {
      showToast('✅ 正在进入预约房间...')
      setTimeout(() => window.electronAPI.openWindow('room'), 500)
    }
  }

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      showToast('⚠️ 请输入房间名称')
      return
    }
    const room = createRoom({
      name: newRoomName.trim(),
      language: newRoomLanguage,
      theme: newRoomTheme,
      difficulty: newRoomDifficulty,
      capacity: newRoomCapacity,
    })
    showToast(`✅ 已创建房间：${room.name}`)
    setShowCreateRoom(false)
    setNewRoomName('')
    setNewRoomLanguage('en')
    setNewRoomTheme('daily')
    setNewRoomDifficulty('beginner')
    setNewRoomCapacity(6)
    setTimeout(() => enterAndOpenRoom(room), 300)
  }

  const allRooms = useMemo(() => {
    return [...customRooms, ...getAllSampleRooms()]
  }, [customRooms])

  const filteredRooms = allRooms.filter(
    (r) =>
      r.language === selectedLanguage &&
      r.theme === selectedTheme &&
      r.difficulty === selectedDifficulty
  )

  const displayRooms = filteredRooms.length > 0 ? filteredRooms : allRooms

  const getThemeLabel = (t: Theme) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: Theme) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: Difficulty) => difficulties.find((x) => x.value === d)?.label || d
  const getDiffColor = (d: Difficulty) => difficulties.find((x) => x.value === d)?.color || '#666'
  const getLangLabel = (l: Language) => languages.find((x) => x.value === l)?.label || l
  const getLangFlag = (l: Language) => languages.find((x) => x.value === l)?.flag || '🌍'

  return (
    <div>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 999,
            zIndex: 9999,
            fontSize: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {toast}
        </div>
      )}

      {showCreateRoom && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
          }}
          onClick={() => setShowCreateRoom(false)}
        >
          <div
            className="card"
            style={{ width: 440, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-16">➕ 创建新房间</h3>

            <div className="mb-12">
              <label className="text-sm text-muted mb-8 block">房间名称</label>
              <input
                type="text"
                className="input"
                placeholder="给房间起个名字吧"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>

            <div className="grid grid-2 gap-12 mb-12">
              <div>
                <label className="text-sm text-muted mb-8 block">语言</label>
                <select
                  className="select"
                  value={newRoomLanguage}
                  onChange={(e) => setNewRoomLanguage(e.target.value as Language)}
                >
                  {languages.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-8 block">主题</label>
                <select
                  className="select"
                  value={newRoomTheme}
                  onChange={(e) => setNewRoomTheme(e.target.value as Theme)}
                >
                  {themes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2 gap-12 mb-16">
              <div>
                <label className="text-sm text-muted mb-8 block">难度</label>
                <select
                  className="select"
                  value={newRoomDifficulty}
                  onChange={(e) => setNewRoomDifficulty(e.target.value as Difficulty)}
                >
                  {difficulties.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-8 block">容量</label>
                <select
                  className="select"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                >
                  <option value={4}>4 人</option>
                  <option value={6}>6 人</option>
                  <option value={8}>8 人</option>
                </select>
              </div>
            </div>

            <div className="flex gap-12">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setShowCreateRoom(false)}
              >
                取消
              </button>
              <button className="btn flex-1" onClick={handleCreateRoom}>
                创建并进入
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="window-header">
        <div className="flex flex-center gap-12">
          <div style={{ position: 'relative' }}>
            <div
              className="avatar"
              style={{ background: profile.avatar.color, position: 'relative' }}
            >
              {profile.avatar.emoji}
            </div>
            <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 20 }}>
              {profile.defaultEmoji}
            </span>
          </div>
          <div>
            <h1 className="window-title">元宇宙语言大厅</h1>
            <p className="text-secondary text-sm mt-4">
              Lv.{profile.level} · {profile.nickname}
              {profile.nameplate && (
                <span className="ml-8" style={{ color: 'var(--primary-light)' }}>
                  「{profile.nameplate}」
                </span>
              )}
            </p>
            <p className="text-sm text-muted mt-4">
              ⏱️ 累计 {Math.floor(profile.totalMinutes / 60)}h · 🎯 {profile.sessions} 次练习 · 🎤 {profile.fluency}% 流利度
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

      {upcomingAppointments.length > 0 && (
        <div
          className="card mb-16"
          style={{
            borderColor: 'var(--warning)',
            background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,87,34,0.08))',
            cursor: 'pointer',
          }}
          onClick={() => {
            const confirmed = upcomingAppointments.find((a) => a.status === 'confirmed')
            if (confirmed) handleEnterFromAppointment(confirmed.id)
          }}
        >
          <div className="flex flex-between items-center">
            <div>
              <div className="text-sm" style={{ color: 'var(--warning)' }}>⏰ 临近预约提醒（点击进入）</div>
              <div className="font-bold mt-4">
                {upcomingAppointments.length === 1
                  ? `${upcomingAppointments[0].partnerName} - ${upcomingAppointments[0].topic} · ${upcomingAppointments[0].time}`
                  : `你有 ${upcomingAppointments.length} 个 24 小时内的预约`}
              </div>
            </div>
            <div className="flex gap-8">
              {upcomingAppointments.slice(0, 2).map((ap) => (
                <button
                  key={ap.id}
                  className="btn btn-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEnterFromAppointment(ap.id)
                  }}
                  disabled={ap.status !== 'confirmed'}
                  style={{ opacity: ap.status !== 'confirmed' ? 0.5 : 1 }}
                >
                  {ap.status === 'confirmed' ? '🚀 立即进入' : '⏳ 待确认'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card mb-24">
        <h3 className="text-lg font-bold mb-16">🌐 选择语言</h3>
        <div className="grid grid-3 gap-12">
          {languages.map((lang) => (
            <button
              key={lang.value}
              className="card text-left"
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
        <button className="btn" onClick={() => setShowCreateRoom(true)}>+ 创建房间</button>
      </div>

      <div className="grid grid-2 gap-16">
        {displayRooms.map((room) => (
          <div key={room.id} className="room-card" onClick={() => enterAndOpenRoom(room)}>
            <div className="flex flex-between mb-12">
              <div>
                <h3 className="font-bold text-lg mb-4">
                  {room.isCustom && <span className="badge badge-purple mr-8">🏠 自建</span>}
                  {room.name}
                </h3>
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
                  toggleFavorite(room.id)
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
