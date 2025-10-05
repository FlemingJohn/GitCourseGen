'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { useToast } from "@/hooks/use-toast";

import { generateOutlineAction, convertToMarkdownAction, pushToGithubAction } from '@/app/actions';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, BookMarked, Github, ArrowRight, ExternalLink } from 'lucide-react';
import { Textarea } from './ui/textarea';
import GithubTokenDialog from './github-token-dialog';

type Step = 1 | 2 | 3;

export default function CourseGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  
  const [outlineState, outlineFormAction] = useFormState(generateOutlineAction, { outline: '', error: '' });
  const [markdownState, markdownFormAction] = useFormState(convertToMarkdownAction, { markdownContent: '', error: '' });
  const [githubState, githubFormAction] = useFormState(pushToGithubAction, { success: '', error: '', url: '' });

  const [isOutlinePending, startOutlineTransition] = useTransition();
  const [isMarkdownPending, startMarkdownTransition] = useTransition();
  const [isGithubPending, startGithubTransition] = useTransition();

  const markdownPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
    }
  }, []);

  useEffect(() => {
    if (outlineState.outline) {
      setOutline(outlineState.outline);
      setStep(2);
      toast({ title: "Outline Generated!", description: "Review the outline and convert to Markdown." });
    }
    if (outlineState.error) {
      toast({ variant: "destructive", title: "Error", description: outlineState.error });
    }
  }, [outlineState, toast]);

  useEffect(() => {
    if (markdownState.markdownContent) {
      setMarkdown(markdownState.markdownContent);
      setStep(3);
      toast({ title: "Markdown Ready!", description: "Preview your course and push to GitHub." });
      setTimeout(() => markdownPreviewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    if (markdownState.error) {
      toast({ variant: "destructive", title: "Error", description: markdownState.error });
    }
  }, [markdownState, toast]);

  useEffect(() => {
    if (githubState.success && githubState.url) {
        toast({
            title: "Success!",
            description: githubState.success,
            action: (
              <a href={githubState.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  View File <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ),
        });
    }
    if (githubState.error) {
        toast({ variant: "destructive", title: "GitHub Push Failed", description: githubState.error });
    }
  }, [githubState, toast]);

  const handleGenerateOutline = (formData: FormData) => {
    const currentTopic = formData.get('topic') as string;
    setTopic(currentTopic);
    startOutlineTransition(() => outlineFormAction(formData));
  };
  
  const handleConvertToMarkdown = () => {
    const formData = new FormData();
    formData.append('courseContent', outline);
    startMarkdownTransition(() => markdownFormAction(formData));
  };

  const handlePushToGithub = (formData: FormData) => {
    if (!githubToken) {
      setIsTokenDialogOpen(true);
      return;
    }
    formData.append('token', githubToken);
    formData.append('content', markdown);
    formData.append('topic', topic);
    startGithubTransition(() => githubFormAction(formData));
  };

  const handleTokenSave = (token: string) => {
    localStorage.setItem('github_token', token);
    setGithubToken(token);
    setIsTokenDialogOpen(false);
    toast({ title: "GitHub Token Saved", description: "You can now push to your repository." });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Step 1: Generate Your Course Outline
          </CardTitle>
          <CardDescription>Enter a topic and let AI craft a comprehensive outline for your new course.</CardDescription>
        </CardHeader>
        <form action={handleGenerateOutline}>
          <CardContent>
            <Label htmlFor="topic">Course Topic</Label>
            <Input id="topic" name="topic" placeholder="e.g., 'Introduction to Quantum Computing'" required disabled={isOutlinePending || step > 1} className="mt-2" />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isOutlinePending || step > 1}>
              {isOutlinePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Outline
              {!isOutlinePending && step === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {step >= 2 && outline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="text-primary" />
              Step 2: Review and Convert
            </CardTitle>
            <CardDescription>Here's your generated course outline. When you're ready, convert it to Markdown.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="p-4 bg-secondary rounded-md max-h-96 overflow-y-auto text-sm whitespace-pre-wrap font-mono">
                {outline}
             </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConvertToMarkdown} disabled={isMarkdownPending || step > 2}>
              {isMarkdownPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert to Markdown
              {!isMarkdownPending && step === 2 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && markdown && (
        <Card ref={markdownPreviewRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="text-primary" />
              Step 3: Preview and Push to GitHub
            </CardTitle>
            <CardDescription>Review the final Markdown and push it directly to your GitHub repository.</CardDescription>
          </CardHeader>
          <form action={handlePushToGithub}>
            <CardContent className="space-y-6">
                <div>
                    <Label>Markdown Content</Label>
                    <Textarea value={markdown} name="content" readOnly className="mt-2 font-mono text-sm min-h-[400px] max-h-[60vh] bg-secondary border-border focus-visible:ring-primary" />
                </div>
                <div>
                    <Label htmlFor="repo">GitHub Repository</Label>
                    <Input id="repo" name="repo" placeholder="owner/repo-name" required disabled={isGithubPending} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {!githubToken ? "You'll need a GitHub token to continue. " : "Using saved GitHub token. "}
                      <Button variant="link" type="button" className="p-0 h-auto text-primary" onClick={() => setIsTokenDialogOpen(true)}>
                        {!githubToken ? "Set Token" : "Update Token"}
                      </Button>
                    </p>
                </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGithubPending}>
                {isGithubPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Push to GitHub
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <GithubTokenDialog isOpen={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen} onSave={handleTokenSave} />
    </div>
  );
}
