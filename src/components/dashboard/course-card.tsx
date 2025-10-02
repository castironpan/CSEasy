"use client";
import type { Course } from '@/lib/types';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const courseLinks: Record<string, string> = {
    COMP1521: "https://cgi.cse.unsw.edu.au/~cs1521/25T3/",
    COMP2521: "https://webcms3.cse.unsw.edu.au/COMP2521/25T3/",
    COMP2511: "https://cgi.cse.unsw.edu.au/~cs2511/25T3/",
  };

  const websiteUrl = courseLinks[course.code] || course.websiteUrl || "#";
  
  return (
    <Link
      href={`/courses/${course.id}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-xl h-full"
    >
      <Card
        data-slot="card"
        className="h-full text-card-foreground flex flex-col gap-6 rounded-xl border bg-[#1a1d24] border-[#2a2d35] p-6 transition-colors group-hover:border-primary/60"
      >
        <CardContent
          data-slot="card-content"
          className="p-0 flex flex-col h-full justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: course.color }}
            >
              {course.initials}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
              {course.code}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{course.name}</p>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Course Progress</span>
              <span className="text-xs text-gray-400">{course.progress}%</span>
            </div>
            <div className="w-full bg-[#0f1117] rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${course.progress}%`,
                  backgroundColor: course.color,
                }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {course.weeks} of {course.totalWeeks} weeks
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(websiteUrl, '_blank', 'noopener');
              }}
              className="text-xs font-medium hover:underline"
              style={{ color: course.color }}
            >
              Course Site ↗
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}