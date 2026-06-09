import { create } from 'zustand'
import type {
  AppState,
  Language,
  Theme,
  Difficulty,
  Avatar,
  Participant,
  TaskCard,
  Hint,
  PlaybackItem,
  Friend,
  Badge,
  StudyPlan,
  SubtitleLine,
  Correction,
  RoomInvite,
  Appointment,
  Room,
  UserProfile,
  SavedItem,
  CollectionType,
  AssignedTask,
  TaskStatus,
  GroupTimer,
  FluencyReport,
  HintPreferences,
} from '@/types'

const STORAGE_KEY = 'metaverse-language-state'

const avatars: Avatar[] = [
  { id: 'a1', name: '小狐狸', emoji: '🦊', color: '#FF7043' },
  { id: 'a2', name: '小熊猫', emoji: '🐼', color: '#42A5F5' },
  { id: 'a3', name: '小猫咪', emoji: '🐱', color: '#FFB74D' },
  { id: 'a4', name: '小兔子', emoji: '🐰', color: '#F06292' },
  { id: 'a5', name: '小老虎', emoji: '🐯', color: '#FFA726' },
  { id: 'a6', name: '小企鹅', emoji: '🐧', color: '#5C6BC0' },
  { id: 'a7', name: '小海豚', emoji: '🐬', color: '#29B6F6' },
  { id: 'a8', name: '小狮子', emoji: '🦁', color: '#EF6C00' },
]

const sampleParticipants: Participant[] = [
  { id: 'u1', nickname: '我', avatar: avatars[0], nameplate: '努力学习英语 ✨', defaultEmoji: '😊', seat: 1, muted: false, handRaised: false, group: 1, isHost: true, isSpeaking: false },
  { id: 'u2', nickname: 'Alice', avatar: avatars[1], nameplate: '英语爱好者', defaultEmoji: '😄', seat: 2, muted: true, handRaised: false, group: 1, isHost: false, isSpeaking: false },
  { id: 'u3', nickname: '小明', avatar: avatars[2], nameplate: '日语入门中', defaultEmoji: '🤔', seat: 3, muted: false, handRaised: true, group: 2, isHost: false, isSpeaking: false },
  { id: 'u4', nickname: 'Sakura', avatar: avatars[3], nameplate: '日本語マスター', defaultEmoji: '🥰', seat: 4, muted: false, handRaised: false, group: 2, isHost: false, isSpeaking: false },
  { id: 'u5', nickname: 'David', avatar: avatars[4], nameplate: 'Business English Pro', defaultEmoji: '😎', seat: 5, muted: true, handRaised: false, group: 1, isHost: false, isSpeaking: false },
  { id: 'u6', nickname: '小红', avatar: avatars[5], nameplate: '韩语初级', defaultEmoji: '💪', seat: 6, muted: false, handRaised: false, group: 2, isHost: false, isSpeaking: false },
]

const sampleTasks: TaskCard[] = [
  {
    id: 't1', title: '餐厅点餐', theme: 'restaurant', difficulty: 'beginner',
    description: '模拟在西餐厅点餐的场景，练习如何询问菜单、点餐、结账等常用表达。',
    dialog: ['Waiter: Good evening! Do you have a reservation?', 'You: Yes, under the name Smith.', 'Waiter: Right this way please.'],
    keyVocabulary: ['reservation', 'menu', 'appetizer', 'dessert', 'bill'],
    keyPatterns: ["I'd like to order...", "Could you recommend...", "May I have the bill?"],
  },
  {
    id: 't2', title: '机场问路', theme: 'travel', difficulty: 'intermediate',
    description: '在国外机场寻找登机口，练习问路和理解方向指引的表达。',
    dialog: ['You: Excuse me, where is Gate B12?', 'Staff: Take the escalator to level 2 and turn left.', 'You: Thank you very much!'],
    keyVocabulary: ['terminal', 'gate', 'escalator', 'boarding pass', 'customs'],
    keyPatterns: ['Could you tell me the way to...', 'How do I get to...', 'Is it far from here?'],
  },
  {
    id: 't3', title: '工作面试', theme: 'interview', difficulty: 'advanced',
    description: '模拟英文工作面试场景，练习自我介绍、回答问题和提问环节。',
    dialog: ['Interviewer: Tell me about yourself.', 'You: I have 5 years of experience in...', 'Interviewer: What are your strengths?'],
    keyVocabulary: ['experience', 'strengths', 'weaknesses', 'motivation', 'responsibility'],
    keyPatterns: ['I believe my greatest strength is...', "I'm looking for an opportunity to...", 'Could you tell me more about...'],
  },
  {
    id: 't4', title: '商场购物', theme: 'shopping', difficulty: 'beginner',
    description: '在商场购物的日常场景，练习询问价格、试穿、讨价还价等。',
    dialog: ['Shop assistant: Can I help you?', 'You: Yes, does this come in blue?', 'Shop assistant: Yes, what size are you?'],
    keyVocabulary: ['size', 'color', 'discount', 'fitting room', 'receipt'],
    keyPatterns: ["How much is this?", "Do you have this in...", "Can I try it on?"],
  },
]

const sampleHints: Hint[] = [
  { id: 'h1', type: 'vocabulary', content: 'Recommendation', translation: '推荐', example: "I'd like your recommendation." },
  { id: 'h2', type: 'pattern', content: 'Could you + verb...', translation: '用于礼貌地请求别人做某事', example: 'Could you pass the salt?' },
  { id: 'h3', type: 'pronunciation', content: 'reservation', translation: '/ˌrezərˈveɪʃn/', example: '注意重音在第三音节' },
  { id: 'h4', type: 'vocabulary', content: 'Medium rare', translation: '三分熟（牛排）', example: "I'd like my steak medium rare." },
  { id: 'h5', type: 'pattern', content: 'I would like to...', translation: '我想要...（礼貌表达）', example: 'I would like to order a coffee.' },
]

const sampleSavedItems: SavedItem[] = [
  { id: 'sv1', type: 'vocabulary', content: 'reservation', translation: '预约、预订', example: "I'd like to make a reservation.", source: '餐厅点餐-回放', createdAt: '2026-06-09 20:45' },
  { id: 'sv2', type: 'pattern', content: "I'd like to...", translation: '我想要...（礼貌表达）', example: "I'd like to order a coffee.", source: '提示窗口收藏', createdAt: '2026-06-08 19:30' },
]

const sampleAssignedTasks: AssignedTask[] = []

const sampleGroupTimers: GroupTimer[] = [
  { groupId: 1, startTime: null, duration: 300, running: false },
  { groupId: 2, startTime: null, duration: 300, running: false },
]

const sampleRecordings: PlaybackItem[] = [
  {
    id: 'r1', date: '2026-06-09 20:30', duration: 1800, roomName: '英语口语-餐厅点餐-中级', roomId: 'r2',
    subtitle: '我想要点一份牛排和一杯红酒。', subtitles: [],
    corrections: [
      { timestamp: 120, original: 'I want eat steak', corrected: "I'd like to eat a steak", note: "使用 I'd like to 更礼貌，steak 前加冠词 a" },
      { timestamp: 360, original: 'How many is it?', corrected: 'How much is it?', note: '价格用 much，数量用 many' },
    ],
    report: {
      overallScore: 72, pronunciationScore: 75, grammarScore: 68, fluencyScore: 74, vocabularyScore: 71,
      highlights: ['发音清晰，表达流畅', '正确使用了点餐核心词汇'],
      suggestions: ['注意 "I want" 和 "I\'d like to" 的使用场景', '价格提问用 How much 而非 How many'],
      totalWords: 245, uniqueWords: 68, speakingTime: 980,
    },
  },
  {
    id: 'r2', date: '2026-06-08 19:00', duration: 2400, roomName: '英语面试-高级', roomId: 'r4',
    subtitle: '我在项目管理方面有丰富经验。', subtitles: [],
    corrections: [
      { timestamp: 240, original: 'I have many experience', corrected: 'I have much experience', note: 'experience 是不可数名词，用 much' },
    ],
  },
  {
    id: 'r3', date: '2026-06-07 21:15', duration: 1500, roomName: '日语入门-日常对话', roomId: 'r3',
    subtitle: 'こんにちは、元気ですか？', subtitles: [],
    corrections: [],
  },
]

const sampleFriends: Friend[] = [
  { id: 'f1', nickname: 'Alice', avatar: avatars[1], online: true, level: 12 },
  { id: 'f2', nickname: '小明', avatar: avatars[2], online: true, level: 8 },
  { id: 'f3', nickname: 'Sakura', avatar: avatars[3], online: false, level: 15 },
  { id: 'f4', nickname: 'David', avatar: avatars[4], online: true, level: 20 },
  { id: 'f5', nickname: '小红', avatar: avatars[5], online: false, level: 6 },
  { id: 'f6', nickname: 'Mike', avatar: avatars[6], online: false, level: 18 },
]

const sampleInvites: RoomInvite[] = [
  {
    id: 'inv1', fromId: 'f1', fromName: 'Alice', fromAvatar: avatars[1],
    roomId: 'r1', roomName: '英语角-日常对话', time: '5分钟前',
    status: 'pending', isFromMe: false,
  },
]

const sampleAppointments: Appointment[] = [
  {
    id: 'ap1', partnerId: 'f3', partnerName: 'Sakura', partnerAvatar: avatars[3],
    time: '2026-06-11 20:00', topic: '日语五十音入门', language: 'ja',
    status: 'confirmed', createdAt: '2026-06-09 18:00',
  },
]

const sampleBadges: Badge[] = [
  { id: 'b1', name: '初学者', description: '完成首次会话练习', icon: '🌱', unlocked: true, progress: 100 },
  { id: 'b2', name: '勤学者', description: '累计练习10小时', icon: '📚', unlocked: true, progress: 100 },
  { id: 'b3', name: '社交达人', description: '添加10位好友', icon: '🤝', unlocked: true, progress: 100 },
  { id: 'b4', name: '流利演说家', description: '完成50次高级难度会话', icon: '🎤', unlocked: false, progress: 60 },
  { id: 'b5', name: '语言大师', description: '掌握3种以上语言', icon: '👑', unlocked: false, progress: 33 },
  { id: 'b6', name: '坚持不懈', description: '连续学习30天', icon: '🔥', unlocked: false, progress: 45 },
  { id: 'b7', name: '纠错达人', description: '纠正100处错误', icon: '✏️', unlocked: false, progress: 25 },
  { id: 'b8', name: '金牌搭档', description: '与好友完成20次共同练习', icon: '💎', unlocked: false, progress: 15 },
]

const samplePlans: StudyPlan[] = [
  { id: 'p1', title: '每日口语30分钟', target: '连续练习30天', deadline: '2026-07-10', progress: 70, createdAt: '2026-05-10', checkIns: [] },
  { id: 'p2', title: '攻克面试英语', target: '完成20次高级面试模拟', deadline: '2026-07-30', progress: 35, createdAt: '2026-05-20', checkIns: [] },
  { id: 'p3', title: '日语N3冲刺', target: '掌握500个N3词汇', deadline: '2026-08-15', progress: 20, createdAt: '2026-06-01', checkIns: [] },
]

const sampleCustomRooms: Room[] = []

const defaultState: AppState = {
  currentWindow: 'lobby',
  profile: {
    id: 'me',
    nickname: '语言学习者',
    avatar: avatars[0],
    nameplate: '努力学习英语 ✨',
    defaultEmoji: '😊',
    level: 10,
    totalMinutes: 720,
    sessions: 45,
    fluency: 68,
  },
  selectedLanguage: 'en',
  selectedTheme: 'restaurant',
  selectedDifficulty: 'intermediate',
  currentRoom: null,
  participants: sampleParticipants,
  tasks: sampleTasks,
  activeTask: sampleTasks[0],
  hints: sampleHints,
  liveSubtitles: [
    { id: 's1', speaker: '小明', speakerId: 'u3', speakerAvatar: avatars[2], speakerEmoji: '🤔', text: 'Excuse me, how can I get to the nearest subway station?', timestamp: 0, isMe: false },
    { id: 's2', speaker: 'Alice', speakerId: 'u2', speakerAvatar: avatars[1], speakerEmoji: '😄', text: 'Go straight for two blocks, then turn left at the traffic lights.', timestamp: 15, isMe: false },
  ],
  recordings: sampleRecordings,
  isRecording: false,
  recordingStartTime: null,
  friends: sampleFriends,
  roomInvites: sampleInvites,
  appointments: sampleAppointments,
  favoriteRooms: ['r1', 'r3'],
  badges: sampleBadges,
  studyPlans: samplePlans,
  savedItems: sampleSavedItems,
  assignedTasks: sampleAssignedTasks,
  groupTimers: sampleGroupTimers,
  turnOrder: null,
  customRooms: sampleCustomRooms,
  currentRound: 1,
  namedSpeakerId: null,
  showAIRecommendation: true,
  hintPreferences: {
    difficulty: 'intermediate',
    focusTypes: ['vocabulary', 'pattern'],
    autoSpeak: true,
  },
}

function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return null
  }
}

function saveToStorage(state: AppState) {
  try {
    const toSave = {
      profile: state.profile,
      recordings: state.recordings,
      studyPlans: state.studyPlans,
      roomInvites: state.roomInvites,
      appointments: state.appointments,
      favoriteRooms: state.favoriteRooms,
      selectedLanguage: state.selectedLanguage,
      selectedTheme: state.selectedTheme,
      selectedDifficulty: state.selectedDifficulty,
      savedItems: state.savedItems,
      tasks: state.tasks,
      customRooms: state.customRooms,
      friends: state.friends,
      showAIRecommendation: state.showAIRecommendation,
      hintPreferences: state.hintPreferences,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    /* noop */
  }
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function formatDate(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function generateFluencyReport(duration: number, subtitles: SubtitleLine[], corrections: Correction[]): FluencyReport {
  const mySubs = subtitles.filter((s) => s.isMe)
  const totalWords = mySubs.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0)
  const uniqueWords = new Set(mySubs.flatMap((s) => s.text.toLowerCase().split(/\s+/).filter(Boolean))).size
  const base = 60 + Math.floor(Math.random() * 20)
  const corr = corrections.length
  return {
    overallScore: Math.min(100, base + Math.floor(Math.random() * 15)),
    pronunciationScore: Math.min(100, base + Math.floor(Math.random() * 15)),
    grammarScore: Math.max(40, Math.min(100, base - corr * 3 + Math.floor(Math.random() * 10))),
    fluencyScore: Math.min(100, base + 5 + Math.floor(Math.random() * 15)),
    vocabularyScore: Math.min(100, Math.floor(uniqueWords * 1.5)),
    highlights: [
      '发音清晰，表达流畅',
      uniqueWords > 30 ? '词汇量丰富，表达多样' : '尝试使用更多词汇来丰富表达',
    ],
    suggestions: [
      corr > 0 ? '注意语法细节，多练习常用句型' : '语法掌握良好，继续保持',
      '可以尝试使用更复杂的从句来提升表达水平',
    ],
    totalWords,
    uniqueWords,
    speakingTime: Math.floor(duration * 0.5),
  }
}

export const useAppStore = create<AppState & {
  updateProfile: (p: Partial<UserProfile>) => void
  startRecording: () => void
  stopRecording: () => PlaybackItem | null
  addSubtitle: (line: Omit<SubtitleLine, 'id' | 'timestamp'>) => void
  addLiveCorrection: (corr: Omit<Correction, 'timestamp'>) => void
  sendRoomInvite: (friendId: string, room: Room) => void
  acceptInvite: (inviteId: string) => Room | null
  declineInvite: (inviteId: string) => void
  createAppointment: (data: { partnerId: string; time: string; topic: string; language: Language }) => void
  confirmAppointment: (id: string) => void
  cancelAppointment: (id: string) => void
  createStudyPlan: (data: { title: string; target: string; deadline: string }) => void
  checkInPlan: (id: string) => void
  deleteStudyPlan: (id: string) => void
  completeSession: (minutes: number) => void
  enterRoom: (room: Room) => void
  leaveRoom: () => void
  syncToWindows: <K extends keyof AppState>(key: K, value: AppState[K]) => void
  saveItem: (data: { type: CollectionType; content: string; translation: string; example?: string; source: string }) => void
  deleteSavedItem: (id: string) => void
  assignTaskToMember: (taskCardId: string, assigneeId: string, roundNumber: number) => void
  updateAssignedTaskStatus: (id: string, status: TaskStatus) => void
  setActiveTaskByCard: (taskCardId: string) => void
  startGroupTimer: (groupId: number, durationSec: number) => void
  stopGroupTimer: (groupId: number) => void
  nameSpeaker: (participantId: string) => void
  clearNamedSpeaker: () => void
  nextTurn: () => void
  createRoom: (data: { name: string; language: Language; theme: Theme; difficulty: Difficulty; capacity: number }) => Room
  addFriend: (data: { nickname: string; avatar: Avatar }) => void
  createCustomTask: (data: { title: string; theme: Theme; difficulty: Difficulty; description: string; dialog: string[]; keyVocabulary: string[]; keyPatterns: string[] }) => void
  exportSubtitles: (recordingId: string) => string
  enterRoomFromAppointment: (appointmentId: string) => Room | null
  acceptAssignedTask: (assignedTaskId: string) => void
  toggleAIRecommendation: () => void
  updateHintPreferences: (prefs: Partial<HintPreferences>) => void
}>((set, get) => {
  const stored = loadFromStorage()

  let mergedState: AppState = {
    ...defaultState,
    ...stored,
  } as AppState

  const syncedParticipants = mergedState.participants.map((pp) =>
    pp.id === 'u1'
      ? {
          ...pp,
          nickname: mergedState.profile.nickname,
          avatar: mergedState.profile.avatar,
          nameplate: mergedState.profile.nameplate,
          defaultEmoji: mergedState.profile.defaultEmoji,
        }
      : pp
  )
  mergedState = { ...mergedState, participants: syncedParticipants }

  return {
    ...mergedState,

    updateProfile: (p) => {
      const newProfile = { ...get().profile, ...p }
      set({ profile: newProfile })
      const updated = get()
      saveToStorage(updated)
      updated.syncToWindows('profile', newProfile)
      const parts = updated.participants.map((pp) =>
        pp.id === 'u1'
          ? { ...pp, nickname: newProfile.nickname, avatar: newProfile.avatar, nameplate: newProfile.nameplate, defaultEmoji: newProfile.defaultEmoji }
          : pp
      )
      set({ participants: parts })
      get().syncToWindows('participants', parts)
    },

    startRecording: () => {
      set({
        isRecording: true,
        recordingStartTime: Date.now(),
        liveSubtitles: [],
      })
      get().syncToWindows('isRecording', true)
    },

    stopRecording: () => {
      const state = get()
      if (!state.isRecording || !state.recordingStartTime) return null

      const duration = Math.max(1, Math.floor((Date.now() - state.recordingStartTime) / 1000))
      const minutes = Math.ceil(duration / 60)

      let finalSubtitles = [...state.liveSubtitles]

      if (finalSubtitles.length < 3) {
        const fallbackSubtitles: SubtitleLine[] = []
        const otherParticipants = state.participants.filter((p) => p.id !== 'u1')
        const other = otherParticipants[0] || state.participants[1]

        const fallbackLines = [
          { text: "Hi! How's it going today?", isMe: false },
          { text: "I'm good, thanks! I've been practicing English.", isMe: true },
          { text: "That's great! What did you learn recently?", isMe: false },
          { text: "I learned some useful phrases for ordering food.", isMe: true },
          { text: "Nice! Can you teach me some?", isMe: false },
        ]

        const count = 3 + Math.floor(Math.random() * 3)
        const selectedLines = fallbackLines.slice(0, count)

        let ts = 0
        selectedLines.forEach((line, idx) => {
          if (line.isMe) {
            fallbackSubtitles.push({
              id: generateId('sub'),
              speaker: state.profile.nickname,
              speakerId: 'u1',
              speakerAvatar: state.profile.avatar,
              speakerEmoji: state.profile.defaultEmoji,
              text: line.text,
              timestamp: ts,
              isMe: true,
            })
          } else {
            fallbackSubtitles.push({
              id: generateId('sub'),
              speaker: other?.nickname || 'Partner',
              speakerId: other?.id || 'u2',
              speakerAvatar: other?.avatar,
              speakerEmoji: other?.defaultEmoji,
              text: line.text,
              timestamp: ts,
              isMe: false,
            })
          }
          ts += 10
        })

        finalSubtitles = fallbackSubtitles
      }

      const subtitle = finalSubtitles[finalSubtitles.length - 1].text

      let generatedCorrections: Correction[] = finalSubtitles
        .filter((s) => s.isMe && Math.random() > 0.6)
        .slice(0, 3)
        .map((s) => ({
          timestamp: s.timestamp,
          original: s.text,
          corrected: s.text.replace(/\bwant\b/g, "would like").replace(/\bmany\b/g, 'much'),
          note: '建议使用更礼貌/更准确的表达方式',
        }))

      if (generatedCorrections.length < 2) {
        const mySubs = finalSubtitles.filter((s) => s.isMe)
        const needed = 2 - generatedCorrections.length
        for (let i = 0; i < Math.min(needed, mySubs.length); i++) {
          const s = mySubs[i]
          generatedCorrections.push({
            timestamp: s.timestamp,
            original: s.text,
            corrected: s.text.replace(/\bI'm\b/g, 'I am').replace(/\bgreat\b/g, 'wonderful'),
            note: '可以尝试使用更正式/丰富的表达',
          })
        }
      }

      const report = generateFluencyReport(duration, finalSubtitles, generatedCorrections)

      const recording: PlaybackItem = {
        id: generateId('rec'),
        date: formatDate(new Date()),
        duration,
        roomName: state.currentRoom?.name || '自由练习',
        roomId: state.currentRoom?.id || '',
        subtitle,
        subtitles: finalSubtitles,
        corrections: generatedCorrections,
        report,
      }

      const newRecordings = [recording, ...state.recordings]
      set({
        recordings: newRecordings,
        isRecording: false,
        recordingStartTime: null,
      })
      saveToStorage(get())
      get().syncToWindows('recordings', newRecordings)
      get().syncToWindows('isRecording', false)

      get().completeSession(minutes)
      return recording
    },

    addSubtitle: (line) => {
      const state = get()
      const speaker = state.participants.find((p) => p.id === line.speakerId)
      const newLine: SubtitleLine = {
        ...line,
        speakerAvatar: speaker?.avatar,
        speakerEmoji: speaker?.defaultEmoji,
        id: generateId('sub'),
        timestamp: state.recordingStartTime
          ? Math.floor((Date.now() - state.recordingStartTime) / 1000)
          : state.liveSubtitles.length * 15,
      }
      const subtitles = [...state.liveSubtitles, newLine]
      set({ liveSubtitles: subtitles })
      get().syncToWindows('liveSubtitles', subtitles)
    },

    addLiveCorrection: (corr) => {
      /* placeholder */
    },

    sendRoomInvite: (friendId, room) => {
      const state = get()
      const friend = state.friends.find((f) => f.id === friendId)
      if (!friend) return
      const invite: RoomInvite = {
        id: generateId('inv'),
        fromId: state.profile.id,
        fromName: state.profile.nickname,
        fromAvatar: state.profile.avatar,
        roomId: room.id,
        roomName: room.name,
        time: '刚刚',
        status: 'pending',
        isFromMe: true,
      }
      const invites = [invite, ...state.roomInvites]
      set({ roomInvites: invites })
      saveToStorage(get())
      get().syncToWindows('roomInvites', invites)
    },

    acceptInvite: (inviteId) => {
      const state = get()
      const invite = state.roomInvites.find((i) => i.id === inviteId)
      if (!invite) return null
      const invites = state.roomInvites.map((i) =>
        i.id === inviteId ? { ...i, status: 'accepted' as const } : i
      )
      set({ roomInvites: invites })
      saveToStorage(get())
      get().syncToWindows('roomInvites', invites)

      const allRooms = [...getAllSampleRooms(), ...state.customRooms]
      const room = allRooms.find((r) => r.id === invite.roomId) || allRooms[0]
      get().enterRoom(room)
      return room
    },

    declineInvite: (inviteId) => {
      const state = get()
      const invites = state.roomInvites.map((i) =>
        i.id === inviteId ? { ...i, status: 'declined' as const } : i
      )
      set({ roomInvites: invites })
      saveToStorage(get())
      get().syncToWindows('roomInvites', invites)
    },

    createAppointment: (data) => {
      const state = get()
      const friend = state.friends.find((f) => f.id === data.partnerId)
      if (!friend) return
      const appointment: Appointment = {
        id: generateId('ap'),
        partnerId: data.partnerId,
        partnerName: friend.nickname,
        partnerAvatar: friend.avatar,
        time: data.time,
        topic: data.topic,
        language: data.language,
        status: 'pending',
        createdAt: formatDate(new Date()),
      }
      const list = [appointment, ...state.appointments]
      set({ appointments: list })
      saveToStorage(get())
      get().syncToWindows('appointments', list)
    },

    confirmAppointment: (id) => {
      const state = get()
      const list = state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'confirmed' as const } : a
      )
      set({ appointments: list })
      saveToStorage(get())
      get().syncToWindows('appointments', list)
    },

    cancelAppointment: (id) => {
      const state = get()
      const list = state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      )
      set({ appointments: list })
      saveToStorage(get())
      get().syncToWindows('appointments', list)
    },

    createStudyPlan: (data) => {
      const state = get()
      const plan: StudyPlan = {
        id: generateId('plan'),
        title: data.title,
        target: data.target,
        deadline: data.deadline,
        progress: 0,
        createdAt: formatDate(new Date()),
        checkIns: [],
      }
      const list = [plan, ...state.studyPlans]
      set({ studyPlans: list })
      saveToStorage(get())
      get().syncToWindows('studyPlans', list)
    },

    checkInPlan: (id) => {
      const state = get()
      const today = new Date().toISOString().slice(0, 10)
      const list = state.studyPlans.map((p) => {
        if (p.id !== id) return p
        if (p.checkIns.includes(today)) return p
        const newCheckIns = [...p.checkIns, today]
        const newProgress = Math.min(100, p.progress + 5)
        return { ...p, checkIns: newCheckIns, progress: newProgress }
      })
      set({ studyPlans: list })
      saveToStorage(get())
      get().syncToWindows('studyPlans', list)
    },

    deleteStudyPlan: (id) => {
      const state = get()
      const list = state.studyPlans.filter((p) => p.id !== id)
      set({ studyPlans: list })
      saveToStorage(get())
      get().syncToWindows('studyPlans', list)
    },

    completeSession: (minutes) => {
      const state = get()
      const newProfile = {
        ...state.profile,
        totalMinutes: state.profile.totalMinutes + minutes,
        sessions: state.profile.sessions + 1,
        fluency: Math.min(100, state.profile.fluency + Math.floor(Math.random() * 3)),
        level: Math.floor((state.profile.totalMinutes + minutes) / 120) + 1,
      }
      set({ profile: newProfile })

      const newBadges = state.badges.map((b) => {
        if (b.unlocked) return b
        let progress = b.progress
        if (b.id === 'b2' && newProfile.totalMinutes >= 600) progress = 100
        if (b.id === 'b4') progress = Math.min(100, b.progress + 2)
        return {
          ...b,
          progress,
          unlocked: progress >= 100,
        }
      })
      set({ badges: newBadges })
      saveToStorage(get())
      get().syncToWindows('profile', newProfile)
      get().syncToWindows('badges', newBadges)
    },

    enterRoom: (room) => {
      set({ currentRoom: room })
      get().syncToWindows('currentRoom', room)
    },

    leaveRoom: () => {
      set({ currentRoom: null, namedSpeakerId: null, assignedTasks: [], turnOrder: null, currentRound: 1 })
      get().syncToWindows('currentRoom', null)
    },

    syncToWindows: (key, value) => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        ;(window as any).electronAPI.updateState(key, value)
      }
    },

    saveItem: (data) => {
      const state = get()
      const item: SavedItem = {
        id: generateId('sv'),
        ...data,
        createdAt: formatDate(new Date()),
      }
      const list = [item, ...state.savedItems]
      set({ savedItems: list })
      saveToStorage(get())
      get().syncToWindows('savedItems', list)
    },

    deleteSavedItem: (id) => {
      const state = get()
      const list = state.savedItems.filter((i) => i.id !== id)
      set({ savedItems: list })
      saveToStorage(get())
      get().syncToWindows('savedItems', list)
    },

    assignTaskToMember: (taskCardId, assigneeId, roundNumber) => {
      const state = get()
      const task = state.tasks.find((t) => t.id === taskCardId)
      const assignee = state.participants.find((p) => p.id === assigneeId)
      if (!task || !assignee) return
      const assigned: AssignedTask = {
        id: generateId('atk'),
        taskCardId,
        assigneeId,
        assigneeName: assignee.nickname,
        assignedAt: formatDate(new Date()),
        status: 'pending',
        roundNumber,
      }
      const list = [assigned, ...state.assignedTasks]
      set({ assignedTasks: list, activeTask: task, currentRound: roundNumber })
      get().syncToWindows('assignedTasks', list)
      get().syncToWindows('activeTask', task)
      get().syncToWindows('currentRound', roundNumber)
    },

    updateAssignedTaskStatus: (id, status) => {
      const state = get()
      const list = state.assignedTasks.map((t) =>
        t.id === id ? { ...t, status } : t
      )
      set({ assignedTasks: list })
      get().syncToWindows('assignedTasks', list)
    },

    setActiveTaskByCard: (taskCardId) => {
      const state = get()
      const task = state.tasks.find((t) => t.id === taskCardId)
      if (!task) return
      set({ activeTask: task })
      get().syncToWindows('activeTask', task)
    },

    startGroupTimer: (groupId, durationSec) => {
      const state = get()
      const timers = state.groupTimers.map((t) =>
        t.groupId === groupId ? { ...t, startTime: Date.now(), duration: durationSec, running: true } : t
      )
      set({ groupTimers: timers })
      get().syncToWindows('groupTimers', timers)
    },

    stopGroupTimer: (groupId) => {
      const state = get()
      const timers = state.groupTimers.map((t) =>
        t.groupId === groupId ? { ...t, startTime: null, running: false } : t
      )
      set({ groupTimers: timers })
      get().syncToWindows('groupTimers', timers)
    },

    nameSpeaker: (participantId) => {
      const state = get()
      const parts = state.participants.map((p) =>
        p.id === participantId ? { ...p, isSpeaking: true } : { ...p, isSpeaking: false }
      )
      set({ namedSpeakerId: participantId, participants: parts })
      get().syncToWindows('namedSpeakerId', participantId)
      get().syncToWindows('participants', parts)
    },

    clearNamedSpeaker: () => {
      const state = get()
      const parts = state.participants.map((p) => ({ ...p, isSpeaking: false }))
      set({ namedSpeakerId: null, participants: parts })
      get().syncToWindows('namedSpeakerId', null)
      get().syncToWindows('participants', parts)
    },

    nextTurn: () => {
      const state = get()
      if (!state.turnOrder) {
        const order = {
          id: generateId('turn'),
          participantIds: state.participants.map((p) => p.id),
          currentIndex: 0,
          roundNumber: state.currentRound,
        }
        set({ turnOrder: order })
        get().nameSpeaker(order.participantIds[0])
        return
      }
      const nextIdx = (state.turnOrder.currentIndex + 1) % state.turnOrder.participantIds.length
      const newRound = nextIdx === 0 ? state.turnOrder.roundNumber + 1 : state.turnOrder.roundNumber
      const newOrder = { ...state.turnOrder, currentIndex: nextIdx, roundNumber: newRound }
      set({ turnOrder: newOrder, currentRound: newRound })
      get().syncToWindows('turnOrder', newOrder)
      get().syncToWindows('currentRound', newRound)
      get().nameSpeaker(newOrder.participantIds[nextIdx])
    },

    createRoom: (data) => {
      const state = get()
      const room: Room = {
        id: generateId('room'),
        name: data.name,
        language: data.language,
        theme: data.theme,
        difficulty: data.difficulty,
        capacity: data.capacity,
        current: 1,
        host: state.profile.nickname,
        hostId: state.profile.id,
        isCustom: true,
      }
      const list = [room, ...state.customRooms]
      set({ customRooms: list })
      saveToStorage(get())
      get().syncToWindows('customRooms', list)
      return room
    },

    addFriend: (data) => {
      const state = get()
      const friend: Friend = {
        id: generateId('f'),
        nickname: data.nickname,
        avatar: data.avatar,
        online: false,
        level: 1,
      }
      const list = [friend, ...state.friends]
      set({ friends: list })
      saveToStorage(get())
      get().syncToWindows('friends', list)
    },

    createCustomTask: (data) => {
      const state = get()
      const task: TaskCard = {
        id: generateId('t'),
        title: data.title,
        theme: data.theme,
        difficulty: data.difficulty,
        description: data.description,
        dialog: data.dialog,
        keyVocabulary: data.keyVocabulary,
        keyPatterns: data.keyPatterns,
      }
      const list = [task, ...state.tasks]
      set({ tasks: list, activeTask: task })
      saveToStorage(get())
      get().syncToWindows('tasks', list)
      get().syncToWindows('activeTask', task)
    },

    exportSubtitles: (recordingId) => {
      const state = get()
      const rec = state.recordings.find((r) => r.id === recordingId)
      if (!rec) return ''
      const lines = rec.subtitles.length > 0
        ? rec.subtitles.map((s) => `[${formatSec(s.timestamp)}] ${s.speaker}: ${s.text}`).join('\n')
        : rec.subtitle
      const content = `# ${rec.roomName}\n日期: ${rec.date}\n时长: ${formatMin(rec.duration)}\n\n## 字幕\n${lines}\n\n## 纠错\n${rec.corrections.map((c) => `[${formatSec(c.timestamp)}] ❌ ${c.original}\n    ✅ ${c.corrected}\n    💡 ${c.note}`).join('\n\n')}`
      if (typeof window !== 'undefined') {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${rec.roomName}_${rec.date.replace(/[:\s]/g, '_')}.txt`
        a.click()
        URL.revokeObjectURL(url)
      }
      return content
    },

    enterRoomFromAppointment: (appointmentId) => {
      const state = get()
      const apt = state.appointments.find((a) => a.id === appointmentId)
      if (!apt) return null

      let matchedTheme: Theme = 'daily'
      const topic = apt.topic.toLowerCase()
      if (/餐厅|点餐|咖啡|吃饭/.test(apt.topic) || /restaurant|cafe|coffee|food|dinner|lunch/.test(topic)) {
        matchedTheme = 'restaurant'
      } else if (/旅行|机场|问路|酒店/.test(apt.topic) || /travel|airport|hotel|trip|journey|direction/.test(topic)) {
        matchedTheme = 'travel'
      } else if (/面试|求职|工作/.test(apt.topic) || /interview|job|work|career|business/.test(topic)) {
        matchedTheme = 'interview'
      } else if (/购物|逛街|买/.test(apt.topic) || /shopping|buy|mall|store/.test(topic)) {
        matchedTheme = 'shopping'
      } else if (/商务|谈判|会议/.test(apt.topic) || /business|meeting|negotiation|conference/.test(topic)) {
        matchedTheme = 'business'
      }

      const room: Room = {
        id: generateId('room'),
        name: `${apt.partnerName} - ${apt.topic}`,
        language: apt.language,
        theme: matchedTheme,
        difficulty: 'intermediate',
        capacity: 2,
        current: 2,
        host: apt.partnerName,
        hostId: apt.partnerId,
        isCustom: true,
      }
      get().enterRoom(room)
      return room
    },

    acceptAssignedTask: (assignedTaskId) => {
      const state = get()
      const assigned = state.assignedTasks.find((t) => t.id === assignedTaskId)
      if (!assigned) return
      state.updateAssignedTaskStatus(assignedTaskId, 'accepted')
      state.setActiveTaskByCard(assigned.taskCardId)
      set({ currentRound: assigned.roundNumber })
      get().syncToWindows('currentRound', assigned.roundNumber)
    },

    toggleAIRecommendation: () => {
      const state = get()
      const newValue = !state.showAIRecommendation
      set({ showAIRecommendation: newValue })
      saveToStorage(get())
      get().syncToWindows('showAIRecommendation', newValue)
    },

    updateHintPreferences: (prefs) => {
      const state = get()
      const newPrefs = { ...state.hintPreferences, ...prefs }
      set({ hintPreferences: newPrefs })
      saveToStorage(get())
      get().syncToWindows('hintPreferences', newPrefs)
    },
  }
})

function formatSec(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatMin(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}分${s}秒`
}

export const { getState, setState } = useAppStore

export const avatarsList = avatars

export function getAllSampleRooms(): Room[] {
  return [
    { id: 'r1', name: '英语角-日常对话', language: 'en', theme: 'daily', difficulty: 'beginner', capacity: 6, current: 4, host: 'Alice', hostId: 'f1' },
    { id: 'r2', name: '餐厅点餐模拟', language: 'en', theme: 'restaurant', difficulty: 'intermediate', capacity: 4, current: 3, host: 'Mike', hostId: 'f6' },
    { id: 'r3', name: '日语入门-五十音', language: 'ja', theme: 'daily', difficulty: 'beginner', capacity: 8, current: 5, host: 'Sakura', hostId: 'f3' },
    { id: 'r4', name: '商务英语-谈判技巧', language: 'en', theme: 'business', difficulty: 'advanced', capacity: 4, current: 2, host: 'David', hostId: 'f4' },
    { id: 'r5', name: '韩语旅行会话', language: 'ko', theme: 'travel', difficulty: 'intermediate', capacity: 6, current: 6, host: 'Jihoon', hostId: 'f2' },
    { id: 'r6', name: '法语咖啡时光', language: 'fr', theme: 'restaurant', difficulty: 'beginner', capacity: 4, current: 1, host: 'Pierre', hostId: 'u4' },
  ]
}

export const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: '英语', flag: '🇺🇸' },
  { value: 'ja', label: '日语', flag: '🇯🇵' },
  { value: 'ko', label: '韩语', flag: '🇰🇷' },
  { value: 'fr', label: '法语', flag: '🇫🇷' },
  { value: 'de', label: '德语', flag: '🇩🇪' },
  { value: 'es', label: '西班牙语', flag: '🇪🇸' },
]

export const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'restaurant', label: '餐厅点餐', icon: '🍽️' },
  { value: 'travel', label: '旅行问路', icon: '✈️' },
  { value: 'interview', label: '工作面试', icon: '💼' },
  { value: 'shopping', label: '购物逛街', icon: '🛍️' },
  { value: 'daily', label: '日常生活', icon: '🏠' },
  { value: 'business', label: '商务谈判', icon: '📊' },
]

export const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner', label: '初级', color: '#4CAF50' },
  { value: 'intermediate', label: '中级', color: '#FF9800' },
  { value: 'advanced', label: '高级', color: '#F44336' },
]

export const expressions = [
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
