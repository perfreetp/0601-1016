import { useState } from 'react'
import { useAppStore, themes, difficulties } from '@/store'
import type { TaskCard } from '@/types'

function TaskWindow() {
  const { tasks, activeTask } = useAppStore()
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(activeTask)

  const getThemeLabel = (t: string) => themes.find((x) => x.value === t)?.label || t
  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDiffLabel = (d: string) => difficulties.find((x) => x.value === d)?.label || d
  const getDiffColor = (d: string) => difficulties.find((x) => x.value === d)?.color || '#666'

  const activateTask = (task: TaskCard) => {
    useAppStore.setState({ activeTask: task })
    window.electronAPI.updateState('activeTask', task)
    setSelectedTask(task)
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
            <button className="card text-center" style={{ borderStyle: 'dashed' }}>
              <div style={{ fontSize: 32 }}>➕</div>
              <div className="text-muted mt-4">自定义任务</div>
            </button>
          </div>
        </div>

        <div>
          {selectedTask ? (
            <div className="task-card-detail">
              <div className="flex flex-between mb-16">
                <div>
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
