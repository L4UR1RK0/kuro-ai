import { create } from 'zustand'
import { Habit, HabitLog } from '@/types'

interface HabitsState {
  habits: Habit[]
  logs: HabitLog[]
  isHabitModalOpen: boolean
  editingHabit: Habit | null

  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Habit) => void
  updateHabit: (habit: Habit) => void
  removeHabit: (id: string) => void
  setLogs: (logs: HabitLog[]) => void
  upsertLog: (log: HabitLog) => void
  openHabitModal: (habit?: Habit) => void
  closeHabitModal: () => void
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  logs: [],
  isHabitModalOpen: false,
  editingHabit: null,

  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
  updateHabit: (habit) =>
    set((s) => ({ habits: s.habits.map((h) => (h.id === habit.id ? habit : h)) })),
  removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
  setLogs: (logs) => set({ logs }),
  upsertLog: (log) =>
    set((s) => {
      const existing = s.logs.findIndex(
        (l) => l.habit_id === log.habit_id && l.date === log.date,
      )
      if (existing >= 0) {
        const updated = [...s.logs]
        updated[existing] = log
        return { logs: updated }
      }
      return { logs: [...s.logs, log] }
    }),
  openHabitModal: (habit) =>
    set({ isHabitModalOpen: true, editingHabit: habit ?? null }),
  closeHabitModal: () =>
    set({ isHabitModalOpen: false, editingHabit: null }),
}))
