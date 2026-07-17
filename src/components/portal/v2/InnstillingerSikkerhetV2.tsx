"use client";

/**
 * PlayerHQ Innstillinger · Sikkerhet — v2 (retning C «Presis»).
 * v2-port 17. juli 2026: erstatter athletic-versjonen i
 * src/app/portal/meg/innstillinger/sikkerhet/page.tsx. Funksjon bevart 1:1:
 *  - Sikkerhetsscore: samme ærlige heuristikk (utregnes fortsatt i page.tsx —
 *    verifisert e-post → 80, ellers 55; +20 opptjenes via 2FA-flyten).
 *  - Endre passord: lenke til Supabase-tilbakestilling (/auth/forgot-password).
 *  - Tofaktor: lenke til den ekte TOTP-flyten (/portal/meg/sikkerhet/2fa).
 *  - Aktive økter: ekte lastLoginAt for denne enheten; full øktliste/historikk
 *    markeres «kommer snart» — aldri falske rader.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
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
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerSikkerhetData = {
  /** Ærlig score fra page.tsx-heuristikken (e-post bekreftet → 80, ellers 55). */
  score: number;
  /** Ferdigformatert siste innlogging (nb-NO), eller «Ukjent». */
  sisteInnlogging: string;
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

/** Rundt ikon-emblem foran en rad (samme idiom som InnstillingerV2). */
function SeksjonIkon({ name, farge }: { name: string; farge?: string }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || T.fg2 }} />
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerSikkerhetV2({ data }: { data: InnstillingerSikkerhetData }) {
  const mobile = useMobile();
  const { score, sisteInnlogging } = data;

  const niva = score >= 80 ? "Sterk" : "Grei";
  const tone: StatusTone = score >= 80 ? "up" : "warn";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Sikkerhet</Tittel>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Tofaktor-autentisering anbefales for alle som har koblet betalingskort.
      </p>

      {/* Sikkerhetsscore — hero */}
      <Kort tint>
        <TallHero
          label="Sikkerhetsscore"
          value={score}
          unit="/ 100"
          size={mobile ? 44 : 52}
          action={<StatusPill tone={tone}>{niva}</StatusPill>}
          hjelp="sikkerhetsscore"
        />
        <div style={{ marginTop: 16 }}>
          <ProgresjonsBar variant="bar" value={score} max={100} label={null} showValue={false} />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>
          Sterkt passord og bekreftet e-post er på plass. Aktiver tofaktor for +20.
        </p>
      </Kort>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Innlogging */}
        <div>
          <Caps size={9} style={{ margin: "0 4px 8px" }}>Innlogging</Caps>
          <Kort pad="4px 20px 6px">
            <Link href="/auth/forgot-password" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<SeksjonIkon name="lock" />}
                title="Endre passord"
                sub="Send tilbakestillingslenke til e-posten din"
              />
            </Link>
            <Link href="/portal/meg/sikkerhet/2fa" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                last
                leading={<SeksjonIkon name="shield-check" farge={T.lime} />}
                title="Tofaktor-autentisering"
                sub="Authenticator-app · ekstra beskyttelse"
                meta={<StatusPill tone="lime">Anbefalt</StatusPill>}
              />
            </Link>
          </Kort>
        </div>

        {/* Aktive økter */}
        <div>
          <Caps size={9} style={{ margin: "0 4px 8px" }}>Aktive økter</Caps>
          <Kort pad="4px 20px 6px">
            <Rad
              leading={<SeksjonIkon name="monitor" farge={T.lime} />}
              title="Denne enheten"
              sub={`Siste innlogging · ${sisteInnlogging}`}
              meta={<StatusPill tone="lime">Aktiv</StatusPill>}
              trailing={null}
            />
            <Rad
              last
              leading={<SeksjonIkon name="history" />}
              title="Andre enheter og innloggings-historikk"
              sub="Med IP, enhet og tidspunkt"
              meta={<StatusPill tone="info">Kommer snart</StatusPill>}
              trailing={null}
            />
          </Kort>
        </div>
      </div>
    </div>
  );
}
