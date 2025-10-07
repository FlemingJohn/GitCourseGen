'use server';

import { generateCourseOutline } from "@/ai/flows/generate-course-outline";
import { generateCourseTitle } from "@/ai/flows/generate-course-title";
import { convertContentToMarkdown } from "@/ai/flows/convert-content-to-markdown";
import { auth } from "@/auth";

export async function generateOutlineAction(prevState: any, formData: FormData) {
    const topic = formData.get('topic') as string;
    if (!topic) {
        return { outline: '', title: '', error: 'Topic is required.' };
    }

    try {
        const [outlineResult, titleResult] = await Promise.all([
            generateCourseOutline({ topic }),
            generateCourseTitle({ topic })
        ]);
        
        return {
            outline: outlineResult.outline,
            title: titleResult.title,
            error: ''
        };
    } catch (e: any) {
        console.error(e);
        return { outline: '', title: '', error: 'Failed to generate content. Please try again.' };
    }
}

export async function convertToMarkdownAction(prevState: any, formData: FormData) {
    const courseContent = formData.get('courseContent') as string;
    if (!courseContent) {
        return { markdownContent: '', error: 'Course content is empty.' };
    }

    try {
        const result = await convertContentToMarkdown({ courseContent });
        return {
            markdownContent: result.markdownContent,
            error: ''
        };
    } catch (e: any) {
        console.error(e);
        return { markdownContent: '', error: 'Failed to convert to Markdown. Please try again.' };
    }
}

export async function pushToGithubAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.accessToken) {
        return { success: '', error: 'Not authenticated. Please sign in with GitHub.', url: '' };
    }

    const repo = formData.get('repo') as string;
    const content = formData.get('content') as string;
    const topic = formData.get('topic') as string;

    if (!repo || !content || !topic) {
        return { success: '', error: 'Missing repository name, content, or topic.', url: '' };
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        return { success: '', error: 'Invalid repository format. Please use "owner/repo-name".', url: '' };
    }
    
    const fileName = `${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    const path = `courses/${fileName}`;
    const commitMessage = `Add course: ${topic}`;

    const headers = {
        'Authorization': `token ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
        // Step 1: Check if repo exists. If not, create it.
        const repoCheckResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
        
        if (repoCheckResponse.status === 404) {
            // Repo doesn't exist, create it
            const createRepoResponse = await fetch(`https://api.github.com/user/repos`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: repoName,
                    private: false, 
                }),
            });

            if (!createRepoResponse.ok) {
                 const errorBody = await createRepoResponse.json();
                 console.error("Failed to create repo:", errorBody);
                 return { success: '', error: `Failed to create repository: ${errorBody.message}`, url: '' };
            }
        } else if (!repoCheckResponse.ok) {
            const errorBody = await repoCheckResponse.json();
            console.error("Failed to check repo:", errorBody);
            return { success: '', error: `Could not verify repository: ${errorBody.message}`, url: '' };
        }

        // Step 2: Get the SHA of the main branch
        const branchResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/branches/main`, { headers });
        let baseSha;

        if (branchResponse.status === 404) {
             // The repo is new and empty, it has no branches. We can commit directly.
        } else if (branchResponse.ok) {
            const branchData = await branchResponse.json();
            baseSha = branchData.commit.sha;
        } else {
            const errorBody = await branchResponse.json();
            console.error("Failed to get branch:", errorBody);
            // If main branch doesn't exist, maybe it's master? Common in older repos.
            // For this app, we'll assume a new or modern repo and error out.
            return { success: '', error: `Could not find 'main' branch: ${errorBody.message}`, url: '' };
        }


        // Step 3: Create or update the file
        const fileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
        
        // First, try to get the file to see if it exists (to get its SHA for an update)
        let fileSha: string | undefined = undefined;
        try {
            const getFileResponse = await fetch(fileUrl, { headers });
            if (getFileResponse.ok) {
                const fileData = await getFileResponse.json();
                fileSha = fileData.sha;
            }
        } catch (e) {
            // Ignore if file doesn't exist
        }

        const contentEncoded = Buffer.from(content).toString('base64');
        const createFileResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: commitMessage,
                content: contentEncoded,
                sha: fileSha, // Include SHA if updating an existing file
                branch: 'main'
            }),
        });

        const responseData = await createFileResponse.json();

        if (createFileResponse.ok) {
            return { 
                success: `Successfully pushed to ${repoName}!`,
                error: '',
                url: responseData.content.html_url
            };
        } else {
             console.error("Failed to push file:", responseData);
             return { success: '', error: `Failed to push file: ${responseData.message}`, url: '' };
        }

    } catch (e: any) {
        console.error(e);
        return { success: '', error: `An unexpected error occurred: ${e.message}`, url: '' };
    }
}
