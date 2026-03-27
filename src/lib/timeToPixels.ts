/**
 * Converts a time (hours + minutes) to a pixel offset from the top of a time grid.
 * The grid is assumed to start at midnight (hour 0).
 *
 * Pure function — no side effects, easy to unit test.
 *
 * @param hours   Integer hours (0–23)
 * @param minutes Integer minutes (0–59)
 * @param hourHeight  Pixel height of one hour row in the grid
 * @returns Pixel offset from top of grid
 */
export function timeToPixels(hours: number, minutes: number, hourHeight: number): number {
  return (hours + minutes / 60) * hourHeight
}
