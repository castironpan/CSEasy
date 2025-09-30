import type { Course } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { CourseCard } from './course-card';

interface CoursesOverviewProps {
  courses: Course[];
}

export function CoursesOverview({ courses }: CoursesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>An overview of your enrolled courses and their progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            return <CourseCard key={course.id} course={course} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
