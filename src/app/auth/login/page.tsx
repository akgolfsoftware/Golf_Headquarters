import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { LoginForm } from "./login-form";

/**
 * /auth/login — portet mot fersk Claude Design-fasit (ph-auth.jsx · ALogin).
 * Skall: sentrert kolonne (max-w 396px) rett på cream-bakgrunn, sentrert
 * ak-logo øverst + venstrestilt eyebrow/tittel/lead — som fasiten.
 * All auth-logikk (e-post/passord + Google OAuth) bevart uendret i LoginForm.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-6 py-10 sm:items-center sm:py-16">
      <div className="flex min-h-[calc(100svh-5rem)] w-full max-w-[396px] flex-col sm:min-h-0">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            aria-label="AK Golf — hjem"
            className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Image
              src="/logos/ak-golf-logo-primary-on-light.svg"
              alt="AK Golf"
              width={120}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="mb-6 text-center">
          <AthleticEyebrow>LOGG INN</AthleticEyebrow>
          <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-foreground">
            Velkommen{" "}
            <em className="font-normal italic text-primary">tilbake.</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
