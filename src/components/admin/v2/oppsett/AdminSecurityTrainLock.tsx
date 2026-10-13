"use client";

/** Eksisterende coachfunksjon med uendrede serverhandlinger. Precision avgrenses av CoachContent; navnet er en beholdt importkontrakt. */

import { CoachLabel as TlCaps } from "@/components/admin/precision/agency-completion/CoachLabel";
import { TL } from "@/lib/v2/train-lock";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";
import { TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand } from "./tl-kit";

export interface AdminSecurityV2Data {
  rolle: "ADMIN" | "COACH";
  epost: string;
  sistOppdatert: string;
}

function TlStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <TlCaps size={13}>{label}</TlCaps>
      <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{value}</div>
      {sub && <div style={{ marginTop: 4, fontSize: 14, color: TL.mute }}>{sub}</div>}
    </div>
  );
}

export function AdminSecurityTrainLock({
  data,
  somFane = false,
}: {
  data: AdminSecurityV2Data;
  /** True når komponenten står som «Sikkerhet»-fanen i /admin/oppsett (MASTERPLAN 15.3). */
  somFane?: boolean;
}) {
  const rolleLabel = data.rolle === "ADMIN" ? "Administrator" : "Coach";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        {!somFane && <TlTittel sub="AgencyOS">Sikkerhet</TlTittel>}
        <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: somFane ? 0 : "10px 0 0", maxWidth: 560 }}>
          Administrer totrinnsinnlogging og passord for din egen konto.
        </p>
      </div>

      <TlKort eyebrow="Oversikt">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
          <TlStat label="Konto" value={rolleLabel} sub={`E-post ${data.epost}`} />
          <TlStat label="Sist oppdatert" value={data.sistOppdatert} sub="Tidspunkt for siste profil-endring" />
        </div>
      </TlKort>

      <TlKort eyebrow="To-faktor" action={<TlCaps size={13}>Konfigurer for høyere sikkerhet</TlCaps>}>
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

      <TlKort eyebrow="Aktive økter" action={<TlCaps size={13}>Enhetsoversikt er ikke tilgjengelig</TlCaps>}>
        <TlTomTilstand
          icon="monitor"
          title="Ingen enhetsoversikt"
          sub="Denne siden viser ikke hvilke enheter som er innlogget."
        />
      </TlKort>
    </div>
  );
}
