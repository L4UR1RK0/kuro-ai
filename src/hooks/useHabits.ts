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

      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', dateStr)
        .maybeSingle()

      let result
      if (existing) {
        result = await supabase
          .from('habit_logs')
          .update({ completed: newCompleted })
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }
        result = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, user_id: user.id, date: dateStr, completed: newCompleted })
          .select()
          .single()
      }

      if (!result.error && result.data) upsertLog(result.data as HabitLog)
      return { data: result.data, error: result.error }
    },
    [supabase, upsertLog],
  )

  return { fetchHabits, createHabit, editHabit, deleteHabit, fetchHabitLogs, logHabit }
}
