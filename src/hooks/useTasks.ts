'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlannerStore } from '@/store/planner'
import { Task } from '@/types'
import { format } from 'date-fns'

export function useTasks() {
  const { setTasks, addTask, updateTask, removeTask } = usePlannerStore()
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
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date')
      .order('start_time')

    if (!error && data) setTasks(data as Task[])
  }, [supabase, setTasks])

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (!error && data) addTask(data as Task)
    return { data, error }
  }, [supabase, addTask])

  const editTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) updateTask(data as Task)
    return { data, error }
  }, [supabase, updateTask])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) removeTask(id)
    return { error }
  }, [supabase, removeTask])

  const toggleComplete = useCallback(async (task: Task) => {
    return editTask(task.id, { completed: !task.completed })
  }, [editTask])

  return { fetchTasksForDate, fetchTasksForRange, createTask, editTask, deleteTask, toggleComplete }
}
