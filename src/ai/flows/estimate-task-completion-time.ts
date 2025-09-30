'use server';

/**
 * @fileOverview Estimates the time required to complete a task using AI analysis.
 *
 * - estimateTaskCompletionTime - A function that estimates the time to complete a given task.
 * - EstimateTaskCompletionTimeInput - The input type for the estimateTaskCompletionTime function.
 * - EstimateTaskCompletionTimeOutput - The return type for the estimateTaskCompletionTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaskCompletionTimeInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to estimate completion time.'),
  userDetails: z
    .string()
    .optional()
    .describe(
      'Optional details about the user, such as skill level or experience with similar tasks.'
    ),
});
export type EstimateTaskCompletionTimeInput = z.infer<
  typeof EstimateTaskCompletionTimeInputSchema
>;

const EstimateTaskCompletionTimeOutputSchema = z.object({
  estimatedTime: z
    .string()
    .describe(
      'The estimated time to complete the task, expressed in hours and minutes.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the estimated time, including factors considered.'
    ),
});
export type EstimateTaskCompletionTimeOutput = z.infer<
  typeof EstimateTaskCompletionTimeOutputSchema
>;

export async function estimateTaskCompletionTime(
  input: EstimateTaskCompletionTimeInput
): Promise<EstimateTaskCompletionTimeOutput> {
  return estimateTaskCompletionTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTaskCompletionTimePrompt',
  input: {schema: EstimateTaskCompletionTimeInputSchema},
  output: {schema: EstimateTaskCompletionTimeOutputSchema},
  prompt: `You are an AI assistant that estimates the completion time for a given task.

  Based on the task description and user details, provide an estimated completion time and the reasoning behind it.

  Task Description: {{{taskDescription}}}
  User Details: {{{userDetails}}}

  Format your response as follows:
  {"estimatedTime": "estimated time in hours and minutes", "reasoning": "reasoning behind the estimated time"}`,
});

const estimateTaskCompletionTimeFlow = ai.defineFlow(
  {
    name: 'estimateTaskCompletionTimeFlow',
    inputSchema: EstimateTaskCompletionTimeInputSchema,
    outputSchema: EstimateTaskCompletionTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
