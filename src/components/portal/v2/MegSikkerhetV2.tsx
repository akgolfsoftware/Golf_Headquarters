"use client";

/**
 * PlayerHQ Meg · Sikkerhet — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen src/app/portal/meg/sikkerhet/page.tsx (+ 2fa), men med v2-komponenter
 * fra "@/components/v2". Kun T.*-tokens, ingen rå hex, ingen ad-hoc UI.
 *
 * Funksjon + datakontrakt bevart 1:1:
 *  - Sikkerhetsscore: samme heuristikk som originalen (verifisert e-post → 65,
 *    ellers 40). Ingen 2FA-status i data ennå → ikke regnet inn (ærlig).
 *  - Tofaktor: lenke til /portal/meg/sikkerhet/2fa (uendret adresse).
 *  - Aktive økter + Innloggings-historikk: IKKE koblet til Supabase auth-sessions
 *    ennå → merket «Kommer snart». «Denne enheten · Aktiv» er den faktiske,
 *    inneværende økten (ikke fabrikkert); logg-ut-andre + full historikk er
 *    ærlige tom-/kommer-snart-tilstander. Aldri falske tall.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  TallHero,
  ProgresjonsBar,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegSikkerhetData = {
  /** Kontoen har verifisert e-post — eneste ekte signal bak score-heuristikken. */
  harEpost: boolean;
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegSikkerhetV2({ data }: { data: MegSikkerhetData }) {
  const mobile = useMobile();

  // Samme heuristikk som originalen: verifisert e-post + satt passord = 65.
  // 2FA-status er ikke eksponert i data ennå, så den regnes ikke inn.
  const score = data.harEpost ? 65 : 40;
  const niva = score >= 80 ? "Sterk" : score >= 60 ? "God" : "Svak";
  const tone: StatusTone = score >= 80 ? "up" : score >= 60 ? "lime" : "warn";
  const scoreTekst = data.harEpost
    ? "Sterkt passord og verifisert e-post. Aktiver tofaktor for å løfte scoren ytterligere."
    : "Legg til og verifiser e-post for å sikre kontoen og løfte scoren.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Sikkerhet</Tittel>

      {/* Sikkerhetsscore — hero */}
      <Kort tint>
        <TallHero
          label="Sikkerhetsscore"
          value={score}
          unit="/ 100"
          size={mobile ? 44 : 52}
          action={<StatusPill tone={tone}>{niva}</StatusPill>}
        />
        <div style={{ marginTop: 16 }}>
          <ProgresjonsBar variant="bar" value={score} max={100} label={null} showValue={false} />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>
          {scoreTekst}
        </p>
      </Kort>

      {/* Tofaktor + Aktive økter */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort eyebrow="Tofaktor" action={<Caps size={9}>Authenticator-app</Caps>}>
          <Link
            href="/portal/meg/sikkerhet/2fa"
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <Rad
              last
              leading={<Icon name="shield" size={16} style={{ color: T.lime }} />}
              title="Konfigurer 2FA"
              sub="Ekstra beskyttelse med engangskode"
            />
          </Link>
        </Kort>

        <Kort eyebrow="Aktive økter" action={<StatusPill tone="info">Kommer snart</StatusPill>}>
          <Rad
            last
            leading={<Icon name="monitor" size={16} style={{ color: T.fg2 }} />}
            title="Denne enheten"
            sub="Logg ut andre enheter — under utvikling"
            meta={<StatusPill tone="lime">Aktiv</StatusPill>}
            trailing={null}
          />
        </Kort>
      </div>

      {/* Innloggings-historikk */}
      <Kort eyebrow="Innloggings-historikk" action={<StatusPill tone="info">Kommer snart</StatusPill>}>
        <TomTilstand
          icon="shield-check"
          title="Ikke tilgjengelig ennå"
          sub="Full historikk med IP, enhet og tidspunkt aktiveres snart."
        />
      </Kort>
    </div>
  );
}
