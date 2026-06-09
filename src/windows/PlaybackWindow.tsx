import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import type { PlaybackItem } from '@/types'

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

function PlaybackWindow() {
  const { recordings } = useAppStore()
  const [selected, setSelected] = useState<PlaybackItem | null>(recordings[0] || null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSubIdx, setCurrentSubIdx] = useState(0)

  useEffect(() => {
    setSelected(recordings[0] || null)
    setProgress(0)
    setCurrentSubIdx(0)
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
              recordings.map((rec) => (
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
                  <div className="text-sm text-secondary mt-12" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    📝 {rec.subtitle}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          {selected ? (
            <div>
              <div className="card mb-16">
                <h3 className="font-bold mb-4">{selected.roomName}</h3>
                <div className="text-sm text-muted mb-16">
                  {selected.date} · 时长 {formatDuration(selected.duration)} · {selected.subtitles.length} 条字幕
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

                <div>
                  <h4 className="font-bold mb-8">📝 字幕记录</h4>
                  <div
                    style={{
                      padding: 12,
                      background: 'var(--bg-dark)',
                      borderRadius: 12,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    {selected.subtitles.length === 0 ? (
                      <div className="text-secondary">{selected.subtitle}</div>
                    ) : (
                      selected.subtitles.map((sub, i) => (
                        <div
                          key={sub.id}
                          className="flex gap-8 mb-6"
                          style={{
                            opacity: i === currentSubIdx ? 1 : 0.5,
                            background: i === currentSubIdx ? 'rgba(108, 92, 231, 0.15)' : undefined,
                            padding: i === currentSubIdx ? '6px 8px' : undefined,
                            borderRadius: 6,
                            transition: 'all 0.2s',
                          }}
                        >
                          <span className="badge badge-purple">
                            {formatTimeShort(sub.timestamp)}
                          </span>
                          <span className="font-medium text-sm" style={{ color: sub.isMe ? 'var(--secondary)' : undefined }}>
                            {sub.speaker}:
                          </span>
                          <span className="text-secondary text-sm">{sub.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="card mb-16">
                <h3 className="font-bold mb-12">
                  ✏️ AI 纠错 ({selected.corrections.length})
                </h3>
                {selected.corrections.length > 0 ? (
                  selected.corrections.map((corr, i) => (
                    <div key={i} className="correction-item">
                      <div className="text-sm text-muted mb-4">
                        ⏱️ {formatTimeShort(corr.timestamp)}
                      </div>
                      <div className="correction-text mb-4">❌ {corr.original}</div>
                      <div className="corrected-text mb-4">✅ {corr.corrected}</div>
                      <div className="text-sm text-secondary">💡 {corr.note}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted">
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                    太棒了！这段录音没有发现语法错误
                  </div>
                )}
              </div>

              <div className="flex gap-8">
                <button className="btn flex-1">📤 导出字幕</button>
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
