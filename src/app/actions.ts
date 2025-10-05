'use server';

import { generateCourseOutline } from '@/ai/flows/generate-course-outline';
import { convertContentToMarkdown } from '@/ai/flows/convert-content-to-markdown';
import { z } from 'zod';

const outlineSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

export async function generateOutlineAction(prevState: any, formData: FormData) {
  const validatedFields = outlineSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }
  
  try {
    const { outline } = await generateCourseOutline({ topic: validatedFields.data.topic });
    return { outline };
  } catch (e) {
    return { error: 'Failed to generate course outline. Please try again.' };
  }
}

const markdownSchema = z.object({
  courseContent: z.string().min(10, 'Content is too short to convert.'),
});

export async function convertToMarkdownAction(prevState: any, formData: FormData) {
    const validatedFields = markdownSchema.safeParse({
        courseContent: formData.get('courseContent'),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.courseContent?.[0],
        };
    }
    
    try {
        const { markdownContent } = await convertContentToMarkdown({ courseContent: validatedFields.data.courseContent });
        return { markdownContent };
    } catch (e) {
        return { error: 'Failed to convert to Markdown. Please try again.' };
    }
}


const githubSchema = z.object({
  token: z.string().min(1, 'GitHub token is required.'),
  repo: z.string().min(1, 'Repository is required.').refine(val => val.includes('/'), { message: 'Invalid repository format. Use "owner/repo-name".' }),
  content: z.string().min(1, 'Content cannot be empty.'),
  topic: z.string().min(1, 'Topic is required.'),
});

export async function pushToGithubAction(prevState: any, formData: FormData) {
    const validatedFields = githubSchema.safeParse({
        token: formData.get('token'),
        repo: formData.get('repo'),
        content: formData.get('content'),
        topic: formData.get('topic'),
    });

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return {
            error: Object.values(errors).flat().join(' '),
        };
    }

    const { token, repo, content, topic } = validatedFields.data;
    const fileName = `${topic.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.md`;
    const [owner, repoName] = repo.split('/');
    
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${fileName}`;

    try {
        const contentBase64 = Buffer.from(content).toString('base64');
        
        let sha: string | undefined;
        try {
            const getResponse = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
            });
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (e) {
            // File likely doesn't exist, which is fine. We'll create it.
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                message: `feat: Add course outline for "${topic}"`,
                content: contentBase64,
                sha: sha,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return { error: `GitHub API Error: ${responseData.message || 'Failed to push file.'}` };
        }

        return { success: `Successfully pushed to ${repo} as ${fileName}!`, url: responseData.content.html_url };
    } catch (e) {
        const error = e as Error;
        return { error: `An unexpected error occurred: ${error.message}` };
    }
}
