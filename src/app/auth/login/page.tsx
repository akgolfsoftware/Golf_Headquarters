import { Suspense } from "react";
import { LoginForm } from "./login-form";

/**
 * /auth/login — hybrid design (2026-06-17).
 * Fasit: Auth Innlogging (hybrid).dc.html — PlayerHQ-tab.
 * Forest logo-mark (44×44 square + lime flag-icon), sentrert card på cream,
 * heading "Logg inn på PlayerHQ", mono-etiketter, pill CTA + Google-knapp.
 * All form-logikk (Supabase e-post/passord + Google OAuth) er uendret i LoginForm.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-5 py-8 sm:items-center sm:py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-6">
        {/* Logo mark */}
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)] bg-primary">
          <FlagIcon />
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-lg">
          <h1 className="mb-1 text-center font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            Logg inn på PlayerHQ
          </h1>
          <p className="mb-6 text-center text-[13.5px] text-muted-foreground">
            Din trenings- og utviklingsportal
          </p>

          <Suspense fallback={<div className="h-64" aria-hidden />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

/** Golf-flagg-ikon fra design-fasiten (lik flag-of-the-hole). */
function FlagIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 22V4" />
      <path d="M6 4l11 2.6a1 1 0 0 1 .1 1.9L6 11.5" />
    </svg>
  );
}
