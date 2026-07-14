/**
 * AgencyOS v2 — Risiko / stall-kart (`/admin/risiko`, AgencyOS Bølge 3.17,
 * 2026-07-14). Port fra `(legacy)/risiko/page.tsx` — samme risiko-logikk
 * (SKADET/permisjon/dager-siden-økt), samme 8-kolonners heatmap + liste over
 * spillere som trenger oppfølging. Ren visning, ingen mutasjoner.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, StatusPill, Icon, T, type StatusTone } from "@/components/v2";

export type RisikoNivaaV2 = 0 | 1 | 2 | 3 | 4;

const RISIKO_LABEL: Record<RisikoNivaaV2, string> = {
  0: "Lav",
  1: "Lav-mod.",
  2: "Moderat",
  3: "Høy",
  4: "Kritisk",
};

const RISIKO_TONE: Record<RisikoNivaaV2, StatusTone> = {
  0: "info",
  1: "info",
  2: "warn",
  3: "warn",
  4: "down",
};

function heatCellFarge(lvl: RisikoNivaaV2): { bg: string; fg: string } {
  if (lvl === 0) return { bg: T.panel3, fg: T.mut };
  if (lvl === 1) return { bg: `color-mix(in srgb, ${T.info} 18%, transparent)`, fg: T.info };
  if (lvl === 2) return { bg: `color-mix(in srgb, ${T.warn} 28%, transparent)`, fg: T.warn };
  if (lvl === 3) return { bg: `color-mix(in srgb, ${T.down} 30%, transparent)`, fg: T.down };
  return { bg: T.down, fg: "#fff" };
}

export interface SpillerRisikoV2 {
  id: string;
  navn: string;
  init: string;
  nivaa: RisikoNivaaV2;
  aarsak: string;
}

export interface AdminRisikoV2Data {
  risikoData: SpillerRisikoV2[];
  datoTekst: string;
}

export function AdminRisikoV2({ risikoData, datoTekst }: AdminRisikoV2Data) {
  const kritiske = risikoData.filter((s) => s.nivaa >= 4);
  const trenger = risikoData.filter((s) => s.nivaa >= 2);
  const antallSpillere = risikoData.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps size={9}>AgencyOS · Risiko</Caps>
          <Tittel em="stall-kart">Risiko</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Intensitetskart over stallen — hvem trenger oppfølging nå.</p>
        </div>
        {kritiske.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.down }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.down }} />
            {kritiske.length} kritisk{kritiske.length !== 1 ? "e" : ""}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: T.gap, alignItems: "start" }}>
        <Kort>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <Caps size={9}>Risk-heatmap · {antallSpillere} spillere</Caps>
            <span style={{ borderRadius: 6, border: `1px solid ${T.border}`, padding: "3px 8px", fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.mut }}>{datoTekst}</span>
          </div>

          {antallSpillere === 0 ? (
            <p style={{ padding: "48px 0", textAlign: "center", fontFamily: T.mono, fontSize: 12, color: T.mut }}>Ingen spillere registrert ennå.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>
              {risikoData.map((s) => {
                const { bg, fg } = heatCellFarge(s.nivaa);
                return (
                  <Link
                    key={s.id}
                    href={`/admin/spillere/${s.id}`}
                    title={`${s.navn} · Risiko: ${RISIKO_LABEL[s.nivaa]}`}
                    style={{ aspectRatio: "1", display: "grid", placeItems: "center", borderRadius: 6, border: `1px solid ${T.border}`, background: bg, color: fg, fontFamily: T.mono, fontSize: 9, fontWeight: 700, textDecoration: "none" }}
                  >
                    {s.init}
                  </Link>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: T.mono, fontSize: 9, color: T.mut }}>
            <span>Lav risiko</span>
            <span style={{ display: "flex", gap: 3 }}>
              {([0, 1, 2, 3, 4] as RisikoNivaaV2[]).map((lvl) => (
                <span key={lvl} style={{ width: 12, height: 12, borderRadius: 3, background: heatCellFarge(lvl).bg }} />
              ))}
            </span>
            <span>Kritisk</span>
          </div>
        </Kort>

        <Kort>
          <Caps size={9}>Trenger oppfølging nå</Caps>
          {trenger.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "36px 0", textAlign: "center" }}>
              <Icon name="alert-triangle" size={28} style={{ color: T.mut, opacity: 0.5 }} />
              <p style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>Ingen spillere med forhøyet risiko.</p>
            </div>
          ) : (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {trenger.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/spillere/${s.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${s.nivaa >= 4 ? T.down : T.warn}`, background: T.panel2, padding: "10px 12px", textDecoration: "none",
                  }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, flex: "none" }}>{s.init}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.navn}</div>
                    <div style={{ marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{s.aarsak}</div>
                  </div>
                  <StatusPill tone={RISIKO_TONE[s.nivaa]}>{RISIKO_LABEL[s.nivaa]}</StatusPill>
                </Link>
              ))}
            </div>
          )}
        </Kort>
      </div>
    </div>
  );
}
