'use server';
/**
 * @fileOverview Converts course content to Markdown format.
 *
 * - convertContentToMarkdown - Function to convert course content to Markdown.
 * - ConvertContentToMarkdownInput - Input type for the function.
 * - ConvertContentToMarkdownOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertContentToMarkdownInputSchema = z.object({
  courseContent: z
    .string()
    .describe('The course content to be converted to Markdown.'),
});
export type ConvertContentToMarkdownInput = z.infer<
  typeof ConvertContentToMarkdownInputSchema
>;

const ConvertContentToMarkdownOutputSchema = z.object({
  markdownContent: z
    .string()
    .describe('The converted course content in Markdown format.'),
});
export type ConvertContentToMarkdownOutput = z.infer<
  typeof ConvertContentToMarkdownOutputSchema
>;

export async function convertContentToMarkdown(
  input: ConvertContentToMarkdownInput
): Promise<ConvertContentToMarkdownOutput> {
  return convertContentToMarkdownFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertContentToMarkdownPrompt',
  input: {schema: ConvertContentToMarkdownInputSchema},
  output: {schema: ConvertContentToMarkdownOutputSchema},
  prompt: `You are an expert in converting text to Markdown format.  Take the following course content and convert it to properly formatted Markdown, including headers, lists, code blocks, and other relevant Markdown syntax.\n\nCourse Content:\n{{{courseContent}}}`,
});

const convertContentToMarkdownFlow = ai.defineFlow(
  {
    name: 'convertContentToMarkdownFlow',
    inputSchema: ConvertContentToMarkdownInputSchema,
    outputSchema: ConvertContentToMarkdownOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
