"use client";

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
import { Caps, Tittel, Kort, Rad, TallHero, TomTilstand, CTAPill, T } from "@/components/v2";
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Innstillinger · Sikkerhet</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="akkurat nå?">Hvem er logget inn</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
          Kontoen din virker grei. Sjekk likevel listen under — første gang du ser en rar
          IP er ofte siste sjanse.
        </p>
      </div>

      <Kort eyebrow="Oversikt">
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
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
