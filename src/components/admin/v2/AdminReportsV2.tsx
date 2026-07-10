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

import Link from "next/link";
import { toast } from "sonner";
import {
  Caps,
  Tittel,
  Kort,
  Knapp,
  Icon,
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
  const { spillere, okter, sesong } = data;

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

  const hode = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <Caps>System · Rapporter</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="rapporter.">Seks</Tittel>
        </div>
        <span
          style={{
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg2,
            display: "block",
            marginTop: 8,
            maxWidth: 460,
          }}
        >
          Generer rapporter for spillere, foreldre, klubb eller forbund. Eksport til
          PDF og CSV.
        </span>
      </div>
      <Knapp
        icon="plus"
        onClick={() => toast.info("Nye rapporter genereres automatisk")}
      >
        Ny rapport
      </Knapp>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
        {tiles.map((t) => (
          <RapportKort key={t.navn} t={t} />
        ))}
      </div>
    </div>
  );
}
