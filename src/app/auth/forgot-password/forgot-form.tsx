"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MailCheck, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticBadge } from "@/components/athletic/badge";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { buttonClasses } from "@/components/ui/button";

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
      <div className="flex flex-col items-center pt-2 text-center">
        <span
          aria-hidden
          className="mb-4 grid h-[60px] w-[60px] place-items-center rounded-2xl bg-accent text-primary"
        >
          <MailCheck className="h-8 w-8" strokeWidth={1.5} />
        </span>
        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-foreground">
          Sjekk <em className="font-normal italic text-primary">innboksen.</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vi har sendt en lenke for å nullstille passordet til {email}.
        </p>
        <Link
          href="/auth/login"
          className={buttonClasses({
            variant: "secondary",
            size: "md",
            className: "mt-6 w-full",
          })}
        >
          Tilbake til innlogging
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col">
      <div className="mb-6">
        <AthleticEyebrow>GLEMT PASSORD</AthleticEyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-balance text-foreground">
          Nullstill <em className="font-normal italic text-primary">passord.</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Skriv inn e-posten din, så sender vi deg en lenke.
        </p>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          E-post
        </span>
        <span className="flex h-12 items-center gap-2 rounded-xl border border-input bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Mail
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="navn@klubb.no"
            className="h-full w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-sm"
          />
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2"
        >
          <AthleticBadge variant="urgent">Feil</AthleticBadge>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <AthleticButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="w-full"
      >
        {pending ? (
          "Sender…"
        ) : (
          <>
            Send lenke <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </>
        )}
      </AthleticButton>
    </form>
  );
}
