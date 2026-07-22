"use client";

/**
 * AgencyOS Rapporter — v2 (retning C «Presis»). Rekomponerer den ekte skjermen
 * src/app/admin/reports/page.tsx i v2-idiomet, med IDENTISK funksjon +
 * datakontrakt: seks rapport-tiles (ikon + navn + meta + CTA). CSV-tilene
 * peker på de EKTE eksport-endepunktene /api/admin/reports/[type] («Generer →»,
 * vanlig <a> for nedlasting); rapporter uten generator lenker til riktig
 * analyse-flate («Åpne →», <Link>) — aldri liksom-generering.
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*). Telleverdiene (spillere, fullførte økter,
 * sesongår) er ekte Prisma-counts fra loaderen, aldri fabrikert.
 *
 * Mobil: tiles stables til én kolonne (grid-cols-1 → md:2 → lg:3), CTA-rad
 * ligger i bunn av hvert kort så trykkflaten er stor på 375px.
 */

import type { Maanedsrapport } from "@/lib/agents/maanedsrapport";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Icon,
  StatusPill,
  TomTilstand,
  CTAPill,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra den ekte loaderen i ruten) ─────────
export interface ReportsV2Data {
  /** Antall aktive spillere (Prisma-count). */
  spillere: number;
  /** Antall fullførte økter (Prisma-count). */
  okter: number;
  /** Inneværende sesongår. */
  sesong: number;
  /** B5: arkiverte månedsrapporter (nyeste først, maks 12). */
  maanedsrapporter: Maanedsrapport[];
  /** VIEW_FINANCE: false = beløp er nullet av loaderen og skjules. */
  visKroner: boolean;
}

const MND_NAVN = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

function kr(ore: number): string {
  return `${Math.round(ore / 100).toLocaleString("nb-NO")} kr`;
}

/** B5: én månedsrapport — totalen + per selskap. */
function MaanedsrapportKort({ r, visKroner }: { r: Maanedsrapport; visKroner: boolean }) {
  return (
    <Kort eyebrow={`${MND_NAVN[r.month - 1]} ${r.year}`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 4 }}>
        <TallPar label="Bookinger" verdi={String(r.totalt.bookinger)} />
        {visKroner && <TallPar label="Bookingverdi" verdi={kr(r.totalt.bookingVerdiOre)} />}
        {visKroner && <TallPar label="Innbetalt" verdi={kr(r.totalt.innbetaltOre)} />}
        <TallPar label="Nye spillere" verdi={String(r.totalt.nyeSpillere)} />
        <TallPar label="Økter gjennomført" verdi={String(r.totalt.okterGjennomfort)} />
      </div>
      {r.perSelskap.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {r.perSelskap.map((sel) => (
            <div key={sel.navn} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{sel.navn}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {sel.bookinger} bookinger{visKroner ? ` · ${kr(sel.innbetaltOre)} inn` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </Kort>
  );
}

function TallPar({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
    </div>
  );
}

interface Tile {
  /** v2 Icon-navn. */
  icon: string;
  navn: string;
  meta: string;
  cta: string;
  href: string;
  /** true = CSV-endepunkt (vanlig <a>), false = intern flate (<Link>). */
  nedlasting: boolean;
}

/** Ett rapport-kort. Hover-løft + lime-CTA for nedlasting, dempet for «Åpne». */
function RapportKort({ t }: { t: Tile }) {
  const innhold = (
    <Kort hover pad="16px 18px" style={{ height: "100%", gap: 12 }}>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: `color-mix(in srgb,${T.lime} 12%,transparent)`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <Icon name={t.icon} size={19} style={{ color: T.lime }} strokeWidth={1.6} />
      </span>
      <span
        style={{
          fontFamily: T.disp,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: T.fg,
          lineHeight: 1.2,
        }}
      >
        {t.navn}
      </span>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingTop: 6,
        }}
      >
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: t.nedlasting ? T.lime : T.fg2,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name={t.nedlasting ? "download" : "arrow-right"} size={12} />
          {t.cta}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{t.meta}</span>
      </div>
    </Kort>
  );

  return t.nedlasting ? (
    <a href={t.href} style={{ textDecoration: "none", minWidth: 0 }}>
      {innhold}
    </a>
  ) : (
    <Link href={t.href} style={{ textDecoration: "none", minWidth: 0 }}>
      {innhold}
    </Link>
  );
}

export function AdminReportsV2({ data }: { data: ReportsV2Data }) {
  const { spillere, okter, sesong, maanedsrapporter, visKroner } = data;

  const tiles: Tile[] = [
    {
      icon: "user",
      navn: "Spiller-rapport",
      meta: `PDF · ${spillere} spillere`,
      cta: "Generer",
      href: "/api/admin/reports/spillere.csv",
      nedlasting: true,
    },
    {
      icon: "users",
      navn: "Gruppe-rapport",
      meta: "Lag-snitt + utvikling",
      cta: "Åpne",
      href: "/admin/lag-snitt",
      nedlasting: false,
    },
    {
      icon: "trending-up",
      navn: "Utviklingsrapport",
      meta: "Kvartalsvis · stall",
      cta: "Åpne",
      href: "/admin/analyse",
      nedlasting: false,
    },
    {
      icon: "credit-card",
      navn: "Omsetning & MRR",
      meta: "Faktura-oversikt",
      cta: "Generer",
      href: "/api/admin/reports/abonnement.csv",
      nedlasting: true,
    },
    {
      icon: "calendar",
      navn: "Aktivitetslogg",
      meta: `${okter} økter + oppmøte`,
      cta: "Generer",
      href: "/api/admin/reports/okter.csv",
      nedlasting: true,
    },
    {
      icon: "trophy",
      navn: "Turneringsresultater",
      meta: `Sesong ${sesong}`,
      cta: "Åpne",
      href: "/admin/tournaments",
      nedlasting: false,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* B: status først + én primær CTA */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>System · Rapporter</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="rapporter.">Seks</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", maxWidth: 460 }}>
            Generer rapporter for spillere, foreldre, klubb eller forbund. Eksport til PDF og CSV.
          </p>
        </div>
        <StatusPill tone="lime">
          {spillere} spillere · {okter} økter · sesong {sesong}
        </StatusPill>
      </div>

      <a href="/api/admin/reports/spillere.csv" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="download" full>
          Generer spiller-rapport
        </CTAPill>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
        {tiles.map((t) => (
          <RapportKort key={t.navn} t={t} />
        ))}
      </div>

      {/* B5: månedsrapport-arkivet (cron 1. i måneden) */}
      <div>
        <Caps>Månedsrapporter · per selskap</Caps>
        {maanedsrapporter.length === 0 ? (
          <div style={{ marginTop: 12 }}>
            <Kort>
              <TomTilstand
                icon="calendar"
                title="Ingen månedsrapporter ennå"
                sub="Første rapport genereres automatisk natt til den 1. — arkivet bygger seg opp her."
              />
            </Kort>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, marginTop: 12 }}>
            {maanedsrapporter.map((r) => (
              <MaanedsrapportKort key={`${r.year}-${r.month}`} r={r} visKroner={visKroner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
