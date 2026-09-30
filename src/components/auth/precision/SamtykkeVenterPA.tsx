"use client";

/**
 * Venterom for spillere under 16 som venter på foreldresamtykke (S-13) i
 * Precision Athletics. Erstatter SamtykkeVenterV2 på /auth/samtykke-venter.
 * Samme logikk (resendGuardianInvitation, logout); ny flate etter AU-05, visningen
 * «Spiller» i ui_kits/konto/screens/AU-04-06.jsx («Venter på forelder»).
 */
import { useState, useTransition } from "react";
import { Check, Clock, Mail } from "lucide-react";
import { Ikon, Knapp, Meta, StatusPille } from "@/components/precision/pa";
import { Felt, InlineVarsel, Kort, TekstFelt } from "@/components/precision/pa-a5";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { AuthFlate, AuthOverskrift } from "./AuthFlate";

type Props = {
  spillerNavn: string;
  invitasjonEmail: string | null;
  /** Server-handlingen «logg ut», sendt inn fra siden. */
  loggUt: () => Promise<void>;
};

export function SamtykkeVenterPA({ spillerNavn, invitasjonEmail, loggUt }: Props) {
  const [pending, start] = useTransition();
  const [nyEmail, setNyEmail] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; melding: string } | null>(null);
  const epostSendt = Boolean(invitasjonEmail) || Boolean(status?.ok);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!nyEmail.trim()) return;
    start(async () => {
      setStatus(null);
      const r = await resendGuardianInvitation({ guardianEmail: nyEmail.trim() });
      setStatus(r.ok ? { ok: true, melding: "Invitasjon sendt. Be forelderen sjekke innboksen." } : { ok: false, melding: r.error ?? "Noe gikk galt. Prøv igjen." });
    });
  }

  const rader = [
    { label: "Konto opprettet", done: true },
    { label: "E-post til forelder sendt", done: epostSendt },
    { label: "Foreldresamtykke", done: false },
  ];

  return (
    <AuthFlate max={520}>
      <AuthOverskrift
        kicker="Samtykke"
        tittel="Venter på forelder"
        tekst={`Hei ${spillerNavn || "der"}! Du er under 16 år, så en forelder må godkjenne kontoen din.${epostSendt ? " Vi har sendt en e-post til forelderen du oppga." : ""}`}
      />
      <div><StatusPille tone="neutral">Venter på forelder</StatusPille></div>
      <Kort style={{ gap: 4 }}>
        <Meta>STATUS</Meta>
        {rader.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36 }}>
            <Ikon icon={r.done ? Check : Clock} size={16} />
            <span style={{ font: "500 14px/1.3 var(--font-sans)", color: r.done ? "var(--text-primary)" : "var(--text-secondary)" }}>{r.label}</span>
          </div>
        ))}
      </Kort>
      <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Felt label={invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"}>
          <TekstFelt type="email" value={nyEmail} onChange={(e) => setNyEmail(e.target.value)} placeholder="forelder@example.com" autoComplete="email" required />
        </Felt>
        <Knapp type="submit" size="lg" fullWidth icon={Mail} loading={pending} loadingText="Sender …" disabled={!nyEmail.trim()}>
          {invitasjonEmail ? "Send påminnelse" : "Send invitasjon"}
        </Knapp>
        {status && <InlineVarsel tone={status.ok ? "ok" : "signal"}>{status.melding}</InlineVarsel>}
      </form>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        Har du spørsmål? <a href="mailto:post@akgolf.no" style={{ color: "var(--link)", textDecoration: "underline", textUnderlineOffset: 3 }}>post@akgolf.no</a>
      </p>
      <form action={loggUt}><Knapp type="submit" variant="ghost">Logg ut</Knapp></form>
    </AuthFlate>
  );
}
