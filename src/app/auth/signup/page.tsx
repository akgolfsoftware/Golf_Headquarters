import Link from "next/link";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { SignupForm } from "./signup-form";

/**
 * /auth/signup — portet mot fersk Claude Design-fasit (ph-auth.jsx · ASignup).
 * Skall: sentrert kolonne (max-w 396px) rett på cream-bakgrunn, sentrert
 * ak-logo øverst + venstrestilt eyebrow/tittel/lead — som fasiten.
 * All registreringslogikk bevart uendret i SignupForm.
 */
export default function SignupPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-6 py-10 sm:items-center sm:py-16">
      <div className="flex w-full max-w-[396px] flex-col">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            aria-label="AK Golf — hjem"
            className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-xl bg-accent font-display text-xl font-extrabold leading-none text-foreground"
            >
              ak
            </span>
          </Link>
        </div>

        <div className="mb-6">
          <AthleticEyebrow>NY KONTO</AthleticEyebrow>
          <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-foreground">
            Bli med i{" "}
            <em className="font-normal italic text-primary">stallen.</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Opprett spillerkonto. Coachen din kobler deg til en plan etterpå.
          </p>
        </div>

        <SignupForm />
      </div>
    </main>
  );
}
