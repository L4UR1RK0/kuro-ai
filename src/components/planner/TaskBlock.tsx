'use client'

import { Task } from '@/types'
import { COLOR_MAP } from '@/lib/colors'
import { TaskIconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { sliceTime } from '@/lib/time'

function formatDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours === 0) return `(${mins} min)`
  if (mins === 0) return `(${hours} hr)`
  return `(${hours} hr ${mins} min)`
}

interface TaskBlockProps {
  task: Task
  style?: React.CSSProperties
  compact?: boolean
}

export function TaskBlock({ task, style, compact }: TaskBlockProps) {
  const { openTaskModal, updateTask } = usePlannerStore()
  const { toggleComplete } = useTasks()
  const colors = COLOR_MAP[task.color]

  return (
    <div
      className={cn(
        'absolute left-1 right-1 rounded-xl px-3 py-2 cursor-pointer',
        'border-l-4 backdrop-blur-sm transition-all hover:brightness-110',
        colors.bg,
        colors.border,
        task.completed && 'opacity-50',
      )}
      style={style}
      onClick={() => openTaskModal(undefined, task)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          data-testid="toggle-complete"
          className={cn(
            'rounded-full w-4 h-4 border border-white/40 flex items-center justify-center shrink-0 hover:border-white/80 transition-colors',
            task.completed && 'bg-white/20',
          )}
          onClick={(e) => {
            e.stopPropagation()
            updateTask({ ...task, completed: !task.completed })
            toggleComplete(task)
          }}
        >
          {task.completed && <Check className="w-2 h-2 text-white/80" />}
        </button>
        <div className={cn('rounded-full p-1 shrink-0', colors.bg)}>
          <TaskIconComponent icon={task.icon} className={cn('w-3 h-3', colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-medium truncate', colors.text, task.completed && 'line-through')}>
            {task.title}
          </p>
          {!compact && (
            <p className="text-xs text-white/50 truncate">
              {sliceTime(task.start_time)} – {sliceTime(task.end_time)}
              {task.start_time && task.end_time && (
                <span className="ml-1">{formatDuration(task.start_time, task.end_time)}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
