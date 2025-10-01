// data.ts

import { courses } from "./courses";
import { students } from "./students";

// Merge the datasets into a knowledge-base-style structure
export const knowledgeBase = students.map((student) => {
  const enrolledCourseDetails = student.enrolledCourses.map((courseCode) => ({
    ...courses[courseCode],
    studentProgress: Object.entries(student.progress)
      .filter(([key]) => key.startsWith(courseCode))
      .map(([taskId, status]) => ({ taskId, status })),
  }));

  return {
    studentId: student.id,
    name: student.name,
    enrolledCourses: enrolledCourseDetails,
  };
});

// Example function: get all data for one student (for chatbot context)
export function getStudentData(studentId: string) {
  return knowledgeBase.find((s) => s.studentId === studentId);
}
