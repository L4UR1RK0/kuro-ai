'use client'

import { useState, useEffect } from 'react'
import { usePlannerStore } from '@/store/planner'
import { useTasks } from '@/hooks/useTasks'
import { Task, TaskColor, TaskIcon, RecurrenceType } from '@/types'
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

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

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
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  // For recurring instances: ask user whether to edit this occurrence or all
  const [editScope, setEditScope] = useState<'single' | 'all' | null>(null)

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setNotes(editingTask.notes ?? '')
      setDate(editingTask.date)
      setStartTime(editingTask.start_time.slice(0, 5))
      setEndTime(editingTask.end_time.slice(0, 5))
      setColor(editingTask.color)
      setIcon(editingTask.icon)
      setRecurrence(editingTask.recurrence)
      setRecurrenceEndDate(editingTask.recurrence_end_date ?? '')
    } else {
      setTitle('')
      setNotes('')
      setDate(format(selectedDate, 'yyyy-MM-dd'))
      setStartTime(defaultStart)
      setEndTime(defaultEnd)
      setColor('blue')
      setIcon('star')
      setRecurrence('none')
      setRecurrenceEndDate('')
    }
    // Reset scope every time the modal opens
    setEditScope(null)
  }, [editingTask, isTaskModalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const payload = {
      title: title.trim(),
      notes,
      date,
      start_time: startTime,
      end_time: endTime,
      color,
      icon,
      completed: editingTask?.completed ?? false,
      recurrence,
      recurrence_end_date: recurrenceEndDate || undefined,
    }

    if (editingTask) {
      // Determine which record to update
      let targetId = editingTask.id
      if (editingTask._recurringInstance) {
        if (editScope === 'all') {
          // Edit all: update the source record (recurrence settings preserved)
          targetId = editingTask._sourceTaskId!
        } else {
          // Edit this: ideally creates an exception; for now edits the source record.
          // TODO: implement per-instance exceptions (requires a separate exceptions table)
          targetId = editingTask._sourceTaskId!
        }
      }
      await editTask(targetId, payload)
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
    const targetId = editingTask._recurringInstance ? editingTask._sourceTaskId! : editingTask.id
    await deleteTask(targetId)
    setSaving(false)
    closeTaskModal()
  }

  // When the user clicks a recurring instance, show the scope chooser first
  const showScopeChooser = editingTask?._recurringInstance && editScope === null

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={(open) => !open && closeTaskModal()}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        {showScopeChooser ? (
          /* Scope chooser for recurring instance edits */
          <div className="space-y-4 py-2">
            <p className="text-white/70 text-sm">This is a recurring task. What would you like to edit?</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setEditScope('single')}
                variant="ghost"
                className="justify-start text-white/90 hover:bg-white/10"
              >
                Edit this event
              </Button>
              <Button
                onClick={() => setEditScope('all')}
                variant="ghost"
                className="justify-start text-white/90 hover:bg-white/10"
              >
                Edit all events
              </Button>
            </div>
            <Button variant="ghost" onClick={closeTaskModal} className="w-full text-white/50">
              Cancel
            </Button>
          </div>
        ) : (
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

            {/* Recurrence picker */}
            <div>
              <Label className="text-white/60 text-xs mb-2 block">Repeat</Label>
              <div className="flex gap-2">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRecurrence(opt.value)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                      recurrence === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* End date — only shown when recurrence is active */}
            {recurrence !== 'none' && (
              <div>
                <Label className="text-white/60 text-xs mb-1 block">
                  End date <span className="text-white/30">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

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
                    title={i.charAt(0).toUpperCase() + i.slice(1)}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
