import { useState } from 'react'
import { useAppStore } from '@/store'

type TabType = 'stats' | 'badges' | 'plans'

function AchievementWindow() {
  const { profile, badges, studyPlans } = useAppStore()
  const [tab, setTab] = useState<TabType>('stats')

  const hours = Math.floor(profile.totalMinutes / 60)
  const minutes = profile.totalMinutes % 60

  const weeklyData = [45, 60, 30, 75, 50, 90, 40]
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']
  const maxMin = Math.max(...weeklyData)

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">🏆 学习成就</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('friends')}>
            👥 好友
          </button>
        </div>
      </div>

      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-hover))' }}>
        <div className="grid grid-4 gap-16 text-center">
          <div>
            <div
              style={{
                width: 80,
                height: 80,
                margin: '0 auto 12px',
                borderRadius: '50%',
                background: profile.avatar.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
              }}
            >
              {profile.avatar.emoji}
            </div>
            <div className="font-bold text-lg">{profile.nickname}</div>
            <div className="badge badge-purple mt-4">Lv.{profile.level}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">{hours}h {minutes}m</div>
            <div className="text-muted mt-4">⏱️ 累计练习时长</div>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>
              {profile.sessions}
            </div>
            <div className="text-muted mt-4">🎯 参与会话次数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-success">{profile.fluency}%</div>
            <div className="text-muted mt-4">🎤 口语流利度</div>
            <div className="progress-bar mt-8">
              <div className="progress-fill" style={{ width: `${profile.fluency}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="tab-group">
        <button className={`tab-item ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          📊 学习统计
        </button>
        <button className={`tab-item ${tab === 'badges' ? 'active' : ''}`} onClick={() => setTab('badges')}>
          🏅 徽章墙 ({badges.filter((b) => b.unlocked).length}/{badges.length})
        </button>
        <button className={`tab-item ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>
          📋 学习计划 ({studyPlans.length})
        </button>
      </div>

      {tab === 'stats' && (
        <div className="grid grid-2 gap-24">
          <div className="card">
            <h3 className="font-bold mb-16">📈 本周学习时长</h3>
            <div className="flex gap-8 items-end" style={{ height: 180 }}>
              {weeklyData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-muted mb-4">{val}分</div>
                  <div
                    style={{
                      width: '100%',
                      height: `${(val / maxMin) * 140}px`,
                      background: 'linear-gradient(180deg, var(--primary), var(--secondary))',
                      borderRadius: '8px 8px 0 0',
                      minHeight: 8,
                    }}
                  />
                  <div className="text-sm text-muted mt-8">周{weekDays[i]}</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="flex flex-between text-sm">
              <span className="text-muted">本周总计</span>
              <span className="font-bold">
                {Math.floor(weeklyData.reduce((a, b) => a + b, 0) / 60)} 小时{' '}
                {weeklyData.reduce((a, b) => a + b, 0) % 60} 分钟
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-16">
            <div className="card">
              <h3 className="font-bold mb-12">🎯 能力雷达</h3>
              <div className="grid grid-2 gap-12">
                {[
                  { label: '词汇量', value: 72 },
                  { label: '语法', value: 65 },
                  { label: '发音', value: 68 },
                  { label: '流利度', value: 70 },
                  { label: '听力', value: 75 },
                  { label: '写作', value: 58 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex flex-between text-sm mb-4">
                      <span className="text-secondary">{item.label}</span>
                      <span className="font-bold">{item.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold mb-12">🌍 语言分布</h3>
              <div className="flex flex-col gap-10">
                {[
                  { lang: '🇺🇸 英语', minutes: 480, color: 'var(--primary)' },
                  { lang: '🇯🇵 日语', minutes: 180, color: 'var(--secondary)' },
                  { lang: '🇰🇷 韩语', minutes: 60, color: 'var(--accent)' },
                ].map((item) => (
                  <div key={item.lang}>
                    <div className="flex flex-between text-sm mb-4">
                      <span>{item.lang}</span>
                      <span className="text-muted">{Math.floor(item.minutes / 60)}h {item.minutes % 60}m</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        style={{
                          height: '100%',
                          background: item.color,
                          borderRadius: 999,
                          width: `${(item.minutes / profile.totalMinutes) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div>
          <div className="grid grid-4 gap-16 mb-24">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="card text-center"
                style={{
                  opacity: badge.unlocked ? 1 : 0.4,
                  filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                  borderColor: badge.unlocked ? 'var(--warning)' : undefined,
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 8 }}>{badge.icon}</div>
                <div className="font-bold">{badge.name}</div>
                <div className="text-xs text-muted mt-4">{badge.description}</div>
                <div className="progress-bar mt-12">
                  <div className="progress-fill" style={{ width: `${badge.progress}%` }} />
                </div>
                <div className="text-xs text-muted mt-4">{badge.progress}%</div>
              </div>
            ))}
          </div>
          <div className="card text-center">
            <div className="text-lg font-bold mb-8">
              🏅 已解锁 {badges.filter((b) => b.unlocked).length} / {badges.length} 个徽章
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(badges.filter((b) => b.unlocked).length / badges.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div>
          <div className="card mb-16" style={{ borderColor: 'var(--success)' }}>
            <h3 className="font-bold mb-12">➕ 新建学习计划</h3>
            <div className="grid grid-2 gap-12 mb-12">
              <input type="text" className="input" placeholder="计划名称，如：每日口语30分钟" />
              <input type="text" className="input" placeholder="目标描述，如：连续练习30天" />
            </div>
            <div className="grid grid-2 gap-12 mb-12">
              <input type="date" className="input" />
              <select className="select">
                <option>英语</option>
                <option>日语</option>
                <option>韩语</option>
              </select>
            </div>
            <button className="btn w-full">🚀 创建计划</button>
          </div>

          <h3 className="font-bold mb-12">📌 当前计划</h3>
          <div className="flex flex-col gap-12">
            {studyPlans.map((plan) => (
              <div key={plan.id} className="card">
                <div className="flex flex-between mb-8">
                  <div className="font-bold text-lg">{plan.title}</div>
                  <span className="badge badge-blue">截止: {plan.deadline}</span>
                </div>
                <div className="text-secondary mb-12">🎯 {plan.target}</div>
                <div className="flex flex-between text-sm mb-4">
                  <span className="text-muted">进度</span>
                  <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                    {plan.progress}%
                  </span>
                </div>
                <div className="progress-bar mb-12">
                  <div className="progress-fill" style={{ width: `${plan.progress}%` }} />
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-small btn-secondary flex-1">查看详情</button>
                  <button className="btn btn-small flex-1">打卡</button>
                  <button className="btn btn-small btn-danger">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementWindow
