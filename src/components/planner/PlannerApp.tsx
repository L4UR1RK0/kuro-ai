'use client'

import { usePlannerStore } from '@/store/planner'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { DayView } from './DayView'
import { MultiDayView } from './MultiDayView'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { TaskModal } from '@/components/tasks/TaskModal'

export function PlannerApp() {
  const { view } = usePlannerStore()

  return (
    <div className="flex h-screen bg-[#08080f] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'day' && <DayView />}
          {view === 'multiday' && <MultiDayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
        </div>
      </div>
      <TaskModal />
    </div>
  )
}
