import type { Course, Announcement, Todo, Student, StudentCourseView, TaskMetadata, StudentTask, StudentTaskState } from '@/lib/types';

/******************** Utility Date Helpers ********************/
function futureDays(n: number) { return new Date(Date.now() + n * 86400000).toISOString(); }
function pastDays(n: number) { return new Date(Date.now() - n * 86400000).toISOString(); }


/******************** Local In-Memory Data Model (Refactored) ********************/

// Courses now have Labs / Assignments WITHOUT completion flags (pure metadata)
const courseCatalog: Course[] = [
  {
    id: 'cs101',
    name: 'Introduction to Programming',
    code: 'COMP1511',
    instructor: 'Sasha Vassar',
    websiteUrl: '#',
    grade: 85,
    progress: 0, // will be derived
    weeks: 7,
    totalWeeks: 10,
    color: 'rgb(155, 89, 182)',
    initials: 'CS',
    totalLabs: 8,
    totalAssignments: 6,
    totalExams: 2,
    labs: [
      { id: 'lab-cs101-1', title: 'Lab 1: Introduction To C', dueDate: futureDays(2) },
      { id: 'lab-cs101-2', title: 'Lab 2: Arrays', dueDate: futureDays(6) },
    ],
    assignments: [
      { id: 'assg-cs101-1', title: 'Assignment 1: CS Ninja', dueDate: futureDays(4) },
      { id: 'assg-cs101-2', title: 'Assignment 2: CS Eat', dueDate: futureDays(11) },
    ],
    announcements: [
      { id: 'ann-cs101-1', courseId: 'cs101', title: 'Guest Lecture', content: 'AI Ethics talk next week.', date: pastDays(1) },
    ],
  },
  {
    id: 'ds202',
    name: 'Data Structures & Algorithms',
    code: 'COMP2521',
    instructor: 'Kevin Luxa',
    websiteUrl: '#',
    grade: 91,
    progress: 0,
    weeks: 8,
    totalWeeks: 10,
    color: 'rgb(26, 188, 156)',
    initials: 'DS',
    totalLabs: 10,
    totalAssignments: 8,
    totalExams: 2,
    labs: [
      { id: 'lab-ds202-1', title: 'Lab 1: Using APIs', dueDate: futureDays(3) },
      { id: 'lab-ds202-2', title: 'Lab 2: Linked Lists', dueDate: futureDays(7) },
    ],
    assignments: [
      { id: 'assg-ds202-1', title: 'Assignment 1: Huffman Tree Encoder', dueDate: futureDays(5) },
      { id: 'assg-ds202-2', title: 'Assignment 2: Maps & Navigation', dueDate: futureDays(12) },
    ],
    announcements: [
      { id: 'ann-ds202-1', courseId: 'ds202', title: 'Midterm Grades Released', content: 'Check portal for grades.', date: pastDays(2) },
    ],
  },
  {
    id: 'os301',
    name: 'Software Engineering Fundamentals',
    code: 'COMP1531',
    instructor: 'Yuchao Jiang',
    websiteUrl: '#',
    grade: 78,
    progress: 0,
    weeks: 6,
    totalWeeks: 10,
    color: 'rgb(241, 196, 15)',
    initials: 'OS',
    totalLabs: 9,
    totalAssignments: 7,
    totalExams: 2,
    labs: [
      { id: 'lab-os301-1', title: 'Lab 1: Git', dueDate: futureDays(1) },
      { id: 'lab-os301-2', title: 'Lab 2: Objects', dueDate: pastDays(1) },
    ],
    assignments: [
      { id: 'assg-os301-1', title: 'Assignment 1: Group Work', dueDate: futureDays(9) },
    ],
    announcements: [
      { id: 'ann-os301-1', courseId: 'os301', title: 'Office Hours Update', content: 'Friday hours canceled.', date: pastDays(3) },
    ],
  },
];

// Extended Student interface to include authentication credentials
interface StudentWithAuth extends Student {
  zId: string;
  password: string; // In production, this would be a hashed password!
}

// In-memory store for all student data with authentication.
// IMPORTANT: In production, passwords should be hashed using bcrypt or similar!
const __internalStudents: Record<string, StudentWithAuth> = {
  'student-1': {
    id: 'student-1',
    name: 'Jane Doe',
    zId: 'z5555555',
    password: 'password123', // In production: hash this!
    enrolledCourseIds: ['cs101', 'ds202', 'os301'],
    todos: [
      { id: 'todo-1', text: 'Review DS202 lecture', completed: true },
      { id: 'todo-2', text: 'Start OS301 Scheduling assignment', completed: false },
      { id: 'todo-3', text: 'Form study group for OS301 final', completed: false },
    ],
    taskStates: {
      'lab-cs101-1': { completed: false },
      'lab-cs101-2': { completed: false },
      'assg-cs101-1': { completed: false },
      'assg-cs101-2': { completed: false },
      'lab-ds202-1': { completed: false },
      'lab-ds202-2': { completed: false },
      'assg-ds202-1': { completed: false },
      'assg-ds202-2': { completed: false },
      'lab-os301-1': { completed: false },
      'lab-os301-2': { completed: true, completedAt: pastDays(1) },
      'assg-os301-1': { completed: false },
    }
  },
  'student-2': {
    id: 'student-2',
    name: 'John Smith',
    zId: 'z1234567',
    password: 'securepass456', // In production: hash this!
    enrolledCourseIds: ['cs101', 'ds202'],
    todos: [
      { id: 'todo-4', text: 'Buy new notebook', completed: true },
    ],
    taskStates: {
      'lab-cs101-1': { completed: true, completedAt: pastDays(2) },
      'lab-cs101-2': { completed: false },
      'assg-cs101-1': { completed: true, completedAt: pastDays(1) },
      'assg-cs101-2': { completed: false },
      'lab-ds202-1': { completed: false },
      'lab-ds202-2': { completed: false },
      'assg-ds202-1': { completed: false },
      'assg-ds202-2': { completed: false },
    }
  }
};

// Map zID to student ID for authentication lookups
const __zIdToStudentId: Record<string, string> = {
  'z5555555': 'student-1',
  'z1234567': 'student-2',
};

/******************** Internal Helpers ********************/

// Convert zID to student ID if needed
function normalizeToStudentId(idOrZid?: string): string {
  if (!idOrZid) return 'student-1';
  
  // Check if it's already a student ID
  if (__internalStudents[idOrZid]) {
    return idOrZid;
  }
  
  // Check if it's a zID
  const studentId = __zIdToStudentId[idOrZid];
  if (studentId) {
    return studentId;
  }
  
  // Default fallback
  return 'student-1';
}

// In a real app, this would resolve the current user from a session cookie.
// For now, it's a placeholder that defaults to student-1.
function resolveStudentId(studentId?: string): string {
  return normalizeToStudentId(studentId);
}

// A helper to safely mutate student data, ensuring we don't leak references.
function mutateStudent(studentId: string, mutator: (student: StudentWithAuth) => void) {
  const student = __internalStudents[studentId];
  if (!student) {
    throw new Error(`Student with id "${studentId}" not found.`);
  }
  // Create a deep copy to prevent direct mutation of the original object.
  const studentCopy = structuredClone(student);
  mutator(studentCopy);
  __internalStudents[studentId] = studentCopy;
}

// Helper to strip sensitive data from student object
function sanitizeStudent(student: StudentWithAuth): Student {
  const { zId, password, ...sanitized } = student;
  return sanitized as Student;
}

/******************** Authentication ********************/

export const authenticateStudent = async (zId: string, password: string): Promise<{ success: boolean; studentId?: string; error?: string }> => {
  // Find student by zID
  const studentId = __zIdToStudentId[zId];
  
  if (!studentId) {
    return { success: false, error: 'Invalid zID or password' };
  }
  
  const student = __internalStudents[studentId];
  
  // In production, use bcrypt.compare() or similar to verify hashed password
  if (student.password !== password) {
    return { success: false, error: 'Invalid zID or password' };
  }
  
  return { success: true, studentId: student.id };
};

/******************** Task Metadata Aggregation ********************/
function buildTaskMetadataForStudent(stu: StudentWithAuth): TaskMetadata[] {
  const meta: TaskMetadata[] = [];
  stu.enrolledCourseIds.forEach(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) return;
    course.labs?.forEach(l => meta.push({ id: l.id, courseId: cid, sourceType: 'Lab', sourceId: l.id, title: l.title, dueDate: l.dueDate }));
    course.assignments?.forEach(a => meta.push({ id: a.id, courseId: cid, sourceType: 'Assignment', sourceId: a.id, title: a.title, dueDate: a.dueDate }));
  });
  return meta;
}

function deriveStudentTasks(stu: StudentWithAuth): StudentTask[] {
  return buildTaskMetadataForStudent(stu).map(m => ({
    ...m,
    completed: !!stu.taskStates[m.id]?.completed,
    completedAt: stu.taskStates[m.id]?.completedAt,
  }));
}

export function getCourseIdForTask(taskId: string): string | undefined {
  for (const course of courseCatalog) {
    if (course.labs?.some(l => l.id === taskId) || course.assignments?.some(a => a.id === taskId)) {
      return course.id;
    }
  }
  return undefined;
}

export function getCourseTotalTasks(course: Course): number {
  return (course.totalAssignments || 0) + (course.totalLabs || 0);
}

export function computeCourseProgressForStudent(course: Course, stuId: string): number {
  // Use totals if provided; otherwise fall back to currently released items.
  const releasedLabCount = course.labs?.length || 0;
  const releasedAssignmentCount = course.assignments?.length || 0;
  const totalLabs = course.totalLabs ?? releasedLabCount;
  const totalAssignments = course.totalAssignments ?? releasedAssignmentCount;
  // Currently we don't model exams as tasks; they could be added similarly.
  const totalUnits = totalLabs + totalAssignments;
  if (totalUnits === 0) return 0;
  const completed = Object.entries(__internalStudents[stuId].taskStates).filter(([taskId, state]) => state.completed && (
    course.labs?.some(l => l.id === taskId) || course.assignments?.some(a => a.id === taskId)
  )).length;
  const progress = Math.round((completed / totalUnits) * 100);
  return progress;
}

/******************** Public API (Data Fetching) ********************/

export const getStudent = async (studentId?: string): Promise<Student> => {
  const id = resolveStudentId(studentId);
  const student = __internalStudents[id];
  if (!student) {
    throw new Error(`Student with id "${id}" not found.`);
  }
  return sanitizeStudent(structuredClone(student));
};

export const getStudentCourses = async (studentId?: string): Promise<StudentCourseView[]> => {
  const id = resolveStudentId(studentId);
  const stu = __internalStudents[id];
  return stu.enrolledCourseIds.map(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) throw new Error(`Missing course ${cid}`);
    const dynamicProgress = computeCourseProgressForStudent(course, id);
    return { ...course, progress: dynamicProgress, labs: course.labs || [], assignments: course.assignments || [] };
  });
};

export const getStudentCourseDetail = async (courseId: string, studentId?: string): Promise<{
  course: StudentCourseView;
  tasks: StudentTask[];
}> => {
  const id = resolveStudentId(studentId);
  const stu = __internalStudents[id];
  if (!stu.enrolledCourseIds.includes(courseId)) {
    throw new Error('Course not enrolled');
  }
  const course = courseCatalog.find(c => c.id === courseId);
  if (!course) throw new Error('Course not found');
  const courseView: StudentCourseView = { ...course, labs: course.labs || [], assignments: course.assignments || [] };
  // augment with current progress
  (courseView as any).progress = computeCourseProgressForStudent(course, id);
  const allTasks = deriveStudentTasks(stu).filter(t => t.courseId === courseId);
  return { course: courseView, tasks: allTasks };
};

export const getStudentTaskMetadata = async (studentId?: string): Promise<TaskMetadata[]> => {
  return buildTaskMetadataForStudent(__internalStudents[resolveStudentId(studentId)]);
}

export const getStudentTasks = async (studentId?: string): Promise<StudentTask[]> => {
  return deriveStudentTasks(__internalStudents[resolveStudentId(studentId)]);
}

export const getStudentAnnouncements = async (studentId?: string): Promise<Announcement[]> => {
  const stu = __internalStudents[resolveStudentId(studentId)];
  const anns: Announcement[] = [];
  stu.enrolledCourseIds.forEach(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (course?.announcements) anns.push(...course.announcements);
  });
  return anns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getStudentTodos = async (studentId?: string): Promise<Todo[]> => {
  return structuredClone(__internalStudents[resolveStudentId(studentId)].todos);
};

export const getAllStudents = async (): Promise<{ id: string; name: string; zId: string; }[]> => {
  return Object.values(__internalStudents).map(s => ({ id: s.id, name: s.name, zId: s.zId }));
};

/******************** Public API (Mutations) ********************/

export const setStudentTaskCompletion = async (taskId: string, completed: boolean, studentId?: string) => {
  const id = resolveStudentId(studentId);
  mutateStudent(id, stu => {
    const state = stu.taskStates[taskId] || { completed: false } as StudentTaskState;
    state.completed = completed;
    state.completedAt = completed ? new Date().toISOString() : undefined;
    stu.taskStates[taskId] = state;
  });
};

export const toggleStudentTask = async (taskId: string, studentId?: string) => {
  const id = resolveStudentId(studentId);
  mutateStudent(id, stu => {
    const state = stu.taskStates[taskId] || { completed: false } as StudentTaskState;
    state.completed = !state.completed;
    state.completedAt = state.completed ? new Date().toISOString() : undefined;
    stu.taskStates[taskId] = state;
  });
};

export const addTodo = async (text: string, studentId?: string) => {
  const id = resolveStudentId(studentId);
  const newTodo: Todo = { id: `todo-${crypto.randomUUID()}`, text, completed: false };
  mutateStudent(id, stu => { stu.todos.push(newTodo); });
  return newTodo;
};

export const toggleTodo = async (todoId: string, studentId?: string) => {
  const id = resolveStudentId(studentId);
  mutateStudent(id, stu => {
    const td = stu.todos.find(t => t.id === todoId);
    if (td) {
      td.completed = !td.completed;
    }
  });
};