import { useState } from 'react'
import { useAppStore, languages, themes, difficulties } from '@/store'
import type { Participant } from '@/types'

function RoomWindow() {
  const { currentRoom, participants, profile } = useAppStore()
  const [muted, setMuted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'group'>('grid')

  const getLangLabel = (l: string) => languages.find((x) => x.value === l)?.label || l
  const getLangFlag = (l: string) => languages.find((x) => x.value === l)?.flag || '🌍'
  const getThemeLabel = (t: string) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: string) => difficulties.find((x) => x.value === d)?.label || d

  const toggleMute = (userId: string) => {
    const updated = participants.map((p) =>
      p.id === userId ? { ...p, muted: !p.muted } : p
    )
    useAppStore.setState({ participants: updated })
    window.electronAPI.updateState('participants', updated)
    if (userId === 'u1') setMuted(!muted)
  }

  const toggleHand = (userId: string) => {
    const updated = participants.map((p) =>
      p.id === userId ? { ...p, handRaised: !p.handRaised } : p
    )
    useAppStore.setState({ participants: updated })
    window.electronAPI.updateState('participants', updated)
  }

  const changeSeat = (userId: string, newSeat: number) => {
    const updated = participants.map((p) =>
      p.id === userId ? { ...p, seat: newSeat } : p
    )
    useAppStore.setState({ participants: updated })
    window.electronAPI.updateState('participants', updated)
  }

  const changeGroup = (userId: string, newGroup: number) => {
    const updated = participants.map((p) =>
      p.id === userId ? { ...p, group: newGroup } : p
    )
    useAppStore.setState({ participants: updated })
    window.electronAPI.updateState('participants', updated)
  }

  const emptySeats = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (n) => !participants.some((p) => p.seat === n)
  )

  const me = participants.find((p) => p.id === 'u1')

  const renderParticipant = (p: Participant, idx: number) => (
    <div
      key={p.id}
      className={`seat ${me?.id === p.id ? 'current' : ''} ${p.id === 'u3' ? 'speaking' : ''}`}
    >
      {p.handRaised && <span className="raised-hand">✋</span>}
      <div className="avatar avatar-small" style={{ background: p.avatar.color }}>
        {p.avatar.emoji}
      </div>
      <div className="text-sm font-medium mt-8">{p.nickname}</div>
      <div className="flex gap-4 mt-8">
        <span className="badge badge-blue">G{p.group}</span>
        {p.id === 'u3' && <span className="badge badge-purple">🎤 说话中</span>}
      </div>
      <div
        className={`mic-icon ${p.muted ? 'mic-off' : 'mic-on'}`}
        onClick={() => toggleMute(p.id)}
        title={p.muted ? '点击解除静音' : '点击静音'}
      >
        {p.muted ? '🔇' : '🎙️'}
      </div>
    </div>
  )

  const group1 = participants.filter((p) => p.group === 1)
  const group2 = participants.filter((p) => p.group === 2)

  return (
    <div>
      <div className="window-header">
        <div>
          <h1 className="window-title">
            {currentRoom ? currentRoom.name : '会话房间'}
          </h1>
          {currentRoom && (
            <div className="flex gap-8 mt-8">
              <span className="badge badge-blue">
                {getLangFlag(currentRoom.language)} {getLangLabel(currentRoom.language)}
              </span>
              <span className="badge badge-purple">
                {getThemeIcon(currentRoom.theme)} {getThemeLabel(currentRoom.theme)}
              </span>
              <span className="badge badge-yellow">{getDiffLabel(currentRoom.difficulty)}</span>
            </div>
          )}
        </div>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('task')}>
            📋 任务
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('hint')}>
            💡 提示
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('playback')}>
            📼 回放
          </button>
        </div>
      </div>

      <div className="flex flex-between mb-16">
        <div className="flex gap-8">
          <button
            className={`nav-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🪑 座位视图
          </button>
          <button
            className={`nav-btn ${viewMode === 'group' ? 'active' : ''}`}
            onClick={() => setViewMode('group')}
          >
            👥 分组视图
          </button>
        </div>
        <div className="flex gap-8">
          <button
            className={`btn ${muted ? 'btn-danger' : 'btn-success'}`}
            onClick={() => toggleMute('u1')}
          >
            {muted ? '🔇 已静音' : '🎙️ 麦克风'}
          </button>
          <button className="btn btn-secondary" onClick={() => toggleHand('u1')}>
            ✋ {me?.handRaised ? '放下手' : '举手'}
          </button>
          <button className="btn btn-secondary">
            📼 开始录制
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-4 gap-16 mb-24">
          {participants.map(renderParticipant)}
          {emptySeats.map((seat) => (
            <div
              key={`empty-${seat}`}
              className="seat empty"
              onClick={() => me && changeSeat(me.id, seat)}
            >
              <div style={{ fontSize: 36, opacity: 0.3 }}>➕</div>
              <div className="text-sm text-muted mt-8">空位 #{seat}</div>
              <div className="text-xs text-muted mt-4">点击入座</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-2 gap-24 mb-24">
          <div className="card">
            <div className="flex flex-between mb-16">
              <h3 className="font-bold">🎯 第一组 ({group1.length}人)</h3>
              {me?.group !== 1 && (
                <button className="btn btn-small" onClick={() => me && changeGroup(me.id, 1)}>
                  加入此组
                </button>
              )}
            </div>
            <div className="grid grid-2 gap-12">
              {group1.map(renderParticipant)}
            </div>
          </div>
          <div className="card">
            <div className="flex flex-between mb-16">
              <h3 className="font-bold">🎯 第二组 ({group2.length}人)</h3>
              {me?.group !== 2 && (
                <button className="btn btn-small" onClick={() => me && changeGroup(me.id, 2)}>
                  加入此组
                </button>
              )}
            </div>
            <div className="grid grid-2 gap-12">
              {group2.map(renderParticipant)}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-bold mb-12">💬 实时字幕</h3>
        <div
          style={{
            background: 'var(--bg-dark)',
            borderRadius: 12,
            padding: 16,
            minHeight: 100,
          }}
        >
          <div className="flex gap-8 mb-8">
            <span className="badge badge-purple">14:32</span>
            <span className="font-medium">小明:</span>
            <span className="text-secondary">Excuse me, how can I get to the nearest subway station?</span>
          </div>
          <div className="flex gap-8 mb-8">
            <span className="badge badge-purple">14:33</span>
            <span className="font-medium">Alice:</span>
            <span className="text-secondary">Go straight for two blocks, then turn left at the traffic lights.</span>
          </div>
          <div className="flex gap-8">
            <span className="badge badge-purple">14:34</span>
            <span className="font-medium" style={{ color: 'var(--secondary)' }}>你:</span>
            <span>
              <span className="waveform" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 8 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    className="wave-bar"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </span>
              正在识别...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomWindow
