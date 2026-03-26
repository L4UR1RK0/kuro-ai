import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HabitBlock } from '@/components/habits/HabitBlock'
import { Habit } from '@/types'

const mockHabit: Habit = {
  id: 'h1',
  user_id: 'u1',
  title: 'Morning Run',
  color: 'emerald',
  icon: 'dumbbell',
  frequency: 'daily',
  target_days: [0, 1, 2, 3, 4, 5, 6],
  created_at: '2026-01-01T00:00:00Z',
}

describe('HabitBlock', () => {
  it('renders the habit title', () => {
    render(
      <HabitBlock
        habit={mockHabit}
        completed={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('shows a checkmark when completed', () => {
    render(
      <HabitBlock
        habit={mockHabit}
        completed={true}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    // Check icon rendered (lucide Check)
    expect(screen.getByLabelText('Mark incomplete')).toBeInTheDocument()
  })

  it('calls onToggle when completion button clicked', () => {
    const onToggle = vi.fn()
    render(
      <HabitBlock
        habit={mockHabit}
        completed={false}
        onToggle={onToggle}
        onEdit={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByLabelText('Mark complete'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when title clicked', () => {
    const onEdit = vi.fn()
    render(
      <HabitBlock
        habit={mockHabit}
        completed={false}
        onToggle={vi.fn()}
        onEdit={onEdit}
      />,
    )
    // Both the icon button and title button share the same aria-label — click the title one
    const editButtons = screen.getAllByLabelText('Edit Morning Run')
    fireEvent.click(editButtons[1])
    expect(onEdit).toHaveBeenCalled()
  })

  it('applies line-through style when completed', () => {
    render(
      <HabitBlock
        habit={mockHabit}
        completed={true}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    const title = screen.getByText('Morning Run')
    expect(title.className).toMatch(/line-through/)
  })
})
