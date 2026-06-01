import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "BankID-pålogging · AK Golf",
  description: "BankID-pålogging kommer post-BETA. Bruk e-post/passord eller Google for nå.",
};

export default function BankIDPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-4 sm:p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-10 text-center shadow-sm">
        <div className="flex flex-col items-center">
          <Link
            href="/"
            aria-label="AK Golf — hjem"
            className="mb-6 inline-flex"
          >
            <AkGolfLogo width={56} />
          </Link>

          <div className="mb-6 grid h-[88px] w-[88px] place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-11 w-11" strokeWidth={1.5} aria-hidden />
          </div>

          <AthleticEyebrow tone="lime">BANKID · KOMMER POST-BETA</AthleticEyebrow>
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            Verifiser med <em className="font-normal italic text-primary">BankID</em>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post,
            passord eller Google for nå.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/auth/login"
            className="font-display inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-sm font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tilbake til vanlig login →
          </Link>
        </div>
      </div>
    </main>
  );
}
