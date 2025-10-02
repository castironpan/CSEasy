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
import { getStudentIdFromCookie } from '@/lib/session';
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
  revalidatePath('/', 'layout');
  return newTodo;
}

// Bulk add AI-suggested todos (infers current student from cookie)
export async function addSuggestedTodos(texts: string[]) : Promise<{ added: string[]; skipped: string[]; studentId?: string }> {
  let studentId = await getStudentIdFromCookie();
  // Fallback: if no session cookie set, default to first defined student to avoid silent no-op
  if (!studentId) {
    try {
      const { getAllStudents } = await import('@/lib/data');
      const all = await getAllStudents();
      studentId = all[0]?.id;
    } catch {}
  }
  if (!studentId) return { added: [], skipped: texts };
  const seen = new Set<string>();
  const added: string[] = [];
  const skipped: string[] = [];
  for (const raw of texts) {
    const t = raw.trim().replace(/^["'`]+|["'`]+$/g, '');
    if (!t || t.length < 3) { skipped.push(raw); continue; }
    const key = t.toLowerCase();
    if (seen.has(key)) { skipped.push(raw); continue; }
    seen.add(key);
    try {
      await addTodoData(t, studentId);
      added.push(t);
    } catch (e) {
      skipped.push(raw);
    }
    if (added.length >= 20) break; // safety cap
  }
  revalidatePath('/', 'layout');
  return { added, skipped, studentId };
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
