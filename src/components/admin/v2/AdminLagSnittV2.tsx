/**
 * AgencyOS — Lag-snitt (Analysere · Lag-snitt), v2-port 16. juli 2026.
 * Erstatter AgPage/AgPageHead/AgChip med v2-primitiver. Samme datagrunnlag
 * (COMPLETED TrainingPlanSession gruppert på pyramidArea per gruppe)
 * uendret — kun presentasjonslaget er nytt.
 */

import { Caps, Tittel, Kort, StatusPill, T, AKSE_NAVN } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

export interface LagSnittRad {
  akse: AkseKey;
  pct: number;
  harData: boolean;
}
export interface LagSnittGruppe {
  id: string;
  navn: string;
  antallMedlemmer: number;
  rader: LagSnittRad[];
}
export interface AdminLagSnittV2Data {
  grupper: LagSnittGruppe[];
}

function AksePctBar({ rad }: { rad: LagSnittRad }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 44px", alignItems: "center", gap: 12, padding: "6px 0" }}>
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
        {AKSE_NAVN[rad.akse] ?? rad.akse}
      </span>
      <span style={{ height: 7, borderRadius: 9999, background: T.track, overflow: "hidden", display: "block" }}>
        <span style={{ display: "block", height: "100%", borderRadius: 9999, width: `${rad.pct}%`, background: T.ax[rad.akse] ?? T.lime }} />
      </span>
      <span style={{ textAlign: "right", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>
        {rad.harData ? `${rad.pct} %` : "—"}
      </span>
    </div>
  );
}

export function AdminLagSnittV2({ data }: { data: AdminLagSnittV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Analysere · Lag-snitt</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="per gruppe.">Pyramide</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
          Slik fordeler treningsbalansen seg i hver gruppe. Bruk det til å justere gruppeprogrammene.
        </p>
      </div>

      {data.grupper.length === 0 ? (
        <Kort>
          <div style={{ textAlign: "center", padding: "32px 16px", fontFamily: T.ui, fontSize: 13, color: T.mut }}>
            Ingen grupper opprettet ennå — opprett en gruppe under Stall for å sammenligne lag-snitt.
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {data.grupper.map((g) => (
            <Kort key={g.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{g.navn}</span>
                <StatusPill tone="info">{g.antallMedlemmer}</StatusPill>
              </div>
              {g.rader.map((r) => (
                <AksePctBar key={r.akse} rad={r} />
              ))}
            </Kort>
          ))}
        </div>
      )}
    </div>
  );
}
