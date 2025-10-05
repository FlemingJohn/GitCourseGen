import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b">
      <Link className="flex items-center justify-center gap-2" href="/">
        <Github className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">GitCourseGen</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:text-primary underline-offset-4"
          href="https://github.com/FirebaseExtended/studio-samples/tree/main/awesome-ai-devtools/next-genkit-course-generator"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code
        </Link>
      </nav>
    </header>
  );
}
