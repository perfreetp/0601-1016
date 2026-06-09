import { useState, useEffect } from 'react'
import { useAppStore, difficulties, themes } from '@/store'
import type { Hint, CollectionType, Difficulty, HintPreferences } from '@/types'

type HintType = 'all' | 'vocabulary' | 'pattern' | 'pronunciation'
type TabType = 'hints' | 'saved'

function HintWindow() {
  const {
    hints,
    generatedHints,
    activeTask,
    savedItems,
    saveItem,
    deleteSavedItem,
    tasks,
    setActiveTaskByCard,
    showAIRecommendation,
    toggleAIRecommendation,
    hintPreferences,
    updateHintPreferences,
    generateHintsForTask,
    currentRound,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('hints')
  const [filter, setFilter] = useState<HintType>('all')
  const [selectedHint, setSelectedHint] = useState<Hint | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showPrefModal, setShowPrefModal] = useState(false)
  const [prefForm, setPrefForm] = useState<HintPreferences>({
    difficulty: hintPreferences.difficulty,
    focusTypes: [...hintPreferences.focusTypes],
    autoSpeak: hintPreferences.autoSpeak,
  })

  useEffect(() => {
    if (activeTask && showAIRecommendation) {
      generateHintsForTask(activeTask.id, hintPreferences.difficulty, hintPreferences.focusTypes)
    }
  }, [activeTask?.id])

  const filterByFocusTypes = (hintList: Hint[]) => {
    if (hintPreferences.focusTypes.length === 0) return hintList
    return hintList.filter((h) => hintPreferences.focusTypes.includes(h.type))
  }

  const displayHints = filter === 'all' ? hints : hints.filter((h) => h.type === filter)
  const displayGeneratedHints = filter === 'all'
    ? filterByFocusTypes(generatedHints)
    : filterByFocusTypes(generatedHints).filter((h) => h.type === filter)

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'vocabulary':
        return { label: '词汇', icon: '📚', color: 'var(--secondary)' }
      case 'pattern':
        return { label: '句型', icon: '✨', color: 'var(--primary)' }
      case 'pronunciation':
        return { label: '发音', icon: '🔊', color: 'var(--accent)' }
      default:
        return { label: '提示', icon: '💡', color: 'var(--warning)' }
    }
  }

  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 0.8
      window.speechSynthesis.speak(utter)
    }
  }

  const handleHintClick = (hint: Hint, isGenerated: boolean) => {
    const newSelected = selectedHint?.id === hint.id ? null : hint
    setSelectedHint(newSelected)
    if (hintPreferences.autoSpeak && newSelected && isGenerated) {
      speak(hint.content)
    }
  }

  const handleSave = (hint: Hint, type: CollectionType) => {
    saveItem({
      type,
      content: hint.content,
      translation: hint.translation,
      example: hint.example,
      source: '提示窗口收藏',
    })
  }

  const handleSwitchTask = (taskId: string) => {
    setActiveTaskByCard(taskId)
    setShowTaskModal(false)
  }

  const handleToggleFocusType = (type: string) => {
    setPrefForm((prev) => ({
      ...prev,
      focusTypes: prev.focusTypes.includes(type)
        ? prev.focusTypes.filter((t) => t !== type)
        : [...prev.focusTypes, type],
    }))
  }

  const handleSavePrefs = () => {
    updateHintPreferences(prefForm)
    if (activeTask) {
      generateHintsForTask(activeTask.id, prefForm.difficulty, prefForm.focusTypes)
    }
    setShowPrefModal(false)
  }

  const openPrefModal = () => {
    setPrefForm({
      difficulty: hintPreferences.difficulty,
      focusTypes: [...hintPreferences.focusTypes],
      autoSpeak: hintPreferences.autoSpeak,
    })
    setShowPrefModal(true)
  }

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">💡 学习提示</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('task')}>
            📋 任务
          </button>
        </div>
      </div>

      {activeTask && (
        <div className="card mb-16" style={{ borderColor: 'var(--primary)' }}>
          <div className="flex flex-between">
            <div>
              <div className="text-sm text-muted">当前任务{currentRound > 0 ? ` · 第 ${currentRound} 轮` : ''}</div>
              <div className="font-bold text-lg mt-4">
                {getThemeIcon(activeTask.theme)} {activeTask.title}
                <span
                  className="badge ml-8"
                  style={{
                    background: `${difficulties.find((d) => d.value === activeTask.difficulty)?.color || '#FF9800'}20`,
                    color: difficulties.find((d) => d.value === activeTask.difficulty)?.color || '#FF9800',
                    fontSize: 12,
                  }}
                >
                  {difficulties.find((d) => d.value === activeTask.difficulty)?.label || activeTask.difficulty}
                </span>
              </div>
              <div className="text-sm text-secondary mt-4" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {activeTask.description}
              </div>
            </div>
            <button className="btn btn-small btn-secondary" onClick={() => setShowTaskModal(true)}>
              切换任务
            </button>
          </div>
        </div>
      )}

      <div className="tab-group mb-16">
        <button
          className={`tab-item ${activeTab === 'hints' ? 'active' : ''}`}
          onClick={() => setActiveTab('hints')}
        >
          💡 系统提示 ({hints.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          ⭐ 我的收藏 ({savedItems.length})
        </button>
      </div>

      {activeTab === 'hints' && (
        <>
          <div className="tab-group mb-16">
            <button
              className={`tab-item ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部 ({hints.length + generatedHints.length})
            </button>
            <button
              className={`tab-item ${filter === 'vocabulary' ? 'active' : ''}`}
              onClick={() => setFilter('vocabulary')}
            >
              📚 词汇
            </button>
            <button
              className={`tab-item ${filter === 'pattern' ? 'active' : ''}`}
              onClick={() => setFilter('pattern')}
            >
              ✨ 句型
            </button>
            <button
              className={`tab-item ${filter === 'pronunciation' ? 'active' : ''}`}
              onClick={() => setFilter('pronunciation')}
            >
              🔊 发音
            </button>
          </div>

          <div className="flex flex-col gap-10">
            {displayGeneratedHints.map((hint) => {
              const typeInfo = getTypeLabel(hint.type)
              const isSelected = selectedHint?.id === hint.id
              return (
                <div
                  key={hint.id}
                  className="hint-card cursor-pointer"
                  style={{
                    borderLeftColor: typeInfo.color,
                    background: isSelected ? 'var(--bg-hover)' : undefined,
                    borderColor: 'var(--accent)',
                  }}
                  onClick={() => handleHintClick(hint, true)}
                >
                  <div className="flex flex-between">
                    <div className="flex gap-12 flex-1">
                      <span style={{ fontSize: 28 }}>{typeInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex gap-8 mb-4 flex-wrap items-center">
                          <span
                            className="badge"
                            style={{
                              background: `${typeInfo.color}20`,
                              color: typeInfo.color,
                            }}
                          >
                            {typeInfo.label}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(253, 203, 110, 0.2)',
                              color: '#FDCB6E',
                            }}
                          >
                            🎯 任务推荐
                          </span>
                          <span className="font-bold text-lg">{hint.content}</span>
                        </div>
                        <div className="text-secondary">{hint.translation}</div>
                        {isSelected && hint.example && (
                          <div
                            className="mt-12"
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(0, 206, 201, 0.1)',
                              borderRadius: 8,
                              fontSize: 14,
                            }}
                          >
                            <span className="text-muted">例句: </span>
                            <span className="text-secondary">{hint.example}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 flex-wrap items-start">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          speak(hint.content)
                        }}
                      >
                        🔊 朗读
                      </button>
                      {(hint.type === 'vocabulary' || hint.type === 'pronunciation') && (
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'vocabulary')
                          }}
                        >
                          ⭐ 收藏词汇
                        </button>
                      )}
                      {hint.type === 'pattern' && (
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'pattern')
                          }}
                        >
                          ⭐ 收藏句型
                        </button>
                      )}
                      {hint.type === 'vocabulary' && (
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'pattern')
                          }}
                        >
                          ✨ 收藏句型
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {displayHints.map((hint) => {
              const typeInfo = getTypeLabel(hint.type)
              const isSelected = selectedHint?.id === hint.id
              return (
                <div
                  key={hint.id}
                  className="hint-card cursor-pointer"
                  style={{
                    borderLeftColor: typeInfo.color,
                    background: isSelected ? 'var(--bg-hover)' : undefined,
                  }}
                  onClick={() => handleHintClick(hint, false)}
                >
                  <div className="flex flex-between">
                    <div className="flex gap-12 flex-1">
                      <span style={{ fontSize: 28 }}>{typeInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex gap-8 mb-4 flex-wrap items-center">
                          <span
                            className="badge"
                            style={{
                              background: `${typeInfo.color}20`,
                              color: typeInfo.color,
                            }}
                          >
                            {typeInfo.label}
                          </span>
                          <span className="font-bold text-lg">{hint.content}</span>
                        </div>
                        <div className="text-secondary">{hint.translation}</div>
                        {isSelected && hint.example && (
                          <div
                            className="mt-12"
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(0, 206, 201, 0.1)',
                              borderRadius: 8,
                              fontSize: 14,
                            }}
                          >
                            <span className="text-muted">例句: </span>
                            <span className="text-secondary">{hint.example}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 flex-wrap items-start">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          speak(hint.content)
                        }}
                      >
                        🔊 朗读
                      </button>
                      {(hint.type === 'vocabulary' || hint.type === 'pronunciation') && (
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'vocabulary')
                          }}
                        >
                          ⭐ 收藏词汇
                        </button>
                      )}
                      {hint.type === 'pattern' && (
                        <button
                          className="btn btn-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'pattern')
                          }}
                        >
                          ⭐ 收藏句型
                        </button>
                      )}
                      {hint.type === 'vocabulary' && (
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSave(hint, 'pattern')
                          }}
                        >
                          ✨ 收藏句型
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card mt-24" style={{ borderColor: 'var(--accent)' }}>
            <h3 className="font-bold mb-12">🎯 AI 智能提示</h3>
            {!showAIRecommendation ? (
              <div className="text-center" style={{ padding: '20px 0' }}>
                <p className="text-secondary mb-16">推荐已关闭</p>
                <button className="btn" onClick={toggleAIRecommendation}>
                  🔔 开启推荐
                </button>
              </div>
            ) : (
              <>
                <p className="text-secondary mb-16">
                  基于你当前的对话场景和任务，AI 会实时推荐最相关的词汇和句型。
                </p>
                {activeTask && (
                  <div className="input mb-12" style={{ textAlign: 'center', padding: '14px' }}>
                    💡 当前任务「{activeTask.title}」已生成 {displayGeneratedHints.length} 条推荐提示
                  </div>
                )}
                {!activeTask && (
                  <div className="input mb-12" style={{ textAlign: 'center', padding: '14px' }}>
                    💡 正在监听你的对话...
                  </div>
                )}
                <div className="flex gap-8">
                  <button className="btn btn-secondary" onClick={toggleAIRecommendation}>
                    🔕 关闭推荐
                  </button>
                  <button className="btn" onClick={openPrefModal}>
                    ⚙️ 设置偏好
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'saved' && (
        <div className="flex flex-col gap-10">
          {savedItems.length === 0 ? (
            <div className="card text-center" style={{ padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>⭐</div>
              <div className="text-muted">暂无收藏内容，快去提示页面收藏一些词汇或句型吧！</div>
            </div>
          ) : (
            savedItems.map((item) => {
              const typeInfo = getTypeLabel(item.type)
              return (
                <div
                  key={item.id}
                  className="hint-card"
                  style={{ borderLeftColor: typeInfo.color }}
                >
                  <div className="flex flex-between">
                    <div className="flex gap-12 flex-1">
                      <span style={{ fontSize: 28 }}>{typeInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex gap-8 mb-4 flex-wrap items-center">
                          <span
                            className="badge"
                            style={{
                              background: `${typeInfo.color}20`,
                              color: typeInfo.color,
                            }}
                          >
                            {typeInfo.label}
                          </span>
                          <span className="font-bold text-lg">{item.content}</span>
                        </div>
                        <div className="text-secondary">{item.translation}</div>
                        {item.example && (
                          <div
                            className="mt-12"
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(0, 206, 201, 0.1)',
                              borderRadius: 8,
                              fontSize: 14,
                            }}
                          >
                            <span className="text-muted">例句: </span>
                            <span className="text-secondary">{item.example}</span>
                          </div>
                        )}
                        <div className="text-sm text-muted mt-8">
                          📅 {item.createdAt}
                          {item.roundNumber && item.taskTitle ? (
                            <span className="ml-8">📍 第 {item.roundNumber} 轮 - {item.taskTitle}任务</span>
                          ) : (
                            <span className="ml-8">📍 {item.source}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6 flex-wrap items-start">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => speak(item.content)}
                      >
                        🔊 朗读
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => deleteSavedItem(item.id)}
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: 520,
              maxHeight: '80vh',
              overflow: 'auto',
              background: 'var(--bg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-between mb-16">
              <h3 className="text-lg font-bold">📋 选择任务</h3>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setShowTaskModal(false)}
              >
                ✕ 关闭
              </button>
            </div>
            <div className="flex flex-col gap-10">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="card cursor-pointer"
                  style={{
                    borderColor: activeTask?.id === task.id ? 'var(--primary)' : undefined,
                  }}
                  onClick={() => handleSwitchTask(task.id)}
                >
                  <div className="flex flex-between">
                    <div className="flex gap-8 items-center">
                      <span style={{ fontSize: 24 }}>{getThemeIcon(task.theme)}</span>
                      <div>
                        <div className="font-bold">{task.title}</div>
                        <div className="text-sm text-muted">
                          {themes.find((t) => t.value === task.theme)?.label || task.theme} ·{' '}
                          {difficulties.find((d) => d.value === task.difficulty)?.label || task.difficulty}
                        </div>
                      </div>
                    </div>
                    {activeTask?.id === task.id && (
                      <span className="badge badge-green">当前</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrefModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPrefModal(false)}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: 480,
              background: 'var(--bg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-between mb-20">
              <h3 className="text-lg font-bold">⚙️ 偏好设置</h3>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setShowPrefModal(false)}
              >
                ✕ 关闭
              </button>
            </div>

            <div className="mb-16">
              <label className="text-sm text-muted mb-4 block">难度选择</label>
              <select
                className="input"
                value={prefForm.difficulty}
                onChange={(e) => setPrefForm({ ...prefForm, difficulty: e.target.value as Difficulty })}
              >
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-16">
              <label className="text-sm text-muted mb-8 block">关注类型（仅显示选中类型的推荐）</label>
              <div className="flex flex-col gap-8">
                {[
                  { value: 'vocabulary', label: '📚 词汇' },
                  { value: 'pattern', label: '✨ 句型' },
                  { value: 'pronunciation', label: '🔊 发音' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-8 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={prefForm.focusTypes.includes(item.value)}
                      onChange={() => handleToggleFocusType(item.value)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-24">
              <label className="flex items-center gap-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefForm.autoSpeak}
                  onChange={(e) => setPrefForm({ ...prefForm, autoSpeak: e.target.checked })}
                />
                <span>自动朗读（点击任务推荐提示时自动发音）</span>
              </label>
            </div>

            <div className="flex gap-8">
              <button className="btn" onClick={handleSavePrefs}>
                ✅ 保存
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPrefModal(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HintWindow
