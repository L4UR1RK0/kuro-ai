import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { format } from 'date-fns'

vi.mock('@/store/planner', () => ({ usePlannerStore: vi.fn() }))
vi.mock('@/hooks/useTasks', () => ({ useTasks: vi.fn() }))
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Plus: () => <div data-testid="plus-icon" />,
  CheckSquare: () => <div data-testid="check-square-icon" />,
  Check: () => <div data-testid="check-icon" />,
}))

import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { Sidebar } from './Sidebar'
import { Task } from '@/types'

const TODAY = format(new Date(), 'yyyy-MM-dd')

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Sidebar Task',
  date: TODAY,
  start_time: '09:00',
  end_time: '10:00',
  color: 'blue',
  icon: 'book',
  completed: false,
  recurrence: 'none',
  created_at: `${TODAY}T00:00:00Z`,
  updated_at: `${TODAY}T00:00:00Z`,
}

const mockCompletedTask: Task = {
  ...mockTask,
  id: 'task-2',
  title: 'Done Task',
  completed: true,
}

describe('Sidebar', () => {
  const mockOpenTaskModal = vi.fn()
  const mockSetSelectedDate = vi.fn()
  const mockToggleComplete = vi.fn()
  const mockUpdateTask = vi.fn()
  const mockFetchTasksForRange = vi.fn()

  const selectedDate = new Date(TODAY)

  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePlannerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedDate,
      setSelectedDate: mockSetSelectedDate,
      openTaskModal: mockOpenTaskModal,
      tasks: [mockTask],
      view: 'day',
      updateTask: mockUpdateTask,
    })
    // Also mock getState for the onClick in the task row
    ;(usePlannerStore as any).getState = vi.fn().mockReturnValue({
      openTaskModal: mockOpenTaskModal,
    })
    ;(useTasks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      fetchTasksForRange: mockFetchTasksForRange,
      toggleComplete: mockToggleComplete,
    })
  })

  it("renders today's tasks", () => {
    render(<Sidebar />)
    expect(screen.getByText('Sidebar Task')).toBeInTheDocument()
  })

  it('clicking the toggle checkbox on a task calls toggleComplete', () => {
    render(<Sidebar />)
    const toggleButton = screen.getByTestId('sidebar-toggle-task-1')
    fireEvent.click(toggleButton)
    expect(mockToggleComplete).toHaveBeenCalledWith(mockTask)
    expect(mockOpenTaskModal).not.toHaveBeenCalled()
  })

  it('clicking the task row (not the checkbox) opens the modal', () => {
    render(<Sidebar />)
    const taskRow = screen.getByTestId('sidebar-task-task-1')
    fireEvent.click(taskRow)
    expect(mockOpenTaskModal).toHaveBeenCalledWith(undefined, mockTask)
    expect(mockToggleComplete).not.toHaveBeenCalled()
  })

  it('completed tasks show strikethrough styling', () => {
    ;(usePlannerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedDate,
      setSelectedDate: mockSetSelectedDate,
      openTaskModal: mockOpenTaskModal,
      tasks: [mockCompletedTask],
      view: 'day',
      updateTask: mockUpdateTask,
    })

    render(<Sidebar />)
    const title = screen.getByText('Done Task')
    expect(title.className).toContain('line-through')
  })
})
