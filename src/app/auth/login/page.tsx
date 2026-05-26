import { Suspense } from "react";
import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-4 sm:p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="AK Golf — hjem" className="mb-6 inline-flex">
            <AkGolfLogo width={56} />
          </Link>
          <AthleticEyebrow tone="lime">AK GOLF · LOGG INN</AthleticEyebrow>
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal italic text-primary">Velkommen</em> tilbake
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Logg inn for å fortsette til plattformen.
          </p>
        </div>

        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
