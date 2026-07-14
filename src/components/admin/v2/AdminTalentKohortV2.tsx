/**
 * AgencyOS v2 — Talent · Kohort-analyse (`/admin/talent/kohort`,
 * AgencyOS Bølge 3.20, 2026-07-14). Port fra `(legacy)/talent/kohort/
 * page.tsx` — samme `TalentTracking`-aggregering (snitt-radar 5 akser +
 * 90-dagers progresjon per nivå U10–Senior). Ren visning, ingen mutasjoner.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Icon, T } from "@/components/v2";

export type NivaV2 = "U10" | "U12" | "U14" | "U16" | "U18" | "Senior";
type RadarKeyV2 = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";

const RADAR_AKSER: { key: RadarKeyV2; label: string }[] = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
];

export interface KohortAggV2 {
  niva: NivaV2;
  antall: number;
  snitt: Record<RadarKeyV2, number | null>;
  total: number | null;
  progresjon: number;
}

function fmt1(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

export function AdminTalentKohortV2({ kohorter, totalSpillere }: { kohorter: KohortAggV2[]; totalSpillere: number }) {
  const ikkeTomKohort = kohorter.filter((k) => k.antall > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>Talent · Kohort-analyse</Caps>
          <Tittel em="på nivå">Kohorter</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{totalSpillere} talent fordelt på U10–Senior. Snitt-radar og 90-dagers progresjon per nivå.</p>
        </div>
        <Link href="/admin/talent" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 14px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
          <Icon name="arrow-left" size={14} />Tilbake til talent
        </Link>
      </div>

      {totalSpillere === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 16px", textAlign: "center" }}>
            <Icon name="users" size={28} style={{ color: T.mut }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen talent registrert</div>
            <p style={{ maxWidth: 360, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Talent-spillere må registreres via TalentTracking før kohort-analyse er meningsfull.</p>
          </div>
        </Kort>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
            {kohorter.map((k) => (
              <Kort key={k.niva} style={k.antall === 0 ? { opacity: 0.55 } : undefined}>
                <Caps size={9}>{k.niva}</Caps>
                <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 26, fontWeight: 700, lineHeight: 1, color: T.fg }}>{k.antall}</div>
                <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>snitt {fmt1(k.total)}/10</div>
                {k.progresjon > 0 && (
                  <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 15%, transparent)`, padding: "2px 8px", fontFamily: T.ui, fontSize: 10, fontWeight: 600, color: T.lime }}>
                    <Icon name="trending-up" size={11} />+{k.progresjon} siste 90d
                  </div>
                )}
              </Kort>
            ))}
          </div>

          <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "8px 20px" }}>
              <Caps size={9}><Icon name="layers" size={11} style={{ marginRight: 6, verticalAlign: "-2px" }} />Snitt-radar per nivå (1–10)</Caps>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "12px 20px" }}><Caps size={9}>Nivå</Caps></th>
                    <th style={{ padding: "12px 14px" }}><Caps size={9}>Antall</Caps></th>
                    {RADAR_AKSER.map((a) => <th key={a.key} style={{ padding: "12px 14px" }}><Caps size={9}>{a.label}</Caps></th>)}
                    <th style={{ padding: "12px 14px" }}><Caps size={9}>Total</Caps></th>
                    <th style={{ padding: "12px 20px" }}><Caps size={9}>90d</Caps></th>
                  </tr>
                </thead>
                <tbody>
                  {kohorter.map((k) => (
                    <tr key={k.niva} style={{ borderTop: `1px solid ${T.border}`, opacity: k.antall === 0 ? 0.5 : 1 }}>
                      <td style={{ padding: "12px 20px", fontWeight: 700, color: T.fg }}>{k.niva}</td>
                      <td style={{ padding: "12px 14px", fontFamily: T.mono, color: T.fg }}>{k.antall}</td>
                      {RADAR_AKSER.map((a) => <td key={a.key} style={{ padding: "12px 14px", fontFamily: T.mono, color: T.fg }}>{fmt1(k.snitt[a.key])}</td>)}
                      <td style={{ padding: "12px 14px", fontFamily: T.mono, fontWeight: 700, color: T.lime }}>{fmt1(k.total)}</td>
                      <td style={{ padding: "12px 20px", fontFamily: T.mono, color: T.mut }}>+{k.progresjon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {ikkeTomKohort.length === 0 && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Ingen radar-data registrert ennå — vis nivå-fordeling.</p>}
        </>
      )}
    </div>
  );
}
