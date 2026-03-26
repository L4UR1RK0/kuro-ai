export type TaskColor =
  | 'rose'
  | 'orange'
  | 'amber'
  | 'lime'
  | 'emerald'
  | 'cyan'
  | 'blue'
  | 'violet'
  | 'pink'
  | 'slate'

export type TaskIcon =
  | 'book'
  | 'briefcase'
  | 'dumbbell'
  | 'utensils'
  | 'coffee'
  | 'music'
  | 'code'
  | 'heart'
  | 'star'
  | 'zap'
  | 'sun'
  | 'moon'
  | 'home'
  | 'car'
  | 'plane'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  user_id: string
  title: string
  notes?: string
  date: string // ISO date string YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  color: TaskColor
  icon: TaskIcon
  completed: boolean
  recurrence: RecurrenceType
  recurrence_end_date?: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  color: TaskColor
  icon: TaskIcon
  frequency: 'daily' | 'weekly'
  target_days: number[] // 0=Sun, 1=Mon, ..., 6=Sat
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
}

export type CalendarView = 'day' | 'multiday' | 'week' | 'month'
