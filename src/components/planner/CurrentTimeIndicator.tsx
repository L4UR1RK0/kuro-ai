'use client'

import { useEffect, useState } from 'react'
import { timeToPixels } from '@/lib/timeToPixels'

interface Props {
  hourHeight: number
}

function nowTop(hourHeight: number): number {
  const now = new Date()
  return timeToPixels(now.getHours(), now.getMinutes(), hourHeight)
}

/**
 * Renders a horizontal red line at the current time within an absolutely-positioned
 * time grid. Updates its position every minute. The parent must be `position: relative`.
 */
export function CurrentTimeIndicator({ hourHeight }: Props) {
  const [top, setTop] = useState(() => nowTop(hourHeight))

  useEffect(() => {
    const id = setInterval(() => setTop(nowTop(hourHeight)), 60_000)
    return () => clearInterval(id)
  }, [hourHeight])

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ top }}
    >
      <div className="flex items-center">
        {/* Circle on the left edge */}
        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0 -translate-y-[1px]" />
        {/* Horizontal line */}
        <div className="flex-1 h-px bg-red-400" />
      </div>
    </div>
  )
}
