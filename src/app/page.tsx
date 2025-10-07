'use client';

import Header from '@/components/header';
import CourseGenerator from '@/components/course-generator';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
           <CourseGenerator session={session} />
        </div>
      </main>
    </div>
  );
}
