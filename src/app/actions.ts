"use server";

import {
  suggestTasks,
  SuggestTasksOutput,
} from "@/ai/flows/suggest-tasks";
import {
  estimateTaskCompletionTime,
  EstimateTaskCompletionTimeOutput,
} from "@/ai/flows/estimate-task-completion-time";
import { revalidatePath } from "next/cache";

// In a real application, you would update a database here.
// For this scaffold, we'll just log the action.
export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  console.log(`Toggling task ${taskId} to ${completed}`);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // After DB update, you might revalidate the path
  // revalidatePath('/');
  return { success: true, taskId, completed };
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
