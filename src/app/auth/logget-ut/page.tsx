import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const metadata: Metadata = {
  title: "Logget ut · AK Golf",
  description: "Du er logget ut av AK Golf. Logg inn igjen når du er klar.",
};

export default function LoggetUtPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-4 sm:p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-10 text-center shadow-sm">
        <Link
          href="/"
          aria-label="AK Golf — hjem"
          className="mb-8 inline-flex"
        >
          <AkGolfLogo width={56} />
        </Link>

        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
          <CheckCircle className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>

        <AthleticEyebrow tone="lime">AK GOLF · TAKK FOR DENNE GANG</AthleticEyebrow>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
          Vi <em className="font-normal italic text-primary">ses</em> snart
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Din sesjon er avsluttet. Logg inn igjen når du er klar.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="font-display inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-5 text-sm font-bold tracking-[-0.005em] text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Logg inn på nytt →
          </Link>
          <Link
            href="/"
            className="font-display inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-primary bg-transparent px-5 text-sm font-bold tracking-[-0.005em] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tilbake til akgolf.no
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Hadde du en god økt? Del feedback med oss på{" "}
          <a
            href="mailto:post@akgolf.no"
            className="text-primary hover:underline"
          >
            post@akgolf.no
          </a>
        </p>
      </div>
    </main>
  );
}
