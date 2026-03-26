'use client'

import { useEffect } from 'react'
import { useHabitsStore } from '@/store/habits'
import { useHabits } from '@/hooks/useHabits'
import { HabitBlock } from './HabitBlock'
import { HabitModal } from './HabitModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { format, getDay } from 'date-fns'

interface HabitsPanelProps {
  selectedDate: Date
}

export function HabitsPanel({ selectedDate }: HabitsPanelProps) {
  const { habits, logs, openHabitModal } = useHabitsStore()
  const { fetchHabits, fetchHabitLogs, logHabit } = useHabits()

  useEffect(() => {
    fetchHabits()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchHabitLogs(selectedDate)
  }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayOfWeek = getDay(selectedDate) // 0=Sun … 6=Sat

  // Show habits that target today's day of week
  const todayHabits = habits.filter(
    (h) => h.frequency === 'daily' || h.target_days.includes(dayOfWeek),
  )

  const isCompleted = (habitId: string) =>
    logs.some((l) => l.habit_id === habitId && l.date === dateStr && l.completed)

  return (
    <>
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Habits</p>
          <button
            onClick={() => openHabitModal()}
            className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Add habit"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayHabits.length === 0 ? (
          <p className="text-xs text-white/20 italic">No habits for today</p>
        ) : (
          <div className="space-y-1">
            {todayHabits.map((habit) => {
              const completed = isCompleted(habit.id)
              return (
                <HabitBlock
                  key={habit.id}
                  habit={habit}
                  completed={completed}
                  onToggle={() => logHabit(habit.id, selectedDate, completed)}
                  onEdit={() => openHabitModal(habit)}
                />
              )
            })}
          </div>
        )}
      </div>

      <HabitModal />
    </>
  )
}
