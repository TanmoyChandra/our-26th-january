import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        26th January 2027 — Invitation System
      </h1>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        This is the architecture foundation. The actual invitation design will
        be implemented in a later phase.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/demo?type=family"
          className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Preview: Family invitation (/demo?type=family)
        </Link>
        <Link
          href="/demo?type=general"
          className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Preview: General invitation (/demo?type=general)
        </Link>
      </div>
    </main>
  );
}
