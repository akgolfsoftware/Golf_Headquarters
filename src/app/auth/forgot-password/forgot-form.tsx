"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AthleticBadge } from "@/components/athletic/badge";

/**
 * ForgotForm — hybrid design (2026-06-17).
 * Fasit: Auth Reset Passord (hybrid).dc.html.
 *
 * Steg 1: Lock-ikon i sirkel, heading, e-post-input, pill CTA, tilbake-lenke.
 * Steg 2: Checkmark-ikon, bekreftelse med e-postadresse, tips-boks, send-pa-nytt.
 */
export function ForgotForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    setPending(false);
    if (err) {
      setError(oversettResetFeil(err.message));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-lg text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle
            className="h-[26px] w-[26px] text-success"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        <h1 className="mb-2 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Sjekk e-posten
        </h1>
        <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
          Vi har sendt en lenke til{" "}
          <strong className="font-semibold text-foreground">{email}</strong>.
          Lenken er gyldig i 30 minutter.
        </p>

        <div className="mb-5 rounded-xl bg-secondary px-[14px] py-[14px] text-left">
          <p className="mb-[6px] font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Ikke fatt e-posten?
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Sjekk soppelpost-mappen. Fremdeles ingenting? Kontakt{" "}
            <a
              href="mailto:anders@akgolf.no"
              className="font-medium text-primary hover:underline"
            >
              anders@akgolf.no
            </a>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSent(false)}
          className="rounded-full border-[1.5px] border-border bg-transparent px-6 py-[11px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Send pa nytt
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-lg">
      <h1 className="mb-1 text-center font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        Glemt passordet?
      </h1>
      <p className="mb-6 text-center text-[13.5px] leading-relaxed text-muted-foreground">
        Skriv inn e-postadressen din, så sender vi deg en lenke for å opprette
        nytt passord.
      </p>

      <form onSubmit={send} className="flex flex-col">
        <label
          htmlFor="forgot-email"
          className="mb-[5px] block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          E-post
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="oyvind@akgolf.no"
          className="mb-[14px] w-full rounded-xl border border-border bg-secondary px-[14px] py-[11px] text-sm text-foreground outline-none placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]"
        />

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
          >
            <AthleticBadge variant="urgent">Feil</AthleticBadge>
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mb-3 w-full rounded-full bg-accent py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {pending ? "Sender…" : "Send tilbakestillingslenke"}
        </button>

        <Link
          href="/auth/login"
          className="block text-center text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          Tilbake til innlogging
        </Link>
      </form>
    </div>
  );
}

function oversettResetFeil(msg: string): string {
  if (msg.includes("you can only request this after"))
    return "Vent et lite øyeblikk før du ber om en ny lenke.";
  if (msg.includes("Unable to validate email address"))
    return "Sjekk at e-postadressen er riktig skrevet.";
  return msg;
}
