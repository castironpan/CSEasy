export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  websiteUrl: string;
  image: {
    id: string;
    url: string;
    hint: string;
  };
  grade: number;
  progress: number;
  weeks: number;
  totalWeeks: number;
  color: string;
  initials: string;
  // New nested academic units
  labs?: Lab[];
  assignments?: Assignment[];
  announcements?: Announcement[];
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  type: 'Assignment' | 'Lab' | 'Exam' | 'Reading';
  dueDate: string; // ISO string
  completed: boolean;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  date: string; // ISO string
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  estimatedTime?: string;
  reasoning?: string;
}

// New granular unit types
export interface Lab {
  id: string;
  title: string;
  dueDate: string; // ISO string
  completed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string; // ISO string
  completed: boolean;
}

// Student-centric model
export interface Student {
  id: string;
  name: string;
  enrolledCourseIds: string[]; // references Course.id
  todos: Todo[];
  // Derived at runtime: tasks aggregated from each enrolled course's labs + assignments
}

// Helper aggregate type for UI when we expand a course for a student
export interface StudentCourseView extends Course {
  labs: Lab[];
  assignments: Assignment[];
}
