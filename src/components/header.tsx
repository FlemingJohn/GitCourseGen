import { Github } from 'lucide-react';
import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ''} />
              <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button type="submit" className="w-full">
              <DropdownMenuItem className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <form
      action={async () => {
        'use server';
        await signIn('github', { redirectTo: '/' });
      }}
    >
      <Button variant="outline">
        <Github className="mr-2 h-4 w-4" />
        Sign in with GitHub
      </Button>
    </form>
  );
}

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b">
      <Link className="flex items-center justify-center gap-2" href="/">
        <Github className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">GitCourseGen</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:text-primary underline-offset-4"
          href="https://github.com/FirebaseExtended/studio-samples/tree/main/awesome-ai-devtools/next-genkit-course-generator"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code
        </Link>
        <AuthButton />
      </nav>
    </header>
  );
}
