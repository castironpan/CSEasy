import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { getStudent, getStudentCourses, getStudentTasks, getStudentAnnouncements, getStudentTodos } from '@/lib/data';
import { getStudentIdFromCookie } from '@/lib/session';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { CoursesOverview } from '@/components/dashboard/courses-overview';
import { DeadlineCalendar } from '@/components/dashboard/deadline-calendar';
import { AITodoList } from '@/components/dashboard/ai-todo-list';
import { CourseUpdatesFeed } from '@/components/dashboard/course-updates-feed';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const studentId = await getStudentIdFromCookie();
  if (!studentId) {
    redirect('/login');
  }
  const [student, courses, tasks, announcements, todos] = await Promise.all([
    getStudent(studentId),
    getStudentCourses(studentId),
    getStudentTasks(studentId),
    getStudentAnnouncements(studentId),
    getStudentTodos(studentId)
  ]);

  return (
    <SidebarProvider>
      <AppSidebar courses={courses} />
      <SidebarInset>
        <AppHeader student={student} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <OverviewStats tasks={tasks} courses={courses} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <UpcomingDeadlines initialTasks={tasks} courses={courses} studentId={studentId} />
                <CoursesOverview courses={courses} />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <DeadlineCalendar tasks={tasks as any} courses={courses as any} />
                <AITodoList initialTodos={todos} studentId={studentId} />
                <CourseUpdatesFeed announcements={announcements} courses={courses} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
