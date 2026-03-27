'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePlannerStore } from '@/store/planner'
import { format, isToday } from 'date-fns'
import { TaskBlock } from './TaskBlock'
import { CurrentTimeIndicator } from './CurrentTimeIndicator'
import { timeToPixels } from '@/lib/timeToPixels'
import { Task } from '@/types'

const HOUR_HEIGHT = 64 // px per hour
const START_HOUR = 0
const END_HOUR = 24

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function getTaskStyle(task: Task): React.CSSProperties {
  const startMin = timeToMinutes(task.start_time)
  const endMin = timeToMinutes(task.end_time)
  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 28)
  return { top, height, position: 'absolute', left: 4, right: 4 }
}

export function DayView() {
  const { selectedDate, tasks, openTaskModal } = usePlannerStore()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayTasks = tasks.filter((t) => t.date === dateStr)
  const scrollRef = useRef<HTMLDivElement>(null)
  const showIndicator = isToday(selectedDate)

  const hours = useMemo(() =>
    Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR),
  [])

  // Auto-scroll so the current time is in the upper third of the viewport
  useEffect(() => {
    if (!scrollRef.current || !showIndicator) return
    const now = new Date()
    const top = timeToPixels(now.getHours(), now.getMinutes(), HOUR_HEIGHT)
    const containerHeight = scrollRef.current.clientHeight
    scrollRef.current.scrollTo({ top: top - containerHeight / 3, behavior: 'instant' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlotClick = (hour: number, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const minutes = Math.floor((offsetY / HOUR_HEIGHT) * 60)
    const roundedMin = Math.min(Math.round(minutes / 15) * 15, 45)
    const time = `${String(hour).padStart(2, '0')}:${String(roundedMin).padStart(2, '0')}`
    openTaskModal(time)
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h2>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: HOUR_HEIGHT * (END_HOUR - START_HOUR) }}>
          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex cursor-pointer hover:bg-white/[0.02] transition-colors"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              onClick={(e) => handleSlotClick(hour, e)}
            >
              <div className="w-16 shrink-0 pt-1 pr-3 text-right">
                <span className="text-xs text-white/30">
                  {hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
                </span>
              </div>
              <div className="flex-1 border-t border-white/5" />
            </div>
          ))}

          {/* Tasks + time indicator (share the same ml-16 content area) */}
          <div className="absolute inset-0 ml-16">
            {showIndicator && <CurrentTimeIndicator hourHeight={HOUR_HEIGHT} />}
            {dayTasks.map((task) => (
              <TaskBlock key={task.id} task={task} style={getTaskStyle(task)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
