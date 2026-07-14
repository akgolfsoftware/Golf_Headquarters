"use client";

/**
 * AgencyOS v2 — Innstillinger · Sikkerhet (`/admin/settings/security`,
 * AgencyOS Bølge 3.33, 2026-07-14). Port fra `(legacy)/settings/security/
 * page.tsx` — samme innhold (kontooversikt, 2FA-oppsett, passord-lenke,
 * plassholder for aktive økter). `Setup2FA` (`@/app/portal/meg/sikkerhet/
 * setup-2fa`) er allerede en klient-komponent og gjenbrukes uendret.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, T } from "@/components/v2";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";

function MiniStatV2({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 16 }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 8, fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg }}>
        {value}
        {unit && <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 400, color: T.mut }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{sub}</div>
    </div>
  );
}

export function AdminInnstillingerSikkerhetV2({ rolle, epost, sistOppdatertTekst }: { rolle: string; epost: string; sistOppdatertTekst: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Link href="/admin/settings" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.ui, fontSize: 12.5 }}>
          <span aria-hidden>←</span> Innstillinger
        </Link>
        <div style={{ marginTop: 10 }}>
          <Caps size={9}>Innstillinger · Sikkerhet</Caps>
          <Tittel em="logget inn akkurat nå?">Hvem er</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: 480 }}>
            Kontoen din virker grei. Sjekk likevel listen — første gang du ser en rar IP er ofte siste sjanse.
          </p>
        </div>
      </div>

      <Kort eyebrow="Oversikt">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <MiniStatV2 label="Konto" value={rolle} unit="rolle" sub={`E-post ${epost}`} />
          <MiniStatV2 label="Sist oppdatert" value={sistOppdatertTekst} unit="" sub="Tidspunkt for siste profil-endring" />
        </div>
      </Kort>

      <Kort eyebrow="To-faktor" action={<Caps size={9}>Konfigurer for høyere sikkerhet</Caps>}>
        <Setup2FA />
      </Kort>

      <Kort eyebrow="Passord">
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: 16, alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>Endre passord</div>
            <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 11, color: T.mut }}>Krever bekreftelse via e-post</div>
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg }}>Bruk «Glemt passord»-flyten for å sette nytt passord.</div>
          <Link href="/auth/forgot-password" style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.lime, textDecoration: "none" }}>Start →</Link>
        </div>
      </Kort>

      <Kort eyebrow="Aktive økter" action={<Caps size={9}>Kommer når vi logger auth-events</Caps>}>
        <div style={{ padding: "24px 0", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>
          Liste over enheter som er logget inn vises her når audit-laget er på plass.
        </div>
      </Kort>
    </div>
  );
}
