import { useState } from 'react'
import { useAppStore } from '@/store'
import type { PlaybackItem } from '@/types'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s}秒`
}

function PlaybackWindow() {
  const { recordings } = useAppStore()
  const [selected, setSelected] = useState<PlaybackItem | null>(recordings[0] || null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(35)

  const togglePlay = () => setPlaying(!playing)

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
          <h3 className="text-lg font-bold mb-12">历史录音</h3>
          <div className="flex flex-col gap-10">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="card cursor-pointer"
                style={{
                  borderColor: selected?.id === rec.id ? 'var(--primary)' : undefined,
                  boxShadow: selected?.id === rec.id ? '0 0 20px var(--glow)' : undefined,
                }}
                onClick={() => setSelected(rec)}
              >
                <div className="flex flex-between mb-8">
                  <div className="font-bold">{rec.roomName}</div>
                  {rec.corrections.length > 0 && (
                    <span className="badge badge-red">{rec.corrections.length} 处纠错</span>
                  )}
                </div>
                <div className="flex gap-16 text-sm text-muted">
                  <span>📅 {rec.date}</span>
                  <span>⏱️ {formatDuration(rec.duration)}</span>
                </div>
                <div className="text-sm text-secondary mt-12 line-clamp-1">
                  📝 {rec.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <div>
              <div className="card mb-16">
                <h3 className="font-bold mb-4">{selected.roomName}</h3>
                <div className="text-sm text-muted mb-16">
                  {selected.date} · 时长 {formatDuration(selected.duration)}
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
                  <button className="btn btn-small btn-secondary">⏮️</button>
                  <button
                    className="btn btn-large"
                    style={{ borderRadius: '50%', width: 60, height: 60, padding: 0 }}
                    onClick={togglePlay}
                  >
                    {playing ? '⏸️' : '▶️'}
                  </button>
                  <button className="btn btn-small btn-secondary">⏭️</button>
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
                  <span>{formatDuration(Math.floor((selected.duration * progress) / 100))}</span>
                  <span>{formatDuration(selected.duration)}</span>
                </div>

                <div className="divider" />

                <div>
                  <h4 className="font-bold mb-8">📝 当前字幕</h4>
                  <div
                    style={{
                      padding: 16,
                      background: 'var(--bg-dark)',
                      borderRadius: 12,
                      fontSize: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    {selected.subtitle}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold mb-12">
                  ✏️ AI 纠错 ({selected.corrections.length})
                </h3>
                {selected.corrections.length > 0 ? (
                  selected.corrections.map((corr, i) => (
                    <div key={i} className="correction-item">
                      <div className="text-sm text-muted mb-4">
                        ⏱️ {Math.floor(corr.timestamp / 60)}:{(corr.timestamp % 60).toString().padStart(2, '0')}
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

              <div className="flex gap-8 mt-16">
                <button className="btn flex-1">📤 导出字幕</button>
                <button className="btn btn-secondary flex-1">🔁 再次练习</button>
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
