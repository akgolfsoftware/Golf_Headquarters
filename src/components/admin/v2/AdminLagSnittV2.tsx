/**
 * AgencyOS v2 — Lag-snitt (`/admin/lag-snitt`, AgencyOS Bølge 3.4, 2026-07-14).
 * Port fra `(legacy)/lag-snitt/page.tsx` — samme datamodell (COMPLETED
 * TrainingPlanSession gruppert på pyramidArea per gruppe), ren visning.
 */

import { Caps, Tittel, Kort, StatusPill, T } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

export interface AdminLagSnittV2Rad {
  label: string;
  akse: AkseKey;
  pct: number;
  value: string;
}

export interface AdminLagSnittV2Lag {
  id: string;
  navn: string;
  antallMedlemmer: number;
  rader: AdminLagSnittV2Rad[];
}

export function AdminLagSnittV2({ lag }: { lag: AdminLagSnittV2Lag[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>Analysere · Lag-snitt</Caps>
        <Tittel em="per gruppe.">Pyramide</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>
          Slik fordeler treningsbalansen seg i hver gruppe. Bruk det til å justere gruppeprogrammene.
        </p>
      </div>

      {lag.length === 0 ? (
        <Kort>
          <div style={{ padding: "26px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen grupper opprettet ennå — opprett en gruppe under Stall for å sammenligne lag-snitt.
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: T.gap }}>
          {lag.map((t) => (
            <Kort key={t.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{t.navn}</span>
                <StatusPill tone="info">{t.antallMedlemmer}</StatusPill>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {t.rader.map((r) => (
                  <div key={r.label} style={{ display: "grid", gridTemplateColumns: "68px 1fr 44px", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{r.label}</span>
                    <span style={{ height: 7, borderRadius: 9999, background: T.track, overflow: "hidden", display: "block" }}>
                      <span style={{ display: "block", height: "100%", borderRadius: 9999, width: `${r.pct}%`, background: T.ax[r.akse] }} />
                    </span>
                    <span style={{ textAlign: "right", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Kort>
          ))}
        </div>
      )}
    </div>
  );
}
