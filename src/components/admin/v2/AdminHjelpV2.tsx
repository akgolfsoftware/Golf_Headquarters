"use client";

/**
 * AgencyOS v2 — Hjelp + support (`/admin/hjelp`, AgencyOS Bølge 3.3, 2026-07-14).
 * Port fra `(legacy)/hjelp/page.tsx` + `hjelp-search.tsx` — statisk innhold
 * (samme kategorier/artikler/kontakt-CTA), lokalt søkefilter uendret.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Icon, T } from "@/components/v2";

export interface HjelpArtikkel {
  id: string;
  title: string;
  category: string;
  readMin: number;
  snippet: string;
}

export interface HjelpKategori {
  id: string;
  title: string;
  count: number;
  ikon: string;
}

const SUGGESTED = ["Logg runde", "Pyramide", "Oppgrader til Pro", "Bytt coach"];

function HjelpSok({ articles }: { articles: readonly HjelpArtikkel[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return articles.filter((a) => a.title.toLowerCase().includes(q) || a.snippet.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [query, articles]);

  const showResults = query.trim().length >= 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ position: "relative", margin: "0 auto", width: "100%", maxWidth: 480 }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="search" size={17} style={{ color: T.mut }} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk hjelp-artikler eller skriv et spørsmål…"
          aria-label="Søk hjelp-artikler"
          style={{ width: "100%", boxSizing: "border-box", appearance: "none", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 14, padding: "15px 16px 15px 44px", fontFamily: T.ui, fontSize: 14, color: T.fg, outline: "none" }}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Tøm søk" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", appearance: "none", cursor: "pointer", background: "none", border: "none", color: T.mut }}>
            <Icon name="x" size={15} />
          </button>
        )}
      </div>

      {!query && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {SUGGESTED.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setQuery(label)}
              style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.borderS}`, fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <div style={{ margin: "0 auto", width: "100%", maxWidth: 620 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8, padding: "0 6px" }}>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Søkeresultater</span>
            <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{results.length} treff</span>
          </div>
          {results.length === 0 ? (
            <Kort><p style={{ textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0 }}>Ingen treff på «{query}». Prøv et annet ord eller kontakt support.</p></Kort>
          ) : (
            <Kort pad="6px 14px">
              {results.map((a, i) => (
                <Link key={a.id} href={`#${a.id}`} style={{ textDecoration: "none", display: "block", padding: "12px 4px", borderBottom: i === results.length - 1 ? "none" : `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{a.title}</div>
                  <p style={{ margin: "4px 0 0", fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.5 }}>{a.snippet}</p>
                  <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{a.category} · {a.readMin} min</div>
                </Link>
              ))}
            </Kort>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminHjelpV2({ kategorier, artikler, totalArtikler }: { kategorier: HjelpKategori[]; artikler: HjelpArtikkel[]; totalArtikler: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 820 }}>
      <div>
        <Caps size={9}>AgencyOS · /admin/hjelp</Caps>
        <Tittel em="lurer du på?">Hva</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>Søk i hjelp-artikler, eller spør direkte. Vi svarer innen 1 time på hverdager.</p>
      </div>

      <HjelpSok articles={artikler} />

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Kategorier</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{totalArtikler} artikler totalt</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: T.gap }}>
          {kategorier.map((cat) => (
            <Link key={cat.id} href={`#${cat.id}`} style={{ textDecoration: "none" }}>
              <Kort hover style={{ gap: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={cat.ikon} size={17} style={{ color: T.lime }} />
                </span>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{cat.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{cat.count} artikler</div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.lime }}>
                  Åpne <Icon name="arrow-right" size={12} />
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Populære artikler</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Sett 1247 ganger denne måneden</span>
        </div>
        <Kort pad="6px 14px">
          {artikler.map((a, i) => (
            <Link key={a.id} href={`#${a.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14, padding: "12px 4px", borderBottom: i === artikler.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{a.title}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut, flex: "none" }}>{a.category} · {a.readMin} min</span>
              <Icon name="chevron-right" size={14} style={{ color: T.mut }} />
            </Link>
          ))}
        </Kort>
      </div>

      <div style={{ borderRadius: T.rCard, background: T.panel3, padding: "26px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>Trenger du <em style={{ fontStyle: "italic", color: T.lime }}>mer hjelp?</em></span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Vi er her — velg det som passer deg</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { ikon: "message-circle", title: "Chat med oss", sub: "Svar innen 1 time på hverdager. Aktiv nå.", cta: "Start chat", href: "/admin/innboks" },
            { ikon: "mail", title: "Send e-post", sub: "support@akgolf.no · svar innen 24t", cta: "Skriv e-post", href: "mailto:support@akgolf.no" },
            { ikon: "users", title: "Be coachen din", sub: "Send en melding direkte i innboksen", cta: "Åpne meldinger", href: "/admin/messages" },
          ].map((c) => (
            <Link key={c.title} href={c.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRadius: 13, border: `1px solid ${T.borderS}`, background: T.panel2, padding: 16 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: `color-mix(in srgb, ${T.lime} 15%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={c.ikon} size={16} style={{ color: T.lime }} />
                </span>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{c.title}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, lineHeight: 1.4 }}>{c.sub}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.lime }}>{c.cta} <Icon name="arrow-right" size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Hjelp-innholdet er statisk og vedlikeholdes manuelt — kontakt support dersom en artikkel mangler eller er utdatert.</p>
    </div>
  );
}
