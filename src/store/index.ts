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
} from '@/types'

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
  { id: 'u1', nickname: '我', avatar: avatars[0], seat: 1, muted: false, handRaised: false, group: 1 },
  { id: 'u2', nickname: 'Alice', avatar: avatars[1], seat: 2, muted: true, handRaised: false, group: 1 },
  { id: 'u3', nickname: '小明', avatar: avatars[2], seat: 3, muted: false, handRaised: true, group: 2 },
  { id: 'u4', nickname: 'Sakura', avatar: avatars[3], seat: 4, muted: false, handRaised: false, group: 2 },
  { id: 'u5', nickname: 'David', avatar: avatars[4], seat: 5, muted: true, handRaised: false, group: 1 },
  { id: 'u6', nickname: '小红', avatar: avatars[5], seat: 6, muted: false, handRaised: false, group: 2 },
]

const sampleTasks: TaskCard[] = [
  {
    id: 't1',
    title: '餐厅点餐',
    theme: 'restaurant',
    difficulty: 'beginner',
    description: '模拟在西餐厅点餐的场景，练习如何询问菜单、点餐、结账等常用表达。',
    dialog: ['Waiter: Good evening! Do you have a reservation?', 'You: Yes, under the name Smith.', 'Waiter: Right this way please.'],
    keyVocabulary: ['reservation', 'menu', 'appetizer', 'dessert', 'bill'],
    keyPatterns: ["I'd like to order...", "Could you recommend...", "May I have the bill?"],
  },
  {
    id: 't2',
    title: '机场问路',
    theme: 'travel',
    difficulty: 'intermediate',
    description: '在国外机场寻找登机口，练习问路和理解方向指引的表达。',
    dialog: ['You: Excuse me, where is Gate B12?', 'Staff: Take the escalator to level 2 and turn left.', 'You: Thank you very much!'],
    keyVocabulary: ['terminal', 'gate', 'escalator', 'boarding pass', 'customs'],
    keyPatterns: ['Could you tell me the way to...', 'How do I get to...', 'Is it far from here?'],
  },
  {
    id: 't3',
    title: '工作面试',
    theme: 'interview',
    difficulty: 'advanced',
    description: '模拟英文工作面试场景，练习自我介绍、回答问题和提问环节。',
    dialog: ['Interviewer: Tell me about yourself.', 'You: I have 5 years of experience in...', 'Interviewer: What are your strengths?'],
    keyVocabulary: ['experience', 'strengths', 'weaknesses', 'motivation', 'responsibility'],
    keyPatterns: ['I believe my greatest strength is...', "I'm looking for an opportunity to...", 'Could you tell me more about...'],
  },
  {
    id: 't4',
    title: '商场购物',
    theme: 'shopping',
    difficulty: 'beginner',
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

const sampleRecordings: PlaybackItem[] = [
  {
    id: 'r1',
    date: '2026-06-09 20:30',
    duration: 1800,
    roomName: '英语口语-餐厅点餐-中级',
    subtitle: '我想要点一份牛排和一杯红酒。',
    corrections: [
      { timestamp: 120, original: 'I want eat steak', corrected: "I'd like to eat a steak", note: "使用 I'd like to 更礼貌，steak 前加冠词 a" },
      { timestamp: 360, original: 'How many is it?', corrected: 'How much is it?', note: '价格用 much，数量用 many' },
    ],
  },
  {
    id: 'r2',
    date: '2026-06-08 19:00',
    duration: 2400,
    roomName: '英语面试-高级',
    subtitle: '我在项目管理方面有丰富经验。',
    corrections: [
      { timestamp: 240, original: 'I have many experience', corrected: 'I have much experience', note: 'experience 是不可数名词，用 much' },
    ],
  },
  {
    id: 'r3',
    date: '2026-06-07 21:15',
    duration: 1500,
    roomName: '日语入门-日常对话',
    subtitle: 'こんにちは、元気ですか？',
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
  { id: 'p1', title: '每日口语30分钟', target: '连续练习30天', deadline: '2026-07-10', progress: 70 },
  { id: 'p2', title: '攻克面试英语', target: '完成20次高级面试模拟', deadline: '2026-07-30', progress: 35 },
  { id: 'p3', title: '日语N3冲刺', target: '掌握500个N3词汇', deadline: '2026-08-15', progress: 20 },
]

export const useAppStore = create<AppState>((set) => ({
  currentWindow: 'lobby',
  profile: {
    id: 'me',
    nickname: '语言学习者',
    avatar: avatars[0],
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
  recordings: sampleRecordings,
  friends: sampleFriends,
  favoriteRooms: ['room1', 'room3'],
  badges: sampleBadges,
  studyPlans: samplePlans,
}))

export const { getState, setState } = useAppStore

export const avatarsList = avatars

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
