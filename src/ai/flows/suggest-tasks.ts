'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting tasks related to courses.
 *
 * - suggestTasks - A function that takes course content and returns AI-powered task suggestions.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  courseContent: z
    .string()
    .describe('The content of the course, including lectures, assignments, and readings.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe('A list of suggested tasks related to the course content.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are an AI assistant designed to suggest tasks for students based on their course content.
  Given the following course content, please provide a list of tasks that the student should do to manage their workload efficiently.

  Course Content: {{{courseContent}}}

  Tasks:`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
