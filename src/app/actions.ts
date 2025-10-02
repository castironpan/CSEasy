'use server';

import { revalidatePath } from 'next/cache';
import { setStudentIdCookie, deleteStudentIdCookie } from '@/lib/session';
import {
  authenticateStudent,
  getStudent,
  toggleStudentTask as toggleTaskData,
  addTodo as addTodoData,
  toggleTodo as toggleTodoData,
  getCourseIdForTask,
} from '@/lib/data';
import {
  suggestTasks,
  SuggestTasksOutput,
} from "@/ai/flows/suggest-tasks";
import {
  estimateTaskCompletionTime,
  EstimateTaskCompletionTimeOutput,
} from "@/ai/flows/estimate-task-completion-time";

/******************** Authentication ********************/
export async function login(zId: string, password: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const result = await authenticateStudent(zId, password);

    if (!result.success) {
      return { error: result.error || 'Invalid zID or password' };
    }

    await setStudentIdCookie(result.studentId!);
    revalidatePath('/', 'layout'); // Revalidate all pages

    return { success: true };
  } catch (e) {
    const error = e as Error;
    console.error('Login failed:', error);
    return { error: error.message || 'An unknown error occurred.' };
  }
}

export async function logout() {
  await deleteStudentIdCookie();
  revalidatePath('/', 'layout');
}

/******************** Task & Todo Actions ********************/
export async function toggleTaskCompletion(taskId: string, studentId: string) {
  await toggleTaskData(taskId, studentId);
  // Revalidate dashboard (layout) so server-provided props refresh
  revalidatePath('/', 'layout');
  const courseId = getCourseIdForTask(taskId);
  if (courseId) {
    revalidatePath(`/courses/${courseId}`);
  }
}

export async function addTodo(text: string, studentId: string) {
  const newTodo = await addTodoData(text, studentId);
  revalidatePath('/');
  return newTodo;
}

export async function toggleTodo(todoId: string, studentId: string) {
  await toggleTodoData(todoId, studentId);
  revalidatePath('/');
}

/******************** AI Actions ********************/
export async function getAiTaskSuggestions(
  courseContent: string
): Promise<SuggestTasksOutput | null> {
  try {
    const result = await suggestTasks({ courseContent });
    return result;
  } catch (error) {
    console.error("Error getting AI task suggestions:", error);
    return null;
  }
}

export async function getAiTimeEstimate(
  taskDescription: string
): Promise<EstimateTaskCompletionTimeOutput | null> {
  try {
    const result = await estimateTaskCompletionTime({ taskDescription });
    return result;
  } catch (error) {
    console.error("Error getting AI time estimate:", error);
    return null;
  }
}
