import { useState, useEffect, useRef } from 'react'
import { useAppStore, themes, difficulties } from '@/store'
import type { PlaybackItem, SubtitleLine, Correction, CollectionType, RoundArchive } from '@/types'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s}秒`
}

function formatTimeShort(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface SaveDialogState {
  open: boolean
  type: CollectionType
  content: string
  example?: string
  source: string
  roundNumber?: number
  taskTitle?: string
}

type DetailTab = 'subtitles' | 'corrections' | 'rounds'

const ROUND_COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#00B894', '#A29BFE']

function PlaybackWindow() {
  const { recordings, saveItem, exportSubtitles, savedItems } = useAppStore()
  const [selected, setSelected] = useState<PlaybackItem | null>(recordings[0] || null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSubIdx, setCurrentSubIdx] = useState(0)
  const [detailTab, setDetailTab] = useState<DetailTab>('subtitles')
  const [activeRound, setActiveRound] = useState<number | null>(null)
  const [saveDialog, setSaveDialog] = useState<SaveDialogState>({
    open: false,
    type: 'vocabulary',
    content: '',
    source: '',
  })
  const [translationInput, setTranslationInput] = useState('')
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const roundsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelected(recordings[0] || null)
    setProgress(0)
    setCurrentSubIdx(0)
    setDetailTab('subtitles')
    setActiveRound(null)
  }, [recordings])

  useEffect(() => {
    if (!playing || !selected) return
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + (100 / selected.duration))
        const idx = Math.floor((next / 100) * Math.max(1, selected.subtitles.length - 1))
        setCurrentSubIdx(idx)
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [playing, selected])

  const togglePlay = () => setPlaying(!playing)

  const currentSec = selected ? Math.floor((progress / 100) * selected.duration) : 0

  const openSaveDialog = (
    type: CollectionType,
    content: string,
    source: string,
    example?: string,
    roundNumber?: number,
    taskTitle?: string
  ) => {
    setSaveDialog({ open: true, type, content, example, source, roundNumber, taskTitle })
    setTranslationInput('')
  }

  const closeSaveDialog = () => {
    setSaveDialog({ open: false, type: 'vocabulary', content: '', source: '' })
    setTranslationInput('')
  }

  const confirmSave = () => {
    if (!translationInput.trim()) return
    saveItem({
      type: saveDialog.type,
      content: saveDialog.content,
      translation: translationInput.trim(),
      example: saveDialog.example,
      source: saveDialog.source,
      roundNumber: saveDialog.roundNumber,
      taskTitle: saveDialog.taskTitle,
    })
    setSaveSuccess(saveDialog.type === 'vocabulary' ? '词汇已收藏！' : '句型已收藏！')
    setTimeout(() => setSaveSuccess(null), 2000)
    closeSaveDialog()
  }

  const handleExportSubtitles = () => {
    if (selected) {
      exportSubtitles(selected.id)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50'
    if (score >= 70) return '#FF9800'
    return '#F44336'
  }

  const getThemeIcon = (t: string) => themes.find((x) => x.value === t)?.icon || '📌'
  const getDifficultyInfo = (d: string) => difficulties.find((x) => x.value === d)

  const scrollToRound = (roundNumber: number) => {
    setDetailTab('rounds')
    setActiveRound(roundNumber)
    setTimeout(() => {
      const el = document.getElementById(`round-card-${roundNumber}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const renderRoundProgress = () => {
    if (!selected || selected.rounds.length === 0) return null
    return (
      <div className="card mb-16">
        <div className="flex flex-between mb-8">
          <span className="text-sm font-bold">🎯 轮次进度</span>
          <span className="text-sm text-muted">共 {selected.rounds.length} 轮</span>
        </div>
        <div style={{ display: 'flex', gap: 4, height: 12, borderRadius: 6, overflow: 'hidden' }}>
          {selected.rounds.map((round, idx) => {
            const width = ((round.endTimestamp - round.startTimestamp) / selected.duration) * 100
            const isActive = activeRound === round.roundNumber
            return (
              <div
                key={round.roundNumber}
                onClick={() => scrollToRound(round.roundNumber)}
                style={{
                  flex: width,
                  background: ROUND_COLORS[idx % ROUND_COLORS.length],
                  height: '100%',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'opacity 0.2s',
                  border: isActive ? '2px solid #fff' : undefined,
                }}
                title={`第 ${round.roundNumber} 轮 - ${round.taskTitle}`}
              />
            )
          })}
        </div>
        <div className="flex gap-8 mt-8 flex-wrap">
          {selected.rounds.map((round, idx) => (
            <button
              key={round.roundNumber}
              className="btn btn-small"
              style={{
                background: ROUND_COLORS[idx % ROUND_COLORS.length],
                border: 'none',
                color: '#fff',
              }}
              onClick={() => scrollToRound(round.roundNumber)}
            >
              第 {round.roundNumber} 轮
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderRoundCard = (round: RoundArchive, idx: number) => {
    const relativeTime = (ts: number) => formatTimeShort(Math.max(0, ts - round.startTimestamp))
    const diffInfo = getDifficultyInfo('intermediate')
    const isActive = activeRound === round.roundNumber

    return (
      <div
        id={`round-card-${round.roundNumber}`}
        key={round.roundNumber}
        className="card mb-16"
        style={{
          borderLeft: `4px solid ${ROUND_COLORS[idx % ROUND_COLORS.length]}`,
          borderColor: isActive ? ROUND_COLORS[idx % ROUND_COLORS.length] : undefined,
          boxShadow: isActive ? `0 0 20px ${ROUND_COLORS[idx % ROUND_COLORS.length]}50` : undefined,
        }}
      >
        <div className="flex flex-between items-start mb-12">
          <div className="flex gap-8 flex-wrap items-center">
            <span
              className="badge"
              style={{
                background: `${ROUND_COLORS[idx % ROUND_COLORS.length]}`,
                color: '#fff',
                fontSize: 13,
                padding: '6px 12px',
              }}
            >
              🎯 第 {round.roundNumber} 轮 - {round.taskTitle}
            </span>
            <span className="badge badge-purple">
              {getThemeIcon(round.taskTheme)} {themes.find((t) => t.value === round.taskTheme)?.label || round.taskTheme}
            </span>
            {diffInfo && (
              <span className="badge" style={{ background: `${diffInfo.color}20`, color: diffInfo.color }}>
                {diffInfo.label}
              </span>
            )}
          </div>
          <span className="text-sm text-muted">
            {formatDuration(round.endTimestamp - round.startTimestamp)}
          </span>
        </div>

        <div className="mb-12">
          <h4 className="font-bold mb-8">📝 字幕记录</h4>
          <div
            style={{
              padding: 12,
              background: 'var(--bg-dark)',
              borderRadius: 12,
              maxHeight: 250,
              overflowY: 'auto',
            }}
          >
            {round.subtitles.length === 0 ? (
              <div className="text-secondary text-sm">该轮暂无字幕记录</div>
            ) : (
              round.subtitles.map((sub: SubtitleLine) => (
                <div key={sub.id} className="mb-6">
                  <div className="flex items-start gap-8">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: sub.speakerAvatar?.color || 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      {sub.speakerAvatar?.emoji || '👤'}
                      {sub.speakerEmoji && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            fontSize: 14,
                            background: 'var(--bg-dark)',
                            borderRadius: '50%',
                            padding: 2,
                          }}
                        >
                          {sub.speakerEmoji}
                        </span>
                      )}
                    </div>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="flex items-center gap-8 mb-2">
                        <span className="badge badge-purple" style={{ fontSize: 11 }}>
                          {relativeTime(sub.timestamp)}
                        </span>
                        <span
                          className="font-medium text-sm"
                          style={{ color: sub.isMe ? 'var(--secondary)' : undefined }}
                        >
                          {sub.speaker}
                        </span>
                      </div>
                      <div className="text-secondary text-sm mb-6">{sub.text}</div>
                      <div className="flex gap-6">
                        <button
                          className="btn btn-small btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() =>
                            openSaveDialog(
                              'vocabulary',
                              sub.text,
                              `${selected?.roomName || ''}-第${round.roundNumber}轮`,
                              undefined,
                              round.roundNumber,
                              round.taskTitle
                            )
                          }
                        >
                          📚 收藏词汇
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() =>
                            openSaveDialog(
                              'pattern',
                              sub.text,
                              `${selected?.roomName || ''}-第${round.roundNumber}轮`,
                              sub.text,
                              round.roundNumber,
                              round.taskTitle
                            )
                          }
                        >
                          💬 收藏句型
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {round.corrections.length > 0 && (
          <div className="mb-12">
            <h4 className="font-bold mb-8">✏️ 纠错记录 ({round.corrections.length})</h4>
            {round.corrections.map((corr: Correction, i: number) => (
              <div key={i} className="correction-item">
                <div className="text-sm text-muted mb-4">
                  ⏱️ {relativeTime(corr.timestamp)}
                </div>
                <div className="correction-text mb-4">❌ {corr.original}</div>
                <div className="corrected-text mb-4">✅ {corr.corrected}</div>
                <div className="text-sm text-secondary mb-8">💡 {corr.note}</div>
                <div className="flex gap-6">
                  <button
                    className="btn btn-small btn-secondary"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() =>
                      openSaveDialog(
                        'pattern',
                        corr.corrected,
                        `${selected?.roomName || ''}-第${round.roundNumber}轮-纠错`,
                        corr.corrected,
                        round.roundNumber,
                        round.taskTitle
                      )
                    }
                  >
                    💬 收藏正确句型
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {round.report && (
          <div>
            <h4 className="font-bold mb-8">📊 流利度小结</h4>
            <div className="grid grid-3 gap-12 mb-16" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {[
                { label: '总分', value: round.report.overallScore },
                { label: '发音', value: round.report.pronunciationScore },
                { label: '语法', value: round.report.grammarScore },
                { label: '流利度', value: round.report.fluencyScore },
                { label: '词汇', value: round.report.vocabularyScore },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    textAlign: 'center',
                    padding: 8,
                    background: 'var(--bg-dark)',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: getScoreColor(item.value),
                    }}
                  >
                    {item.value}
                  </div>
                  <div className="text-sm text-muted mt-2">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-2 gap-16">
              <div>
                <div className="font-bold mb-8" style={{ color: '#4CAF50' }}>
                  ✨ 亮点
                </div>
                <ul style={{ paddingLeft: 20 }}>
                  {round.report.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-secondary mb-4">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold mb-8" style={{ color: '#FF9800' }}>
                  💡 建议
                </div>
                <ul style={{ paddingLeft: 20 }}>
                  {round.report.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-secondary mb-4">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">📼 回放复习</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('room')}>
            🎙️ 房间
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--success)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          ✅ {saveSuccess}
        </div>
      )}

      {saveDialog.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
          onClick={closeSaveDialog}
        >
          <div
            className="card"
            style={{
              width: 420,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-16">
              收藏为{saveDialog.type === 'vocabulary' ? '词汇' : '句型'}
            </h3>
            {saveDialog.roundNumber && saveDialog.taskTitle && (
              <div className="mb-12">
                <div
                  style={{
                    padding: 12,
                    background: 'rgba(108, 92, 231, 0.15)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--primary)',
                  }}
                >
                  📍 来自第 {saveDialog.roundNumber} 轮 - {saveDialog.taskTitle}
                </div>
              </div>
            )}
            <div className="mb-12">
              <div className="text-sm text-muted mb-4">原文</div>
              <div
                style={{
                  padding: 12,
                  background: 'var(--bg-dark)',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                {saveDialog.content}
              </div>
            </div>
            {saveDialog.example && (
              <div className="mb-12">
                <div className="text-sm text-muted mb-4">例句</div>
                <div
                  style={{
                    padding: 12,
                    background: 'var(--bg-dark)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: 'var(--secondary)',
                  }}
                >
                  {saveDialog.example}
                </div>
              </div>
            )}
            <div className="mb-16">
              <div className="text-sm text-muted mb-4">翻译 / 释义 *</div>
              <input
                type="text"
                className="input"
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                placeholder="请输入翻译或释义"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmSave()
                  if (e.key === 'Escape') closeSaveDialog()
                }}
              />
            </div>
            <div className="flex gap-8">
              <button className="btn btn-secondary flex-1" onClick={closeSaveDialog}>
                取消
              </button>
              <button
                className="btn flex-1"
                onClick={confirmSave}
                disabled={!translationInput.trim()}
              >
                确认收藏
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2 gap-24">
        <div>
          <div className="flex flex-between mb-12">
            <h3 className="text-lg font-bold">历史录音 ({recordings.length})</h3>
          </div>
          <div className="flex flex-col gap-10" style={{ maxHeight: 600, overflowY: 'auto' }}>
            {recordings.length === 0 ? (
              <div className="card text-center py-16 text-muted">
                <div style={{ fontSize: 48, marginBottom: 12 }}>📼</div>
                暂无录音，去房间开始练习吧！
              </div>
            ) : (
              <>
                <div className="mb-12">
                  <h3 className="font-bold mb-8">⭐ 我的收藏 ({savedItems.length})</h3>
                  <div className="flex flex-col gap-8" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {savedItems.length === 0 ? (
                      <div className="text-sm text-muted">暂无收藏</div>
                    ) : (
                      savedItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="card"
                          style={{ padding: 10 }}
                        >
                          <div className="flex items-center gap-8">
                            <span className="text-lg">
                              {item.type === 'vocabulary' ? '📚' : '✨'}
                            </span>
                            <div className="flex-1" style={{ minWidth: 0 }}>
                              <div className="font-bold text-sm">{item.content}</div>
                              <div className="text-xs text-muted">
                                📅 {item.createdAt}
                                {item.roundNumber && item.taskTitle && (
                                  <span className="ml-4">📍 第 {item.roundNumber} 轮 - {item.taskTitle}任务</span>
                                )}
                                {!item.roundNumber && <span className="ml-4">📍 {item.source}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="divider mb-12" />

                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="card cursor-pointer"
                    style={{
                      borderColor: selected?.id === rec.id ? 'var(--primary)' : undefined,
                      boxShadow: selected?.id === rec.id ? '0 0 20px var(--glow)' : undefined,
                    }}
                    onClick={() => {
                      setSelected(rec)
                      setProgress(0)
                      setCurrentSubIdx(0)
                      setPlaying(false)
                      setDetailTab('subtitles')
                      setActiveRound(null)
                    }}
                  >
                    <div className="flex flex-between mb-8">
                      <div className="font-bold">{rec.roomName}</div>
                      {rec.corrections.length > 0 ? (
                        <span className="badge badge-red">{rec.corrections.length} 处纠错</span>
                      ) : (
                        <span className="badge badge-green">✓ 无错误</span>
                      )}
                    </div>
                    <div className="flex gap-16 text-sm text-muted">
                      <span>📅 {rec.date}</span>
                      <span>⏱️ {formatDuration(rec.duration)}</span>
                    </div>
                    {rec.report && (
                      <div className="mt-8 text-sm">
                        <span className="badge badge-purple">总分 {rec.report.overallScore}</span>
                      </div>
                    )}
                    {rec.rounds.length > 0 && (
                      <div className="mt-8 text-sm">
                        <span className="badge badge-purple">{rec.rounds.length} 轮</span>
                      </div>
                    )}
                    <div className="text-sm text-secondary mt-12" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      📝 {rec.subtitle}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div>
          {selected ? (
            <div>
              {selected.report && (
                <div className="card mb-16">
                  <h3 className="font-bold mb-12">📊 流利度报告</h3>
                  <div className="grid grid-3 gap-12 mb-16" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {[
                      { label: '总分', value: selected.report.overallScore },
                      { label: '发音', value: selected.report.pronunciationScore },
                      { label: '语法', value: selected.report.grammarScore },
                      { label: '流利度', value: selected.report.fluencyScore },
                      { label: '词汇', value: selected.report.vocabularyScore },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          textAlign: 'center',
                          padding: 12,
                          background: 'var(--bg-dark)',
                          borderRadius: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: getScoreColor(item.value),
                          }}
                        >
                          {item.value}
                        </div>
                        <div className="text-sm text-muted mt-2">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-2 gap-16 mb-12">
                    <div>
                      <div className="font-bold mb-8" style={{ color: '#4CAF50' }}>
                        ✨ 亮点
                      </div>
                      <ul style={{ paddingLeft: 20 }}>
                        {selected.report.highlights.map((h, i) => (
                          <li key={i} className="text-sm text-secondary mb-4">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-bold mb-8" style={{ color: '#FF9800' }}>
                        💡 建议
                      </div>
                      <ul style={{ paddingLeft: 20 }}>
                        {selected.report.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-secondary mb-4">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="grid grid-3 gap-12 mt-12" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--primary)' }}>
                        {selected.report.totalWords}
                      </div>
                      <div className="text-sm text-muted mt-2">总字数</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {selected.report.uniqueWords}
                      </div>
                      <div className="text-sm text-muted mt-2">词汇量</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent)' }}>
                        {formatDuration(selected.report.speakingTime)}
                      </div>
                      <div className="text-sm text-muted mt-2">说话时长</div>
                    </div>
                  </div>
                </div>
              )}

              {renderRoundProgress()}

              <div className="card mb-16">
                <h3 className="font-bold mb-4">{selected.roomName}</h3>
                <div className="text-sm text-muted mb-16">
                  {selected.date} · 时长 {formatDuration(selected.duration)} · {selected.subtitles.length} 条字幕
                  {selected.rounds.length > 0 && ` · ${selected.rounds.length} 轮`}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 12,
                    height: 80,
                    background: 'var(--bg-dark)',
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setProgress(Math.max(0, progress - 5))
                    }}
                  >
                    ⏮️ -5s
                  </button>
                  <button
                    className="btn btn-large"
                    style={{ borderRadius: '50%', width: 60, height: 60, padding: 0 }}
                    onClick={togglePlay}
                  >
                    {playing ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setProgress(Math.min(100, progress + 5))
                    }}
                  >
                    ⏭️ +5s
                  </button>
                  {playing && (
                    <span className="waveform" style={{ marginLeft: 16 }}>
                      {Array.from({ length: 20 }, (_, i) => (
                        <span
                          key={i}
                          className="wave-bar"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        />
                      ))}
                    </span>
                  )}
                </div>

                <div className="progress-bar mb-8">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex flex-between text-sm text-muted">
                  <span>{formatTimeShort(currentSec)}</span>
                  <span>{formatTimeShort(selected.duration)}</span>
                </div>

                <div className="divider" />

                <div className="tab-group mb-16">
                  <button
                    className={`tab-item ${detailTab === 'subtitles' ? 'active' : ''}`}
                    onClick={() => setDetailTab('subtitles')}
                  >
                    📝 字幕 ({selected.subtitles.length})
                  </button>
                  <button
                    className={`tab-item ${detailTab === 'corrections' ? 'active' : ''}`}
                    onClick={() => setDetailTab('corrections')}
                  >
                    ✏️ 纠错 ({selected.corrections.length})
                  </button>
                  <button
                    className={`tab-item ${detailTab === 'rounds' ? 'active' : ''}`}
                    onClick={() => setDetailTab('rounds')}
                  >
                    📚 按轮次查看 ({selected.rounds.length})
                  </button>
                </div>

                {detailTab === 'subtitles' && (
                  <div>
                    <div
                      style={{
                        padding: 12,
                        background: 'var(--bg-dark)',
                        borderRadius: 12,
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {selected.subtitles.length === 0 ? (
                        <div className="text-secondary">{selected.subtitle}</div>
                      ) : (
                        selected.subtitles.map((sub: SubtitleLine, i: number) => (
                          <div
                            key={sub.id}
                            className="mb-6"
                            style={{
                              opacity: i === currentSubIdx ? 1 : 0.5,
                              background: i === currentSubIdx ? 'rgba(108, 92, 231, 0.15)' : undefined,
                              padding: '8px 10px',
                              borderRadius: 8,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div className="flex items-start gap-8">
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  background: sub.speakerAvatar?.color || 'var(--primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 20,
                                  flexShrink: 0,
                                  position: 'relative',
                                }}
                              >
                                {sub.speakerAvatar?.emoji || '👤'}
                                {sub.speakerEmoji && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      bottom: -4,
                                      right: -4,
                                      fontSize: 14,
                                      background: 'var(--bg-dark)',
                                      borderRadius: '50%',
                                      padding: 2,
                                    }}
                                  >
                                    {sub.speakerEmoji}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1" style={{ minWidth: 0 }}>
                                <div className="flex items-center gap-8 mb-2">
                                  <span className="badge badge-purple" style={{ fontSize: 11 }}>
                                    {formatTimeShort(sub.timestamp)}
                                  </span>
                                  <span
                                    className="font-medium text-sm"
                                    style={{ color: sub.isMe ? 'var(--secondary)' : undefined }}
                                  >
                                    {sub.speaker}
                                  </span>
                                </div>
                                <div className="text-secondary text-sm mb-6">{sub.text}</div>
                                <div className="flex gap-6">
                                  <button
                                    className="btn btn-small btn-secondary"
                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                    onClick={() =>
                                      openSaveDialog(
                                        'vocabulary',
                                        sub.text,
                                        `${selected.roomName}-字幕`
                                      )
                                    }
                                  >
                                    📚 收藏词汇
                                  </button>
                                  <button
                                    className="btn btn-small btn-secondary"
                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                    onClick={() =>
                                      openSaveDialog(
                                        'pattern',
                                        sub.text,
                                        `${selected.roomName}-字幕`,
                                        sub.text
                                      )
                                    }
                                  >
                                    💬 收藏句型
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {detailTab === 'corrections' && (
                  <div>
                    <h3 className="font-bold mb-12">
                      ✏️ AI 纠错 ({selected.corrections.length})
                    </h3>
                    {selected.corrections.length > 0 ? (
                      selected.corrections.map((corr: Correction, i: number) => (
                        <div key={i} className="correction-item">
                          <div className="text-sm text-muted mb-4">
                            ⏱️ {formatTimeShort(corr.timestamp)}
                          </div>
                          <div className="correction-text mb-4">❌ {corr.original}</div>
                          <div className="corrected-text mb-4">✅ {corr.corrected}</div>
                          <div className="text-sm text-secondary mb-8">💡 {corr.note}</div>
                          <div className="flex gap-6">
                            <button
                              className="btn btn-small btn-secondary"
                              style={{ fontSize: 12, padding: '4px 10px' }}
                              onClick={() =>
                                openSaveDialog(
                                  'pattern',
                                  corr.corrected,
                                  `${selected.roomName}-纠错`,
                                  corr.corrected
                                )
                              }
                            >
                              💬 收藏正确句型
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted">
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                        太棒了！这段录音没有发现语法错误
                      </div>
                    )}
                  </div>
                )}

                {detailTab === 'rounds' && (
                  <div ref={roundsRef}>
                    {selected.rounds.length === 0 ? (
                      <div className="text-center py-12 text-muted">
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                        该录音暂无轮次归档数据
                      </div>
                    ) : (
                      selected.rounds.map((round, idx) => renderRoundCard(round, idx))
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-8">
                <button className="btn flex-1" onClick={handleExportSubtitles}>
                  📤 导出字幕
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => window.electronAPI.openWindow('room')}
                >
                  🔁 再次练习
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📼</div>
              <div className="text-muted">请选择一段录音进行回放</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaybackWindow
