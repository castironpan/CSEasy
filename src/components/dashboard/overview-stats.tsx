import type { Task, Course } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, BookOpen, Clock } from 'lucide-react';

interface OverviewStatsProps {
  tasks: Task[];
  courses: Course[];
}

export function OverviewStats({ tasks, courses }: OverviewStatsProps) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const upcomingTasks = tasks.filter(
    (task) =>
      !task.completed && new Date(task.dueDate) > new Date()
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Semester at a Glance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses Enrolled</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="bg-accent/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
              <p className="text-2xl font-bold">{upcomingTasks}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-sm font-medium text-primary">{`${completionPercentage.toFixed(
              0
            )}%`}</p>
          </div>
          <Progress value={completionPercentage} aria-label="Overall course completion progress" />
        </div>
      </CardContent>
    </Card>
  );
}
