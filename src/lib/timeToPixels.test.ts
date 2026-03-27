import { describe, it, expect } from 'vitest'
import { timeToPixels } from './timeToPixels'

describe('timeToPixels', () => {
  it('returns 0 for midnight with any hourHeight', () => {
    expect(timeToPixels(0, 0, 64)).toBe(0)
    expect(timeToPixels(0, 0, 48)).toBe(0)
  })

  it('places each exact hour at hourHeight * hour', () => {
    expect(timeToPixels(9, 0, 64)).toBe(576)   // 9 * 64
    expect(timeToPixels(12, 0, 48)).toBe(576)  // 12 * 48
    expect(timeToPixels(17, 0, 56)).toBe(952)  // 17 * 56
  })

  it('interpolates minutes as a fraction of hourHeight', () => {
    expect(timeToPixels(8, 30, 64)).toBe(544)  // (8 + 0.5) * 64
    expect(timeToPixels(0, 15, 64)).toBe(16)   // (0 + 0.25) * 64
    expect(timeToPixels(0, 45, 64)).toBe(48)   // (0 + 0.75) * 64
  })

  it('handles end-of-day times', () => {
    expect(timeToPixels(23, 0, 64)).toBe(1472)          // 23 * 64
    expect(timeToPixels(23, 59, 64)).toBeCloseTo(1534.93, 1) // (23 + 59/60) * 64
  })

  it('scales linearly with hourHeight', () => {
    const h = 10
    const m = 30
    const p64 = timeToPixels(h, m, 64)
    const p48 = timeToPixels(h, m, 48)
    const p56 = timeToPixels(h, m, 56)
    // ratio should match hourHeight ratio
    expect(p64 / p48).toBeCloseTo(64 / 48)
    expect(p64 / p56).toBeCloseTo(64 / 56)
  })

  it('works with each view\'s hourHeight constant', () => {
    // DayView: 64, WeekView: 48, MultiDayView: 56
    expect(timeToPixels(9, 0, 64)).toBe(576)
    expect(timeToPixels(9, 0, 48)).toBe(432)
    expect(timeToPixels(9, 0, 56)).toBe(504)
  })
})
