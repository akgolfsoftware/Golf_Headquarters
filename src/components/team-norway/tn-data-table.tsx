import type { ReactNode } from "react";
import { TN } from "@/lib/v2/team-norway";
import s from "./tn-data-table.module.css";

/**
 * Fasit: components/data/DataTable.jsx i Claw-designsystemet (a03bf94a…).
 * Ren presentasjon (ingen hooks) — kan brukes fra en server component.
 * `loading` tegner skjelettrader i tabellens egen rytme; `empty` er et
 * gyldig svar fra loaderen, ikke en feil. Skjermene skal ikke tegne dette selv.
 *
 * Avvik:
 *   - Ingen riggrad: den visuelle riggen dekker Train-lock, ikke Claw ennå
 *     (PORTING.md §0b, ingen Claw-skjerm har det per 08.09.2026).
 */

export type TnDataTableKolonne = {
  key: string;
  label: string;
  /** 'right' gir mono-tall og høyrestilling — bruk for alle måltall. */
  align?: "left" | "right";
};

export function TnDataTable({
  kolonner,
  rader,
  dense = false,
  empty,
  loading = false,
  caption,
  highlightRow,
}: {
  kolonner: TnDataTableKolonne[];
  rader: Array<Record<string, ReactNode>>;
  dense?: boolean;
  empty?: string | ReactNode;
  loading?: boolean;
  caption?: string;
  highlightRow?: number;
}) {
  const pad = dense ? "10px 14px" : "14px 18px";
  const skall: React.CSSProperties = {
    minWidth: 0,
    borderRadius: TN.radius.lg,
    border: `1px solid ${TN.borderSubtle}`,
    background: TN.white,
  };

  if (loading) {
    return (
      <div style={skall} role="status" aria-label={caption ? `Henter ${caption.toLocaleLowerCase("nb-NO")}` : "Henter tabell"}>
        <div aria-hidden="true" style={{ display: "flex", gap: 12, padding: pad, background: TN.ink50, borderBottom: `1px solid ${TN.borderSubtle}` }}>
          {kolonner.map((k) => (
            <div key={k.key} style={{ flex: 1, height: 11, borderRadius: TN.radius.xs, background: TN.ink200 }} />
          ))}
        </div>
        {[0, 1, 2, 3].map((rad) => (
          <div
            key={rad}
            aria-hidden="true"
            style={{ display: "flex", gap: 12, padding: pad, borderBottom: rad === 3 ? "none" : `1px solid ${TN.ink100}` }}
          >
            {kolonner.map((k) => (
              <div key={k.key} style={{ flex: 1, height: 13, borderRadius: TN.radius.xs, background: TN.ink100 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (rader.length === 0) {
    return (
      <div style={{ ...skall, padding: "26px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontFamily: TN.font.body, fontSize: TN.text.base, fontWeight: TN.weight.semibold, color: TN.ink900 }}>
          {typeof empty === "string" ? empty : "Ingen rader"}
        </span>
        {typeof empty !== "string" && empty ? empty : null}
      </div>
    );
  }

  return (
    <div style={skall} role="region" aria-label={caption ?? "Tabell"}>
      <table className={dense ? `${s.tabell} ${s.tett}` : s.tabell}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {kolonner.map((k) => (
              <th key={k.key} scope="col" className={k.align === "right" ? s.hoyre : undefined}>
                {k.label.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.map((rad, ri) => (
            <tr key={ri} className={ri === highlightRow ? s.uthevet : undefined}>
              {kolonner.map((k) => (
                <td key={k.key} data-etikett={k.label} className={k.align === "right" ? `${s.hoyre} ${s.tall}` : undefined}>
                  {rad[k.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
