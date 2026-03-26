import { TaskColor } from '@/types'

export const COLOR_MAP: Record<TaskColor, { bg: string; text: string; border: string; dot: string }> = {
  rose:    { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500',    dot: 'bg-rose-500' },
  orange:  { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500',  dot: 'bg-orange-500' },
  amber:   { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500',   dot: 'bg-amber-500' },
  lime:    { bg: 'bg-lime-500/20',    text: 'text-lime-300',    border: 'border-lime-500',    dot: 'bg-lime-500' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500', dot: 'bg-emerald-500' },
  cyan:    { bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    border: 'border-cyan-500',    dot: 'bg-cyan-500' },
  blue:    { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500',    dot: 'bg-blue-500' },
  violet:  { bg: 'bg-violet-500/20',  text: 'text-violet-300',  border: 'border-violet-500',  dot: 'bg-violet-500' },
  pink:    { bg: 'bg-pink-500/20',    text: 'text-pink-300',    border: 'border-pink-500',    dot: 'bg-pink-500' },
  slate:   { bg: 'bg-slate-500/20',   text: 'text-slate-300',   border: 'border-slate-500',   dot: 'bg-slate-500' },
}

export const TASK_COLORS: TaskColor[] = [
  'rose', 'orange', 'amber', 'lime', 'emerald', 'cyan', 'blue', 'violet', 'pink', 'slate',
]
