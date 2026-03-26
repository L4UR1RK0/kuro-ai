'use client'

import { useState, useEffect } from 'react'
import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { Task, TaskColor, TaskIcon } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { COLOR_MAP, TASK_COLORS } from '@/lib/colors'
import { TaskIconComponent, TASK_ICONS } from '@/lib/icons'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'

export function TaskModal() {
  const { isTaskModalOpen, closeTaskModal, editingTask, selectedSlotTime, selectedDate } = usePlannerStore()
  const { createTask, editTask, deleteTask } = useTasks()

  const defaultStart = selectedSlotTime ?? '09:00'
  const [h, m] = defaultStart.split(':').map(Number)
  const endH = Math.min(h + 1, 23)
  const defaultEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(format(selectedDate, 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [color, setColor] = useState<TaskColor>('blue')
  const [icon, setIcon] = useState<TaskIcon>('star')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setNotes(editingTask.notes ?? '')
      setDate(editingTask.date)
      setStartTime(editingTask.start_time)
      setEndTime(editingTask.end_time)
      setColor(editingTask.color)
      setIcon(editingTask.icon)
    } else {
      setTitle('')
      setNotes('')
      setDate(format(selectedDate, 'yyyy-MM-dd'))
      setStartTime(defaultStart)
      setEndTime(defaultEnd)
      setColor('blue')
      setIcon('star')
    }
  }, [editingTask, isTaskModalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const payload = { title: title.trim(), notes, date, start_time: startTime, end_time: endTime, color, icon, completed: false, recurrence: 'none' as const }

    if (editingTask) {
      await editTask(editingTask.id, payload)
    } else {
      const { data: { user } } = await (await import('@/lib/supabase/client')).createClient().auth.getUser()
      if (user) await createTask({ ...payload, user_id: user.id })
    }

    setSaving(false)
    closeTaskModal()
  }

  const handleDelete = async () => {
    if (!editingTask) return
    setSaving(true)
    await deleteTask(editingTask.id)
    setSaving(false)
    closeTaskModal()
  }

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={(open) => !open && closeTaskModal()}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you planning?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-white/60 text-xs mb-1 block">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-1 block">Start</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-1 block">End</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
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
                    color === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]'
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
                    icon === i ? 'bg-white/20' : 'hover:bg-white/10'
                  )}
                >
                  <TaskIconComponent icon={i} className="w-4 h-4 text-white/70" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white/60 text-xs mb-1 block">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-1">
            {editingTask && (
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
            <Button variant="ghost" onClick={closeTaskModal} className="flex-1 text-white/60">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {saving ? 'Saving…' : editingTask ? 'Save' : 'Add Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
