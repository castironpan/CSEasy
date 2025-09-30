import type { Course, Task, Announcement, Todo, Student, Lab, Assignment, StudentCourseView, TaskMetadata, StudentTask, StudentTaskState } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

// Student with per-task completion state separate from catalog definitions
let student: Student = {
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
    'lab-os301-1': { completed: true, completedAt: pastDays(1) },
    'lab-os301-2': { completed: false },
    'assg-os301-1': { completed: false },
  }
};

/******************** Utility Date Helpers ********************/
function futureDays(n: number) { return new Date(Date.now() + n*86400000).toISOString(); }
function pastDays(n: number) { return new Date(Date.now() - n*86400000).toISOString(); }

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

/******************** Public API ********************/
export const getStudent = async (): Promise<Student> => structuredClone(student);
export const getStudentCourses = async (): Promise<StudentCourseView[]> => {
  return student.enrolledCourseIds.map(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) throw new Error(`Missing course ${cid}`);
    return { ...course, labs: course.labs || [], assignments: course.assignments || [] };
  });
};
export const getStudentTaskMetadata = async (): Promise<TaskMetadata[]> => buildTaskMetadataForStudent(student);
export const getStudentTasks = async (): Promise<StudentTask[]> => deriveStudentTasks(student);
export const getStudentAnnouncements = async (): Promise<Announcement[]> => {
  const anns: Announcement[] = [];
  student.enrolledCourseIds.forEach(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (course?.announcements) anns.push(...course.announcements);
  });
  return anns.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const getStudentTodos = async (): Promise<Todo[]> => structuredClone(student.todos);

/******************** Mutations ********************/
export const toggleStudentTask = async (taskId: string) => {
  const state = student.taskStates[taskId] || { completed: false } as StudentTaskState;
  state.completed = !state.completed;
  state.completedAt = state.completed ? new Date().toISOString() : undefined;
  student.taskStates[taskId] = state;
};
export const addTodo = async (text: string) => {
  const newTodo: Todo = { id: `todo-${crypto.randomUUID()}`, text, completed: false };
  student.todos.push(newTodo);
  return newTodo;
};
export const toggleTodo = async (todoId: string) => {
  const td = student.todos.find(t => t.id === todoId);
  if (td) td.completed = !td.completed;
};
export const enrollInCourse = async (courseId: string) => {
  if (!student.enrolledCourseIds.includes(courseId)) student.enrolledCourseIds.push(courseId);
};
export const dropCourse = async (courseId: string) => {
  student.enrolledCourseIds = student.enrolledCourseIds.filter(id => id !== courseId);
  // Optionally purge task states for dropped course
  Object.keys(student.taskStates).forEach(tid => {
    if (tid.startsWith(`lab-${courseId}`) || tid.startsWith(`assg-${courseId}`)) delete student.taskStates[tid];
  });
};

/******************** Legacy Compatibility Wrappers ********************/
// Map StudentTask -> legacy Task shape
export const getTasks = async (): Promise<Task[]> => (await getStudentTasks()).map(st => ({
  id: st.id,
  courseId: st.courseId,
  title: st.title,
  type: st.sourceType,
  dueDate: st.dueDate,
  completed: st.completed,
}));
export const getCourses = async (): Promise<Course[]> => getStudentCourses();
export const getAnnouncements = async (): Promise<Announcement[]> => getStudentAnnouncements();
export const getTodos = async (): Promise<Todo[]> => getStudentTodos();
