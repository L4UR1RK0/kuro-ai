/**
 * BUG-5 regression: logHabit must include user_id in the upsert payload
 * and must surface errors via console.error rather than silently dropping them.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHabitsStore } from '@/store/habits'

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockUpsert = vi.fn()
const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ single: mockSingle }))
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }))
mockUpsert.mockReturnValue({ select: mockSelect })

const MOCK_USER = { id: 'user-abc' }

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: () => Promise.resolve({ data: { user: MOCK_USER }, error: null }),
    },
  }),
}))

import { useHabits } from '@/hooks/useHabits'

beforeEach(() => {
  vi.clearAllMocks()
  useHabitsStore.setState({ habits: [], logs: [], isHabitModalOpen: false, editingHabit: null })
})

describe('useHabits.logHabit (BUG-5)', () => {
  it('calls upsert with user_id, habit_id, date, and toggled completed', async () => {
    const mockLog = {
      id: 'log-1',
      habit_id: 'h1',
      user_id: MOCK_USER.id,
      date: '2026-03-27',
      completed: true,
    }
    mockSingle.mockResolvedValue({ data: mockLog, error: null })

    const { result } = renderHook(() => useHabits())
    await act(async () => {
      await result.current.logHabit('h1', new Date(2026, 2, 27), false)
    })

    expect(mockFrom).toHaveBeenCalledWith('habit_logs')
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        habit_id: 'h1',
        user_id: MOCK_USER.id,
        date: '2026-03-27',
        completed: true, // toggled from false → true
      }),
      expect.objectContaining({ onConflict: 'habit_id,date' }),
    )
  })

  it('toggles completed from true to false', async () => {
    const mockLog = {
      id: 'log-1',
      habit_id: 'h1',
      user_id: MOCK_USER.id,
      date: '2026-03-27',
      completed: false,
    }
    mockSingle.mockResolvedValue({ data: mockLog, error: null })

    const { result } = renderHook(() => useHabits())
    await act(async () => {
      await result.current.logHabit('h1', new Date(2026, 2, 27), true)
    })

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ completed: false }),
      expect.any(Object),
    )
  })

  it('calls console.error and does NOT update the store when upsert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSingle.mockResolvedValue({ data: null, error: { message: 'RLS violation' } })

    const { result } = renderHook(() => useHabits())
    await act(async () => {
      await result.current.logHabit('h1', new Date(2026, 2, 27), false)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[useHabits] logHabit upsert failed',
      expect.objectContaining({ error: expect.objectContaining({ message: 'RLS violation' }) }),
    )
    expect(useHabitsStore.getState().logs).toHaveLength(0)
    consoleSpy.mockRestore()
  })

  it('updates the store with the returned log on success', async () => {
    const mockLog = {
      id: 'log-1',
      habit_id: 'h1',
      user_id: MOCK_USER.id,
      date: '2026-03-27',
      completed: true,
    }
    mockSingle.mockResolvedValue({ data: mockLog, error: null })

    const { result } = renderHook(() => useHabits())
    await act(async () => {
      await result.current.logHabit('h1', new Date(2026, 2, 27), false)
    })

    const logs = useHabitsStore.getState().logs
    expect(logs).toHaveLength(1)
    expect(logs[0].completed).toBe(true)
  })
})
