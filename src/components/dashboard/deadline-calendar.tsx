// 'use client';

// import { useState } from 'react';
// import type { Task } from '@/lib/types';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Calendar } from '@/components/ui/calendar';
// import { isSameDay, format } from 'date-fns';
// import { Badge } from '../ui/badge';

// interface DeadlineCalendarProps {
//   tasks: Task[];
// }

// export function DeadlineCalendar({ tasks }: DeadlineCalendarProps) {
//   const [date, setDate] = useState<Date | undefined>(new Date());

//   const deadlineDates = tasks
//     .filter((task) => !task.completed)
//     .map((task) => new Date(task.dueDate));

//   const selectedDayTasks = tasks.filter(
//     (task) => date && isSameDay(new Date(task.dueDate), date)
//   );

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Deadline Calendar</CardTitle>
//         <CardDescription>An overview of your deadlines for the month.</CardDescription>
//       </CardHeader>
//       <CardContent className="flex flex-col items-center">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={setDate}
//           className="rounded-md border"
//           modifiers={{ deadlines: deadlineDates }}
//           modifiersStyles={{
//             deadlines: {
//               color: 'hsl(var(--accent-foreground))',
//               backgroundColor: 'hsl(var(--accent))',
//             },
//           }}
//         />
//         <div className="mt-4 w-full">
//             <h4 className="font-medium text-center mb-2">
//                 {date ? format(date, 'MMMM do') : 'Select a date'}
//             </h4>
//             <div className="space-y-2">
//                 {selectedDayTasks.length > 0 ? (
//                     selectedDayTasks.map(task => (
//                         <div key={task.id} className="text-sm p-2 rounded-md border bg-background flex justify-between items-center">
//                             <span>{task.title}</span>
//                             <Badge variant={task.completed ? 'default' : 'secondary'}>{task.completed ? 'Done' : 'Due'}</Badge>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-sm text-muted-foreground text-center">No deadlines for this day.</p>
//                 )}
//             </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

'use client';
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  courseId: string;
  title: string;
  type: string;
  dueDate: string;
  completed: boolean;
}

interface Course {
  id: string;
  code: string;
  color: string;
}

interface DeadlineCalendarProps {
  tasks: Task[];
  courses: Course[];
}

export function DeadlineCalendar({ tasks, courses }: DeadlineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return !task.completed && taskDate.toDateString() === date.toDateString();
    });
  };

  // Get course color
  const getCourseColor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.color : 'rgb(156, 163, 175)';
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-700" />
        <h3 className="font-bold text-gray-900">Calendar</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">View deadlines by date</p>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">{monthName}</span>
        <button 
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const tasksForDay = day ? getTasksForDate(day) : [];
          const isSelected = selectedDate && day && selectedDate.toDateString() === day.toDateString();
          const isToday = day && day.toDateString() === new Date().toDateString();
          
          return (
            <button
              key={idx}
              onClick={() => day && setSelectedDate(day)}
              disabled={!day}
              className={`aspect-square p-1 text-sm rounded relative transition-colors ${
                !day ? 'invisible' :
                isSelected ? 'bg-blue-500 text-white font-bold' :
                isToday ? 'bg-gray-100 font-semibold' :
                'hover:bg-gray-100'
              }`}
            >
              {day && (
                <>
                  <span>{day.getDate()}</span>
                  {tasksForDay.length > 0 && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {tasksForDay.slice(0, 3).map((task, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getCourseColor(task.courseId) }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Course Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-2">Assignment Due Dates:</div>
        <div className="space-y-1">
          {courses.map(course => (
            <div key={course.id} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }}></div>
              <span className="text-gray-600">{course.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && selectedDateTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric' 
            })}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {selectedDateTasks.length} assignment(s) due
          </div>
          <div className="space-y-2">
            {selectedDateTasks.map(task => {
              const course = courses.find(c => c.id === task.courseId);
              return (
                <div key={task.id} className="p-2 bg-gray-50 rounded flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: getCourseColor(task.courseId) }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {course?.code}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded whitespace-nowrap ml-2">
                    {task.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for selected date with no tasks */}
      {selectedDate && selectedDateTasks.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric' 
            })}
          </div>
          <p className="text-xs text-gray-500">No deadlines for this day.</p>
        </div>
      )}
    </div>
  );
}