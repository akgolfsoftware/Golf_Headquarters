import type { ReactNode } from "react";
import { TN } from "@/lib/v2/team-norway";

/**
 * Fasit: components/data/DataTable.jsx i Claw-designsystemet (a03bf94a…).
 * Ren presentasjon (ingen hooks) — kan brukes fra en server component.
 * `loading` tegner skjelettrader i tabellens egen rytme; `empty` er et
 * gyldig svar fra loaderen, ikke en feil. Skjermene skal ikke tegne dette selv.
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
}: {
  kolonner: TnDataTableKolonne[];
  rader: Array<Record<string, ReactNode>>;
  dense?: boolean;
  empty?: string | ReactNode;
  loading?: boolean;
}) {
  const pad = dense ? "10px 14px" : "14px 18px";
  const skall: React.CSSProperties = {
    overflow: "hidden",
    borderRadius: TN.radius.lg,
    border: `1px solid ${TN.borderSubtle}`,
    background: TN.white,
    boxShadow: TN.shadow.sm,
  };

  if (loading) {
    return (
      <div style={skall}>
        <div style={{ display: "flex", gap: 12, padding: pad, background: TN.ink50, borderBottom: `1px solid ${TN.borderSubtle}` }}>
          {kolonner.map((k) => (
            <div key={k.key} style={{ flex: 1, height: 11, borderRadius: TN.radius.xs, background: TN.ink200 }} />
          ))}
        </div>
        {[0, 1, 2, 3].map((rad) => (
          <div
            key={rad}
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
    <div style={skall}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: TN.font.body, fontSize: dense ? 13 : 14 }}>
        <thead>
          <tr>
            {kolonner.map((k) => (
              <th
                key={k.key}
                style={{
                  textAlign: k.align === "right" ? "right" : "left",
                  padding: pad,
                  background: TN.ink50,
                  fontFamily: TN.font.mono,
                  fontSize: TN.text.micro,
                  letterSpacing: TN.tracking.eyebrow,
                  fontWeight: TN.weight.medium,
                  color: TN.ink500,
                  borderBottom: `1px solid ${TN.borderSubtle}`,
                  whiteSpace: "nowrap",
                }}
              >
                {k.label.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.map((rad, ri) => (
            <tr key={ri}>
              {kolonner.map((k) => (
                <td
                  key={k.key}
                  style={{
                    padding: pad,
                    textAlign: k.align === "right" ? "right" : "left",
                    fontFamily: k.align === "right" ? TN.font.mono : TN.font.body,
                    fontVariantNumeric: k.align === "right" ? "tabular-nums" : undefined,
                    color: TN.ink900,
                    borderBottom: ri === rader.length - 1 ? "none" : `1px solid ${TN.ink100}`,
                  }}
                >
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
