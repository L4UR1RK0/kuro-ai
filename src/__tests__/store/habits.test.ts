import { describe, it, expect, beforeEach } from 'vitest'
import { useHabitsStore } from '@/store/habits'
import { Habit, HabitLog } from '@/types'

const mockHabit: Habit = {
  id: 'h1',
  user_id: 'u1',
  title: 'Morning Run',
  color: 'emerald',
  icon: 'dumbbell',
  frequency: 'daily',
  target_days: [1, 2, 3, 4, 5],
  created_at: '2026-01-01T00:00:00Z',
}

const mockLog: HabitLog = {
  id: 'l1',
  habit_id: 'h1',
  user_id: 'u1',
  date: '2026-03-26',
  completed: true,
}

beforeEach(() => {
  useHabitsStore.setState({
    habits: [],
    logs: [],
    isHabitModalOpen: false,
    editingHabit: null,
  })
})

describe('habits store', () => {
  it('adds a habit', () => {
    useHabitsStore.getState().addHabit(mockHabit)
    expect(useHabitsStore.getState().habits).toHaveLength(1)
    expect(useHabitsStore.getState().habits[0].id).toBe('h1')
  })

  it('updates a habit', () => {
    useHabitsStore.getState().addHabit(mockHabit)
    useHabitsStore.getState().updateHabit({ ...mockHabit, title: 'Evening Run' })
    expect(useHabitsStore.getState().habits[0].title).toBe('Evening Run')
  })

  it('removes a habit', () => {
    useHabitsStore.getState().addHabit(mockHabit)
    useHabitsStore.getState().removeHabit('h1')
    expect(useHabitsStore.getState().habits).toHaveLength(0)
  })

  it('inserts a new log', () => {
    useHabitsStore.getState().upsertLog(mockLog)
    expect(useHabitsStore.getState().logs).toHaveLength(1)
  })

  it('updates an existing log on upsert', () => {
    useHabitsStore.getState().upsertLog(mockLog)
    useHabitsStore.getState().upsertLog({ ...mockLog, completed: false })
    expect(useHabitsStore.getState().logs).toHaveLength(1)
    expect(useHabitsStore.getState().logs[0].completed).toBe(false)
  })

  it('opens and closes the habit modal', () => {
    useHabitsStore.getState().openHabitModal(mockHabit)
    expect(useHabitsStore.getState().isHabitModalOpen).toBe(true)
    expect(useHabitsStore.getState().editingHabit?.id).toBe('h1')

    useHabitsStore.getState().closeHabitModal()
    expect(useHabitsStore.getState().isHabitModalOpen).toBe(false)
    expect(useHabitsStore.getState().editingHabit).toBeNull()
  })

  it('opens modal without habit for creation', () => {
    useHabitsStore.getState().openHabitModal()
    expect(useHabitsStore.getState().isHabitModalOpen).toBe(true)
    expect(useHabitsStore.getState().editingHabit).toBeNull()
  })
})
