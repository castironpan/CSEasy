'use server';

import { revalidatePath } from 'next/cache';
import { setStudentIdCookie, deleteStudentIdCookie } from '@/lib/session';
import { getStudent, toggleStudentTask as toggleTaskData, addTodo as addTodoData, toggleTodo as toggleTodoData } from '@/lib/data';
import {
  suggestTasks,
  SuggestTasksOutput,
} from "@/ai/flows/suggest-tasks";
import {
  estimateTaskCompletionTime,
  EstimateTaskCompletionTimeOutput,
} from "@/ai/flows/estimate-task-completion-time";

export async function login(studentId: string): Promise<{ error: string } | null> {
  try {
    // Check if student exists
    const student = await getStudent(studentId);
    if (!student) {
      return { error: 'Invalid student ID' };
    }
  await setStudentIdCookie(studentId);
    revalidatePath('/', 'layout'); // Revalidate all pages
    return null;
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

export async function toggleTaskCompletion(taskId: string, studentId: string) {
  await toggleTaskData(taskId, studentId);
  revalidatePath('/');
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
