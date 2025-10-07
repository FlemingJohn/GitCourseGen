'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a course title based on a user-provided topic.
 *
 * - generateCourseTitle - A function that takes a course topic as input and returns a suggested course title.
 * - GenerateCourseTitleInput - The input type for the generateCourseTitle function.
 * - GenerateCourseTitleOutput - The return type for the generateCourseTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseTitleInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a course title.'),
});
export type GenerateCourseTitleInput = z.infer<typeof GenerateCourseTitleInputSchema>;

const GenerateCourseTitleOutputSchema = z.object({
  title: z.string().describe('A creative and engaging title for the course.'),
});
export type GenerateCourseTitleOutput = z.infer<typeof GenerateCourseTitleOutputSchema>;

export async function generateCourseTitle(input: GenerateCourseTitleInput): Promise<GenerateCourseTitleOutput> {
  return generateCourseTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseTitlePrompt',
  input: {schema: GenerateCourseTitleInputSchema},
  output: {schema: GenerateCourseTitleOutputSchema},
  prompt: `You are an expert copywriter specializing in educational content. Generate a single, concise, and catchy course title for the following topic. Do not add any extra text or quotation marks, just the title itself.\n\nTopic: {{{topic}}}`,
});

const generateCourseTitleFlow = ai.defineFlow(
  {
    name: 'generateCourseTitleFlow',
    inputSchema: GenerateCourseTitleInputSchema,
    outputSchema: GenerateCourseTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
