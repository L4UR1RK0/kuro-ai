'use client'

import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { format, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isToday, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export function Sidebar() {
  const { selectedDate, setSelectedDate, openTaskModal, tasks, view } = usePlannerStore()
  const { fetchTasksForRange } = useTasks()

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  useEffect(() => {
    fetchTasksForRange(
      format(gridStart, 'yyyy-MM-dd'),
      format(gridEnd, 'yyyy-MM-dd')
    )
  }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const taskDates = new Set(tasks.map((t) => t.date))

  const todayTasks = tasks
    .filter((t) => t.date === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-[#0f0f1a] border-r border-white/5 h-full">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">kuro</span>
      </div>

      {/* Mini calendar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-1 rounded hover:bg-white/10 text-white/60">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white/80">
            {format(selectedDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-1 rounded hover:bg-white/10 text-white/60">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-white/30 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const hasTask = taskDates.has(key)
            const selected = isSameDay(day, selectedDate)
            const inMonth = isSameMonth(day, selectedDate)

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-full w-8 h-8 mx-auto text-xs transition-all',
                  !inMonth && 'opacity-20',
                  selected ? 'bg-blue-600 text-white' : isToday(day) ? 'text-blue-400 font-semibold' : 'text-white/60 hover:bg-white/10',
                )}
              >
                {format(day, 'd')}
                {hasTask && !selected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-3">
        <Button
          onClick={() => openTaskModal()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Today's tasks list */}
      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-xs text-white/30 font-medium mb-2 uppercase tracking-wider">
          {format(selectedDate, 'MMM d')}
        </p>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-white/20 italic">No tasks</p>
        ) : (
          <div className="space-y-1">
            {todayTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => usePlannerStore.getState().openTaskModal(undefined, task)}
                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', `bg-${task.color}-500`)} />
                  <span className={cn('text-xs text-white/70 truncate', task.completed && 'line-through opacity-50')}>
                    {task.title}
                  </span>
                </div>
                <p className="text-[10px] text-white/30 ml-4">{task.start_time} – {task.end_time}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
