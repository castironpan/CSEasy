'use client';

import type { Announcement, Course } from '@/lib/types';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Megaphone, ArrowLeft } from 'lucide-react'; // Remove Calendar from here

interface CourseUpdatesFeedProps {
  announcements: Announcement[];
  courses: Course[];
}

export function CourseUpdatesFeed({
  announcements,
  courses,
}: CourseUpdatesFeedProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const getCourseCode = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.code || 'N/A';
  };

  const getCourse = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  // Detail view
  if (selectedAnnouncement) {
    const course = getCourse(selectedAnnouncement.courseId);
    
    return (
      <Card>
        <CardHeader>
          <button
            className="flex items-center gap-2 text-sm hover:underline mb-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Updates
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-mono">
              {course?.code}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {course?.name}
            </span>
          </div>
          <CardTitle className="text-2xl">{selectedAnnouncement.title}</CardTitle>
          <CardDescription className="mt-2">
            Posted {formatDistanceToNow(new Date(selectedAnnouncement.date), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {selectedAnnouncement.content || 'No additional details available.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Updates</CardTitle>
        <CardDescription>Recent announcements from your courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {announcements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="bg-primary/10 p-2 rounded-full h-fit">
                    <Megaphone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium hover:text-primary transition-colors">
                      {announcement.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="font-mono">
                        {getCourseCode(announcement.courseId)}
                      </Badge>
                      <span>
                        {formatDistanceToNow(new Date(announcement.date), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}