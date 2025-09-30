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
    code: 'CS 101',
    instructor: 'Dr. Alan Turing',
    websiteUrl: '#',
    grade: 85,
    progress: 72,
    weeks: 7,
    totalWeeks: 10,
    color: 'rgb(155, 89, 182)',
    initials: 'CS',
    labs: [
      { id: 'lab-cs101-1', title: 'Lab 1: Variables & IO', dueDate: futureDays(2) },
      { id: 'lab-cs101-2', title: 'Lab 2: Conditionals', dueDate: futureDays(6) },
    ],
    assignments: [
      { id: 'assg-cs101-1', title: 'Assignment 1: Basic Python Functions', dueDate: futureDays(4) },
      { id: 'assg-cs101-2', title: 'Assignment 2: Loops', dueDate: futureDays(11) },
    ],
    announcements: [
      { id: 'ann-cs101-1', courseId: 'cs101', title: 'Guest Lecture', content: 'AI Ethics talk next week.', date: pastDays(1) },
    ],
  },
  {
    id: 'ds202',
    name: 'Data Structures & Algorithms',
    code: 'DS 202',
    instructor: 'Dr. Ada Lovelace',
    websiteUrl: '#',
    grade: 91,
    progress: 80,
    weeks: 8,
    totalWeeks: 10,
    color: 'rgb(26, 188, 156)',
    initials: 'DS',
    labs: [
      { id: 'lab-ds202-1', title: 'Lab 1: Arrays & Lists', dueDate: futureDays(3) },
      { id: 'lab-ds202-2', title: 'Lab 2: Linked Lists', dueDate: futureDays(7) },
    ],
    assignments: [
      { id: 'assg-ds202-1', title: 'Assignment 1: Complexity Analysis', dueDate: futureDays(5) },
      { id: 'assg-ds202-2', title: 'Assignment 2: Trees', dueDate: futureDays(12) },
    ],
    announcements: [
      { id: 'ann-ds202-1', courseId: 'ds202', title: 'Midterm Grades Released', content: 'Check portal for grades.', date: pastDays(2) },
    ],
  },
  {
    id: 'os301',
    name: 'Operating Systems',
    code: 'OS 301',
    instructor: 'Dr. Linus Torvalds',
    websiteUrl: '#',
    grade: 78,
    progress: 60,
    weeks: 6,
    totalWeeks: 10,
    color: 'rgb(241, 196, 15)',
    initials: 'OS',
    labs: [
      { id: 'lab-os301-1', title: 'Lab 1: Processes', dueDate: futureDays(1) },
      { id: 'lab-os301-2', title: 'Lab 2: Shell Scripting', dueDate: pastDays(1) },
    ],
    assignments: [
      { id: 'assg-os301-1', title: 'Assignment 1: Scheduling', dueDate: futureDays(9) },
    ],
    announcements: [
      { id: 'ann-os301-1', courseId: 'os301', title: 'Office Hours Update', content: 'Friday hours canceled.', date: pastDays(3) },
    ],
  },
];

// In-memory store for all student data.
// In a real app, this would be a database.
const __internalStudents: Record<string, Student> = {
  'student-1': {
    id: 'student-1',
    name: 'Jane Doe',
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

/******************** Internal Helpers ********************/

// In a real app, this would resolve the current user from a session cookie.
// For now, it's a placeholder that defaults to student-1.
function resolveStudentId(studentId?: string): string {
  return studentId || 'student-1';
}

// A helper to safely mutate student data, ensuring we don't leak references.
function mutateStudent(studentId: string, mutator: (student: Student) => void) {
  const student = __internalStudents[studentId];
  if (!student) {
    throw new Error(`Student with id "${studentId}" not found.`);
  }
  // Create a deep copy to prevent direct mutation of the original object.
  const studentCopy = structuredClone(student);
  mutator(studentCopy);
  __internalStudents[studentId] = studentCopy;
}

/******************** Task Metadata Aggregation ********************/
function buildTaskMetadataForStudent(stu: Student): TaskMetadata[] {
  const meta: TaskMetadata[] = [];
  stu.enrolledCourseIds.forEach(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) return;
    course.labs?.forEach(l => meta.push({ id: l.id, courseId: cid, sourceType: 'Lab', sourceId: l.id, title: l.title, dueDate: l.dueDate }));
    course.assignments?.forEach(a => meta.push({ id: a.id, courseId: cid, sourceType: 'Assignment', sourceId: a.id, title: a.title, dueDate: a.dueDate }));
  });
  return meta;
}

function deriveStudentTasks(stu: Student): StudentTask[] {
  return buildTaskMetadataForStudent(stu).map(m => ({
    ...m,
    completed: !!stu.taskStates[m.id]?.completed,
    completedAt: stu.taskStates[m.id]?.completedAt,
  }));
}

/******************** Public API (Data Fetching) ********************/

export const getStudent = async (studentId?: string): Promise<Student> => {
  const id = resolveStudentId(studentId);
  return structuredClone(__internalStudents[id]);
};

export const getStudentCourses = async (studentId?: string): Promise<StudentCourseView[]> => {
  const id = resolveStudentId(studentId);
  const stu = __internalStudents[id];
  return stu.enrolledCourseIds.map(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) throw new Error(`Missing course ${cid}`);
    return { ...course, labs: course.labs || [], assignments: course.assignments || [] };
  });
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

export const getAllStudents = async (): Promise<{ id: string; name: string; }[]> => {
  return Object.values(__internalStudents).map(s => ({ id: s.id, name: s.name }));
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
