import {
  BookOpen, Briefcase, Dumbbell, Utensils, Coffee,
  Music, Code, Heart, Star, Zap, Sun, Moon, Home, Car, Plane,
} from 'lucide-react'
import { TaskIcon } from '@/types'

export const ICON_MAP: Record<TaskIcon, React.ComponentType<{ className?: string }>> = {
  book:      BookOpen,
  briefcase: Briefcase,
  dumbbell:  Dumbbell,
  utensils:  Utensils,
  coffee:    Coffee,
  music:     Music,
  code:      Code,
  heart:     Heart,
  star:      Star,
  zap:       Zap,
  sun:       Sun,
  moon:      Moon,
  home:      Home,
  car:       Car,
  plane:     Plane,
}

export const TASK_ICONS: TaskIcon[] = Object.keys(ICON_MAP) as TaskIcon[]

export function TaskIconComponent({ icon, className }: { icon: TaskIcon; className?: string }) {
  const Icon = ICON_MAP[icon]
  return <Icon className={className} />
}
