'use client'

import { useMemo } from 'react'
import { usePlannerStore } from '@/store/planner'
import {
  format, parse, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { COLOR_MAP } from '@/lib/colors'

function formatTaskTime(startTime: string): string {
  const d = parse(startTime, 'HH:mm', new Date())
  return format(d, d.getMinutes() === 0 ? 'h a' : 'h:mm a')
}

export function MonthView() {
  const { selectedDate, tasks, setSelectedDate } = usePlannerStore()

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd])

  const tasksByDay = useMemo(() => {
    const map: Record<string, typeof tasks> = {}
    tasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [tasks])

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-xs text-white/30 font-medium py-2 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 flex-1 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDay[key] || []
          const isSelected = isSameDay(day, selectedDate)
          const inMonth = isSameMonth(day, selectedDate)

          return (
            <div
              key={key}
              className={cn(
                'rounded-xl p-2 cursor-pointer transition-colors min-h-[80px]',
                inMonth ? 'hover:bg-white/5' : 'opacity-30',
                isSelected && 'bg-white/10',
              )}
              onClick={() => setSelectedDate(day)}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1',
                isToday(day) && 'bg-blue-500 text-white',
                !isToday(day) && 'text-white/80',
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1 min-w-0 text-[10px] text-white/70"
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', COLOR_MAP[task.color].dot)} />
                    <span className="truncate flex-1">{task.title}</span>
                    <span className="shrink-0 text-white/40">{formatTaskTime(task.start_time)}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-white/30">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
