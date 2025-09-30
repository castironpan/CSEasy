'use server';

/**
 * @fileOverview A Genkit flow to extract deadlines and announcements from course websites using AI.
 *
 * - extractCourseEvents - A function that handles the extraction process.
 * - ExtractCourseEventsInput - The input type for the extractCourseEvents function.
 * - ExtractCourseEventsOutput - The return type for the extractCourseEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCourseEventsInputSchema = z.object({
  websiteContent: z
    .string()
    .describe('The HTML content of the course website to extract events from.'),
  courseName: z.string().describe('The name of the course the website belongs to.'),
});
export type ExtractCourseEventsInput = z.infer<typeof ExtractCourseEventsInputSchema>;

const CourseEventSchema = z.object({
  type: z.enum(['deadline', 'announcement']).describe('The type of event.'),
  title: z.string().describe('The title of the event.'),
  description: z.string().optional().describe('A more detailed description of the event.'),
  dueDate: z.string().optional().describe('The due date of the event, if applicable.'),
});

const ExtractCourseEventsOutputSchema = z.array(CourseEventSchema).describe('An array of extracted course events.');
export type ExtractCourseEventsOutput = z.infer<typeof ExtractCourseEventsOutputSchema>;

export async function extractCourseEvents(input: ExtractCourseEventsInput): Promise<ExtractCourseEventsOutput> {
  return extractCourseEventsFlow(input);
}

const extractEventsPrompt = ai.definePrompt({
  name: 'extractEventsPrompt',
  input: {schema: ExtractCourseEventsInputSchema},
  output: {schema: ExtractCourseEventsOutputSchema},
  prompt: `You are an AI assistant that extracts course events such as deadlines and announcements from website content.

  Analyze the following HTML content from the course website "{{courseName}}" and extract all deadlines and announcements.

  Website Content: {{{websiteContent}}}

  Return a JSON array of course events, each with a type (deadline or announcement), a title, an optional description, and an optional due date if it is a deadline.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  }
});

const extractCourseEventsFlow = ai.defineFlow(
  {
    name: 'extractCourseEventsFlow',
    inputSchema: ExtractCourseEventsInputSchema,
    outputSchema: ExtractCourseEventsOutputSchema,
  },
  async input => {
    const {output} = await extractEventsPrompt(input);
    return output!;
  }
);
