import { useState } from 'react'
import { useAppStore } from '@/store'
import type { Hint, CollectionType } from '@/types'

type HintType = 'all' | 'vocabulary' | 'pattern' | 'pronunciation'
type TabType = 'hints' | 'saved'

function HintWindow() {
  const {
    hints,
    activeTask,
    savedItems,
    saveItem,
    deleteSavedItem,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('hints')
  const [filter, setFilter] = useState<HintType>('all')
  const [selectedHint, setSelectedHint] = useState<Hint | null>(null)

  const filteredHints = filter === 'all' ? hints : hints.filter((h) => h.type === filter)

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

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 0.8
      window.speechSynthesis.speak(utter)
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
              <div className="text-sm text-muted">当前关联任务</div>
              <div className="font-bold text-lg mt-4">🍽️ {activeTask.title}</div>
            </div>
            <button className="btn btn-small btn-secondary">切换任务</button>
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
              全部 ({hints.length})
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
            {filteredHints.map((hint) => {
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
                  onClick={() => setSelectedHint(isSelected ? null : hint)}
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
            <p className="text-secondary mb-16">
              基于你当前的对话场景，AI 会实时推荐最相关的词汇和句型。
            </p>
            <div className="input mb-12" style={{ textAlign: 'center', padding: '14px' }}>
              💡 正在监听你的对话...
            </div>
            <div className="flex gap-8">
              <button className="btn btn-secondary">🔕 关闭推荐</button>
              <button className="btn">⚙️ 设置偏好</button>
            </div>
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
                          📅 {item.createdAt} · 📍 {item.source}
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
    </div>
  )
}

export default HintWindow
