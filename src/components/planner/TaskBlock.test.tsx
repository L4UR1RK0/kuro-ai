import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mocks must be declared before imports that use them
vi.mock('@/store/planner', () => ({ usePlannerStore: vi.fn() }))
vi.mock('@/hooks/useTasks', () => ({ useTasks: vi.fn() }))
vi.mock('@/lib/colors', () => ({
  COLOR_MAP: {
    blue: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-100' },
  },
}))
vi.mock('@/lib/icons', () => ({
  TaskIconComponent: () => <div data-testid="task-icon" />,
}))
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))
vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="check-icon" />,
}))

import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { TaskBlock } from './TaskBlock'
import { Task } from '@/types'

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  date: '2026-03-26',
  start_time: '09:00',
  end_time: '10:00',
  color: 'blue',
  icon: 'book',
  completed: false,
  recurrence: 'none',
  created_at: '2026-03-26T00:00:00Z',
  updated_at: '2026-03-26T00:00:00Z',
}

const mockCompletedTask: Task = {
  ...mockTask,
  completed: true,
}

describe('TaskBlock', () => {
  const mockOpenTaskModal = vi.fn()
  const mockToggleComplete = vi.fn()
  const mockUpdateTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePlannerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      openTaskModal: mockOpenTaskModal,
      updateTask: mockUpdateTask,
    })
    ;(useTasks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toggleComplete: mockToggleComplete,
    })
  })

  it('renders the task title', () => {
    render(<TaskBlock task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('clicking the toggle button calls toggleComplete and not openTaskModal', () => {
    render(<TaskBlock task={mockTask} />)
    const toggleButton = screen.getByTestId('toggle-complete')
    fireEvent.click(toggleButton)
    expect(mockToggleComplete).toHaveBeenCalledWith(mockTask)
    expect(mockOpenTaskModal).not.toHaveBeenCalled()
  })

  it('completed task shows strikethrough on title and reduced opacity on container', () => {
    const { container } = render(<TaskBlock task={mockCompletedTask} />)
    // Title should have line-through class
    const title = screen.getByText('Test Task')
    expect(title.className).toContain('line-through')
    // Container should have opacity-50 class
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('opacity-50')
  })

  it('clicking the task body (not the toggle) opens the modal', () => {
    render(<TaskBlock task={mockTask} />)
    const titleEl = screen.getByText('Test Task')
    fireEvent.click(titleEl)
    expect(mockOpenTaskModal).toHaveBeenCalledWith(undefined, mockTask)
    expect(mockToggleComplete).not.toHaveBeenCalled()
  })
})
