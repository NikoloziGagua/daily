export type Context = 'Home' | 'Work' | 'Errands'

export interface Task {
  id: string
  title: string
  context: Context
  minutes: number
  mustDo: boolean
  completed: boolean
  completedAt: string | null
  createdAt: string
  rolledFrom: string | null
  date: string // YYYY-MM-DD
}

export interface Note {
  id: string
  title: string
  body: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface AppState {
  tasks: Task[]
  notes: Note[]
  intentions: Record<string, string>
  lastOpened: string
  bestStreak: number
}
