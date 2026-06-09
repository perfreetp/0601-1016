import { useState } from 'react'
import { useAppStore } from '@/store'

type TabType = 'stats' | 'badges' | 'plans'

function AchievementWindow() {
  const {
    profile,
    badges,
    studyPlans,
    createStudyPlan,
    checkInPlan,
    deleteStudyPlan,
  } = useAppStore()
  const [tab, setTab] = useState<TabType>('stats')
  const [toast, setToast] = useState<string | null>(null)

  const [planTitle, setPlanTitle] = useState('')
  const [planTarget, setPlanTarget] = useState('')
  const [planDeadline, setPlanDeadline] = useState('')

  const hours = Math.floor(profile.totalMinutes / 60)
  const minutes = profile.totalMinutes % 60

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const weeklyData = [45, 60, 30, 75, 50, 90, 40]
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']
  const maxMin = Math.max(...weeklyData)

  const handleCreatePlan = () => {
    if (!planTitle || !planTarget || !planDeadline) {
      showToast('⚠️ 请填写完整计划信息')
      return
    }
    createStudyPlan({ title: planTitle, target: planTarget, deadline: planDeadline })
    showToast('✅ 学习计划已创建')
    setPlanTitle('')
    setPlanTarget('')
    setPlanDeadline('')
  }

  const handleCheckIn = (id: string, title: string, alreadyChecked: boolean) => {
    if (alreadyChecked) {
      showToast('⚠️ 今天已打卡过啦')
      return
    }
    checkInPlan(id)
    showToast(`✅ "${title}" 打卡成功！进度 +5%`)
  }

  const handleDeletePlan = (id: string, title: string) => {
    deleteStudyPlan(id)
    showToast(`已删除计划"${title}"`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 999,
            zIndex: 9999,
            fontSize: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {toast}
        </div>
      )}

      <div className="window-header">
        <h1 className="window-title">🏆 学习成就</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('friends')}>
            👥 好友
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('playback')}>
            📼 回放
          </button>
        </div>
      </div>

      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-hover))' }}>
        <div className="grid grid-4 gap-16 text-center">
          <div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
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
                  position: 'relative',
                }}
              >
                {profile.avatar.emoji}
                <span style={{ position: 'absolute', top: -6, right: -10, fontSize: 22 }}>
                  {profile.defaultEmoji}
                </span>
              </div>
            </div>
            <div className="font-bold text-lg">{profile.nickname}</div>
            <div className="text-xs text-muted mt-2" style={{ maxWidth: 160, margin: '0 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.nameplate}
            </div>
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
                  { label: '流利度', value: profile.fluency },
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
                <div className="text-xs mt-4" style={{ color: badge.unlocked ? 'var(--success)' : 'var(--text-muted)' }}>
                  {badge.unlocked ? '✅ 已解锁' : `${badge.progress}%`}
                </div>
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
            <div className="text-sm text-muted mt-8">
              💡 完成一次练习可获得徽章进度，加油！
            </div>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div>
          <div className="card mb-16" style={{ borderColor: 'var(--success)' }}>
            <h3 className="font-bold mb-12">➕ 新建学习计划</h3>
            <div className="grid grid-2 gap-12 mb-12">
              <input
                type="text"
                className="input"
                placeholder="计划名称，如：每日口语30分钟"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                maxLength={20}
              />
              <input
                type="text"
                className="input"
                placeholder="目标描述，如：连续练习30天"
                value={planTarget}
                onChange={(e) => setPlanTarget(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="grid grid-2 gap-12 mb-12">
              <input
                type="date"
                className="input"
                value={planDeadline}
                onChange={(e) => setPlanDeadline(e.target.value)}
              />
              <button className="btn" onClick={handleCreatePlan}>
                🚀 创建计划
              </button>
            </div>
          </div>

          <h3 className="font-bold mb-12">� 当前计划</h3>
          {studyPlans.length === 0 ? (
            <div className="card text-center py-16 text-muted">
              <div style={{ fontSize: 48, marginBottom: 12 }}>�</div>
              还没有学习计划，去创建一个吧！
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {studyPlans.map((plan) => {
                const alreadyChecked = plan.checkIns.includes(today)
                return (
                  <div key={plan.id} className="card">
                    <div className="flex flex-between mb-8">
                      <div className="font-bold text-lg">{plan.title}</div>
                      <div className="flex gap-8">
                        <span className="badge badge-blue">截止: {plan.deadline}</span>
                        {plan.checkIns.length > 0 && (
                          <span className="badge badge-green">已打卡 {plan.checkIns.length} 天</span>
                        )}
                      </div>
                    </div>
                    <div className="text-secondary mb-12">🎯 {plan.target}</div>
                    <div className="flex flex-between text-sm mb-4">
                      <span className="text-muted">
                        进度 {alreadyChecked && <span className="text-success ml-4">✓ 今日已打卡</span>}
                      </span>
                      <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                        {plan.progress}%
                      </span>
                    </div>
                    <div className="progress-bar mb-12">
                      <div className="progress-fill" style={{ width: `${plan.progress}%` }} />
                    </div>
                    <div className="flex gap-8">
                      <button
                        className={`btn btn-small flex-1 ${alreadyChecked ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => handleCheckIn(plan.id, plan.title, alreadyChecked)}
                      >
                        {alreadyChecked ? '✓ 今日已打卡' : '✅ 今日打卡 (+5%)'}
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeletePlan(plan.id, plan.title)}
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AchievementWindow
