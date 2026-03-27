import { describe, it, expect } from 'vitest'
import { sliceTime, weekRangeLabel } from '../time'

describe('sliceTime', () => {
  it('returns HH:MM from HH:MM:SS', () => {
    expect(sliceTime('10:00:00')).toBe('10:00')
  })
  it('returns HH:MM from HH:MM unchanged', () => {
    expect(sliceTime('10:00')).toBe('10:00')
  })
  it('handles midnight', () => {
    expect(sliceTime('00:00:00')).toBe('00:00')
  })
  it('handles end of day', () => {
    expect(sliceTime('23:59:00')).toBe('23:59')
  })
})

describe('weekRangeLabel', () => {
  it('returns Mon–Sun of the week containing the date', () => {
    // Wednesday 2026-03-25 → week is Mon Mar 23 – Sun Mar 29
    const result = weekRangeLabel(new Date(2026, 2, 25))
    expect(result).toBe('Mar 23 – Mar 29, 2026')
  })
  it('works when selectedDate is already Monday', () => {
    // Monday 2026-03-23 → week is Mon Mar 23 – Sun Mar 29
    const result = weekRangeLabel(new Date(2026, 2, 23))
    expect(result).toBe('Mar 23 – Mar 29, 2026')
  })
  it('works when selectedDate is Sunday', () => {
    // Sunday 2026-03-29 → week is Mon Mar 23 – Sun Mar 29
    const result = weekRangeLabel(new Date(2026, 2, 29))
    expect(result).toBe('Mar 23 – Mar 29, 2026')
  })
  it('handles cross-month weeks', () => {
    // Friday 2026-03-27 → week is Mon Mar 23 – Sun Mar 29
    const result = weekRangeLabel(new Date(2026, 2, 27))
    expect(result).toBe('Mar 23 – Mar 29, 2026')
  })
})
