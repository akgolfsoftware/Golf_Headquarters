import { ResetForm } from "./reset-form";

/**
 * /auth/reset-password — hybrid design (2026-06-17).
 * Brukeren lander her etter a ha klikket lenken fra e-posten.
 * Lock-ikon, heading, to passordfelt (ny + bekreft), pill CTA.
 */
export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-5 py-12 sm:items-center sm:py-16">
      <div className="w-full max-w-[440px]">
        <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-lg">
          {/* Lock-ikon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-primary"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <h1 className="mb-1 text-center font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            Sett nytt passord
          </h1>
          <p className="mb-6 text-center text-[13.5px] leading-relaxed text-muted-foreground">
            Velg et passord pa minst 8 tegn.
          </p>

          <ResetForm />
        </div>
      </div>
    </main>
  );
}
