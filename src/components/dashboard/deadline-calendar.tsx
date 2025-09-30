 'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import type { StudentTask } from '@/lib/types';
import { useState } from 'react';
import { isSameDay } from 'date-fns';

interface DeadlineCalendarProps {
  tasks: StudentTask[];
}

export function DeadlineCalendar({ tasks }: DeadlineCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksOnSelectedDay = tasks.filter(
    (task) => date && isSameDay(new Date(task.dueDate), date)
  );

  const modifiers = {
    due: tasks.map((task) => new Date(task.dueDate)),
  };

  const modifiersStyles = {
    due: {
      textDecoration: 'underline',
      textDecorationColor: 'var(--destructive)',
      textDecorationThickness: '2px',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deadline Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
        <div className="mt-4 w-full space-y-2">
          <h3 className="text-sm font-semibold">
            Tasks due on {date ? date.toLocaleDateString() : 'selected date'}
          </h3>
          {tasksOnSelectedDay.length > 0 ? (
            tasksOnSelectedDay.map((task) => (
              <div key={task.id} className="flex justify-between items-center text-xs p-2 rounded-md bg-muted/50">
                <span>{task.title}</span>
                <Badge variant={task.completed ? 'secondary' : 'destructive'}>
                  {task.completed ? 'Done' : 'Due'}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No deadlines on this day.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
