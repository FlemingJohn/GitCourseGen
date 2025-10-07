'use client';

import { useEffect, useActionState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Session } from 'next-auth';

import { generateAndPushToGithubAction } from '@/app/actions';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Github, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CourseGeneratorProps {
  session: Session | null;
}

export default function CourseGenerator({ session }: CourseGeneratorProps) {
  const { toast } = useToast();
  
  const [githubState, githubFormAction, isGithubPending] = useActionState(generateAndPushToGithubAction, { success: '', error: '', url: '' });

  useEffect(() => {
    if (githubState.success && githubState.url) {
        toast({
            title: "Success!",
            description: githubState.success,
            duration: 9000,
            action: (
              <a href={githubState.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  View Repo <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ),
        });
    }
    if (githubState.error) {
        toast({ variant: "destructive", title: "Generation Failed", description: githubState.error, duration: 9000 });
    }
  }, [githubState, toast]);
  
  if (!session) {
      return (
          <Alert>
              <AlertDescription>
                  Please sign in with GitHub to use the course generator.
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Generate and Push Your Course
          </CardTitle>
          <CardDescription>Enter a topic, provide a repo name, and let AI build and push the entire course structure to GitHub for you.</CardDescription>
        </CardHeader>
        <form action={githubFormAction}>
          <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Course Topic</Label>
                <Input id="topic" name="topic" placeholder="e.g., 'Intro to Python for Data Science'" required disabled={isGithubPending} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="repo">GitHub Repository</Label>
                <Input id="repo" name="repo" placeholder="your-github-username/new-repo-name" required disabled={isGithubPending} className="mt-2" />
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGithubPending} className="w-full sm:w-auto">
              {isGithubPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGithubPending ? 'Generating & Pushing...' : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Generate & Push to GitHub
                  </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
