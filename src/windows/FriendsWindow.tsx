import { useState } from 'react'
import { useAppStore } from '@/store'
import type { Friend } from '@/types'

type TabType = 'friends' | 'invites' | 'favorites' | 'appointments'

function FriendsWindow() {
  const { friends, favoriteRooms } = useAppStore()
  const [tab, setTab] = useState<TabType>('friends')
  const [search, setSearch] = useState('')

  const onlineFriends = friends.filter((f) => f.online)
  const offlineFriends = friends.filter((f) => !f.online)

  const searchFilter = (list: Friend[]) =>
    list.filter((f) => f.nickname.toLowerCase().includes(search.toLowerCase()))

  const invites = [
    { id: 'i1', from: 'Alice', roomName: '英语角-日常对话', time: '5分钟前' },
    { id: 'i2', from: '小明', roomName: '餐厅点餐模拟', time: '12分钟前' },
  ]

  const appointments = [
    { id: 'ap1', partner: 'Sakura', time: '2026-06-11 20:00', topic: '日语五十音入门', status: 'confirmed' },
    { id: 'ap2', partner: 'David', time: '2026-06-12 19:30', topic: '商务英语谈判', status: 'pending' },
    { id: 'ap3', partner: 'Mike', time: '2026-06-13 21:00', topic: '高级面试模拟', status: 'pending' },
  ]

  const favoriteRoomList = [
    { id: 'room1', name: '英语角-日常对话', host: 'Alice', online: 4 },
    { id: 'room3', name: '日语入门-五十音', host: 'Sakura', online: 5 },
    { id: 'room5', name: '法语咖啡时光', host: 'Pierre', online: 2 },
  ]

  const renderFriendCard = (friend: Friend) => (
    <div key={friend.id} className="list-item">
      <div className="flex gap-12">
        <div style={{ position: 'relative' }}>
          <div
            className="avatar avatar-small"
            style={{ background: friend.avatar.color, width: 48, height: 48, fontSize: 24 }}
          >
            {friend.avatar.emoji}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid var(--bg-card)',
              background: friend.online ? 'var(--success)' : 'var(--text-muted)',
            }}
          />
        </div>
        <div>
          <div className="font-bold">{friend.nickname}</div>
          <div className="text-sm text-muted">
            Lv.{friend.level} · {friend.online ? '🟢 在线' : '⚪ 离线'}
          </div>
        </div>
      </div>
      <div className="flex gap-8">
        <button className="btn btn-small btn-secondary">💬 消息</button>
        <button className="btn btn-small" onClick={() => window.electronAPI.openWindow('room')}>
          🎮 邀请
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="window-header">
        <h1 className="window-title">👥 好友搭子</h1>
        <div className="window-nav">
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('lobby')}>
            🏠 大厅
          </button>
          <button className="nav-btn" onClick={() => window.electronAPI.openWindow('achievement')}>
            🏆 成就
          </button>
        </div>
      </div>

      <div className="tab-group">
        <button className={`tab-item ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
          👤 好友 ({friends.length})
        </button>
        <button className={`tab-item ${tab === 'invites' ? 'active' : ''}`} onClick={() => setTab('invites')}>
          ✉️ 邀请 ({invites.length})
        </button>
        <button className={`tab-item ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>
          📅 预约 ({appointments.length})
        </button>
        <button className={`tab-item ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}>
          ⭐ 收藏 ({favoriteRooms.length})
        </button>
      </div>

      {(tab === 'friends' || tab === 'invites') && (
        <div className="mb-16">
          <input
            type="text"
            className="input"
            placeholder="🔍 搜索好友..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {tab === 'friends' && (
        <div>
          {onlineFriends.length > 0 && (
            <div className="mb-16">
              <h3 className="font-bold mb-8 text-sm text-success">
                🟢 在线好友 ({onlineFriends.length})
              </h3>
              {searchFilter(onlineFriends).map(renderFriendCard)}
            </div>
          )}
          {offlineFriends.length > 0 && (
            <div>
              <h3 className="font-bold mb-8 text-sm text-muted">
                ⚪ 离线好友 ({offlineFriends.length})
              </h3>
              {searchFilter(offlineFriends).map(renderFriendCard)}
            </div>
          )}
          <button className="card w-full text-center mt-16" style={{ borderStyle: 'dashed' }}>
            <span style={{ fontSize: 24 }}>➕</span>
            <span className="ml-8">添加好友</span>
          </button>
        </div>
      )}

      {tab === 'invites' && (
        <div>
          {invites.length > 0 ? (
            invites.map((inv) => (
              <div key={inv.id} className="list-item">
                <div>
                  <div className="font-bold">
                    {inv.from} <span className="text-sm text-muted">邀请你进入房间</span>
                  </div>
                  <div className="text-sm text-secondary">{inv.roomName}</div>
                  <div className="text-xs text-muted mt-4">{inv.time}</div>
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-small btn-danger">拒绝</button>
                  <button
                    className="btn btn-small btn-success"
                    onClick={() => window.electronAPI.openWindow('room')}
                  >
                    接受
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-16">暂无新邀请</div>
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          <div className="card mb-16" style={{ borderColor: 'var(--accent)' }}>
            <h3 className="font-bold mb-12">🎯 预约新搭子</h3>
            <div className="grid grid-2 gap-12 mb-12">
              <select className="select">
                <option>选择好友</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nickname}
                  </option>
                ))}
              </select>
              <input type="date" className="input" />
            </div>
            <div className="grid grid-2 gap-12 mb-12">
              <input type="time" className="input" />
              <select className="select">
                <option>英语</option>
                <option>日语</option>
                <option>韩语</option>
              </select>
            </div>
            <input type="text" className="input mb-12" placeholder="练习主题（如：餐厅点餐）" />
            <button className="btn w-full">📅 发送预约</button>
          </div>

          <h3 className="font-bold mb-12">📌 已预约</h3>
          {appointments.map((ap) => (
            <div key={ap.id} className="list-item">
              <div>
                <div className="flex gap-8 mb-4">
                  <span className="font-bold">{ap.partner}</span>
                  <span
                    className={`badge ${ap.status === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}
                  >
                    {ap.status === 'confirmed' ? '✅ 已确认' : '⏳ 待确认'}
                  </span>
                </div>
                <div className="text-sm text-secondary">{ap.topic}</div>
                <div className="text-sm text-muted mt-4">🕐 {ap.time}</div>
              </div>
              <div className="flex gap-8">
                <button className="btn btn-small btn-secondary">修改</button>
                <button className="btn btn-small btn-danger">取消</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'favorites' && (
        <div>
          <h3 className="font-bold mb-12">⭐ 收藏的房间</h3>
          {favoriteRoomList.map((room) => (
            <div
              key={room.id}
              className="list-item"
              onClick={() => window.electronAPI.openWindow('room')}
            >
              <div>
                <div className="font-bold">{room.name}</div>
                <div className="text-sm text-muted">房主: {room.host}</div>
              </div>
              <div className="flex gap-8">
                <span className="badge badge-blue">👥 {room.online}人</span>
                <button className="btn btn-small">进入</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendsWindow
