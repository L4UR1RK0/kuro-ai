'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHabitsStore } from '@/store/habits'
import { Habit, HabitLog } from '@/types'
import { format } from 'date-fns'

export function useHabits() {
  const { setHabits, addHabit, updateHabit, removeHabit, setLogs, upsertLog } =
    useHabitsStore()
  const supabase = createClient()

  const fetchHabits = useCallback(async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at')

    if (!error && data) setHabits(data as Habit[])
  }, [supabase, setHabits])

  const createHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single()

      if (!error && data) addHabit(data as Habit)
      return { data, error }
    },
    [supabase, addHabit],
  )

  const editHabit = useCallback(
    async (id: string, updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) updateHabit(data as Habit)
      return { data, error }
    },
    [supabase, updateHabit],
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (!error) removeHabit(id)
      return { error }
    },
    [supabase, removeHabit],
  )

  const fetchHabitLogs = useCallback(
    async (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', dateStr)

      if (!error && data) setLogs(data as HabitLog[])
    },
    [supabase, setLogs],
  )

  const logHabit = useCallback(
    async (habitId: string, date: Date, currentCompleted: boolean) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const newCompleted = !currentCompleted

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Not authenticated') }

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: user.id, date: dateStr, completed: newCompleted },
          { onConflict: 'habit_id,date' },
        )
        .select()
        .single()

      if (!error && data) upsertLog(data as HabitLog)
      return { data, error }
    },
    [supabase, upsertLog],
  )

  return { fetchHabits, createHabit, editHabit, deleteHabit, fetchHabitLogs, logHabit }
}
