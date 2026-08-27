"use client";

/**
 * AgencyOS Innstillinger · Sikkerhet — Train-lock (T13, 27.08.2026).
 *
 * Designport av `AdminSecurityV2` (Paper) — ingen egen fasit tegner
 * sikkerhet-skjermen, så layouten er en mønster-port til tl-kit. Egen
 * rolle/e-post (mini-stats), Setup2FA (gjenbrukt fra PlayerHQ som-den-er,
 * ingen egen styling å porte), lenke til «glemt passord»-flyten, og en
 * ærlig tom-tilstand for aktive økter (kommer når vi logger auth-events).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { TL } from "@/lib/v2/train-lock";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand } from "./tl-kit";

export interface AdminSecurityV2Data {
  rolle: "ADMIN" | "COACH";
  epost: string;
  sistOppdatert: string;
}

function TlStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <TlCaps size={9}>{label}</TlCaps>
      <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{value}</div>
      {sub && <div style={{ marginTop: 4, fontSize: 12.5, color: TL.mute }}>{sub}</div>}
    </div>
  );
}

export function AdminSecurityTrainLock({ data }: { data: AdminSecurityV2Data }) {
  const rolleLabel = data.rolle === "ADMIN" ? "Administrator" : "Coach";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <TlTittel sub="AgencyOS">Sikkerhet</TlTittel>
        <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
          Kontoen din virker grei. Sjekk likevel listen under — første gang du ser en rar
          IP er ofte siste sjanse.
        </p>
      </div>

      <TlKort eyebrow="Oversikt">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
          <TlStat label="Konto" value={rolleLabel} sub={`E-post ${data.epost}`} />
          <TlStat label="Sist oppdatert" value={data.sistOppdatert} sub="Tidspunkt for siste profil-endring" />
        </div>
      </TlKort>

      <TlKort eyebrow="To-faktor" action={<TlCaps size={9}>Konfigurer for høyere sikkerhet</TlCaps>}>
        <Setup2FA />
      </TlKort>

      <TlKort eyebrow="Passord">
        <TlRad
          title="Endre passord"
          sub='Krever bekreftelse via e-post · bruk «Glemt passord»-flyten for å sette nytt passord'
          trailing={
            <TlKnapp variant="sekundaer" icon="arrow-right" href="/auth/forgot-password">
              Start
            </TlKnapp>
          }
          chevron={false}
          last
        />
      </TlKort>

      <TlKort eyebrow="Aktive økter" action={<TlCaps size={9}>Kommer når vi logger auth-events</TlCaps>}>
        <TlTomTilstand
          icon="monitor"
          title="Ikke bygget ennå"
          sub="Liste over enheter som er logget inn vises her når audit-laget for auth-events er på plass."
        />
      </TlKort>
    </div>
  );
}
