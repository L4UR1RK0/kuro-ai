'use client'

import { Habit } from '@/types'
import { COLOR_MAP } from '@/lib/colors'
import { TaskIconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface HabitBlockProps {
  habit: Habit
  completed: boolean
  onToggle: () => void
  onEdit: () => void
}

export function HabitBlock({ habit, completed, onToggle, onEdit }: HabitBlockProps) {
  const colors = COLOR_MAP[habit.color]

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 rounded-xl px-3 py-2',
        'border-l-4 backdrop-blur-sm',
        colors.bg,
        colors.border,
        completed && 'opacity-60',
      )}
    >
      {/* Icon — click to edit */}
      <button
        onClick={onEdit}
        className={cn('rounded-full p-1 shrink-0 hover:brightness-125 transition-all', colors.bg)}
        aria-label={`Edit ${habit.title}`}
      >
        <TaskIconComponent icon={habit.icon} className={cn('w-3 h-3', colors.text)} />
      </button>

      {/* Title — click to edit */}
      <button
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
        aria-label={`Edit ${habit.title}`}
      >
        <p className={cn('text-sm font-medium truncate', colors.text, completed && 'line-through')}>
          {habit.title}
        </p>
      </button>

      {/* Completion toggle */}
      <button
        onClick={onToggle}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        className={cn(
          'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
          completed
            ? cn('border-transparent', colors.dot ?? colors.bg)
            : 'border-white/20 hover:border-white/40',
        )}
        style={completed ? undefined : undefined}
      >
        {completed && <Check className="w-3 h-3 text-white" />}
      </button>
    </div>
  )
}
