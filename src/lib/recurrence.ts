import { addDays, addWeeks, addMonths, parseISO, isAfter, isBefore, format } from 'date-fns'
import type { Task } from '@/types'

const DEFAULT_HORIZON_DAYS = 90

/**
 * Expands recurring tasks into individual instances within [from, to].
 * Non-recurring tasks are passed through unchanged (if they fall in the range).
 * Recurring tasks whose origin date is before the range are still expanded into it.
 *
 * Pure function — no side effects.
 */
export function expandRecurringTasks(tasks: Task[], from: string, to: string): Task[] {
  const fromDate = parseISO(from)
  const toDate = parseISO(to)
  const result: Task[] = []

  for (const task of tasks) {
    if (task.recurrence === 'none') {
      const taskDate = parseISO(task.date)
      if (!isBefore(taskDate, fromDate) && !isAfter(taskDate, toDate)) {
        result.push(task)
      }
      continue
    }

    const originDate = parseISO(task.date)
    const horizon = task.recurrence_end_date
      ? parseISO(task.recurrence_end_date)
      : addDays(originDate, DEFAULT_HORIZON_DAYS)

    // Include source occurrence if it falls in range
    if (!isBefore(originDate, fromDate) && !isAfter(originDate, toDate)) {
      result.push(task)
    }

    // Generate subsequent occurrences
    let current = originDate
    for (let safety = 0; safety < 3650; safety++) {
      if (task.recurrence === 'daily') current = addDays(current, 1)
      else if (task.recurrence === 'weekly') current = addWeeks(current, 1)
      else current = addMonths(current, 1)

      if (isAfter(current, horizon)) break
      if (isAfter(current, toDate)) break

      if (isBefore(current, fromDate)) continue

      const dateStr = format(current, 'yyyy-MM-dd')
      result.push({
        ...task,
        id: `${task.id}::${dateStr}`,
        date: dateStr,
        _recurringInstance: true,
        _sourceTaskId: task.id,
      })
    }
  }

  return result.sort(
    (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)
  )
}
