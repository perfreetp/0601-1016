import { useState } from 'react'
import { useAppStore, languages } from '@/store'
import type { Friend, Room, Language } from '@/types'

type TabType = 'friends' | 'invites' | 'favorites' | 'appointments'

const sampleRooms: Room[] = [
  { id: 'r1', name: '英语角-日常对话', language: 'en', theme: 'daily', difficulty: 'beginner', capacity: 6, current: 4, host: 'Alice' },
  { id: 'r2', name: '餐厅点餐模拟', language: 'en', theme: 'restaurant', difficulty: 'intermediate', capacity: 4, current: 3, host: 'Mike' },
  { id: 'r3', name: '日语入门-五十音', language: 'ja', theme: 'daily', difficulty: 'beginner', capacity: 8, current: 5, host: 'Sakura' },
  { id: 'r4', name: '商务英语-谈判技巧', language: 'en', theme: 'business', difficulty: 'advanced', capacity: 4, current: 2, host: 'David' },
]

function FriendsWindow() {
  const {
    friends,
    favoriteRooms,
    roomInvites,
    appointments,
    currentRoom,
    profile,
    sendRoomInvite,
    acceptInvite,
    declineInvite,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    enterRoom,
  } = useAppStore()

  const [tab, setTab] = useState<TabType>('friends')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [partnerId, setPartnerId] = useState('')
  const [apptDate, setApptDate] = useState('')
  const [apptTime, setApptTime] = useState('')
  const [apptLang, setApptLang] = useState<Language>('en')
  const [apptTopic, setApptTopic] = useState('')

  const [planTitle, setPlanTitle] = useState('')
  const [planTarget, setPlanTarget] = useState('')
  const [planDeadline, setPlanDeadline] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const onlineFriends = friends.filter((f) => f.online)
  const offlineFriends = friends.filter((f) => !f.online)

  const searchFilter = (list: Friend[]) =>
    list.filter((f) => f.nickname.toLowerCase().includes(search.toLowerCase()))

  const pendingInvites = roomInvites.filter((i) => i.status === 'pending')
  const historyInvites = roomInvites.filter((i) => i.status !== 'pending')

  const handleSendInvite = (friend: Friend) => {
    const room = currentRoom || sampleRooms[0]
    sendRoomInvite(friend.id, room)
    showToast(`✅ 已向 ${friend.nickname} 发送房间邀请`)
  }

  const handleAcceptInvite = (inviteId: string) => {
    const room = acceptInvite(inviteId)
    if (room) {
      enterRoom(room)
      showToast('✅ 已接受邀请，正在进入房间...')
      setTimeout(() => window.electronAPI.openWindow('room'), 800)
    }
  }

  const handleDeclineInvite = (inviteId: string) => {
    declineInvite(inviteId)
    showToast('已拒绝邀请')
  }

  const handleCreateAppointment = () => {
    if (!partnerId || !apptDate || !apptTime || !apptTopic) {
      showToast('⚠️ 请填写完整预约信息')
      return
    }
    createAppointment({
      partnerId,
      time: `${apptDate} ${apptTime}`,
      topic: apptTopic,
      language: apptLang,
    })
    showToast('✅ 预约已发送！等待对方确认')
    setPartnerId('')
    setApptDate('')
    setApptTime('')
    setApptTopic('')
  }

  const handleConfirm = (id: string) => {
    confirmAppointment(id)
    showToast('✅ 已确认预约')
  }

  const handleCancel = (id: string) => {
    cancelAppointment(id)
    showToast('已取消预约')
  }

  const favoriteRoomList = sampleRooms.filter((r) => favoriteRooms.includes(r.id))

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
        <button
          className="btn btn-small btn-secondary"
          onClick={() => handleSendInvite(friend)}
        >
          🎮 邀请
        </button>
      </div>
    </div>
  )

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
        <div className="flex gap-12 items-center">
          <h1 className="window-title">👥 好友搭子</h1>
          {pendingInvites.length > 0 && (
            <span className="badge badge-red">{pendingInvites.length} 条新邀请</span>
          )}
        </div>
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
          ✉️ 邀请 ({pendingInvites.length})
        </button>
        <button className={`tab-item ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>
          📅 预约 ({appointments.filter((a) => a.status !== 'cancelled').length})
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
          {currentRoom && (
            <div className="card mb-16" style={{ borderColor: 'var(--success)' }}>
              <div className="flex flex-between items-center">
                <div>
                  <div className="text-sm text-muted">当前房间</div>
                  <div className="font-bold">🎙️ {currentRoom.name}</div>
                </div>
                <span className="badge badge-green">可邀请好友</span>
              </div>
            </div>
          )}
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
          <h3 className="font-bold mb-12">📥 待处理邀请</h3>
          {pendingInvites.length === 0 ? (
            <div className="text-center text-muted py-12">
              <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
              暂无新邀请
            </div>
          ) : (
            pendingInvites.map((inv) => (
              <div key={inv.id} className="list-item">
                <div className="flex gap-12">
                  <div
                    className="avatar avatar-small"
                    style={{ background: inv.fromAvatar.color, width: 48, height: 48, fontSize: 24 }}
                  >
                    {inv.fromAvatar.emoji}
                  </div>
                  <div>
                    <div className="font-bold">
                      {inv.fromName}
                      {inv.isFromMe && <span className="text-sm text-muted ml-8">(我发出的)</span>}
                      <span className="text-sm text-muted ml-8">邀请你进入房间</span>
                    </div>
                    <div className="text-sm text-secondary">{inv.roomName}</div>
                    <div className="text-xs text-muted mt-4">{inv.time}</div>
                  </div>
                </div>
                {!inv.isFromMe && (
                  <div className="flex gap-8">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeclineInvite(inv.id)}
                    >
                      拒绝
                    </button>
                    <button
                      className="btn btn-small btn-success"
                      onClick={() => handleAcceptInvite(inv.id)}
                    >
                      接受
                    </button>
                  </div>
                )}
                {inv.isFromMe && <span className="badge badge-yellow">等待对方处理</span>}
              </div>
            ))
          )}

          {historyInvites.length > 0 && (
            <>
              <h3 className="font-bold mb-12 mt-24">📜 历史记录</h3>
              {historyInvites.map((inv) => (
                <div key={inv.id} className="list-item" style={{ opacity: 0.7 }}>
                  <div>
                    <div className="font-bold">
                      {inv.fromName} <span className="text-sm text-muted">→ {inv.roomName}</span>
                    </div>
                    <div className="text-xs text-muted mt-4">{inv.time}</div>
                  </div>
                  <span
                    className={`badge ${inv.status === 'accepted' ? 'badge-green' : 'badge-red'}`}
                  >
                    {inv.status === 'accepted' ? '✅ 已接受' : '❌ 已拒绝'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          <div className="card mb-16" style={{ borderColor: 'var(--accent)' }}>
            <h3 className="font-bold mb-12">🎯 预约新搭子</h3>
            <div className="grid grid-2 gap-12 mb-12">
              <select
                className="select"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
              >
                <option value="">选择好友</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nickname} (Lv.{f.level})
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="input"
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
              />
            </div>
            <div className="grid grid-2 gap-12 mb-12">
              <input
                type="time"
                className="input"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
              />
              <select
                className="select"
                value={apptLang}
                onChange={(e) => setApptLang(e.target.value as Language)}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              className="input mb-12"
              placeholder="练习主题（如：餐厅点餐情景对话）"
              value={apptTopic}
              onChange={(e) => setApptTopic(e.target.value)}
            />
            <button className="btn w-full" onClick={handleCreateAppointment}>
              📅 发送预约
            </button>
          </div>

          <h3 className="font-bold mb-12">📌 我的预约</h3>
          {appointments.filter((a) => a.status !== 'cancelled').length === 0 ? (
            <div className="text-center text-muted py-12">暂无预约，快去约一个搭子吧！</div>
          ) : (
            appointments
              .filter((a) => a.status !== 'cancelled')
              .map((ap) => (
                <div key={ap.id} className="list-item">
                  <div className="flex gap-12">
                    <div
                      className="avatar avatar-small"
                      style={{ background: ap.partnerAvatar.color, width: 48, height: 48, fontSize: 24 }}
                    >
                      {ap.partnerAvatar.emoji}
                    </div>
                    <div>
                      <div className="flex gap-8 mb-4">
                        <span className="font-bold">{ap.partnerName}</span>
                        <span
                          className={`badge ${
                            ap.status === 'confirmed' ? 'badge-green' : 'badge-yellow'
                          }`}
                        >
                          {ap.status === 'confirmed' ? '✅ 已确认' : '⏳ 待确认'}
                        </span>
                        <span className="badge badge-blue">
                          {languages.find((l) => l.value === ap.language)?.flag}
                        </span>
                      </div>
                      <div className="text-sm text-secondary">🎯 {ap.topic}</div>
                      <div className="text-sm text-muted mt-4">🕐 {ap.time}</div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    {ap.status === 'pending' && (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleConfirm(ap.id)}
                      >
                        确认
                      </button>
                    )}
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleCancel(ap.id)}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div>
          <h3 className="font-bold mb-12">⭐ 收藏的房间</h3>
          {favoriteRoomList.length === 0 ? (
            <div className="text-center text-muted py-12">
              <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
              还没有收藏任何房间
            </div>
          ) : (
            favoriteRoomList.map((room) => (
              <div
                key={room.id}
                className="list-item"
                onClick={() => {
                  enterRoom(room)
                  window.electronAPI.openWindow('room')
                }}
              >
                <div>
                  <div className="font-bold">{room.name}</div>
                  <div className="text-sm text-muted">
                    房主: {room.host} · {languages.find((l) => l.value === room.language)?.label}
                  </div>
                </div>
                <div className="flex gap-8">
                  <span className="badge badge-blue">👥 {room.current}/{room.capacity}</span>
                  <button className="btn btn-small">进入</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default FriendsWindow
