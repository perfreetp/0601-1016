export type Language = 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Theme = 'restaurant' | 'travel' | 'interview' | 'shopping' | 'daily' | 'business'

export interface Avatar {
  id: string
  name: string
  emoji: string
  color: string
}

export interface UserProfile {
  id: string
  nickname: string
  avatar: Avatar
  level: number
  totalMinutes: number
  sessions: number
  fluency: number
}

export interface Room {
  id: string
  name: string
  language: Language
  theme: Theme
  difficulty: Difficulty
  capacity: number
  current: number
  host: string
}

export interface Participant {
  id: string
  nickname: string
  avatar: Avatar
  seat: number
  muted: boolean
  handRaised: boolean
  group: number
}

export interface TaskCard {
  id: string
  title: string
  theme: Theme
  difficulty: Difficulty
  description: string
  dialog: string[]
  keyVocabulary: string[]
  keyPatterns: string[]
}

export interface Hint {
  id: string
  type: 'vocabulary' | 'pattern' | 'pronunciation'
  content: string
  translation: string
  example?: string
}

export interface PlaybackItem {
  id: string
  date: string
  duration: number
  roomName: string
  subtitle: string
  corrections: Correction[]
}

export interface Correction {
  timestamp: number
  original: string
  corrected: string
  note: string
}

export interface Friend {
  id: string
  nickname: string
  avatar: Avatar
  online: boolean
  level: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
}

export interface StudyPlan {
  id: string
  title: string
  target: string
  deadline: string
  progress: number
}

export interface AppState {
  currentWindow: string
  profile: UserProfile
  selectedLanguage: Language
  selectedTheme: Theme
  selectedDifficulty: Difficulty
  currentRoom: Room | null
  participants: Participant[]
  tasks: TaskCard[]
  activeTask: TaskCard | null
  hints: Hint[]
  recordings: PlaybackItem[]
  friends: Friend[]
  favoriteRooms: string[]
  badges: Badge[]
  studyPlans: StudyPlan[]
}
