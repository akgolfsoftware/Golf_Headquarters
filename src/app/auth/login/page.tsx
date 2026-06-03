import { Suspense } from "react";
import Link from "next/link";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { LoginForm } from "./login-form";

/**
 * /auth/login — v10-design (3. juni). Presentasjon byttet til v10-fasit
 * (lime ak-logo-boks + «Velkommen tilbake.»-headline). All auth-logikk
 * (e-post/passord + Google OAuth) bevart uendret i LoginForm.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="AK Golf — hjem"
            className="mb-6 inline-flex rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-[11px] bg-accent font-display text-xl font-extrabold leading-none text-primary"
            >
              ak
            </span>
          </Link>
          <AthleticEyebrow>LOGG INN</AthleticEyebrow>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            Velkommen{" "}
            <em className="font-normal italic text-primary">tilbake.</em>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Logg inn for å se dagens program og tallene dine.
          </p>
        </div>

        <Suspense fallback={<div className="h-64" aria-hidden />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
