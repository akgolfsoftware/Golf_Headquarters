"use client";

/**
 * Venterom for mindreårige (AU-05). resendGuardianInvitation og logout
 * er beholdt. Statusradene er de samme tre.
 */

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { logout } from "@/lib/auth/logout";
import "@/styles/precision-athletics.css";

type Props = {
  spillerNavn: string;
  invitasjonEmail: string | null;
};

export function SamtykkeVenterV2({ spillerNavn, invitasjonEmail }: Props) {
  const [isPending, startTransition] = useTransition();
  const [nyEmail, setNyEmail] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; melding: string } | null>(null);
  const epostSendt = Boolean(invitasjonEmail) || Boolean(status?.ok);
  const statusRader = [
    { label: "Konto opprettet", done: true },
    { label: "E-post til forelder sendt", done: epostSendt },
    { label: "Foreldre-samtykke", done: false },
  ];

  function onSend(e: FormEvent) {
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
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Venter på samtykke</p>
          <h1>Nesten i mål</h1>
          <p>
            Hei {spillerNavn || "der"}! Du er under 16 år, så en forelder må godkjenne kontoen din.
            Det skulle skje innen sju dager etter at du opprettet den, og kontoen er låst til forelderen har godkjent.
            {epostSendt ? " Vi har sendt en e-post til forelderen du oppga." : ""}
          </p>
        </header>
        <div className="au-tips">
          <p className="au-kicker">Status</p>
          <ul className="au-liste">
            {statusRader.map((rad) => (
              <li key={rad.label} data-ferdig={rad.done ? "true" : "false"}>{rad.label}</li>
            ))}
          </ul>
        </div>
        <form className="au-skjema" onSubmit={onSend}>
          <label>
            {invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}
            <input
              type="email"
              required
              autoComplete="email"
              value={nyEmail}
              placeholder="forelder@example.com"
              onChange={(e) => setNyEmail(e.target.value)}
            />
          </label>
          <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={isPending || !nyEmail.trim()}>
            {isPending ? "Sender…" : invitasjonEmail ? "Send påminnelse" : "Send invitasjon"}
          </button>
          {status ? (
            <p className="au-melding" data-tone={status.ok ? "ok" : "feil"} role="status">{status.melding}</p>
          ) : null}
        </form>
        <p>
          Har du spørsmål? <a href="mailto:post@akgolf.no">post@akgolf.no</a>
        </p>
        <form action={logout}>
          <button type="submit" className="pa-btn pa-btn--ghost">Logg ut</button>
        </form>
      </div>
    </div>
  );
}
