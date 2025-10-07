// This file is no longer used for the main application entry point.
// The Chrome Extension functionality is handled by the 'extension' directory.

// You can still use this page for testing components in isolation if needed.

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold">GitCourseGen Chrome Extension</h1>
      <p className="mt-2 text-muted-foreground">
        Load this directory as an unpacked extension in Chrome to use the tool on YouTube.
      </p>
    </div>
  );
}
