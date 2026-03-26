'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlannerStore } from '@/store/planner'
import { Task } from '@/types'
import { format } from 'date-fns'
import { expandRecurringTasks } from '@/lib/recurrence'

export function useTasks() {
  const { setTasks, addTask, updateTask, removeTask, setVisibleRange } = usePlannerStore()
  const supabase = createClient()

  const fetchTasksForDate = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', dateStr)
      .order('start_time')

    if (!error && data) setTasks(data as Task[])
  }, [supabase, setTasks])

  const fetchTasksForRange = useCallback(async (from: string, to: string) => {
    setVisibleRange({ from, to })

    // Fetch tasks with dates inside the range
    const { data: inRange, error: e1 } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date')
      .order('start_time')

    // Also fetch recurring tasks that started before the range — they may recur into it
    const { data: recurringBefore, error: e2 } = await supabase
      .from('tasks')
      .select('*')
      .neq('recurrence', 'none')
      .lt('date', from)

    if (e1 || e2) return

    // Merge and deduplicate by id
    const merged = [...(inRange ?? []), ...(recurringBefore ?? [])]
    const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values()) as Task[]

    setTasks(expandRecurringTasks(unique, from, to))
  }, [supabase, setTasks, setVisibleRange])

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    // Strip client-only fields before persisting
    const { _recurringInstance: _ri, _sourceTaskId: _si, ...payload } = task as Task
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      const { from, to } = usePlannerStore.getState().visibleRange ?? {}
      if (from && to) {
        // Re-expand to include new task's instances in the visible range
        const currentBase = usePlannerStore.getState().tasks.filter((t) => !t._recurringInstance)
        setTasks(expandRecurringTasks([...currentBase, data as Task], from, to))
      } else {
        addTask(data as Task)
      }
    }
    return { data, error }
  }, [supabase, addTask, setTasks])

  const editTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Strip client-only fields before persisting
    const { _recurringInstance: _ri, _sourceTaskId: _si, ...safeUpdates } = updates as Task
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      const { from, to } = usePlannerStore.getState().visibleRange ?? {}
      if (from && to && (data as Task).recurrence !== 'none') {
        // Re-expand: replace the updated source task, keep other base tasks
        const currentBase = usePlannerStore.getState().tasks
          .filter((t) => !t._recurringInstance)
          .map((t) => (t.id === id ? (data as Task) : t))
        setTasks(expandRecurringTasks(currentBase, from, to))
      } else {
        updateTask(data as Task)
      }
    }
    return { data, error }
  }, [supabase, updateTask, setTasks])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      // Remove source task and all its expanded instances
      const current = usePlannerStore.getState().tasks
      const updated = current.filter((t) => t.id !== id && t._sourceTaskId !== id)
      setTasks(updated)
    }
    return { error }
  }, [supabase, setTasks, removeTask])

  const toggleComplete = useCallback(async (task: Task) => {
    const effectiveId = task._recurringInstance ? task._sourceTaskId! : task.id
    return editTask(effectiveId, { completed: !task.completed })
  }, [editTask])

  return { fetchTasksForDate, fetchTasksForRange, createTask, editTask, deleteTask, toggleComplete }
}
