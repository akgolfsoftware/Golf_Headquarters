import { ForgotForm } from "./forgot-form";

/**
 * /auth/forgot-password — hybrid design (2026-06-17).
 * Fasit: Auth Reset Passord (hybrid).dc.html.
 * Sentrert layout på cream-bakgrunn, card med border+shadow.
 * Steg 1 = send e-post, steg 2 = bekreftelses-state — begge i ForgotForm.
 */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-5 py-12 sm:items-center sm:py-16">
      <div className="w-full max-w-[440px]">
        <ForgotForm />
      </div>
    </main>
  );
}
