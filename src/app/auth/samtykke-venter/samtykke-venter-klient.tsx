"use client";

import { useState, useTransition } from "react";
import { Clock, Mail, LogOut, RefreshCw } from "lucide-react";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import Link from "next/link";

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
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-6">
      <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-2xl border border-border bg-card px-8 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* Ikon + tittel */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/15">
            <Clock size={28} className="text-warning" strokeWidth={1.75} />
          </div>
          <div className="text-center">
            <h1 className="m-0 font-display text-[22px] font-extrabold -tracking-[0.02em] text-foreground">
              Venter på foreldresamtykke
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Hei {spillerNavn || "der"}! Du er under 16 år og trenger foreldresamtykke
              for å bruke AK Golf-plattformen (GDPR art.&nbsp;8).
            </p>
          </div>
        </div>

        {/* Status for invitasjon */}
        {invitasjonEmail && !status && (
          <div className="rounded-xl bg-primary/5 px-4 py-3 text-[13px] text-foreground">
            <Mail
              size={14}
              className="mr-1.5 inline align-middle"
              strokeWidth={1.75}
            />
            Invitasjon sendt til <strong>{invitasjonEmail}</strong>. Be forelderen sjekke
            innboksen og klikke lenken.
          </div>
        )}

        {/* Resend-skjema */}
        <div>
          <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}
          </p>
          <form onSubmit={onSend} className="flex gap-2">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
              <Mail size={14} className="text-muted-foreground" strokeWidth={1.75} />
              <input
                type="email"
                value={nyEmail}
                onChange={(e) => setNyEmail(e.target.value)}
                placeholder="forelder@example.com"
                autoComplete="email"
                required
                className="flex-1 border-none bg-transparent text-sm text-foreground outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={isPending || !nyEmail.trim()}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-[18px] font-display text-[13px] font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} strokeWidth={2} />
              {isPending ? "Sender…" : "Send"}
            </button>
          </form>

          {status && (
            <p
              className={`mt-2 font-mono text-[12px] tracking-[0.04em] ${
                status.ok ? "text-success" : "text-destructive"
              }`}
            >
              {status.melding}
            </p>
          )}
        </div>

        {/* Hjelpetekst */}
        <p className="m-0 text-center text-[12px] text-muted-foreground">
          Har du spørsmål?{" "}
          <a href="mailto:post@akgolf.no" className="text-primary underline">
            post@akgolf.no
          </a>
        </p>

        {/* Logg ut */}
        <div className="border-t border-border pt-4 text-center">
          <Link
            href="/auth/logout"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline"
          >
            <LogOut size={13} strokeWidth={1.75} />
            Logg ut
          </Link>
        </div>
      </div>
    </div>
  );
}
