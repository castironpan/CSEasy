import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { getCourses, getTasks, getAnnouncements, getTodos } from '@/lib/data';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { CoursesOverview } from '@/components/dashboard/courses-overview';
import { DeadlineCalendar } from '@/components/dashboard/deadline-calendar';
import { AITodoList } from '@/components/dashboard/ai-todo-list';
import { CourseUpdatesFeed } from '@/components/dashboard/course-updates-feed';

export default async function DashboardPage() {
  const courses = await getCourses();
  const tasks = await getTasks();
  const announcements = await getAnnouncements();
  const todos = await getTodos();

  return (
    <SidebarProvider>
      <AppSidebar courses={courses} />
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <OverviewStats tasks={tasks} courses={courses} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <UpcomingDeadlines initialTasks={tasks} courses={courses} />
                <CoursesOverview courses={courses} />
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <DeadlineCalendar tasks={tasks} />
                <AITodoList initialTodos={todos} />
                <CourseUpdatesFeed announcements={announcements} courses={courses} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
