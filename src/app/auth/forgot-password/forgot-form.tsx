"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticBadge } from "@/components/athletic/badge";

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
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <AthleticBadge variant="ok">E-POST SENDT</AthleticBadge>
        </div>
        <p className="font-display text-xl font-semibold leading-tight">
          <em className="font-normal italic text-primary">Sjekk</em> innboksen
        </p>
        <p className="text-sm text-muted-foreground">
          Vi har sendt en lenke til {email}. Klikk på den for å sette nytt passord.
        </p>
        <Link
          href="/auth/login"
          className="font-display mt-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-transparent px-6 text-sm font-bold tracking-[-0.005em] text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Tilbake til innlogging
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          E-post
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-base sm:text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2"
        >
          <AthleticBadge variant="urgent">Feil</AthleticBadge>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <AthleticButton
        type="submit"
        variant="primary"
        size="md"
        disabled={pending}
        className="w-full"
      >
        {pending ? "Sender…" : "Send reset-lenke"}
      </AthleticButton>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Husket passordet?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Logg inn
        </Link>
      </p>
    </form>
  );
}
