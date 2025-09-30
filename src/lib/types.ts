export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  websiteUrl: string;
  grade: number;
  progress: number;
  weeks: number;
  totalWeeks: number;
  color: string;
  initials: string;
  image?: { id: string; url: string; hint: string }; // optional to preserve older components
  labs?: Lab[];
  assignments?: Assignment[];
  announcements?: Announcement[];
}

// Generic task metadata derived from labs/assignments (no per-student flags inside Lab/Assignment)
export interface TaskMetadata {
  id: string;            // stable ID (e.g. lab/assignment id reused or generated)
  courseId: string;
  sourceType: 'Lab' | 'Assignment';
  sourceId: string;      // id of the Lab or Assignment
  title: string;
  dueDate: string;       // ISO
}

// Student-specific task (metadata + completion status)
export interface StudentTask extends TaskMetadata {
  completed: boolean;
  completedAt?: string;
}

// Legacy Task type retained for backward compatibility (mapped from StudentTask)
export interface Task {
  id: string;
  courseId: string;
  title: string;
  type: 'Assignment' | 'Lab';
  dueDate: string;
  completed: boolean;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  date: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  estimatedTime?: string;
  reasoning?: string;
}

// Granular academic units (now pure definitions without completion flags)
export interface Lab {
  id: string;
  title: string;
  dueDate: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
}

export interface StudentTaskState {
  completed: boolean;
  completedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  enrolledCourseIds: string[];
  todos: Todo[];
  taskStates: Record<string, StudentTaskState>; // keyed by TaskMetadata.id
}

export interface StudentCourseView extends Course {
  labs: Lab[];
  assignments: Assignment[];
}
