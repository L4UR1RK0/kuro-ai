/**
 * BUG-4 regression: mini-calendar month navigation must NOT change selectedDate.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePlannerStore } from '@/store/planner'

// ─── Minimal stubs so Sidebar renders without Supabase ───────────────────────

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({ fetchTasksForRange: vi.fn() }),
}))

vi.mock('@/components/habits/HabitsPanel', () => ({
  HabitsPanel: () => null,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
    auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
  }),
}))

// Import after mocks
import { Sidebar } from '@/components/layout/Sidebar'

const MARCH_27 = new Date(2026, 2, 27) // month is 0-indexed

beforeEach(() => {
  usePlannerStore.setState({
    selectedDate: MARCH_27,
    view: 'day',
    tasks: [],
    isTaskModalOpen: false,
    editingTask: null,
    selectedSlotTime: null,
  })
})

describe('Sidebar mini-calendar month navigation (BUG-4)', () => {
  it('shows the correct month header on mount', () => {
    render(<Sidebar />)
    expect(screen.getByText('March 2026')).toBeInTheDocument()
  })

  it('clicking prev-month arrow shows February without changing selectedDate', () => {
    render(<Sidebar />)
    const [prevBtn] = screen.getAllByRole('button', { name: '' }).filter((b) =>
      b.querySelector('svg'),
    )
    // find the left chevron button (first icon button in the calendar header)
    const chevrons = screen.getAllByRole('button').filter((b) =>
      b.className.includes('rounded') && b.querySelector('svg'),
    )
    fireEvent.click(chevrons[0]) // first chevron = prev month

    expect(screen.getByText('February 2026')).toBeInTheDocument()
    // selectedDate must still be March 27
    expect(usePlannerStore.getState().selectedDate).toEqual(MARCH_27)
  })

  it('clicking next-month arrow shows April without changing selectedDate', () => {
    render(<Sidebar />)
    const chevrons = screen.getAllByRole('button').filter((b) =>
      b.className.includes('rounded') && b.querySelector('svg'),
    )
    fireEvent.click(chevrons[1]) // second chevron = next month

    expect(screen.getByText('April 2026')).toBeInTheDocument()
    expect(usePlannerStore.getState().selectedDate).toEqual(MARCH_27)
  })

  it('navigating to a different month then clicking a day updates selectedDate', () => {
    render(<Sidebar />)
    const chevrons = screen.getAllByRole('button').filter((b) =>
      b.className.includes('rounded') && b.querySelector('svg'),
    )
    // Go to April
    fireEvent.click(chevrons[1])
    // Click "1" (April 1)
    const dayButtons = screen.getAllByRole('button').filter((b) => b.textContent === '1')
    fireEvent.click(dayButtons[0])

    const newDate = usePlannerStore.getState().selectedDate
    expect(newDate.getMonth()).toBe(3) // April = 3
    expect(newDate.getDate()).toBe(1)
  })
})
