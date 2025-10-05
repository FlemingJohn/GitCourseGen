'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a course outline based on a user-provided topic.
 *
 * - generateCourseOutline - A function that takes a course topic as input and returns a detailed course outline.
 * - GenerateCourseOutlineInput - The input type for the generateCourseOutline function.
 * - GenerateCourseOutlineOutput - The return type for the generateCourseOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseOutlineInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a course outline.'),
});
export type GenerateCourseOutlineInput = z.infer<typeof GenerateCourseOutlineInputSchema>;

const GenerateCourseOutlineOutputSchema = z.object({
  outline: z.string().describe('A detailed course outline for the given topic.'),
});
export type GenerateCourseOutlineOutput = z.infer<typeof GenerateCourseOutlineOutputSchema>;

export async function generateCourseOutline(input: GenerateCourseOutlineInput): Promise<GenerateCourseOutlineOutput> {
  return generateCourseOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseOutlinePrompt',
  input: {schema: GenerateCourseOutlineInputSchema},
  output: {schema: GenerateCourseOutlineOutputSchema},
  prompt: `You are an experienced curriculum designer. Generate a detailed course outline for the following topic:\n\nTopic: {{{topic}}}\n\nOutline: `,
});

const generateCourseOutlineFlow = ai.defineFlow(
  {
    name: 'generateCourseOutlineFlow',
    inputSchema: GenerateCourseOutlineInputSchema,
    outputSchema: GenerateCourseOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
