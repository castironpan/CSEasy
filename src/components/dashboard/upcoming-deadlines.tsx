'use client';

import { useState, useOptimistic, useTransition, useEffect } from 'react';
import type { StudentTask, StudentCourseView } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { toggleTaskCompletion } from '@/app/actions';

interface UpcomingDeadlinesProps {
  initialTasks: StudentTask[];
  courses: StudentCourseView[];
  studentId: string;
}

type OptimisticTask = StudentTask & { pending?: boolean };

export function UpcomingDeadlines({
  initialTasks,
  courses,
  studentId,
}: UpcomingDeadlinesProps) {
  const [tasks, setTasks] = useState<StudentTask[]>(initialTasks);
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const [optimisticTasks, setOptimisticTasks] = useOptimistic<
    OptimisticTask[],
    { taskId: string; completed: boolean }
  >(
    tasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ),
    (state, { taskId, completed }) =>
      state.map((t) =>
        t.id === taskId ? { ...t, completed, pending: true } : t
      )
  );
  let [, startTransition] = useTransition();

  const getCourseCode = (courseId: string) =>
    courses.find((c) => c.id === courseId)?.code || 'N/A';
  const getDueDateInfo = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date))
      return {
        text: `Due ${formatDistanceToNow(date, { addSuffix: true })}`,
        color: 'text-destructive',
        badge: 'destructive' as const,
      };
    if (isToday(date))
      return {
        text: `Due today`,
        color: 'text-accent-foreground',
        badge: 'secondary' as const,
      };
    return {
      text: `Due in ${formatDistanceToNow(date)}`,
      color: 'text-muted-foreground',
      badge: 'outline' as const,
    };
  };

  async function handleToggle(task: StudentTask, checked: boolean) {
    startTransition(async () => {
      setOptimisticTasks({ taskId: task.id, completed: checked });
      await toggleTaskCompletion(task.id, studentId);
    });
  }

  const openTasks = optimisticTasks.filter((t) => !t.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>
          Don't miss these upcoming assignments and labs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {openTasks.slice(0, 5).map((task) => {
            const dueDateInfo = getDueDateInfo(task.dueDate);
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-4 transition-opacity',
                  task.pending && 'opacity-50'
                )}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(c) => handleToggle(task, !!c)}
                  aria-label={`Mark ${task.title} as complete`}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">
                      {getCourseCode(task.courseId)}
                    </Badge>
                    <span className={dueDateInfo.color}>
                      {dueDateInfo.text}
                    </span>
                  </div>
                </div>
                <Badge variant={dueDateInfo.badge}>{task.sourceType}</Badge>
              </div>
            );
          })}
          {openTasks.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              You're all caught up! ✨
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
