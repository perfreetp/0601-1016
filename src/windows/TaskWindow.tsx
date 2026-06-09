import { useState, useEffect } from 'react'
import { useAppStore, themes, difficulties } from '@/store'
import type { TaskCard, Theme, Difficulty, TaskStatus, AssignedTask } from '@/types'

function TaskWindow() {
  const {
    tasks,
    activeTask,
    currentRound,
    assignedTasks,
    activeAssignedTaskId,
    updateAssignedTaskStatus,
    createCustomTask,
    acceptAssignedTask,
  } = useAppStore()
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(activeTask)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewRound, setViewRound] = useState<number>(currentRound)
  const [formData, setFormData] = useState({
    title: '',
    theme: 'daily' as Theme,
    difficulty: 'beginner' as Difficulty,
    description: '',
    dialog: '',
    keyVocabulary: '',
    keyPatterns: '',
  })

  useEffect(() => {
    setViewRound(currentRound)
  }, [currentRound])

  useEffect(() => {
    if (activeAssignedTaskId) {
      const assigned = assignedTasks.find((at) => at.id === activeAssignedTaskId)
      if (assigned) {
        const task = tasks.find((t) => t.id === assigned.taskCardId)
        if (task) {
          setSelectedTask(task)
        }
      }
    }
  }, [activeAssignedTaskId, assignedTasks, tasks])

  const activeAssignedTask = activeAssignedTaskId
    ? assignedTasks.find((at) => at.id === activeAssignedTaskId) || null
    : null

  const getThemeLabel = (t: string) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: string) => difficulties.find((x) => x.value === d)?.label || d
  const getDiffColor = (d: string) => difficulties.find((x) => x.value === d)?.color || '#666'

  const getStatusLabel = (s: TaskStatus) => {
    switch (s) {
      case 'pending':
        return { label: '待接受', color: '#FF9800', icon: '⏳' }
      case 'accepted':
        return { label: '已接受', color: '#2196F3', icon: '✅' }
      case 'in-progress':
        return { label: '进行中', color: '#9C27B0', icon: '🔄' }
      case 'completed':
        return { label: '已完成', color: '#4CAF50', icon: '🎉' }
      default:
        return { label: s, color: '#666', icon: '📌' }
    }
  }

  const activateTask = (task: TaskCard) => {
    useAppStore.setState({ activeTask: task })
    window.electronAPI.updateState('activeTask', task)
    setSelectedTask(task)
  }

  const getTaskCard = (taskCardId: string) => tasks.find((t) => t.id === taskCardId)

  const handleAccept = (id: string) => {
    acceptAssignedTask(id)
    const assigned = assignedTasks.find((at) => at.id === id)
    if (assigned) {
      const task = getTaskCard(assigned.taskCardId)
      if (task) setSelectedTask(task)
    }
  }

  const handleStart = (id: string) => {
    updateAssignedTaskStatus(id, 'in-progress')
  }

  const handleComplete = (id: string) => {
    updateAssignedTaskStatus(id, 'completed')
  }

  const handleAssignedTaskClick = (at: AssignedTask) => {
    const task = getTaskCard(at.taskCardId)
    if (task) setSelectedTask(task)
  }

  const handleCreateTask = () => {
    if (!formData.title.trim()) return
    createCustomTask({
      title: formData.title.trim(),
      theme: formData.theme,
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      dialog: formData.dialog.split(',').map((s) => s.trim()).filter(Boolean),
      keyVocabulary: formData.keyVocabulary.split(',').map((s) => s.trim()).filter(Boolean),
      keyPatterns: formData.keyPatterns.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setShowCreateForm(false)
    setFormData({
      title: '',
      theme: 'daily',
      difficulty: 'beginner',
      description: '',
      dialog: '',
      keyVocabulary: '',
      keyPatterns: '',
    })
  }

  const maxRound = Math.max(currentRound, ...assignedTasks.map((at) => at.roundNumber), 1)

  const getRoundTaskName = (round: number) => {
    const roundAssigned = assignedTasks.find((at) => at.roundNumber === round)
    if (roundAssigned) {
      const task = getTaskCard(roundAssigned.taskCardId)
      if (task) return task.title
    }
    if (activeTask) return activeTask.title
    return '暂无任务'
  }

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">📋 情景任务卡</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('room')}>
            🎙️ 房间
          </button>
        </div>
      </div>

      <div className="card mb-16" style={{ borderColor: 'var(--primary)' }}>
        <div className="flex flex-between flex-wrap gap-12 items-center">
          <div className="flex gap-24 flex-wrap items-center">
            <div>
              <div className="text-sm text-muted">当前轮次</div>
              <div className="flex items-center gap-12 mt-4">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => setViewRound(Math.max(1, viewRound - 1))}
                  disabled={viewRound <= 1}
                >
                  ◀ 上一轮
                </button>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    padding: '0 8px',
                    minWidth: 60,
                    textAlign: 'center',
                  }}
                >
                  {viewRound}
                </div>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => setViewRound(Math.min(maxRound, viewRound + 1))}
                  disabled={viewRound >= maxRound}
                >
                  下一轮 ▶
                </button>
              </div>
              <div className="font-bold mt-4" style={{ color: 'var(--primary)' }}>
                🎯 第 {viewRound} 轮 - {getRoundTaskName(viewRound)}
              </div>
              {viewRound !== currentRound && (
                <div className="text-sm text-muted mt-4">
                  (当前正在进行第 {currentRound} 轮)
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted">当前活跃任务</div>
              <div className="font-bold text-lg mt-4">
                {activeTask ? `${getThemeIcon(activeTask.theme)} ${activeTask.title}` : '暂无活跃任务'}
              </div>
            </div>
          </div>
          <button
            className="btn"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ 创建自定义任务
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="card mb-16" style={{ borderColor: 'var(--accent)' }}>
          <div className="flex flex-between mb-16">
            <h3 className="text-lg font-bold">✨ 创建自定义任务</h3>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              ✕ 关闭
            </button>
          </div>
          <div className="grid grid-2 gap-12">
            <div>
              <label className="text-sm text-muted mb-4 block">任务标题 *</label>
              <input
                className="input"
                placeholder="输入任务标题..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="flex gap-12">
              <div style={{ flex: 1 }}>
                <label className="text-sm text-muted mb-4 block">主题</label>
                <select
                  className="input"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value as Theme })}
                >
                  {themes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-sm text-muted mb-4 block">难度</label>
                <select
                  className="input"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                >
                  {difficulties.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <label className="text-sm text-muted mb-4 block">任务描述</label>
            <textarea
              className="input"
              rows={3}
              placeholder="描述任务的场景和目标..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="mt-12">
            <label className="text-sm text-muted mb-4 block">参考对话（用逗号分隔每行）</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Waiter: Good evening!, You: Hello!..."
              value={formData.dialog}
              onChange={(e) => setFormData({ ...formData, dialog: e.target.value })}
            />
          </div>
          <div className="grid grid-2 gap-12 mt-12">
            <div>
              <label className="text-sm text-muted mb-4 block">关键词汇（逗号分隔）</label>
              <input
                className="input"
                placeholder="reservation, menu, bill..."
                value={formData.keyVocabulary}
                onChange={(e) => setFormData({ ...formData, keyVocabulary: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-4 block">关键句型（逗号分隔）</label>
              <input
                className="input"
                placeholder="I'd like to..., Could you...?"
                value={formData.keyPatterns}
                onChange={(e) => setFormData({ ...formData, keyPatterns: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-8 mt-16">
            <button
              className="btn"
              onClick={handleCreateTask}
              disabled={!formData.title.trim()}
            >
              ✅ 创建任务
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {assignedTasks.length > 0 && (
        <div className="card mb-16">
          <h3 className="text-lg font-bold mb-12">📤 已派发任务</h3>
          <div className="flex flex-col gap-10">
            {assignedTasks.map((at) => {
              const task = getTaskCard(at.taskCardId)
              const statusInfo = getStatusLabel(at.status)
              const isActive = at.id === activeAssignedTaskId
              return (
                <div
                  key={at.id}
                  className="card cursor-pointer"
                  style={{
                    borderLeft: `4px solid ${statusInfo.color}`,
                    background: isActive ? 'rgba(108, 92, 231, 0.08)' : undefined,
                    boxShadow: isActive ? '0 0 20px var(--glow)' : undefined,
                    borderColor: isActive ? 'var(--primary)' : undefined,
                  }}
                  onClick={() => handleAssignedTaskClick(at)}
                >
                  <div className="flex flex-between flex-wrap gap-8">
                    <div className="flex gap-12 flex-wrap">
                      <div>
                        <div className="font-bold">
                          {task ? `${getThemeIcon(task.theme)} ${task.title}` : `任务 #${at.taskCardId}`}
                        </div>
                        <div className="text-sm text-muted mt-4">
                          👤 {at.assigneeName} · 🎯 第 {at.roundNumber} 轮
                        </div>
                        <div className="text-xs text-muted mt-4 flex flex-wrap gap-12">
                          <span>📅 派发: {at.assignedAt}</span>
                          {at.acceptedAt && <span>✅ 接受: {at.acceptedAt}</span>}
                          {at.completedAt && <span>🎉 完成: {at.completedAt}</span>}
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${statusInfo.color}20`,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      {isActive && (
                        <span
                          className="badge"
                          style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                            color: 'white',
                          }}
                        >
                          📌 当前
                        </span>
                      )}
                    </div>
                    <div className="flex gap-6">
                      {at.status === 'pending' && (
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={(e) => { e.stopPropagation(); handleAccept(at.id) }}
                        >
                          ✅ 接受
                        </button>
                      )}
                      {at.status === 'accepted' && (
                        <button
                          className="btn btn-small"
                          onClick={(e) => { e.stopPropagation(); handleStart(at.id) }}
                        >
                          🔄 开始
                        </button>
                      )}
                      {(at.status === 'in-progress' || at.status === 'accepted') && (
                        <button
                          className="btn btn-small btn-success"
                          onClick={(e) => { e.stopPropagation(); handleComplete(at.id) }}
                        >
                          🎉 标记完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-2 gap-24">
        <div>
          <h3 className="text-lg font-bold mb-12">任务列表</h3>
          <div className="flex flex-col gap-12">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="card cursor-pointer"
                style={{
                  borderColor: selectedTask?.id === task.id ? 'var(--primary)' : undefined,
                  boxShadow: selectedTask?.id === task.id ? '0 0 20px var(--glow)' : undefined,
                }}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex flex-between mb-8">
                  <div className="flex gap-8">
                    <span style={{ fontSize: 24 }}>{getThemeIcon(task.theme)}</span>
                    <div>
                      <div className="font-bold">{task.title}</div>
                      <div className="text-sm text-muted">
                        {getThemeLabel(task.theme)}
                      </div>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: `${getDiffColor(task.difficulty)}20`,
                      color: getDiffColor(task.difficulty),
                    }}
                  >
                    {getDiffLabel(task.difficulty)}
                  </span>
                </div>
                <div className="text-sm text-secondary mt-8 line-clamp-2">
                  {task.description}
                </div>
                <div className="flex gap-4 mt-12">
                  <button
                    className={`btn btn-small ${activeTask?.id === task.id ? 'btn-success' : 'btn-secondary'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      activateTask(task)
                    }}
                  >
                    {activeTask?.id === task.id ? '✅ 当前任务' : '▶️ 开始此任务'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedTask ? (
            <div className="task-card-detail">
              <div className="flex flex-between mb-16">
                <div>
                  {activeAssignedTask && activeAssignedTask.taskCardId === selectedTask.id && (
                    <div className="mb-8">
                      <span
                        className="badge"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                          color: 'white',
                          fontSize: 13,
                          padding: '6px 14px',
                        }}
                      >
                        📌 当前派发任务 · 第 {activeAssignedTask.roundNumber} 轮 · {getStatusLabel(activeAssignedTask.status).icon} {getStatusLabel(activeAssignedTask.status).label}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {getThemeIcon(selectedTask.theme)}
                  </div>
                  <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                  <div className="flex gap-8 mt-8">
                    <span className="badge badge-purple">
                      {getThemeLabel(selectedTask.theme)}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: `${getDiffColor(selectedTask.difficulty)}20`,
                        color: getDiffColor(selectedTask.difficulty),
                      }}
                    >
                      {getDiffLabel(selectedTask.difficulty)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-20">
                <h4 className="font-bold mb-8">📖 任务描述</h4>
                <p className="text-secondary">{selectedTask.description}</p>
              </div>

              <div className="mb-20">
                <h4 className="font-bold mb-8">💬 参考对话</h4>
                <div
                  style={{
                    background: 'var(--bg-dark)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  {selectedTask.dialog.map((line, i) => (
                    <div
                      key={i}
                      className="text-sm mb-8"
                      style={{ color: i === 1 ? 'var(--secondary)' : 'var(--text-secondary)' }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-20">
                <h4 className="font-bold mb-8">📚 关键词汇</h4>
                <div className="flex flex-wrap gap-8">
                  {selectedTask.keyVocabulary.map((word, i) => (
                    <span
                      key={i}
                      className="badge badge-blue"
                      style={{ padding: '6px 14px', fontSize: 13 }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-24">
                <h4 className="font-bold mb-8">✨ 关键句型</h4>
                <div className="flex flex-col gap-8">
                  {selectedTask.keyPatterns.map((pattern, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(108, 92, 231, 0.1)',
                        borderLeft: '3px solid var(--primary)',
                        borderRadius: '0 8px 8px 0',
                        fontSize: 14,
                      }}
                    >
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-large w-full" onClick={() => activateTask(selectedTask)}>
                🚀 在房间中使用此任务
              </button>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
              <div className="text-muted">请从左侧选择一个任务</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskWindow
