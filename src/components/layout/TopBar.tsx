'use client'

import { usePlannerStore } from '@/store/planner'
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarView } from '@/types'
import { cn } from '@/lib/utils'

const VIEWS: { label: string; value: CalendarView }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Multi', value: 'multiday' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

export function TopBar() {
  const { view, setView, selectedDate, setSelectedDate } = usePlannerStore()

  const navigate = (dir: 1 | -1) => {
    if (view === 'day') setSelectedDate(dir === 1 ? addDays(selectedDate, 1) : subDays(selectedDate, 1))
    else if (view === 'multiday') setSelectedDate(dir === 1 ? addDays(selectedDate, 3) : subDays(selectedDate, 3))
    else if (view === 'week') setSelectedDate(dir === 1 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1))
    else setSelectedDate(dir === 1 ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1))
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0d1a]">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-sm font-medium text-white/80 hover:text-white transition-colors min-w-[120px] text-center"
        >
          {view === 'month'
            ? format(selectedDate, 'MMMM yyyy')
            : view === 'week'
            ? `${format(selectedDate, 'MMM d')} – ${format(addDays(selectedDate, 6), 'MMM d, yyyy')}`
            : format(selectedDate, 'MMMM d, yyyy')}
        </button>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
        {VIEWS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setView(value)}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              view === value
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/70'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
