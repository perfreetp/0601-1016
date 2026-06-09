import { useState } from 'react'
import { useAppStore, avatarsList } from '@/store'
import type { Avatar } from '@/types'

const expressions = [
  { id: 'e1', name: '开心', emoji: '😊' },
  { id: 'e2', name: '微笑', emoji: '🙂' },
  { id: 'e3', name: '大笑', emoji: '😄' },
  { id: 'e4', name: '思考', emoji: '🤔' },
  { id: 'e5', name: '惊讶', emoji: '😮' },
  { id: 'e6', name: '害羞', emoji: '😳' },
  { id: 'e7', name: '酷', emoji: '😎' },
  { id: 'e8', name: '爱', emoji: '🥰' },
  { id: 'e9', name: '加油', emoji: '💪' },
  { id: 'e10', name: '点赞', emoji: '👍' },
  { id: 'e11', name: '握手', emoji: '🤝' },
  { id: 'e12', name: 'OK', emoji: '👌' },
]

function CharacterWindow() {
  const { profile } = useAppStore()
  const [nickname, setNickname] = useState(profile.nickname)
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(profile.avatar)
  const [selectedExpr, setSelectedExpr] = useState<string>('e1')
  const [nameplate, setNameplate] = useState('努力学习英语 ✨')

  const saveProfile = () => {
    const newProfile = { ...profile, nickname, avatar: selectedAvatar }
    useAppStore.setState({ profile: newProfile })
    window.electronAPI.updateState('profile', newProfile)
  }

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">👤 角色设置</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 返回大厅
          </button>
        </div>
      </div>

      <div className="grid grid-2 gap-24">
        <div className="card">
          <h3 className="text-lg font-bold mb-16">角色预览</h3>
          <div
            className="flex flex-col flex-center"
            style={{ padding: '32px 0' }}
          >
            <div
              className="avatar avatar-large mb-16"
              style={{ background: selectedAvatar.color }}
            >
              {selectedAvatar.emoji}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: -16, right: -32, fontSize: 28 }}>
                {expressions.find((e) => e.id === selectedExpr)?.emoji}
              </span>
              <div className="text-xl font-bold text-center">{nickname}</div>
            </div>
            <div className="badge badge-purple mt-8">Lv.{profile.level}</div>
            <div
              className="mt-16"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--bg-hover), var(--bg-card))',
                border: '1px solid var(--primary)',
                borderRadius: 999,
                fontSize: 13,
              }}
            >
              🏷️ {nameplate}
            </div>
            <div className="mt-24 text-center text-secondary text-sm">
              <div>累计练习: {Math.floor(profile.totalMinutes / 60)} 小时 {profile.totalMinutes % 60} 分钟</div>
              <div className="mt-4">参与会话: {profile.sessions} 次</div>
              <div className="mt-4">流利度: {profile.fluency}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-16">
          <div className="card">
            <h3 className="text-lg font-bold mb-12">📝 基本信息</h3>
            <div className="mb-12">
              <label className="label">昵称</label>
              <input
                type="text"
                className="input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你的昵称"
              />
            </div>
            <div>
              <label className="label">个性名牌</label>
              <input
                type="text"
                className="input"
                value={nameplate}
                onChange={(e) => setNameplate(e.target.value)}
                placeholder="一句展示个性的话"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-12">🎭 选择形象</h3>
            <div className="grid grid-4 gap-12">
              {avatarsList.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar ${selectedAvatar.id === avatar.id ? 'selected' : ''}`}
                  style={{ background: avatar.color }}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar.emoji}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-12">😊 默认表情</h3>
            <div className="grid grid-4 gap-8">
              {expressions.map((expr) => (
                <button
                  key={expr.id}
                  className="card text-center"
                  style={{
                    padding: '12px 8px',
                    borderColor: selectedExpr === expr.id ? 'var(--accent)' : undefined,
                    boxShadow: selectedExpr === expr.id ? '0 0 15px rgba(253, 121, 168, 0.4)' : undefined,
                  }}
                  onClick={() => setSelectedExpr(expr.id)}
                >
                  <div style={{ fontSize: 28 }}>{expr.emoji}</div>
                  <div className="text-sm text-muted mt-4">{expr.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-large" onClick={saveProfile}>
            ✅ 保存设置
          </button>
        </div>
      </div>
    </div>
  )
}

export default CharacterWindow
