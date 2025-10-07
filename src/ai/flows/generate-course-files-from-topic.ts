'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a structured course with folders and files.
 *
 * - generateCourseFilesFromTopic - A function that takes a course topic and returns a JSON structure representing the course.
 * - GenerateCourseFilesInput - The input type for the function.
 * - GenerateCourseFilesOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FileSchema = z.object({
  name: z.string().describe('The name of the file, including its extension (e.g., "introduction.md", "variables.py").'),
  content: z.string().describe('The full content of the file. This should be Markdown for theory files and code for programming files.'),
});

const FolderSchema = z.object({
  name: z.string().describe('The name of the folder (e.g., "01-Introduction", "02-Data-Types").'),
  files: z.array(FileSchema).describe('A list of files within this folder.'),
});

const GenerateCourseFilesInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a course structure.'),
});
export type GenerateCourseFilesInput = z.infer<typeof GenerateCourseFilesInputSchema>;

const GenerateCourseFilesOutputSchema = z.object({
    title: z.string().describe('A creative and engaging title for the course.'),
    folders: z.array(FolderSchema).describe('An array of folders representing the course structure.'),
});
export type GenerateCourseFilesOutput = z.infer<typeof GenerateCourseFilesOutputSchema>;


export async function generateCourseFilesFromTopic(input: GenerateCourseFilesInput): Promise<GenerateCourseFilesOutput> {
  return generateCourseFilesFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateCourseFilesPrompt',
  input: {schema: GenerateCourseFilesInputSchema},
  output: {schema: GenerateCourseFilesOutputSchema},
  prompt: `You are an expert curriculum designer and software developer. Your task is to generate a complete, structured course for a given topic.

The output must be a JSON object that strictly follows the provided schema.

You must:
1.  Create a creative and engaging 'title' for the course.
2.  Design a logical structure of 'folders' for the course modules.
3.  Inside each folder, create one or more 'files'.
4.  For each file, determine the correct file 'name' with the appropriate extension.
    - Use '.md' for theoretical content, explanations, or introductory text.
    - Use the correct programming language extension (e.g., '.py' for Python, '.js' for JavaScript, '.html' for HTML) for files containing code examples.
5.  Write the full 'content' for each file. The content should be high-quality and directly relevant to the file's name and the course topic.

Topic: {{{topic}}}
`,
});

const generateCourseFilesFlow = ai.defineFlow(
  {
    name: 'generateCourseFilesFlow',
    inputSchema: GenerateCourseFilesInputSchema,
    outputSchema: GenerateCourseFilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
