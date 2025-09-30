'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay, format } from 'date-fns';
import { Badge } from '../ui/badge';

interface DeadlineCalendarProps {
  tasks: Task[];
}

export function DeadlineCalendar({ tasks }: DeadlineCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const deadlineDates = tasks
    .filter((task) => !task.completed)
    .map((task) => new Date(task.dueDate));

  const selectedDayTasks = tasks.filter(
    (task) => date && isSameDay(new Date(task.dueDate), date)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deadline Calendar</CardTitle>
        <CardDescription>An overview of your deadlines for the month.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{ deadlines: deadlineDates }}
          modifiersStyles={{
            deadlines: {
              color: 'hsl(var(--accent-foreground))',
              backgroundColor: 'hsl(var(--accent))',
            },
          }}
        />
        <div className="mt-4 w-full">
            <h4 className="font-medium text-center mb-2">
                {date ? format(date, 'MMMM do') : 'Select a date'}
            </h4>
            <div className="space-y-2">
                {selectedDayTasks.length > 0 ? (
                    selectedDayTasks.map(task => (
                        <div key={task.id} className="text-sm p-2 rounded-md border bg-background flex justify-between items-center">
                            <span>{task.title}</span>
                            <Badge variant={task.completed ? 'default' : 'secondary'}>{task.completed ? 'Done' : 'Due'}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No deadlines for this day.</p>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
