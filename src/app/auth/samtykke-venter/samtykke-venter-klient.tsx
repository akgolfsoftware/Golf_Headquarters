"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Clock, Mail, LogOut, RefreshCw } from "lucide-react";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { logout } from "@/lib/auth/logout";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

type Props = {
  spillerNavn: string;
  invitasjonEmail: string | null;
};

export function SamtykkeVenterKlient({ spillerNavn, invitasjonEmail }: Props) {
  const [isPending, startTransition] = useTransition();
  const [nyEmail, setNyEmail] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; melding: string } | null>(null);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!nyEmail.trim()) return;
    startTransition(async () => {
      setStatus(null);
      const result = await resendGuardianInvitation({ guardianEmail: nyEmail.trim() });
      if (result.ok) {
        setStatus({ ok: true, melding: "Invitasjon sendt. Be forelderen sjekke innboksen." });
      } else {
        setStatus({ ok: false, melding: result.error ?? "Noe gikk galt. Prøv igjen." });
      }
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-4 sm:p-8">
      <div className="w-full max-w-[430px] rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
        {/* Logo + eyebrow + tittel */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="AK Golf — hjem" className="mb-6 inline-flex">
            <AkGolfLogo width={56} />
          </Link>

          <span className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-warning/15">
            <Clock className="h-7 w-7 text-warning" strokeWidth={1.75} aria-hidden />
          </span>

          <AthleticEyebrow tone="lime">AK GOLF · FORELDRESAMTYKKE</AthleticEyebrow>
          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            Venter på <em className="font-normal italic text-primary">samtykke</em>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Hei {spillerNavn || "der"}! Du er under 16 år og trenger foreldresamtykke
            for å bruke AK Golf-plattformen (GDPR art.&nbsp;8).
          </p>
        </div>

        {/* Status for sendt invitasjon */}
        {invitasjonEmail && !status && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-border border-l-[3px] border-l-accent bg-secondary px-4 py-3 text-[13px] leading-relaxed text-foreground">
            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
            <span>
              Invitasjon sendt til <strong className="font-semibold">{invitasjonEmail}</strong>.
              Be forelderen sjekke innboksen og klikke lenken.
            </span>
          </div>
        )}

        {/* Resend / legg til forelder */}
        <form onSubmit={onSend} className="flex flex-col gap-2">
          <label
            htmlFor="guardian-email"
            className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}
          </label>
          <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <input
              id="guardian-email"
              type="email"
              value={nyEmail}
              onChange={(e) => setNyEmail(e.target.value)}
              placeholder="forelder@example.com"
              autoComplete="email"
              required
              className="h-full flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !nyEmail.trim()}
            className="font-display mt-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-sm font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {isPending ? "Sender…" : "Send invitasjon"}
          </button>

          {status && (
            <p
              className={`font-mono text-[12px] tracking-[0.04em] ${
                status.ok ? "text-success" : "text-destructive"
              }`}
              role="status"
            >
              {status.melding}
            </p>
          )}
        </form>

        {/* Hjelpetekst */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Har du spørsmål?{" "}
          <a href="mailto:post@akgolf.no" className="text-primary hover:underline">
            post@akgolf.no
          </a>
        </p>

        {/* Logg ut — server action (ingen /auth/logout-rute finnes) */}
        <div className="mt-8 border-t border-border pt-6 text-center">
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Logg ut
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
