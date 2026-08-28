"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * v2: AgencyOS Innstillinger → Sikkerhet. Rekomponerer
 * /admin/(legacy)/settings/security i v2-språket (V2Shell +
 * v2-komponentbiblioteket). Egen rolle/e-post (mini-stats), Setup2FA
 * (gjenbrukt fra PlayerHQ som-den-er), lenke til «glemt passord»-flyten,
 * og en ærlig tomt-tilstand for aktive økter (kommer når vi logger
 * auth-events — ikke bygget ennå).
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) —
 * ingen ad-hoc UI, ingen rå hex (kun T.*).
 */

import Link from "next/link";
import { Caps, Kort, Rad, TallHero, TomTilstand, CTAPill } from "@/components/v2";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";
export interface AdminSecurityV2Data {
  rolle: "ADMIN" | "COACH";
  epost: string;
  /** Tidspunkt for siste profil-endring, ferdig formatert (nb-NO). */
  sistOppdatert: string;
}

export function AdminSecurityV2({ data }: { data: AdminSecurityV2Data }) {
  const rolleLabel = data.rolle === "ADMIN" ? "Administrator" : "Coach";

  return (
    <div data-paper-wave-h="security" data-paper-pattern data-paper-slug="agencyos-oppsett" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Sikkerhet</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
          Kontoen din virker grei. Sjekk likevel listen under — første gang du ser en rar
          IP er ofte siste sjanse.
        </p>
      </div>

      <Kort eyebrow="Oversikt">
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <TallHero label="Konto" value={rolleLabel} sub={`E-post ${data.epost}`} size={26} />
          <TallHero label="Sist oppdatert" value={data.sistOppdatert} sub="Tidspunkt for siste profil-endring" size={26} />
        </div>
      </Kort>

      <Kort eyebrow="To-faktor" action={<Caps size={9}>Konfigurer for høyere sikkerhet</Caps>}>
        <Setup2FA />
      </Kort>

      <Kort eyebrow="Passord">
        <Rad
          title="Endre passord"
          sub='Krever bekreftelse via e-post · bruk «Glemt passord»-flyten for å sette nytt passord'
          trailing={
            <Link href="/auth/forgot-password" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="arrow-right">
                Start
              </CTAPill>
            </Link>
          }
          last
        />
      </Kort>

      <Kort eyebrow="Aktive økter" action={<Caps size={9}>Kommer når vi logger auth-events</Caps>}>
        <TomTilstand
          icon="monitor"
          title="Ikke bygget ennå"
          sub="Liste over enheter som er logget inn vises her når audit-laget for auth-events er på plass."
        />
      </Kort>
    </div>
  );
}
