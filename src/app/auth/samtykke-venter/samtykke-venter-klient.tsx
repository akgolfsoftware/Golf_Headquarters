"use client";

/**
 * Samtykke-venterom (spiller under 16) — visuelt skall fra fersk fasit:
 * (historisk juni-fasit, fjernet fra repo) playerhq-app/ph-auth.jsx
 *   → ASamtykke (klokke-badge → «Venter på samtykke»-chip → «Nesten i mål.»
 *     → STATUS-kort med tre rader → sekundær påminnelses-CTA → logg ut-lenke).
 *
 * Bevisste avvik fra fasit:
 * - Fasit sier «under 18» — appens GDPR-gate er 16 år (art. 8) → teksten sier 16.
 * - Fasitens «Send påminnelse» er én knapp; appen trenger e-postfeltet for å
 *   resende/endre foresatt-adresse (eksisterende logikk beholdt urørt).
 * - Fasitens demo-«hopp over og fortsett»-kort er demo-chrome → utelatt.
 * - chip-warn-fargene (#FBEFD4/#6B4D11) er ikke DS-tokens → warning-token brukes.
 *
 * Chrome løftet til auth-kanonen 2026-07-06 (D4): mørk terminal-flate + grid +
 * «ak»-lettermerke som login/signup, pill-CTA (mono caps). `.dark` flipper
 * tokenene så kort/inputs blir mørke. KUN presentasjon endret — resend-action,
 * logout og all state er uendret.
 */

import { Eyebrow } from "@/components/athletic/golfdata";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Clock, Mail } from "lucide-react";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { logout } from "@/lib/auth/logout";

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

  // STATUS-kortets rader (fasit) — avledet av eksisterende props/state.
  const epostSendt = Boolean(invitasjonEmail) || Boolean(status?.ok);
  const statusRader: { label: string; done: boolean }[] = [
    { label: "Konto opprettet", done: true },
    { label: "E-post til forelder sendt", done: epostSendt },
    { label: "Foreldre-samtykke", done: false },
  ];

  return (
    <main
      className="dark relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: "linear-gradient(160deg, #0A1410, #07100C)" }}
    >
      {/* Svakt terminal-grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px),linear-gradient(90deg,var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative z-10 flex w-full max-w-[430px] flex-col items-center gap-7">
        {/* «ak»-lettermerke */}
        <Link
          href="/"
          aria-label="AK Golf — hjem"
          className="font-display text-[40px] font-bold leading-none tracking-[-0.045em] text-accent"
        >
          ak
        </Link>

        <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 shadow-lg">
        {/* Klokke-badge + chip + tittel (fasit-hode) */}
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            aria-hidden
            className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary"
          >
            <Clock className="h-8 w-8" strokeWidth={1.5} />
          </span>

          <span className="mb-3 inline-flex rounded-full bg-warning/15 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-warning">
            Venter på samtykke
          </span>

          <h1 className="font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground [text-wrap:balance]">
            Nesten <em className="font-normal italic text-primary">i mål.</em>
          </h1>
          <p className="mt-3 text-[14.5px] leading-[1.55] text-muted-foreground">
            Hei {spillerNavn || "der"}! Du er under 16 år, så en forelder må godkjenne
            kontoen din.
            {epostSendt ? " Vi har sendt en e-post til forelderen du oppga." : ""}
          </p>
        </div>

        {/* STATUS-kort — tre rader med check/klokke (fasit) */}
        <div className="mb-4 rounded-2xl border border-border bg-secondary/40 p-[18px] text-left">
          <Eyebrow as="span">STATUS</Eyebrow>
          <div className="mt-2.5">
            {statusRader.map((rad) => (
              <div key={rad.label} className="flex items-center gap-2.5 py-[7px]">
                <span
                  className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${
                    rad.done
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {rad.done ? (
                    <Check className="h-[13px] w-[13px]" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                  )}
                </span>
                <span
                  className={`text-[13px] font-medium ${
                    rad.done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {rad.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resend / legg til forelder — eksisterende logikk, fasit-felt + sekundær-CTA */}
        <form onSubmit={onSend} className="flex flex-col gap-2">
          <label
            htmlFor="guardian-email"
            className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary px-[14px] transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <input
              id="guardian-email"
              type="email"
              value={nyEmail}
              onChange={(e) => setNyEmail(e.target.value)}
              placeholder="forelder@example.com"
              autoComplete="email"
              required
              className="flex-1 border-none bg-transparent py-[11px] text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !nyEmail.trim()}
            className="mt-1 w-full rounded-full border-[1.5px] border-border bg-transparent py-[11px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Sender…" : invitasjonEmail ? "Send påminnelse" : "Send invitasjon"}
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

        {/* Logg ut — server action (fasit: dempet mono-caps lenke) */}
        <div className="mt-6 text-center">
          <form action={logout}>
            <button
              type="submit"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Logg ut
            </button>
          </form>
        </div>
        </div>
      </div>
    </main>
  );
}
