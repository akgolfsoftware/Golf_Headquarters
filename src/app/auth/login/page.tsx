import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-sm">
        <Link
          href="/"
          className="mb-8 inline-block font-display text-xl font-bold tracking-tight"
        >
          AK <em className="font-normal text-primary not-italic md:italic">Golf</em>
        </Link>

        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Velkommen</em> tilbake
        </h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Logg inn for å fortsette til plattformen.
        </p>

        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
