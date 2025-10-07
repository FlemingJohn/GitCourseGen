'use client';

import { useState, useTransition, useEffect, useRef, useActionState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Session } from 'next-auth';

import { generateOutlineAction, convertToMarkdownAction, pushToGithubAction } from '@/app/actions';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, BookMarked, Github, ArrowRight, ExternalLink } from 'lucide-react';
import { Textarea } from './ui/textarea';

type Step = 1 | 2 | 3;

interface CourseGeneratorProps {
  session: Session | null;
}

export default function CourseGenerator({ session }: CourseGeneratorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [markdown, setMarkdown] = useState('');
  
  const [outlineState, outlineFormAction, isOutlinePending] = useActionState(generateOutlineAction, { outline: '', title: '', error: '' });
  const [markdownState, markdownFormAction, isMarkdownPending] = useActionState(convertToMarkdownAction, { markdownContent: '', error: '' });
  const [githubState, githubFormAction, isGithubPending] = useActionState(pushToGithubAction, { success: '', error: '', url: '' });

  const markdownPreviewRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (outlineState.outline && outlineState.title) {
      setOutline(outlineState.outline);
      setTitle(outlineState.title);
      setStep(2);
      toast({ title: "Assets Generated!", description: "Review the title and outline, then convert to Markdown." });
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
  
  const handleConvertToMarkdown = () => {
    const fullContent = `# ${title}\n\n${outline}`;
    const formData = new FormData();
    formData.append('courseContent', fullContent);
    markdownFormAction(formData);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Step 1: Generate Your Course
          </CardTitle>
          <CardDescription>Enter a topic and let AI craft a title and comprehensive outline for you.</CardDescription>
        </CardHeader>
        <form action={(formData) => {
          setTopic(formData.get('topic') as string);
          outlineFormAction(formData);
        }}>
          <CardContent>
            <Label htmlFor="topic">Course Topic</Label>
            <Input id="topic" name="topic" placeholder="e.g., 'Introduction to Quantum Computing'" required disabled={isOutlinePending || step > 1} className="mt-2" />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isOutlinePending || step > 1}>
              {isOutlinePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Course
              {!isOutlinePending && step === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {step >= 2 && outline && title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="text-primary" />
              Step 2: Review and Convert
            </CardTitle>
            <CardDescription>Here's your generated title and outline. When you're ready, convert it to Markdown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label>Generated Title</Label>
                <Input value={title} readOnly className="mt-2 font-bold text-lg bg-secondary" />
            </div>
             <div>
                <Label>Generated Outline</Label>
                 <div className="p-4 bg-secondary rounded-md max-h-96 overflow-y-auto text-sm whitespace-pre-wrap font-mono mt-2">
                    {outline}
                 </div>
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

      {step === 3 && markdown && session && (
        <Card ref={markdownPreviewRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="text-primary" />
              Step 3: Preview and Push to GitHub
            </CardTitle>
            <CardDescription>Review the final Markdown and push it directly to your GitHub repository.</CardDescription>
          </CardHeader>
          <form action={githubFormAction}>
             <CardContent className="space-y-6">
                <input type="hidden" name="content" value={markdown} />
                <input type="hidden" name="topic" value={topic} />
                <div>
                    <Label>Markdown Content</Label>
                    <Textarea value={markdown} disabled className="mt-2 font-mono text-sm min-h-[400px] max-h-[60vh] bg-secondary border-border focus-visible:ring-primary" />
                </div>
                <div>
                    <Label htmlFor="repo">GitHub Repository</Label>
                    <Input id="repo" name="repo" placeholder="owner/repo-name" required disabled={isGithubPending} className="mt-2" />
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
    </div>
  );
}
