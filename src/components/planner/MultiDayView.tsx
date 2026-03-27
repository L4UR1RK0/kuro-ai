'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePlannerStore } from '@/store/planner'
import { format, addDays, isToday, isSameDay } from 'date-fns'
import { TaskBlock } from './TaskBlock'
import { CurrentTimeIndicator } from './CurrentTimeIndicator'
import { timeToPixels } from '@/lib/timeToPixels'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

const HOUR_HEIGHT = 56
const START_HOUR = 0
const END_HOUR = 24
const DAYS = 3

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function getTaskStyle(task: Task): React.CSSProperties {
  const startMin = timeToMinutes(task.start_time)
  const endMin = timeToMinutes(task.end_time)
  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24)
  return { top, height, position: 'absolute', left: 2, right: 2 }
}

export function MultiDayView() {
  const { selectedDate, tasks, setSelectedDate, openTaskModal } = usePlannerStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(selectedDate, i)), [selectedDate])
  const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR), [])
  const windowContainsToday = days.some((d) => isToday(d))

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {}
    days.forEach((d) => {
      const key = format(d, 'yyyy-MM-dd')
      map[key] = tasks.filter((t) => t.date === key)
    })
    return map
  }, [days, tasks])

  // Auto-scroll to current time when today is visible
  useEffect(() => {
    if (!scrollRef.current || !windowContainsToday) return
    const now = new Date()
    const top = timeToPixels(now.getHours(), now.getMinutes(), HOUR_HEIGHT)
    const containerHeight = scrollRef.current.clientHeight
    scrollRef.current.scrollTo({ top: top - containerHeight / 3, behavior: 'instant' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex border-b border-white/5">
        <div className="w-14 shrink-0" />
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 text-center py-3">
            <div className="text-xs text-white/40 uppercase">{format(day, 'EEE')}</div>
            <div className={cn(
              'mx-auto mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              isToday(day) ? 'bg-blue-500 text-white' : 'text-white/80',
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: HOUR_HEIGHT * (END_HOUR - START_HOUR) }}>
          <div className="w-14 shrink-0 relative">
            {hours.map((h) => (
              <div key={h} className="absolute w-full" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}>
                <span className="text-[10px] text-white/30 pr-2 float-right">
                  {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            return (
              <div key={key} className="flex-1 relative border-l border-white/5">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-white/5 hover:bg-white/[0.02] cursor-pointer"
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const rawMin = Math.round(((e.clientY - rect.top) / HOUR_HEIGHT) * 60 / 15) * 15
                      const minutes = Math.min(rawMin, 45)
                      setSelectedDate(day)
                      openTaskModal(`${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
                    }}
                  />
                ))}
                {/* Time indicator only in today's column */}
                {isToday(day) && <CurrentTimeIndicator hourHeight={HOUR_HEIGHT} />}
                {(tasksByDay[key] || []).map((task) => (
                  <TaskBlock key={task.id} task={task} style={getTaskStyle(task)} compact />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
