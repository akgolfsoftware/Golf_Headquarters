import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mb-6 font-display text-xl font-bold tracking-tight">
          AK <em className="font-normal text-primary not-italic md:italic">Golf</em>
        </div>

        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight">
          Sjekk innboksen din
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Vi har sendt en bekreftelseslenke til e-posten du registrerte deg
          med. Klikk på lenken for å aktivere kontoen din.
        </p>

        <p className="mt-6 text-xs text-muted-foreground">
          Fant du den ikke? Sjekk søppelpost eller{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            prøv igjen
          </Link>
          .
        </p>

        <Link
          href="/auth/login"
          className="mt-8 inline-block rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
        >
          Tilbake til innlogging
        </Link>
      </div>
    </main>
  );
}
