import Header from '@/components/header';
import CourseGenerator from '@/components/course-generator';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
        <CourseGenerator session={session} />
      </main>
    </div>
  );
}
