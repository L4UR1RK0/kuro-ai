'use client'

import { useState, useEffect } from 'react'
import { useHabitsStore } from '@/store/habits'
import { useHabits } from '@/hooks/useHabits'
import { Habit, TaskColor, TaskIcon } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { COLOR_MAP, TASK_COLORS } from '@/lib/colors'
import { TaskIconComponent, TASK_ICONS } from '@/lib/icons'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function HabitModal() {
  const { isHabitModalOpen, closeHabitModal, editingHabit } = useHabitsStore()
  const { createHabit, editHabit, deleteHabit } = useHabits()

  const [title, setTitle] = useState('')
  const [color, setColor] = useState<TaskColor>('emerald')
  const [icon, setIcon] = useState<TaskIcon>('star')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title)
      setColor(editingHabit.color)
      setIcon(editingHabit.icon)
      setFrequency(editingHabit.frequency)
      setTargetDays(editingHabit.target_days)
    } else {
      setTitle('')
      setColor('emerald')
      setIcon('star')
      setFrequency('daily')
      setTargetDays([0, 1, 2, 3, 4, 5, 6])
    }
  }, [editingHabit, isHabitModalOpen])

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    )
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const payload = { title: title.trim(), color, icon, frequency, target_days: targetDays }

    if (editingHabit) {
      await editHabit(editingHabit.id, payload)
    } else {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await createHabit({ ...payload, user_id: user.id })
    }

    setSaving(false)
    closeHabitModal()
  }

  const handleDelete = async () => {
    if (!editingHabit) return
    setSaving(true)
    await deleteHabit(editingHabit.id)
    setSaving(false)
    closeHabitModal()
  }

  return (
    <Dialog open={isHabitModalOpen} onOpenChange={(open) => !open && closeHabitModal()}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{editingHabit ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What habit are you building?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus
            />
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-white/60 text-xs mb-2 block">Frequency</Label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm capitalize transition-all',
                    frequency === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Target days */}
          <div>
            <Label className="text-white/60 text-xs mb-2 block">Target Days</Label>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                    targetDays.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <Label className="text-white/60 text-xs mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    COLOR_MAP[c].dot,
                    color === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <Label className="text-white/60 text-xs mb-2 block">Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {TASK_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    icon === i ? 'bg-white/20' : 'hover:bg-white/10',
                  )}
                >
                  <TaskIconComponent icon={i} className="w-4 h-4 text-white/70" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {editingHabit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={saving}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={closeHabitModal} className="flex-1 text-white/60">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {saving ? 'Saving…' : editingHabit ? 'Save' : 'Add Habit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
