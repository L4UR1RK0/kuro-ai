import { describe, it, expect } from 'vitest'
import { expandRecurringTasks } from './recurrence'
import type { Task } from '@/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Test Task',
    date: '2026-03-01',
    start_time: '09:00',
    end_time: '10:00',
    color: 'blue',
    icon: 'star',
    completed: false,
    recurrence: 'none',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('expandRecurringTasks', () => {
  describe('non-recurring tasks', () => {
    it('passes through a non-recurring task unchanged', () => {
      const task = makeTask({ date: '2026-03-15' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-31')
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(task)
    })

    it('excludes a non-recurring task outside the range', () => {
      const task = makeTask({ date: '2026-02-15' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-31')
      expect(result).toHaveLength(0)
    })
  })

  describe('daily recurrence', () => {
    it('generates an instance for every day in the range', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-05' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-31')
      const dates = result.map((t) => t.date).sort()
      expect(dates).toEqual(['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'])
    })

    it('stops at recurrence_end_date', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-03' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-31')
      expect(result.map((t) => t.date).sort()).toEqual(['2026-03-01', '2026-03-02', '2026-03-03'])
    })

    it('uses 90-day horizon when no end date is set', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-03-01' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-06-30')
      // 90 days from 2026-03-01 is 2026-05-30
      const dates = result.map((t) => t.date)
      expect(dates).toContain('2026-03-01')
      expect(dates).toContain('2026-05-30')
      expect(dates).not.toContain('2026-05-31')
      expect(dates).not.toContain('2026-06-01')
    })

    it('only returns instances within the queried range', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-31' })
      const result = expandRecurringTasks([task], '2026-03-10', '2026-03-12')
      expect(result.map((t) => t.date).sort()).toEqual(['2026-03-10', '2026-03-11', '2026-03-12'])
    })

    it('expands a task that started before the range into the range', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-02-01', recurrence_end_date: '2026-03-05' })
      const result = expandRecurringTasks([task], '2026-03-03', '2026-03-07')
      expect(result.map((t) => t.date).sort()).toEqual(['2026-03-03', '2026-03-04', '2026-03-05'])
    })

    it('generates no instances when end date is before the range', () => {
      const task = makeTask({ recurrence: 'daily', date: '2026-01-01', recurrence_end_date: '2026-02-28' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-31')
      expect(result).toHaveLength(0)
    })
  })

  describe('weekly recurrence', () => {
    it('generates instances on the same day of the week', () => {
      // 2026-03-04 is a Wednesday
      const task = makeTask({ recurrence: 'weekly', date: '2026-03-04', recurrence_end_date: '2026-04-15' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-04-15')
      const dates = result.map((t) => t.date).sort()
      expect(dates).toEqual(['2026-03-04', '2026-03-11', '2026-03-18', '2026-03-25', '2026-04-01', '2026-04-08', '2026-04-15'])
    })

    it('respects the original day of week when start is before range', () => {
      // 2026-02-04 is a Wednesday
      const task = makeTask({ recurrence: 'weekly', date: '2026-02-04', recurrence_end_date: '2026-03-15' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-15')
      const dates = result.map((t) => t.date).sort()
      expect(dates).toEqual(['2026-03-04', '2026-03-11'])
    })
  })

  describe('monthly recurrence', () => {
    it('generates instances on the same day of the month', () => {
      const task = makeTask({ recurrence: 'monthly', date: '2026-01-15', recurrence_end_date: '2026-04-30' })
      const result = expandRecurringTasks([task], '2026-01-01', '2026-04-30')
      const dates = result.map((t) => t.date).sort()
      expect(dates).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15'])
    })

    it('respects original day of month when start is before range', () => {
      const task = makeTask({ recurrence: 'monthly', date: '2025-11-10', recurrence_end_date: '2026-04-30' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-04-30')
      const dates = result.map((t) => t.date).sort()
      expect(dates).toEqual(['2026-03-10', '2026-04-10'])
    })
  })

  describe('expanded instance shape', () => {
    it('marks expanded instances with _recurringInstance and _sourceTaskId', () => {
      const task = makeTask({ id: 'src-1', recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-02' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-02')
      const instance = result.find((t) => t.date === '2026-03-02')
      expect(instance?._recurringInstance).toBe(true)
      expect(instance?._sourceTaskId).toBe('src-1')
    })

    it('does not mark the source task occurrence as an instance', () => {
      const task = makeTask({ id: 'src-1', recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-03' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-03')
      const source = result.find((t) => t.date === '2026-03-01')
      expect(source?._recurringInstance).toBeUndefined()
      expect(source?._sourceTaskId).toBeUndefined()
    })

    it('gives each expanded instance a unique id', () => {
      const task = makeTask({ id: 'src-1', recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-03' })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-03')
      const ids = result.map((t) => t.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('copies all other fields from the source task to each instance', () => {
      const task = makeTask({
        id: 'src-1',
        title: 'Daily Standup',
        color: 'rose',
        icon: 'briefcase',
        recurrence: 'daily',
        date: '2026-03-01',
        recurrence_end_date: '2026-03-02',
      })
      const result = expandRecurringTasks([task], '2026-03-01', '2026-03-02')
      const instance = result.find((t) => t.date === '2026-03-02')!
      expect(instance.title).toBe('Daily Standup')
      expect(instance.color).toBe('rose')
      expect(instance.icon).toBe('briefcase')
      expect(instance.start_time).toBe('09:00')
      expect(instance.end_time).toBe('10:00')
    })
  })

  describe('output ordering', () => {
    it('returns tasks sorted by date then start_time', () => {
      const t1 = makeTask({ id: 't1', recurrence: 'daily', date: '2026-03-01', recurrence_end_date: '2026-03-02', start_time: '14:00' })
      const t2 = makeTask({ id: 't2', recurrence: 'none', date: '2026-03-01', start_time: '08:00' })
      const result = expandRecurringTasks([t1, t2], '2026-03-01', '2026-03-02')
      expect(result[0].date).toBe('2026-03-01')
      expect(result[0].start_time).toBe('08:00')
      expect(result[1].date).toBe('2026-03-01')
      expect(result[1].start_time).toBe('14:00')
    })
  })
})
