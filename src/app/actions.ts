'use server';

import { generateCourseFilesFromTopic } from "@/ai/flows/generate-course-files-from-topic";
import { auth } from "@/auth";

async function createGithubFile(repo: string, path: string, content: string, token: string, owner: string, repoName: string) {
    const contentEncoded = Buffer.from(content).toString('base64');
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
    
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: `Add course file: ${path}`,
            content: contentEncoded,
            branch: 'main'
        }),
    });
    
    if (!response.ok) {
        const errorBody = await response.json();
        console.error(`Failed to create file ${path}:`, errorBody);
        throw new Error(`Failed to create file ${path}: ${errorBody.message}`);
    }
    return await response.json();
}


export async function generateAndPushToGithubAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.accessToken) {
        return { success: '', error: 'Not authenticated. Please sign in with GitHub.', url: '' };
    }

    const topic = formData.get('topic') as string;
    const repo = formData.get('repo') as string;

    if (!topic || !repo) {
        return { success: '', error: 'Topic and repository name are required.', url: '' };
    }
    
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        return { success: '', error: 'Invalid repository format. Please use "owner/repo-name".', url: '' };
    }

    const headers = {
        'Authorization': `token ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    try {
        // Step 1: Generate course content and structure from AI
        const courseData = await generateCourseFilesFromTopic({ topic });

        // Step 2: Check if repo exists. If not, create it.
        const repoCheckResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
        let repoHtmlUrl = '';

        if (repoCheckResponse.status === 404) {
            console.log("Repository not found, creating it...");
            const createRepoResponse = await fetch(`https://api.github.com/user/repos`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: repoName, private: false, description: courseData.title }),
            });
            const createRepoData = await createRepoResponse.json();
            if (!createRepoResponse.ok) {
                 console.error("Failed to create repo:", createRepoData);
                 return { success: '', error: `Failed to create repository: ${createRepoData.message}`, url: '' };
            }
            repoHtmlUrl = createRepoData.html_url;
        } else if (repoCheckResponse.ok) {
            const repoData = await repoCheckResponse.json();
            repoHtmlUrl = repoData.html_url;
        } else {
            const errorBody = await repoCheckResponse.json();
            console.error("Failed to check repo:", errorBody);
            return { success: '', error: `Could not verify repository: ${errorBody.message}`, url: '' };
        }

        // Step 3: Create a README.md for the course
        const readmeContent = `# ${courseData.title}\n\nCourse generated for topic: "${topic}"`;
        await createGithubFile(repo, 'README.md', readmeContent, session.accessToken, owner, repoName);

        // Step 4: Create all folders and files
        for (const folder of courseData.folders) {
            for (const file of folder.files) {
                const filePath = `${folder.name}/${file.name}`;
                await createGithubFile(repo, filePath, file.content, session.accessToken, owner, repoName);
            }
        }
        
        return { 
            success: `Successfully pushed "${courseData.title}" to ${repoName}!`,
            error: '',
            url: repoHtmlUrl
        };

    } catch (e: any) {
        console.error(e);
        return { success: '', error: `An unexpected error occurred: ${e.message}`, url: '' };
    }
}
