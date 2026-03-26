import { create } from 'zustand'
import { CalendarView, Task } from '@/types'
import { startOfDay } from 'date-fns'

interface PlannerState {
  selectedDate: Date
  view: CalendarView
  tasks: Task[]
  isTaskModalOpen: boolean
  editingTask: Task | null
  selectedSlotTime: string | null
  visibleRange: { from: string; to: string } | null

  setSelectedDate: (date: Date) => void
  setView: (view: CalendarView) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (id: string) => void
  openTaskModal: (time?: string, task?: Task) => void
  closeTaskModal: () => void
  setVisibleRange: (range: { from: string; to: string }) => void
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedDate: startOfDay(new Date()),
  view: 'day',
  tasks: [],
  isTaskModalOpen: false,
  editingTask: null,
  selectedSlotTime: null,
  visibleRange: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setView: (view) => set({ view }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (task) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  openTaskModal: (time, task) =>
    set({ isTaskModalOpen: true, selectedSlotTime: time ?? null, editingTask: task ?? null }),
  closeTaskModal: () =>
    set({ isTaskModalOpen: false, editingTask: null, selectedSlotTime: null }),
  setVisibleRange: (range) => set({ visibleRange: range }),
}))
