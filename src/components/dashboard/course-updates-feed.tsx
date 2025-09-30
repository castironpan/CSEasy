import type { Announcement, Course } from '@/lib/types';
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
import { Megaphone } from 'lucide-react';

interface CourseUpdatesFeedProps {
  announcements: Announcement[];
  courses: Course[];
}

export function CourseUpdatesFeed({
  announcements,
  courses,
}: CourseUpdatesFeedProps) {
  const getCourseCode = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.code || 'N/A';
  };

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
                <div key={announcement.id} className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-full h-fit">
                    <Megaphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{announcement.title}</p>
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
