import { redirect } from 'next/navigation';
import { getStudentIdFromCookie } from '@/lib/session';
import { getStudentCourseDetail } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { StudentTask } from '@/lib/types';
import { TaskToggleList } from '@/components/course/task-toggle-list';
// Ensure this page always reflects latest in-memory mutations (no static caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sortTasks(tasks: StudentTask[]): StudentTask[] {
  return tasks.slice().sort((a, b) => {
    const aTime = a.dueDate ? parseISO(a.dueDate).getTime() : 0;
    const bTime = b.dueDate ? parseISO(b.dueDate).getTime() : 0;
    return aTime - bTime;
  });
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params; // Next.js dynamic params now async
  const studentId = await getStudentIdFromCookie();
  if (!studentId) redirect('/login');

  const { course, tasks } = await getStudentCourseDetail(courseId, studentId);
  console.log('Course detail', course, tasks);
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  const sortedActive = sortTasks(activeTasks);
  const sortedCompleted = sortTasks(completedTasks).reverse();
  // Determine planned totals (may exceed released items)
  const releasedLabCount = course.labs?.length || 0;
  const releasedAssignmentCount = course.assignments?.length || 0;
  const totalLabs = (course as any).totalLabs ?? releasedLabCount;
  const totalAssignments = (course as any).totalAssignments ?? releasedAssignmentCount;
  const plannedTotal = totalLabs + totalAssignments;
  const completedCount = completedTasks.length;
  const percent = plannedTotal === 0 ? 0 : Math.round((completedCount / plannedTotal) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
            <p className="text-muted-foreground mt-1">{course.code} • {course.instructor || 'Instructor TBA'}</p>
          </div>
          <div className="flex gap-2">
            {course.websiteUrl && (
              <Button asChild variant="outline">
                <a href={course.websiteUrl} target="_blank" rel="noopener noreferrer">Open Course Site ↗</a>
              </Button>
            )}
            <Link href="/" passHref>
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Course Progress</span>
              <span className="text-xs text-gray-400">{course.progress}%</span>
            </div>
            <div className="w-full bg-[#0f1117] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%`, backgroundColor: course.color }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{course.weeks} of {course.totalWeeks} weeks</span>
              <span>{completedCount}/{plannedTotal} tasks</span>
            </div>
          </div>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Tasks</CardTitle>
            <p className="text-xs text-muted-foreground">Assignments & labs not yet completed</p>
          </CardHeader>
          <CardContent>
            <TaskToggleList tasks={sortedActive} studentId={studentId} variant="active" />
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Completed Tasks</CardTitle>
            <p className="text-xs text-muted-foreground">Historical record of finished work</p>
          </CardHeader>
          <CardContent>
            <TaskToggleList tasks={sortedCompleted} studentId={studentId} variant="completed" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
