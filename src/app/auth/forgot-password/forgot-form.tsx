"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
        <p className="font-display text-xl font-semibold leading-tight">
          <em className="font-normal text-primary md:italic">Sjekk</em> innboksen
        </p>
        <p className="text-sm text-muted-foreground">
          Vi har sendt en lenke til {email}. Klikk på den for å sette nytt passord.
        </p>
        <Link
          href="/auth/login"
          className="mt-2 inline-block rounded-md border border-input bg-card px-6 py-2.5 text-sm font-medium hover:border-border"
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
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-base sm:text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sender…" : "Send reset-lenke"}
      </button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Husket passordet?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Logg inn
        </Link>
      </p>
    </form>
  );
}
