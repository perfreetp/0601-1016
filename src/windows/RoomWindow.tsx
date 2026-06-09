import { useState, useEffect, useRef } from 'react'
import { useAppStore, languages, themes, difficulties } from '@/store'
import type { Participant, TaskStatus } from '@/types'

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
    tasks,
    assignedTasks,
    groupTimers,
    currentRound,
    namedSpeakerId,
    selectedParticipantId,
    startRecording,
    stopRecording,
    addSubtitle,
    assignTaskToMember,
    updateAssignedTaskStatus,
    startGroupTimer,
    stopGroupTimer,
    nameSpeaker,
    clearNamedSpeaker,
    nextTurn,
    selectParticipant,
    startNewRound,
  } = useAppStore()
  const [muted, setMuted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'group'>('grid')
  const [elapsed, setElapsed] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedTaskCardId, setSelectedTaskCardId] = useState<string>(tasks[0]?.id || '')
  const [taskRoundNumber, setTaskRoundNumber] = useState<number>(1)
  const [groupTimerDurations, setGroupTimerDurations] = useState<{ [key: number]: number }>({ 1: 300, 2: 300 })
  const [groupRemainingTimes, setGroupRemainingTimes] = useState<{ [key: number]: number }>({ 1: 300, 2: 300 })
  const [showNewRoundConfirm, setShowNewRoundConfirm] = useState(false)
  const timerRef = useRef<number | null>(null)
  const subtitleIdxRef = useRef(0)
  const groupTimerIntervalRef = useRef<number | null>(null)

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

  useEffect(() => {
    groupTimerIntervalRef.current = window.setInterval(() => {
      setGroupRemainingTimes((prev) => {
        const next = { ...prev }
        groupTimers.forEach((t) => {
          if (t.running && t.startTime) {
            const remaining = Math.max(0, t.duration - Math.floor((Date.now() - t.startTime) / 1000))
            next[t.groupId] = remaining
          }
        })
        return next
      })
    }, 500)
    return () => {
      if (groupTimerIntervalRef.current) window.clearInterval(groupTimerIntervalRef.current)
    }
  }, [groupTimers])

  useEffect(() => {
    setTaskRoundNumber(currentRound)
  }, [currentRound])

  const getLangLabel = (l: string) => languages.find((x) => x.value === l)?.label || l
  const getLangFlag = (l: string) => languages.find((x) => x.value === l)?.flag || '🌍'
  const getThemeLabel = (t: string) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: string) => difficulties.find((x) => x.value === d)?.label || d
  const getDiffColor = (d: string) => difficulties.find((x) => x.value === d)?.color || '#666'

  const getStatusLabel = (s: TaskStatus) => {
    switch (s) {
      case 'pending': return { label: '待接受', color: '#FF9800' }
      case 'accepted': return { label: '已接受', color: '#2196F3' }
      case 'in-progress': return { label: '进行中', color: '#9C27B0' }
      case 'completed': return { label: '已完成', color: '#4CAF50' }
    }
  }

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

  const handleNameSpeaker = () => {
    if (selectedParticipantId) {
      nameSpeaker(selectedParticipantId)
    }
  }

  const handleAssignTask = () => {
    if (selectedTaskCardId && selectedParticipantId) {
      assignTaskToMember(selectedTaskCardId, selectedParticipantId, taskRoundNumber)
    }
  }

  const handleStartGroupTimer = (groupId: number) => {
    startGroupTimer(groupId, groupTimerDurations[groupId] || 300)
  }

  const handleStopGroupTimer = (groupId: number) => {
    stopGroupTimer(groupId)
  }

  const handleSeatClick = (participantId: string) => {
    if (selectedParticipantId === participantId) {
      selectParticipant(null)
    } else {
      selectParticipant(participantId)
    }
  }

  const handleStartNewRound = () => {
    startNewRound()
    setShowNewRoundConfirm(false)
  }

  const selectedParticipant = selectedParticipantId
    ? participants.find((p) => p.id === selectedParticipantId) || null
    : null

  const selectedParticipantTasks = selectedParticipantId
    ? assignedTasks.filter((at) => at.assigneeId === selectedParticipantId)
    : []

  const currentParticipantTask = selectedParticipantTasks.find((at) => at.roundNumber === currentRound)
    || selectedParticipantTasks[0]
    || null

  const currentTaskCard = currentParticipantTask
    ? tasks.find((t) => t.id === currentParticipantTask.taskCardId) || null
    : null

  const emptySeats = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (n) => !participants.some((p) => p.seat === n)
  )

  const me = participants.find((p) => p.id === 'u1')
  const isHost = me?.isHost

  const roundNumbers = Array.from(new Set(assignedTasks.map((at) => at.roundNumber))).sort((a, b) => a - b)
  if (!roundNumbers.includes(currentRound)) roundNumbers.push(currentRound)
  roundNumbers.sort((a, b) => a - b)

  const getRoundStats = (round: number) => {
    const roundTasks = assignedTasks.filter((at) => at.roundNumber === round)
    const completed = roundTasks.filter((at) => at.status === 'completed').length
    return { total: roundTasks.length, completed }
  }

  const getParticipantStatusForRound = (participantId: string, round: number) => {
    const at = assignedTasks.find((t) => t.assigneeId === participantId && t.roundNumber === round)
    return at?.status || null
  }

  const renderParticipant = (p: Participant) => {
    const isSelected = selectedParticipantId === p.id
    const isNamedSpeaker = p.id === namedSpeakerId
    return (
      <div
        key={p.id}
        className={`seat ${me?.id === p.id ? 'current' : ''} ${isNamedSpeaker ? 'speaking named' : ''} ${p.id === 'u3' && isRecording && !isNamedSpeaker ? 'speaking' : ''}`}
        onClick={() => handleSeatClick(p.id)}
        style={{
          outline: isSelected && !isNamedSpeaker ? '3px solid var(--accent)' : undefined,
          outlineOffset: isSelected && !isNamedSpeaker ? '2px' : undefined,
          boxShadow: isSelected && !isNamedSpeaker ? '0 0 24px rgba(255, 152, 0, 0.4)' : undefined,
        }}
      >
        {p.handRaised && <span className="raised-hand">✋</span>}
        {p.isHost && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: 14,
              background: 'var(--warning)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            👑 主持
          </span>
        )}
        {isSelected && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontSize: 14,
              background: 'var(--accent)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            👁️ 查看中
          </span>
        )}
        <div className="avatar avatar-small" style={{ background: p.avatar.color }}>
          {p.avatar.emoji}
          {p.defaultEmoji && (
            <span
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                fontSize: 16,
                background: 'var(--bg-card)',
                borderRadius: '50%',
                padding: 2,
                border: '2px solid var(--border)',
              }}
            >
              {p.defaultEmoji}
            </span>
          )}
        </div>
        <div className="text-sm font-medium mt-8">{p.nickname}</div>
        {p.nameplate && (
          <div
            className="text-xs text-muted mt-4"
            style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 8px' }}
            title={p.nameplate}
          >
            {p.nameplate}
          </div>
        )}
        <div className="flex gap-4 mt-8">
          <span className="badge badge-blue">G{p.group}</span>
          {isNamedSpeaker && <span className="badge badge-red">🎤 点名发言</span>}
          {p.id === 'u3' && isRecording && !isNamedSpeaker && <span className="badge badge-purple">🎤 说话中</span>}
        </div>
        <div
          className={`mic-icon ${p.muted ? 'mic-off' : 'mic-on'}`}
          onClick={(e) => { e.stopPropagation(); toggleMute(p.id) }}
          title={p.muted ? '点击解除静音' : '点击静音'}
        >
          {p.muted ? '🔇' : '🎙️'}
        </div>
      </div>
    )
  }

  const group1 = participants.filter((p) => p.group === 1)
  const group2 = participants.filter((p) => p.group === 2)

  const renderGroupTimer = (groupId: number) => {
    const timer = groupTimers.find((t) => t.groupId === groupId)
    const remaining = groupRemainingTimes[groupId] || 0
    const duration = groupTimerDurations[groupId] || 300
    const isRunning = timer?.running

    return (
      <div
        className="card"
        style={{
          padding: 12,
          background: isRunning ? 'rgba(156, 39, 176, 0.08)' : 'var(--bg-card)',
          border: isRunning ? '1px solid var(--purple)' : '1px solid var(--border)',
        }}
      >
        <div className="flex flex-between items-center mb-8">
          <h4 className="font-bold text-sm">⏱️ 第{groupId}组计时</h4>
          <span
            className="badge"
            style={{
              background: isRunning ? 'var(--purple)' : 'var(--bg-input)',
              color: isRunning ? 'white' : 'var(--text-secondary)',
            }}
          >
            {isRunning ? '运行中' : '已停止'}
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center',
            fontFamily: 'monospace',
            color: isRunning ? (remaining <= 10 ? 'var(--danger)' : 'var(--primary)') : 'var(--text-muted)',
            margin: '8px 0',
          }}
        >
          {formatTime(remaining)}
        </div>
        <div className="flex gap-4 items-center mb-8">
          <span className="text-sm text-muted">时长:</span>
          <select
            className="input input-small"
            value={duration}
            onChange={(e) => setGroupTimerDurations({ ...groupTimerDurations, [groupId]: Number(e.target.value) })}
            disabled={isRunning}
          >
            <option value={60}>1分钟</option>
            <option value={180}>3分钟</option>
            <option value={300}>5分钟</option>
            <option value={600}>10分钟</option>
            <option value={900}>15分钟</option>
          </select>
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              className="btn btn-small btn-primary"
              onClick={() => handleStartGroupTimer(groupId)}
              style={{ flex: 1 }}
            >
              ▶️ 开始
            </button>
          ) : (
            <button
              className="btn btn-small btn-danger"
              onClick={() => handleStopGroupTimer(groupId)}
              style={{ flex: 1 }}
            >
              ⏹️ 停止
            </button>
          )}
        </div>
      </div>
    )
  }

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

      {showNewRoundConfirm && (
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
            zIndex: 10000,
          }}
          onClick={() => setShowNewRoundConfirm(false)}
        >
          <div
            className="card"
            style={{
              width: 400,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-12">🔄 开始新一轮？</h3>
            <p className="text-secondary mb-16">
              当前轮次（第 {currentRound} 轮）将被归档，所有字幕和任务进度将被保存。确定要开始新一轮吗？
            </p>
            <div className="flex gap-8 justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewRoundConfirm(false)}
              >
                取消
              </button>
              <button
                className="btn btn-warning"
                onClick={handleStartNewRound}
              >
                ✅ 确认开始
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="window-header">
        <div>
          <div className="flex gap-12 items-center">
            <h1 className="window-title">
              {currentRoom ? currentRoom.name : '会话房间'}
            </h1>
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                color: 'white',
                fontSize: 13,
                padding: '6px 14px',
              }}
            >
              🔄 第 {currentRound} 轮
            </span>
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

      {isHost && (
        <div className="card mb-16">
          <h3 className="font-bold mb-12">🎙️ 主持人工具栏</h3>
          <div className="grid grid-5 gap-12">
            <div>
              <label className="text-sm text-muted mb-4 block">选择成员</label>
              <select
                className="input"
                value={selectedParticipantId || ''}
                onChange={(e) => selectParticipant(e.target.value || null)}
              >
                <option value="">-- 点击座位或选择成员 --</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.avatar.emoji} {p.nickname} {p.isHost ? '(主持)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted mb-4 block">点名发言</label>
              <button
                className="btn btn-primary"
                onClick={handleNameSpeaker}
                disabled={!selectedParticipantId}
                style={{ width: '100%' }}
              >
                📢 点名发言
              </button>
            </div>
            <div>
              <label className="text-sm text-muted mb-4 block">轮次控制</label>
              <button
                className="btn btn-warning"
                onClick={nextTurn}
                style={{ width: '100%' }}
              >
                ⏭️ 下一位
              </button>
            </div>
            <div>
              <label className="text-sm text-muted mb-4 block">清除点名</label>
              <button
                className="btn btn-secondary"
                onClick={clearNamedSpeaker}
                style={{ width: '100%' }}
              >
                ✖️ 清除点名
              </button>
            </div>
            <div>
              <label className="text-sm text-muted mb-4 block">轮次管理</label>
              <button
                className="btn btn-warning"
                onClick={() => setShowNewRoundConfirm(true)}
                style={{ width: '100%' }}
              >
                🔄 新一轮
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-16">
        <h3 className="font-bold mb-12">📊 轮次进度面板</h3>
        <div className="flex flex-col gap-12">
          {roundNumbers.map((round) => {
            const stats = getRoundStats(round)
            const roundTask = assignedTasks.find((at) => at.roundNumber === round)
            const taskCard = roundTask ? tasks.find((t) => t.id === roundTask.taskCardId) : null
            const isCurrent = round === currentRound
            return (
              <div
                key={round}
                className="card"
                style={{
                  background: isCurrent ? 'rgba(108, 92, 231, 0.06)' : undefined,
                  borderColor: isCurrent ? 'var(--primary)' : undefined,
                }}
              >
                <div className="flex flex-between flex-wrap gap-12 mb-12 items-center">
                  <div className="flex items-center gap-12">
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        background: isCurrent
                          ? 'linear-gradient(135deg, var(--primary), var(--purple))'
                          : 'var(--bg-input)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: isCurrent ? 'transparent' : 'var(--text-secondary)',
                        backgroundClip: 'text',
                        minWidth: 50,
                        textAlign: 'center',
                      }}
                    >
                      {round}
                    </div>
                    <div>
                      <div className="font-bold">
                        第 {round} 轮
                        {taskCard && ` - ${getThemeIcon(taskCard.theme)} ${taskCard.title}`}
                      </div>
                      {isCurrent && (
                        <span className="badge mt-4" style={{ background: 'var(--primary)', color: 'white', fontSize: 11 }}>
                          🎯 当前轮次
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div
                      style={{
                        width: 120,
                        height: 8,
                        background: 'var(--bg-input)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--success), var(--primary))',
                          borderRadius: 999,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold">
                      {stats.completed} / {stats.total} 已完成
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-8">
                  {participants.map((p) => {
                    const status = getParticipantStatusForRound(p.id, round)
                    const statusInfo = status ? getStatusLabel(status) : null
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-6"
                        style={{
                          padding: '6px 12px',
                          background: 'var(--bg-input)',
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{p.avatar.emoji}</span>
                        <span className="text-sm font-medium">{p.nickname}</span>
                        {statusInfo ? (
                          <span
                            className="badge"
                            style={{
                              background: `${statusInfo.color}20`,
                              color: statusInfo.color,
                              fontSize: 11,
                              padding: '2px 8px',
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: 'var(--bg-dark)',
                              color: 'var(--text-muted)',
                              fontSize: 11,
                              padding: '2px 8px',
                            }}
                          >
                            未派发
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
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

      <div className="grid grid-3 gap-16 mb-24">
        <div style={{ gridColumn: 'span 2' }}>
          {viewMode === 'grid' ? (
            <div className="grid grid-4 gap-16">
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
            <div className="grid grid-2 gap-24">
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
        </div>

        <div className="flex flex-col gap-12">
          {selectedParticipant && (
            <div
              className="card"
              style={{
                borderColor: 'var(--accent)',
                boxShadow: '0 0 20px rgba(255, 152, 0, 0.15)',
              }}
            >
              <div className="flex flex-between mb-12">
                <h3 className="font-bold">👁️ 成员详情</h3>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => selectParticipant(null)}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-12 mb-16">
                <div
                  className="avatar"
                  style={{
                    background: selectedParticipant.avatar.color,
                    width: 56,
                    height: 56,
                    fontSize: 28,
                    position: 'relative',
                  }}
                >
                  {selectedParticipant.avatar.emoji}
                  {selectedParticipant.defaultEmoji && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -6,
                        right: -6,
                        fontSize: 18,
                        background: 'var(--bg-card)',
                        borderRadius: '50%',
                        padding: 2,
                        border: '2px solid var(--border)',
                      }}
                    >
                      {selectedParticipant.defaultEmoji}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedParticipant.nickname}</div>
                  {selectedParticipant.nameplate && (
                    <div className="text-sm text-muted">{selectedParticipant.nameplate}</div>
                  )}
                  <div className="flex gap-4 mt-4">
                    <span className="badge badge-blue">G{selectedParticipant.group}</span>
                    {selectedParticipant.isHost && <span className="badge badge-yellow">👑 主持</span>}
                  </div>
                </div>
              </div>

              {currentTaskCard ? (
                <div>
                  <div className="text-sm text-muted mb-4">📋 当前任务（第 {currentParticipantTask?.roundNumber} 轮）</div>
                  <div
                    className="card"
                    style={{ background: 'var(--bg-input)', margin: 0, marginBottom: 12 }}
                  >
                    <div className="flex flex-between items-start mb-8">
                      <div>
                        <div className="font-bold">
                          {getThemeIcon(currentTaskCard.theme)} {currentTaskCard.title}
                        </div>
                        <div className="flex gap-4 mt-4">
                          <span className="badge badge-purple">{getThemeLabel(currentTaskCard.theme)}</span>
                          <span
                            className="badge"
                            style={{
                              background: `${getDiffColor(currentTaskCard.difficulty)}20`,
                              color: getDiffColor(currentTaskCard.difficulty),
                            }}
                          >
                            {getDiffLabel(currentTaskCard.difficulty)}
                          </span>
                          {currentParticipantTask && (
                            <span
                              className="badge"
                              style={{
                                background: `${getStatusLabel(currentParticipantTask.status).color}20`,
                                color: getStatusLabel(currentParticipantTask.status).color,
                              }}
                            >
                              {getStatusLabel(currentParticipantTask.status).label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-12">
                    <div className="text-sm text-muted mb-6">📚 关键词汇</div>
                    <div className="flex flex-wrap gap-6">
                      {currentTaskCard.keyVocabulary.slice(0, 5).map((word, i) => (
                        <span
                          key={i}
                          className="badge badge-blue"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted mb-6">✨ 关键句型</div>
                    <div className="flex flex-col gap-6">
                      {currentTaskCard.keyPatterns.slice(0, 3).map((pattern, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(108, 92, 231, 0.1)',
                            borderLeft: '3px solid var(--primary)',
                            borderRadius: '0 6px 6px 0',
                            fontSize: 12,
                          }}
                        >
                          {pattern}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-12">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <div className="text-sm">该成员暂无派发任务</div>
                </div>
              )}
            </div>
          )}

          {isHost && (
            <div className="card">
              <h3 className="font-bold mb-12">📝 派发任务</h3>
              <div className="flex flex-col gap-8">
                <div>
                  <label className="text-sm text-muted mb-4 block">选择任务卡</label>
                  <select
                    className="input"
                    value={selectedTaskCardId}
                    onChange={(e) => setSelectedTaskCardId(e.target.value)}
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {getThemeIcon(t.theme)} {t.title} ({getDiffLabel(t.difficulty)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted mb-4 block">派发给成员</label>
                  <select
                    className="input"
                    value={selectedParticipantId || ''}
                    onChange={(e) => selectParticipant(e.target.value || null)}
                  >
                    <option value="">-- 选择成员 --</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.avatar.emoji} {p.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted mb-4 block">轮次号</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={taskRoundNumber}
                    onChange={(e) => setTaskRoundNumber(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAssignTask}
                  disabled={!selectedTaskCardId || !selectedParticipantId}
                >
                  📤 派发任务
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-bold mb-12">⏱️ 分组计时</h3>
            <div className="flex flex-col gap-8">
              {renderGroupTimer(1)}
              {renderGroupTimer(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="flex flex-between mb-12">
          <h3 className="font-bold">📋 已派发任务 ({assignedTasks.length})</h3>
        </div>
        {assignedTasks.length === 0 ? (
          <div className="text-center text-muted py-12">
            暂无派发的任务
          </div>
        ) : (
          <div className="grid grid-2 gap-12">
            {assignedTasks.map((at) => {
              const task = tasks.find((t) => t.id === at.taskCardId)
              const statusInfo = getStatusLabel(at.status)
              return (
                <div
                  key={at.id}
                  className="card"
                  style={{ background: 'var(--bg-input)', margin: 0 }}
                >
                  <div className="flex flex-between items-start mb-8">
                    <div>
                      <div className="font-bold">
                        {task ? `${getThemeIcon(task.theme)} ${task.title}` : at.taskCardId}
                      </div>
                      <div className="text-sm text-muted mt-4">
                        👤 {at.assigneeName} · 轮次 {at.roundNumber}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ background: statusInfo.color, color: 'white' }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted mb-8 flex flex-wrap gap-12">
                    <span>📅 派发: {at.assignedAt}</span>
                    {at.acceptedAt && <span>✅ 接受: {at.acceptedAt}</span>}
                    {at.completedAt && <span>🎉 完成: {at.completedAt}</span>}
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <select
                      className="input input-small"
                      value={at.status}
                      onChange={(e) => updateAssignedTaskStatus(at.id, e.target.value as TaskStatus)}
                    >
                      <option value="pending">待接受</option>
                      <option value="accepted">已接受</option>
                      <option value="in-progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
            <div className="flex gap-8 mb-8" key={sub.id} style={{ alignItems: 'flex-start' }}>
              {sub.speakerAvatar && (
                <div
                  className="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    background: sub.speakerAvatar.color,
                    fontSize: 18,
                    position: 'relative',
                  }}
                >
                  {sub.speakerAvatar.emoji}
                  {sub.speakerEmoji && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        fontSize: 12,
                        background: 'var(--bg-card)',
                        borderRadius: '50%',
                        padding: 1,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {sub.speakerEmoji}
                    </span>
                  )}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div className="flex gap-8 items-center mb-4">
                  <span className="badge badge-purple">
                    {formatTime(sub.timestamp)}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: sub.isMe ? 'var(--secondary)' : undefined }}
                  >
                    {sub.speaker}
                    {sub.speakerEmoji && <span className="ml-4">{sub.speakerEmoji}</span>}
                    :
                  </span>
                  {sub.roundNumber && (
                    <span className="badge" style={{ fontSize: 10, padding: '1px 6px' }}>
                      R{sub.roundNumber}
                    </span>
                  )}
                </div>
                <div className="text-secondary" style={{ paddingLeft: 4 }}>
                  {sub.text}
                </div>
              </div>
            </div>
          ))}
          {isRecording && (
            <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
              <div
                className="avatar"
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  background: profile.avatar.color,
                  fontSize: 18,
                  position: 'relative',
                }}
              >
                {profile.avatar.emoji}
                {profile.defaultEmoji && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      fontSize: 12,
                      background: 'var(--bg-card)',
                      borderRadius: '50%',
                      padding: 1,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {profile.defaultEmoji}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex gap-8 items-center mb-4">
                  <span className="badge badge-purple">{formatTime(elapsed)}</span>
                  <span className="font-medium" style={{ color: 'var(--secondary)' }}>
                    {profile.nickname}
                    {profile.defaultEmoji && <span className="ml-4">{profile.defaultEmoji}</span>}
                    :
                  </span>
                </div>
                <div style={{ paddingLeft: 4 }}>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoomWindow
