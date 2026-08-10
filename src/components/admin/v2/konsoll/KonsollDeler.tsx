"use client";

/**
 * Byggeklosser for konsoll-tråden (PP-2.1).
 *
 * Fasit: designsystem/paper/fase1/agencyos-konsoll-desktop.html. Fasiten er en
 * SAMTALE, ikke en oppslagstavle: hvert AI-svar er `steps` (arbeidslinjer) →
 * `say.prose` (prosa) → valgfri `details.why` («Hvorfor dette tallet») →
 * valgfri `tbl` (tabell) → `acts` (utgående handlinger).
 *
 * Delene her er bevisst rene presentasjonskomponenter uten datakobling — de
 * fylles av KonsollChat med EKTE CockpitData. Ingen av dem fabrikkerer tall:
 * mangler et grunnlag, sender kalleren rett og slett ikke `hvorfor`.
 *
 * Én oransje handling per skjerm (T.handling) eies av «Én ting nå» — alle
 * knapper her er derfor nøytrale eller ink.
 */

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

/* ── Systeminnlegg — fasitens <article class="turn"> med kun ai-siden ───── */

export function SystemInnlegg({
  eyebrow,
  klokke,
  children,
  odId,
}: {
  /** Kort merkelapp over innlegget, f.eks. «systemet, uoppfordret». */
  eyebrow: string;
  /** Klokkeslett (Oslo, beregnet server-side) — utelates når det ikke er relevant. */
  klokke?: string;
  children: ReactNode;
  odId?: string;
}) {
  return (
    <article data-od-id={odId} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {eyebrow}
        {klokke ? <> · {klokke}</> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </article>
  );
}

/* ── Arbeidslinjer — fasitens <ul class="steps"> ────────────────────────── */

export function StegListe({ steg }: { steg: string[] }) {
  if (steg.length === 0) return null;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
      {steg.map((s, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            color: T.mut,
          }}
        >
          <Icon name="check" size={12} style={{ color: T.mut, flex: "none" }} />
          {s}
        </li>
      ))}
    </ul>
  );
}

/* ── Prosa — fasitens <p class="say prose"> (serif lesetekst) ───────────── */

export function Prosa({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: T.bodyFont,
        fontSize: 14.5,
        lineHeight: 1.6,
        color: T.fg,
        maxWidth: "68ch",
      }}
    >
      {children}
    </p>
  );
}

/** Tall i prosa — mono, som fasitens <span class="num">. */
export function Tall({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: T.mono, fontSize: "0.94em" }}>{children}</span>;
}

/* ── «Hvorfor dette tallet» — fasitens <details class="why"> ────────────── */

export function Hvorfor({ punkter, odId }: { punkter: ReactNode[]; odId?: string }) {
  if (punkter.length === 0) return null;
  return (
    <details
      data-od-id={odId}
      style={{
        border: `1px solid ${T.border}`,
        borderRadius: T.rTag,
        background: T.panel2,
        padding: "8px 12px",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontFamily: T.ui,
          fontSize: 12.5,
          fontWeight: 500,
          color: T.fg2,
          listStyle: "none",
        }}
      >
        Hvorfor dette tallet
      </summary>
      <ul
        style={{
          margin: "8px 0 0",
          paddingLeft: 18,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontFamily: T.ui,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: T.mut,
        }}
      >
        {punkter.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </details>
  );
}

/* ── Tabell — fasitens <table class="tbl"> ──────────────────────────────── */

export type TabellKolonne = { nokkel: string; label: string; tall?: boolean };

/** Synlig kun for skjermlesere — fasitens .sr. */
const srSkjult: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export function Tabell({
  caption,
  kolonner,
  rader,
  odId,
  mobil = false,
}: {
  /** Skjult for skjerm, lest av skjermleser — fasitens <caption class="sr">. */
  caption: string;
  kolonner: TabellKolonne[];
  rader: Array<Record<string, ReactNode>>;
  odId?: string;
  /**
   * På 390px har en tre-kolonners tabell ikke plass: cellene brytes til
   * enkeltord og raden blir uleselig (målt 10.08 på AI-kø-tabellen). Mobil
   * rendres derfor som kort — første kolonne som tittel, resten som
   * merkede linjer. Samme data, lesbar bredde.
   */
  mobil?: boolean;
}) {
  // To kolonner (navn + verdi) får plass på 390px og leses best som tabell —
  // kortformen ville laget seks tunge bokser av seks korte nøkkeltall.
  if (mobil && kolonner.length > 2) {
    const [forste, ...resten] = kolonner;
    return (
      <div data-od-id={odId} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <span style={srSkjult}>{caption}</span>
        {rader.map((r, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: T.rTag,
              background: T.panel2,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              minWidth: 0,
            }}
          >
            <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 600, color: T.fg, minWidth: 0 }}>
              {r[forste.nokkel]}
            </div>
            {resten.map((k) => (
              <div
                key={k.nokkel}
                style={{ display: "flex", gap: 8, alignItems: "baseline", justifyContent: "space-between", minWidth: 0 }}
              >
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: T.mut,
                    flex: "none",
                  }}
                >
                  {k.label}
                </span>
                <span
                  style={{
                    fontFamily: k.tall ? T.mono : T.ui,
                    fontSize: 12.5,
                    color: T.fg,
                    textAlign: "right",
                    minWidth: 0,
                  }}
                >
                  {r[k.nokkel]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const celle: CSSProperties = {
    padding: "7px 10px",
    borderBottom: `1px solid ${T.border}`,
    fontFamily: T.ui,
    fontSize: 13,
    color: T.fg,
    textAlign: "left",
  };
  return (
    <div style={{ overflowX: "auto", minWidth: 0 }} data-od-id={odId}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
        <caption
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {kolonner.map((k) => (
              <th
                key={k.nokkel}
                scope="col"
                style={{
                  ...celle,
                  fontFamily: T.mono,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: T.mut,
                  fontWeight: 500,
                  textAlign: k.tall ? "right" : "left",
                }}
              >
                {k.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.map((r, i) => (
            <tr key={i}>
              {kolonner.map((k) => (
                <td
                  key={k.nokkel}
                  style={{
                    ...celle,
                    borderBottom: i === rader.length - 1 ? "none" : celle.borderBottom,
                    textAlign: k.tall ? "right" : "left",
                    fontFamily: k.tall ? T.mono : T.ui,
                    fontSize: k.tall ? 12.5 : 13,
                  }}
                >
                  {r[k.nokkel]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Handlingsrad — fasitens <div class="acts"> (kun nøytrale knapper) ──── */

const handlingStil: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 40,
  padding: "0 14px",
  borderRadius: T.rTag,
  border: `1px solid ${T.border}`,
  background: T.panel,
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
};

export function Handlinger({
  lenker,
}: {
  lenker: Array<{ label: string; href?: string; onClick?: () => void; odId?: string }>;
}) {
  if (lenker.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {lenker.map((l) =>
        l.href ? (
          <Link key={l.label} href={l.href} data-od-id={l.odId} className="v2-press v2-focus" style={handlingStil}>
            {l.label}
          </Link>
        ) : (
          <button
            key={l.label}
            type="button"
            onClick={l.onClick}
            data-od-id={l.odId}
            className="v2-press v2-focus"
            style={handlingStil}
          >
            {l.label}
          </button>
        ),
      )}
    </div>
  );
}

/* ── Artefaktkort i tråden — fasitens <div class="artcard"> ─────────────── */

export function ArtefaktKort({
  navn,
  status,
  beskrivelse,
  handlinger,
}: {
  navn: string;
  status: string;
  beskrivelse: string;
  handlinger: Array<{ label: string; href?: string; onClick?: () => void; odId?: string }>;
}) {
  return (
    <div
      style={{
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        background: T.panel2,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{navn}</span>
        <Merkelapp>{status}</Merkelapp>
      </div>
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>{beskrivelse}</p>
      <Handlinger lenker={handlinger} />
    </div>
  );
}

/* ── Merkelapp — fasitens <span class="tag"> ────────────────────────────── */

export function Merkelapp({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${T.border}`,
        background: T.panel,
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: "0.04em",
        color: T.fg2,
      }}
    >
      {children}
    </span>
  );
}

/* ── «Én ting nå» — fasitens .nowblock. Skjermens ENESTE oransje flate ──── */

export function EnTingNa({
  tekst,
  primaer,
  sekundaer,
}: {
  tekst: ReactNode;
  primaer: { label: string; href: string; odId?: string };
  sekundaer?: { label: string; href: string; odId?: string };
}) {
  return (
    <div
      data-paper-en-ting="true"
      style={{
        border: `1px solid color-mix(in srgb, ${T.handling} 32%, ${T.border})`,
        borderRadius: T.rCard,
        background: T.handlingSoft,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>Én ting nå</h3>
      <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 14.5, lineHeight: 1.6, color: T.fg }}>{tekst}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
        <Link
          href={primaer.href}
          data-od-id={primaer.odId}
          className="v2-press v2-focus"
          style={{
            ...handlingStil,
            minHeight: 44,
            padding: "0 18px",
            border: "none",
            background: T.handling,
            color: T.onHandling,
            fontWeight: 600,
          }}
        >
          {primaer.label}
        </Link>
        {sekundaer && (
          <Link
            href={sekundaer.href}
            data-od-id={sekundaer.odId}
            className="v2-press v2-focus"
            style={{ ...handlingStil, minHeight: 44, padding: "0 18px" }}
          >
            {sekundaer.label}
          </Link>
        )}
      </div>
    </div>
  );
}
