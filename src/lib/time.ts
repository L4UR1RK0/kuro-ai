import { format, startOfWeek, addDays } from 'date-fns'

/** Normalises a Supabase time value (HH:MM:SS or HH:MM) to HH:MM. */
export function sliceTime(time: string): string {
  return time.slice(0, 5)
}

/** Returns the Mon–Sun label for the week containing `date`. */
export function weekRangeLabel(date: Date): string {
  const ws = startOfWeek(date, { weekStartsOn: 1 })
  const we = addDays(ws, 6)
  return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`
}
