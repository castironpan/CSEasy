import type { Course, Task, Announcement, Todo, Student, Lab, Assignment, StudentCourseView } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/******************** Local In-Memory Data Model ********************/
// Canonical course catalog (with nested labs & assignments)
const courseCatalog: Course[] = [
  {
    id: 'cs101',
    name: 'Introduction to Programming',
    code: 'CS 101',
    instructor: 'Dr. Alan Turing',
    websiteUrl: '#',
    image: {
      id: 'course-1',
      url: PlaceHolderImages.find(img => img.id === 'course-1')?.imageUrl || '',
      hint: PlaceHolderImages.find(img => img.id === 'course-1')?.imageHint || '',
    },
    grade: 85,
    progress: 72,
    weeks: 7,
    totalWeeks: 10,
    color: 'rgb(155, 89, 182)',
    initials: 'CS',
    labs: [
      { id: 'lab-cs101-1', title: 'Lab 1: Variables & IO', dueDate: futureDays(2), completed: false },
      { id: 'lab-cs101-2', title: 'Lab 2: Conditionals', dueDate: futureDays(6), completed: false },
    ],
    assignments: [
      { id: 'assg-cs101-1', title: 'Assignment 1: Basic Python Functions', dueDate: futureDays(4), completed: false },
      { id: 'assg-cs101-2', title: 'Assignment 2: Loops', dueDate: futureDays(11), completed: false },
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
    image: {
      id: 'course-2',
      url: PlaceHolderImages.find(img => img.id === 'course-2')?.imageUrl || '',
      hint: PlaceHolderImages.find(img => img.id === 'course-2')?.imageHint || '',
    },
    grade: 91,
    progress: 80,
    weeks: 8,
    totalWeeks: 10,
    color: 'rgb(26, 188, 156)',
    initials: 'DS',
    labs: [
      { id: 'lab-ds202-1', title: 'Lab 1: Arrays & Lists', dueDate: futureDays(3), completed: false },
      { id: 'lab-ds202-2', title: 'Lab 2: Linked Lists', dueDate: futureDays(7), completed: false },
    ],
    assignments: [
      { id: 'assg-ds202-1', title: 'Assignment 1: Complexity Analysis', dueDate: futureDays(5), completed: false },
      { id: 'assg-ds202-2', title: 'Assignment 2: Trees', dueDate: futureDays(12), completed: false },
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
    image: {
      id: 'course-3',
      url: PlaceHolderImages.find(img => img.id === 'course-3')?.imageUrl || '',
      hint: PlaceHolderImages.find(img => img.id === 'course-3')?.imageHint || '',
    },
    grade: 78,
    progress: 60,
    weeks: 6,
    totalWeeks: 10,
    color: 'rgb(241, 196, 15)',
    initials: 'OS',
    labs: [
      { id: 'lab-os301-1', title: 'Lab 1: Processes', dueDate: futureDays(1), completed: true },
      { id: 'lab-os301-2', title: 'Lab 2: Shell Scripting', dueDate: pastDays(1), completed: false },
    ],
    assignments: [
      { id: 'assg-os301-1', title: 'Assignment 1: Scheduling', dueDate: futureDays(9), completed: false },
    ],
    announcements: [
      { id: 'ann-os301-1', courseId: 'os301', title: 'Office Hours Update', content: 'Friday hours canceled.', date: pastDays(3) },
    ],
  },
];

// Single active student (could expand to multi-student later)
let student: Student = {
  id: 'student-1',
  name: 'Jane- Doe',
  enrolledCourseIds: ['cs101', 'ds202', 'os301'],
  todos: [
    { id: 'todo-1', text: 'Review DS202 lecture', completed: true },
    { id: 'todo-2', text: 'Start OS301 Scheduling assignment', completed: false },
    { id: 'todo-3', text: 'Form study group for OS301 final', completed: false },
  ],
};

/******************** Utility Date Helpers ********************/
function futureDays(n: number) { return new Date(Date.now() + n*86400000).toISOString(); }
function pastDays(n: number) { return new Date(Date.now() - n*86400000).toISOString(); }

/******************** Derived Aggregations ********************/
function aggregateStudentTasks(stu: Student): Task[] {
  const list: Task[] = [];
  stu.enrolledCourseIds.forEach(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) return;
    course.labs?.forEach(lab => list.push({ id: lab.id, courseId: cid, title: lab.title, type: 'Lab', dueDate: lab.dueDate, completed: lab.completed }));
    course.assignments?.forEach(a => list.push({ id: a.id, courseId: cid, title: a.title, type: 'Assignment', dueDate: a.dueDate, completed: a.completed }));
  });
  return list;
}

/******************** Public API (Local) ********************/
export const getStudent = async (): Promise<Student> => structuredClone(student);

export const getStudentCourses = async (): Promise<StudentCourseView[]> => {
  return student.enrolledCourseIds.map(cid => {
    const course = courseCatalog.find(c => c.id === cid);
    if (!course) throw new Error(`Missing course ${cid}`);
    return {
      ...course,
      labs: course.labs || [],
      assignments: course.assignments || [],
    };
  });
};

export const getStudentTasks = async (): Promise<Task[]> => aggregateStudentTasks(student);

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
export const toggleTaskCompletion = async (taskId: string) => {
  // Update inside nested course labs or assignments
  courseCatalog.forEach(course => {
    course.labs?.forEach(l => { if (l.id === taskId) l.completed = !l.completed; });
    course.assignments?.forEach(a => { if (a.id === taskId) a.completed = !a.completed; });
  });
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
  if (!student.enrolledCourseIds.includes(courseId)) {
    student.enrolledCourseIds.push(courseId);
  }
};

export const dropCourse = async (courseId: string) => {
  student.enrolledCourseIds = student.enrolledCourseIds.filter(id => id !== courseId);
};

/******************** Legacy Compatibility (Optional) ********************/
// If existing components still call the old functions, keep lightweight wrappers.
export const getCourses = async (): Promise<Course[]> => getStudentCourses();
export const getTasks = async (): Promise<Task[]> => getStudentTasks();
export const getAnnouncements = async (): Promise<Announcement[]> => getStudentAnnouncements();
export const getTodos = async (): Promise<Todo[]> => getStudentTodos();
