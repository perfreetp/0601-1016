import { useState, useEffect, useRef } from 'react'
import { useAppStore, languages, themes, difficulties } from '@/store'
import type { Participant } from '@/types'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const sampleSubtitles = [
  "I'd like to order a steak, please.",
  'How would you like your steak cooked?',
  'Medium rare, thank you.',
  'Would you like any appetizers?',
  'Yes, I want some soup.',
  'I want a glass of red wine too.',
  'Certainly, anything else?',
  'No, that is all for now.',
]

function RoomWindow() {
  const {
    currentRoom,
    participants,
    profile,
    isRecording,
    recordingStartTime,
    liveSubtitles,
    startRecording,
    stopRecording,
    addSubtitle,
  } = useAppStore()
  const [muted, setMuted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'group'>('grid')
  const [elapsed, setElapsed] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const timerRef = useRef<number | null>(null)
  const subtitleIdxRef = useRef(0)

  useEffect(() => {
    if (isRecording && recordingStartTime) {
      setElapsed(0)
      subtitleIdxRef.current = 0
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - recordingStartTime) / 1000))
      }, 500)

      const subTimer = window.setInterval(() => {
        if (subtitleIdxRef.current >= sampleSubtitles.length) {
          window.clearInterval(subTimer)
          return
        }
        const idx = subtitleIdxRef.current
        const isMe = idx % 3 === 0 || idx % 3 === 2
        addSubtitle({
          speaker: isMe ? profile.nickname : (idx % 3 === 1 ? 'Waiter' : 'Alice'),
          speakerId: isMe ? 'u1' : (idx % 3 === 1 ? 'staff' : 'u2'),
          text: sampleSubtitles[idx],
          isMe,
        })
        subtitleIdxRef.current += 1
      }, 6000)

      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        window.clearInterval(subTimer)
      }
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [isRecording, recordingStartTime, profile.nickname, addSubtitle])

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

  const handleToggleRecording = () => {
    if (isRecording) {
      const rec = stopRecording()
      if (rec) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } else {
      startRecording()
    }
  }

  const emptySeats = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (n) => !participants.some((p) => p.seat === n)
  )

  const me = participants.find((p) => p.id === 'u1')

  const renderParticipant = (p: Participant) => (
    <div
      key={p.id}
      className={`seat ${me?.id === p.id ? 'current' : ''} ${p.id === 'u3' && isRecording ? 'speaking' : ''}`}
    >
      {p.handRaised && <span className="raised-hand">✋</span>}
      <div className="avatar avatar-small" style={{ background: p.avatar.color }}>
        {p.avatar.emoji}
      </div>
      <div className="text-sm font-medium mt-8">{p.nickname}</div>
      <div className="flex gap-4 mt-8">
        <span className="badge badge-blue">G{p.group}</span>
        {p.id === 'u3' && isRecording && <span className="badge badge-purple">🎤 说话中</span>}
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
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: 'var(--success)',
            color: 'white',
            borderRadius: 999,
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          ✅ 录制已完成！已生成回放记录
        </div>
      )}

      <div className="window-header">
        <div>
          <div className="flex gap-12 items-center">
            <h1 className="window-title">
              {currentRoom ? currentRoom.name : '会话房间'}
            </h1>
            {isRecording && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  background: 'rgba(225, 112, 85, 0.2)',
                  border: '1px solid var(--danger)',
                  borderRadius: 999,
                  color: 'var(--danger)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                录制中 {formatTime(elapsed)}
              </div>
            )}
          </div>
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
          <button
            className={`btn ${isRecording ? 'btn-danger' : 'btn-warning'}`}
            onClick={handleToggleRecording}
          >
            {isRecording ? `⏹️ 停止录制 (${formatTime(elapsed)})` : '📼 开始录制'}
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
        <div className="flex flex-between mb-12">
          <h3 className="font-bold">💬 实时字幕 {isRecording && <span className="badge badge-red ml-8">REC</span>}</h3>
          <div className="text-sm text-muted">
            共 {liveSubtitles.length} 条
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-dark)',
            borderRadius: 12,
            padding: 16,
            minHeight: 150,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {liveSubtitles.length === 0 && !isRecording && (
            <div className="text-center text-muted py-8">
              开始录制后，对话字幕将实时显示在这里
            </div>
          )}
          {liveSubtitles.map((sub) => (
            <div className="flex gap-8 mb-8" key={sub.id}>
              <span className="badge badge-purple">
                {formatTime(sub.timestamp)}
              </span>
              <span className="font-medium" style={{ color: sub.isMe ? 'var(--secondary)' : undefined }}>
                {sub.speaker}:
              </span>
              <span className="text-secondary">{sub.text}</span>
            </div>
          ))}
          {isRecording && (
            <div className="flex gap-8">
              <span className="badge badge-purple">{formatTime(elapsed)}</span>
              <span className="font-medium" style={{ color: 'var(--secondary)' }}>
                {profile.nickname}:
              </span>
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
          )}
        </div>
      </div>
    </div>
  )
}

export default RoomWindow
