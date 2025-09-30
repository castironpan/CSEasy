"use client";
import { useOptimistic, useTransition, useEffect } from 'react';
import { parseISO, format, isBefore } from 'date-fns';
import type { StudentTask } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleTaskCompletion } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface TaskToggleListProps {
  tasks: StudentTask[];
  studentId: string;
  variant: 'active' | 'completed';
}

export function TaskToggleList({ tasks, studentId, variant }: TaskToggleListProps) {
  const router = useRouter();
  const [optimistic, apply] = useOptimistic(tasks, (state: StudentTask[], updated: { id: string; completed: boolean }) =>
    state.map(t => t.id === updated.id ? { ...t, completed: updated.completed, completedAt: updated.completed ? new Date().toISOString() : undefined } : t)
  );
  const [pending, start] = useTransition();

  // Listen for external toggles (from dashboard or another course view)
  useEffect(() => {
    function onTaskToggled(e: Event) {
      const detail = (e as CustomEvent).detail as { taskId: string; completed: boolean } | undefined;
      if (!detail) return;
      apply({ id: detail.taskId, completed: detail.completed });
    }
    window.addEventListener('cseasy-task-toggled', onTaskToggled as EventListener);
    return () => window.removeEventListener('cseasy-task-toggled', onTaskToggled as EventListener);
  }, [apply]);

  const list = optimistic.filter(t => variant === 'active' ? !t.completed : t.completed);

  async function handleToggle(task: StudentTask, checked: boolean) {
    start(async () => {
      apply({ id: task.id, completed: checked });
      await toggleTaskCompletion(task.id, studentId);
      window.dispatchEvent(new CustomEvent('cseasy-task-toggled', { detail: { taskId: task.id, completed: checked } }));
      // After server state updates, refresh to get accurate segregation between lists
      router.refresh();
    });
  }

  if (list.length === 0) {
    return <p className="text-sm text-muted-foreground">{variant === 'active' ? 'No active tasks 🎉' : 'No tasks completed yet.'}</p>;
  }

  return (
    <div className="space-y-3">
      {list.map(t => {
        const due = t.dueDate ? parseISO(t.dueDate) : undefined;
        const overdue = variant === 'active' && due && isBefore(due, new Date()) && !t.completed;
        return (
          <div key={t.id} className="rounded border p-3 text-sm bg-background/50 flex gap-3 items-start">
            <Checkbox
              checked={t.completed}
              onCheckedChange={c => handleToggle(t, !!c)}
              aria-label={`Toggle completion for ${t.title}`}
            />
            <div className="flex-1 space-y-1">
              <span className={overdue ? 'font-medium text-destructive' : 'font-medium'}>{t.title}</span>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                <span>{t.sourceType}</span>
                {due && <span>{variant === 'completed' ? `Was due ${format(due, 'MMM d')}` : `Due ${format(due, 'MMM d, HH:mm')}`}</span>}
                {overdue && <span className="text-destructive">Overdue</span>}
                {variant === 'completed' && t.completedAt && <span>Done {format(parseISO(t.completedAt), 'MMM d, HH:mm')}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
