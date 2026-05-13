import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-sm">
        <Link href="/" aria-label="AK Golf — hjem" className="mb-8 inline-flex">
          <AkGolfLogo width={56} />
        </Link>

        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Glemt</em> passord?
        </h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Skriv inn e-posten din. Vi sender en lenke for å lage nytt passord.
        </p>

        <ForgotForm />
      </div>
    </main>
  );
}
