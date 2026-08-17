"use client";

/**
 * PlayerHQ · Øvelsesbank — Paper-port W1 (fase2), klientdel.
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-drills.html.
 *
 * «Én ting nå»-blokk (anbefalt drill fra største SG-gap) → filterchips
 * Alle/TEK/SLAG/SPILL (aria-pressed inverterer til blekk) → enkle drill-rader
 * med navn, område, tid·reps, AK-formel i mono og bruk siste 30 dager.
 * All data kommer serialisert fra serveren — ingenting fabrikkeres her.
 */

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Caps, Icon } from "@/components/v2";

export type DrillRad = {
  id: string;
  navn: string;
  omrade: string;
  /** Mono-metalinje: tid · reps (kun reelle felter). */
  meta: string | null;
  /** AK-formel v2 bygget av reelle felter — null når ingen felter finnes. */
  formel: string | null;
  /** «brukt i N økter siste 30 dager» eller «ny for deg». */
  brukt: string;
  /** Pyramide-akse for filtrering (TEK/SLAG/SPILL/FYS/TURN). */
  akse: string;
};

export type AnbefaltDrill = {
  id: string;
  navn: string;
  omrade: string;
  /** Hvorfor-tekst i klarspråk (bygget av ekte SG-gap på serveren). */
  hvorfor: string;
  /** Kilde/beregning/forbehold-punkter til why-details. */
  whyPunkter: string[];
};

const FILTRE = ["Alle", "TEK", "SLAG", "SPILL"] as const;

export function DrillsListe({
  anbefalt,
  rader,
}: {
  anbefalt: AnbefaltDrill | null;
  rader: DrillRad[];
}) {
  const [filter, setFilter] = useState<(typeof FILTRE)[number]>("Alle");

  const synlige = rader.filter((r) => filter === "Alle" || r.akse === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Én ting nå — anbefalt drill fra største SG-gap (kun når gapet finnes) */}
      {anbefalt && (
        <div
          style={{
            background: T.handlingSoft,
            border: `1px solid ${T.border}`,
            borderRadius: T.rCard,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Caps>Én ting nå · anbefalt for deg</Caps>
          <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            {anbefalt.navn} · {anbefalt.omrade}
          </h3>
          <p style={{ margin: "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
            {anbefalt.hvorfor}
          </p>
          {/* Kontrakt §3: skjermens ene aksenthandling — legger drillen i neste økt (via Workbench). */}
          <Link
            href="/portal/planlegge/workbench"
            data-od-id="drills-anbefalt-legg"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: T.rCard,
              background: T.handling,
              color: T.onHandling,
              fontFamily: T.ui,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Legg i neste økt
          </Link>
          <details
            data-od-id="drills-why-anbefalt"
            style={{ marginTop: 12, border: `1px solid ${T.border}`, borderRadius: T.rCard }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 16px",
                cursor: "pointer",
                listStyle: "none",
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 500,
                color: T.mut,
              }}
            >
              Hvorfor denne drillen
            </summary>
            <ul
              style={{
                margin: 0,
                padding: "12px 16px 16px 24px",
                fontFamily: T.bodyFont,
                fontSize: 13,
                color: T.mut,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              {anbefalt.whyPunkter.map((p) => (
                <li key={p} style={{ marginBottom: 8 }}>
                  {p}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {/* Videre-lenke — AI-forslag på tvers av alle svake områder (ikke bare
          størst gap som «Én ting nå» over). Ordinær rad, ingen ny clay-CTA. */}
      <Link
        href="/portal/ai/foresla-drill"
        data-od-id="drills-ai-foresla"
        className="v2-press v2-focus"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: "12px 16px",
          marginBottom: 12,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Icon name="sparkles" size={16} style={{ color: T.mut, flex: "none" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
            La AI foreslå driller
          </span>
          <span style={{ display: "block", fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 1 }}>
            Rangert liste på tvers av svakhetene dine
          </span>
        </div>
        <Icon name="chevron-right" size={15} style={{ color: T.mut, flex: "none" }} />
      </Link>

      {/* Filterchips — aria-pressed inverterer til blekk (fasit §5) */}
      <div
        role="group"
        aria-label="Filtrer på pyramide"
        style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}
      >
        {FILTRE.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={f === filter}
            data-od-id={`drills-filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className="v2-press v2-focus"
            style={{
              flex: "none",
              minHeight: 44,
              padding: "0 12px",
              borderRadius: T.rPill,
              border: `1px solid ${f === filter ? T.cta : T.border}`,
              background: f === filter ? T.cta : "transparent",
              color: f === filter ? T.onCta : T.fg,
              fontFamily: T.ui,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <Caps>
        drills · {synlige.length} av {rader.length}
      </Caps>

      <div style={{ marginTop: 8 }}>
        {synlige.map((d, i) => (
          <Link
            key={d.id}
            href={`/portal/drills/${d.id}`}
            data-od-id={`drills-rad-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: T.rCard,
              padding: "12px 16px",
              marginBottom: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                {d.navn}
              </span>
              <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
                {[d.omrade, d.meta, d.brukt].filter(Boolean).join(" · ")}
              </span>
              {d.formel && (
                <span
                  style={{
                    display: "block",
                    fontFamily: T.mono,
                    fontSize: 9.5,
                    color: T.mut,
                    marginTop: 4,
                    wordBreak: "break-all",
                  }}
                >
                  {d.formel}
                </span>
              )}
            </div>
          </Link>
        ))}
        {synlige.length === 0 && (
          <div
            style={{
              padding: "24px 16px",
              background: T.panel2,
              border: `1px dashed ${T.border}`,
              borderRadius: T.rCard,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              Ingen drills i dette filteret
            </h3>
            <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
              Prøv et annet pyramide-område — eller «Alle».
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
