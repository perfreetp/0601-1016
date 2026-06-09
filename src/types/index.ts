export type Language = 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Theme = 'restaurant' | 'travel' | 'interview' | 'shopping' | 'daily' | 'business'

export interface HintPreferences {
  difficulty: Difficulty
  focusTypes: string[]
  autoSpeak: boolean
}

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
  nameplate: string
  defaultEmoji: string
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
  hostId: string
  isCustom?: boolean
}

export interface Participant {
  id: string
  nickname: string
  avatar: Avatar
  nameplate?: string
  defaultEmoji?: string
  seat: number
  muted: boolean
  handRaised: boolean
  group: number
  isHost: boolean
  isSpeaking: boolean
}

export type TaskStatus = 'pending' | 'accepted' | 'in-progress' | 'completed'

export interface AssignedTask {
  id: string
  taskCardId: string
  assigneeId: string
  assigneeName: string
  assignedAt: string
  status: TaskStatus
  roundNumber: number
}

export interface GroupTimer {
  groupId: number
  startTime: number | null
  duration: number
  running: boolean
}

export interface TurnOrder {
  id: string
  participantIds: string[]
  currentIndex: number
  roundNumber: number
}

export type CollectionType = 'vocabulary' | 'pattern'

export interface SavedItem {
  id: string
  type: CollectionType
  content: string
  translation: string
  example?: string
  source: string
  createdAt: string
}

export interface FluencyReport {
  overallScore: number
  pronunciationScore: number
  grammarScore: number
  fluencyScore: number
  vocabularyScore: number
  highlights: string[]
  suggestions: string[]
  totalWords: number
  uniqueWords: number
  speakingTime: number
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

export interface Correction {
  timestamp: number
  original: string
  corrected: string
  note: string
}

export interface SubtitleLine {
  id: string
  speaker: string
  speakerId: string
  speakerAvatar?: Avatar
  speakerEmoji?: string
  text: string
  timestamp: number
  isMe: boolean
}

export interface PlaybackItem {
  id: string
  date: string
  duration: number
  roomName: string
  roomId: string
  subtitle: string
  subtitles: SubtitleLine[]
  corrections: Correction[]
  report?: FluencyReport
}

export interface Friend {
  id: string
  nickname: string
  avatar: Avatar
  online: boolean
  level: number
}

export type InviteStatus = 'pending' | 'accepted' | 'declined'

export interface RoomInvite {
  id: string
  fromId: string
  fromName: string
  fromAvatar: Avatar
  roomId: string
  roomName: string
  time: string
  status: InviteStatus
  isFromMe: boolean
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Appointment {
  id: string
  partnerId: string
  partnerName: string
  partnerAvatar: Avatar
  time: string
  topic: string
  language: Language
  status: AppointmentStatus
  createdAt: string
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
  createdAt: string
  checkIns: string[]
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
  liveSubtitles: SubtitleLine[]
  recordings: PlaybackItem[]
  isRecording: boolean
  recordingStartTime: number | null
  friends: Friend[]
  roomInvites: RoomInvite[]
  appointments: Appointment[]
  favoriteRooms: string[]
  badges: Badge[]
  studyPlans: StudyPlan[]
  savedItems: SavedItem[]
  assignedTasks: AssignedTask[]
  groupTimers: GroupTimer[]
  turnOrder: TurnOrder | null
  customRooms: Room[]
  currentRound: number
  namedSpeakerId: string | null
  showAIRecommendation: boolean
  hintPreferences: HintPreferences
}
