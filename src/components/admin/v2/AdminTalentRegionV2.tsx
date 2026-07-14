/**
 * AgencyOS v2 — Talent · Regional pipeline (`/admin/talent/region`,
 * AgencyOS Bølge 3.21, 2026-07-14). Port fra `(legacy)/talent/region/
 * page.tsx` — samme `TalentTracking`-region-aggregering og forenklede
 * Norge-kart-stub (SVG, samme geometri, kun v2-tokens for farger).
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Icon, T } from "@/components/v2";

const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
export type NivaTalentV2 = (typeof NIVAER)[number];

export type RegionIdV2 = "ost" | "vest" | "sor" | "nord" | "midt" | "innland" | "trondelag";

export const REGION_PINS_V2: { id: RegionIdV2; label: string; x: number; y: number }[] = [
  { id: "nord", label: "Nord", x: 220, y: 60 },
  { id: "trondelag", label: "Trøndelag", x: 200, y: 130 },
  { id: "midt", label: "Midt", x: 145, y: 180 },
  { id: "innland", label: "Innland", x: 260, y: 230 },
  { id: "vest", label: "Vest", x: 100, y: 265 },
  { id: "ost", label: "Øst", x: 230, y: 295 },
  { id: "sor", label: "Sør", x: 175, y: 345 },
];

export interface RegionAggV2 {
  id: RegionIdV2 | "ukjent";
  label: string;
  antall: number;
  snitt: number | null;
  toppKlubber: [string, number][];
}

function fmt1(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

export function AdminTalentRegionV2({
  regioner,
  antallPerRegion,
  totalt,
  valgtNiva,
}: {
  regioner: RegionAggV2[];
  antallPerRegion: Record<string, number>;
  totalt: number;
  valgtNiva: NivaTalentV2 | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>Talent · Regional pipeline</Caps>
          <Tittel em={valgtNiva ?? undefined}>Regioner</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            {totalt} talent fordelt på regioner{valgtNiva ? ` (filtrert på ${valgtNiva})` : ""}.
          </p>
        </div>
        <Link href="/admin/talent" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 14px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
          <Icon name="arrow-left" size={14} />Tilbake
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Caps size={9}>Nivå</Caps>
        <Link href="/admin/talent/region" style={{ borderRadius: 9999, padding: "6px 14px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, textDecoration: "none", background: !valgtNiva ? T.lime : T.panel2, color: !valgtNiva ? T.onLime : T.fg, border: !valgtNiva ? "none" : `1px solid ${T.border}` }}>Alle</Link>
        {NIVAER.map((n) => (
          <Link key={n} href={`/admin/talent/region?niva=${n}`} style={{ borderRadius: 9999, padding: "6px 14px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, textDecoration: "none", background: valgtNiva === n ? T.lime : T.panel2, color: valgtNiva === n ? T.onLime : T.fg, border: valgtNiva === n ? "none" : `1px solid ${T.border}` }}>{n}</Link>
        ))}
      </div>

      {totalt === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 16px", textAlign: "center" }}>
            <Icon name="users" size={28} style={{ color: T.mut }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen talent {valgtNiva ? `på ${valgtNiva}` : "registrert"}</div>
            <p style={{ maxWidth: 360, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Talent-spillere må ha region registrert i TalentTracking for å vises her.</p>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 420px) minmax(0, 1fr)", gap: T.gap, alignItems: "start" }}>
          <Kort>
            <Caps size={9}><Icon name="map-pin" size={11} style={{ marginRight: 6, verticalAlign: "-2px" }} />Norge · regioner</Caps>
            <svg viewBox="0 0 360 420" style={{ width: "100%", marginTop: 12 }}>
              <path
                d="M210 30 L260 50 L240 120 L260 160 L290 200 L300 250 L260 290 L240 330 L200 370 L160 390 L130 380 L110 340 L90 290 L80 240 L100 200 L120 160 L140 130 L160 100 L180 60 Z"
                fill={T.panel3}
                stroke={T.border}
                strokeWidth={1.5}
              />
              {REGION_PINS_V2.map((pin) => {
                const antall = antallPerRegion[pin.id] ?? 0;
                const r = Math.max(8, Math.min(28, 8 + antall * 2));
                const aktiv = antall > 0;
                return (
                  <g key={pin.id}>
                    <circle cx={pin.x} cy={pin.y} r={r} fill={aktiv ? T.lime : T.mut} opacity={aktiv ? 0.85 : 0.35} stroke={T.panel} strokeWidth={2} />
                    <text x={pin.x} y={pin.y + 3} textAnchor="middle" fontFamily={T.mono} fontSize="11" fontWeight={600} fill={aktiv ? T.onLime : T.panel}>{antall}</text>
                    <text x={pin.x} y={pin.y + r + 14} textAnchor="middle" fontFamily={T.mono} fontSize="10" fill={T.fg}>{pin.label}</text>
                  </g>
                );
              })}
            </svg>
          </Kort>

          <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "8px 20px" }}>
              <Caps size={9}>Region-oversikt ({regioner.length})</Caps>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "12px 20px" }}><Caps size={9}>Region</Caps></th>
                    <th style={{ padding: "12px 14px" }}><Caps size={9}>Antall</Caps></th>
                    <th style={{ padding: "12px 14px" }}><Caps size={9}>Snitt-radar</Caps></th>
                    <th style={{ padding: "12px 20px" }}><Caps size={9}>Topp-klubber</Caps></th>
                  </tr>
                </thead>
                <tbody>
                  {regioner.map((r) => (
                    <tr key={r.id} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: "12px 20px", fontWeight: 700, color: T.fg }}>{r.label}</td>
                      <td style={{ padding: "12px 14px", fontFamily: T.mono, color: T.fg }}>{r.antall}</td>
                      <td style={{ padding: "12px 14px", fontFamily: T.mono, fontWeight: 700, color: T.lime }}>{fmt1(r.snitt)}</td>
                      <td style={{ padding: "12px 20px" }}>
                        {r.toppKlubber.length === 0 ? (
                          <span style={{ color: T.mut }}>—</span>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {r.toppKlubber.map(([navn, ant]) => (
                              <span key={navn} style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, background: T.panel3, padding: "3px 9px", fontFamily: T.ui, fontSize: 11 }}>
                                {navn}<span style={{ fontFamily: T.mono, color: T.mut }}>{ant}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
