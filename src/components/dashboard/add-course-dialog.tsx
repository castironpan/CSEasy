"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractCourseEvents } from "@/ai/flows/extract-course-events";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const sampleHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>CS 555 - Advanced Algorithms</title>
</head>
<body>
    <h1>Welcome to CS 555!</h1>
    
    <h2>Announcements</h2>
    <p><strong>Jan 10:</strong> Welcome to the class! The first lecture is on Monday.</p>
    <p><strong>Jan 15:</strong> Assignment 1 has been posted. It is due on Jan 29.</p>

    <h2>Deadlines</h2>
    <ul>
        <li><strong>Assignment 1:</strong> Due Jan 29, 11:59 PM</li>
        <li><strong>Lab 1:</strong> Due Feb 5, 11:59 PM</li>
        <li><strong>Midterm Exam:</strong> March 10</li>
    </ul>
</body>
</html>
`;


interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCourseDialog({ open, onOpenChange }: AddCourseDialogProps) {
  const [isExtracting, startExtractionTransition] = useTransition();
  const { toast } = useToast();
  const [courseName, setCourseName] = useState("Advanced Algorithms");
  const [websiteContent, setWebsiteContent] = useState(sampleHtml);

  const handleExtract = () => {
    if (!courseName.trim() || !websiteContent.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a course name and website content.",
      });
      return;
    }
    
    startExtractionTransition(async () => {
      try {
        const result = await extractCourseEvents({ courseName, websiteContent });
        toast({
          title: "Extraction Successful!",
          description: `Found ${result.length} events for ${courseName}. (This is a demo, data is not saved)`,
        });
        console.log("Extracted Events:", result);
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "Could not extract events. Please check the content and try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Enter course details and paste the website content to sync.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course-name" className="text-right">
              Course Name
            </Label>
            <Input
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="website-content" className="text-right pt-2">
              Website Content
            </Label>
            <Textarea
              id="website-content"
              value={websiteContent}
              onChange={(e) => setWebsiteContent(e.target.value)}
              className="col-span-3 min-h-[150px]"
              placeholder="Paste course website HTML here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExtract} disabled={isExtracting}>
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              "Sync and Add Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
