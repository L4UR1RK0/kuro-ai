'use client'

import { Task } from '@/types'
import { COLOR_MAP } from '@/lib/colors'
import { TaskIconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { usePlannerStore } from '@/store/planner'

interface TaskBlockProps {
  task: Task
  style?: React.CSSProperties
  compact?: boolean
}

export function TaskBlock({ task, style, compact }: TaskBlockProps) {
  const { openTaskModal } = usePlannerStore()
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
        <div className={cn('rounded-full p-1 shrink-0', colors.bg)}>
          <TaskIconComponent icon={task.icon} className={cn('w-3 h-3', colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-medium truncate', colors.text, task.completed && 'line-through')}>
            {task.title}
          </p>
          {!compact && (
            <p className="text-xs text-white/50 truncate">
              {task.start_time} – {task.end_time}
            </p>
          )}
        </div>
        {task.completed && <Check className="w-3 h-3 text-white/60 shrink-0" />}
      </div>
    </div>
  )
}
