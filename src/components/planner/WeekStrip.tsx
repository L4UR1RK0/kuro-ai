'use client'

import { useMemo } from 'react'
import { usePlannerStore } from '@/store/planner'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { COLOR_MAP } from '@/lib/colors'
import { cn } from '@/lib/utils'

export function WeekStrip() {
  const { selectedDate, setSelectedDate, tasks } = usePlannerStore()

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.toISOString()],
  )

  return (
    <div className="flex w-full bg-[#0d0d1a] border-b border-white/5 h-14">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd')
        const dayTasks = tasks.filter((t) => t.date === key).slice(0, 3)
        const selected = isSameDay(day, selectedDate)
        const today = isToday(day)

        return (
          <button
            key={key}
            onClick={() => setSelectedDate(day)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 hover:bg-white/5 transition-colors"
          >
            <span className="text-[10px] text-white/40 uppercase tracking-wide leading-none">
              {format(day, 'EEE')}
            </span>
            <span
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors',
                today ? 'text-white' : selected ? 'bg-white/15 text-white' : 'text-white/70',
              )}
              style={today ? { backgroundColor: '#e8704a' } : undefined}
            >
              {format(day, 'd')}
            </span>
            <div className="flex gap-0.5 h-1.5 items-center">
              {dayTasks.map((t, i) => (
                <span key={i} className={cn('w-1 h-1 rounded-full', COLOR_MAP[t.color].dot)} />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
