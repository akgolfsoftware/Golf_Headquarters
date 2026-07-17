"use client";

/**
 * PlayerHQ Meg · Hjelp · Kategori — v2 (retning C «Presis»).
 * Rekomponert fra /portal/meg/help/kategori/[slug]/page.tsx: hero med
 * kategori-navn, sort-filter (lenkebasert, samme ?sort=-parametre som før),
 * artikkel-liste og «send oss et spørsmål»-CTA.
 *
 * NB: Artikkel-metadataene (titler, lesetid, visninger, datoer) er
 * redaksjonelt hjelpesenter-innhold fra kilderuten — ikke spillerens data.
 * Sorteringen skjer i server-page (uendret); komponenten rendrer lista.
 */

import Link from "next/link";
import { T, Caps, Kort, Icon, CTAPill, MikroMeta } from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type KategoriSort = "populaer" | "dato" | "mest-leste";

export type KategoriArtikkel = {
  slug: string;
  tittel: string;
  preview: string;
  lesetid: number;
  visninger: number;
  /** Ferdig formatert oppdatert-dato, f.eks. «12. mai 2026». */
  oppdatertTekst: string;
};

export type MegHelpKategoriData = {
  slug: string;
  tittel: string;
  beskrivelse: string;
  /** v2 Icon-navn (Lucide via @/components/v2/icon). */
  ikon: string;
  sort: KategoriSort;
  /** Ferdig formatert «sist oppdatert»-dato for hele kategorien. */
  sistOppdatertTekst: string;
  /** Artikler, allerede sortert av server-page etter valgt sort. */
  artikler: KategoriArtikkel[];
};

const SORT_VALG: { id: KategoriSort; navn: string }[] = [
  { id: "populaer", navn: "Populært" },
  { id: "mest-leste", navn: "Mest leste" },
  { id: "dato", navn: "Nyeste" },
];

function sortHref(slug: string, sort: KategoriSort): string {
  return sort === "populaer"
    ? `/portal/meg/help/kategori/${slug}`
    : `/portal/meg/help/kategori/${slug}?sort=${sort}`;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegHelpKategoriV2({ data }: { data: MegHelpKategoriData }) {
  return (
    <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", paddingTop: 6 }}>
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={data.ikon} size={24} style={{ color: T.fg2 }} />
        </span>
        <Caps>PlayerHQ · Hjelp</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 30, letterSpacing: "-0.025em", color: T.fg, margin: 0, lineHeight: 1.1 }}>
          <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>{data.tittel}</em>
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.mut, margin: 0, maxWidth: 520 }}>
          {data.beskrivelse}
        </p>
        <Caps size={9}>
          {data.artikler.length} artikler · sist oppdatert {data.sistOppdatertTekst}
        </Caps>
      </div>

      {/* Sort-filter (lenkebasert — samme ?sort=-adresser som før) */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Caps size={9}>Sortér</Caps>
        {SORT_VALG.map((s) => {
          const on = s.id === data.sort;
          return (
            <Link
              key={s.id}
              href={sortHref(data.slug, s.id)}
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 9999,
                textDecoration: "none",
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 600,
                background: on ? T.lime : T.panel2,
                border: `1px solid ${on ? "transparent" : T.border}`,
                color: on ? T.onLime : T.fg2,
              }}
            >
              {on && <Icon name="check" size={12} />}
              {s.navn}
            </Link>
          );
        })}
      </div>

      {/* Artikkel-liste */}
      <Kort pad="6px 20px">
        {data.artikler.map((a, i) => (
          <Link key={a.slug} href={`/portal/meg/help/artikkel/${a.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <div
              className="v2-row-h"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 10px",
                margin: "0 -10px",
                borderRadius: 10,
                borderBottom: i === data.artikler.length - 1 ? "none" : `1px solid ${T.border}`,
                cursor: "pointer",
              }}
            >
              <span style={{ width: 26, flex: "none", paddingTop: 2, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, lineHeight: 1.35 }}>
                  {a.tittel}
                </div>
                <p
                  style={{
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: T.mut,
                    margin: "5px 0 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.preview}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 7 }}>
                  <MikroMeta icon="clock">{a.lesetid} min</MikroMeta>
                  <MikroMeta icon="trending-up">{a.visninger.toLocaleString("nb-NO")} visninger</MikroMeta>
                  <MikroMeta icon="calendar">Oppdatert {a.oppdatertTekst}</MikroMeta>
                </div>
              </div>
              <Icon name="chevron-right" size={15} style={{ color: T.mut, flex: "none", marginTop: 4 }} />
            </div>
          </Link>
        ))}
      </Kort>

      {/* Send-spørsmål-CTA */}
      <Kort tint>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "10px 4px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 14%, transparent)`, color: T.lime, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mail" size={17} />
          </span>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: T.fg }}>
            Fant du ikke det du lette etter?
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.6, color: T.mut, margin: 0 }}>
            Send oss et spørsmål — vi svarer innen 24 timer på hverdager.
          </p>
          <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none", marginTop: 4 }}>
            <CTAPill icon="mail">Send oss et spørsmål</CTAPill>
          </Link>
        </div>
      </Kort>
    </div>
  );
}
