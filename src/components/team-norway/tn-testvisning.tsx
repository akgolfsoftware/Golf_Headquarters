import type { CSSProperties } from "react";

import type { Testvisning } from "@/lib/portal-tester/tn-testvisning";
import { TN } from "@/lib/v2/team-norway";
import { TnKort } from "./core";
import { TnSeksjon } from "./tn-shell";

/**
 * Testvisningen (utkast 3, Anders 22.10.2026): siste gjennomføring som slag. Spredningsplott mot målet for
 * PEI-testene, port og sone for gate-testene, avstandsbånd for putt, og TrackMan-tallene per slag der treneren
 * koblet slagene. Uten TrackMan står bare Carry og Side, og «—» for resten. Ren visning uten klientkode.
 */

const tall = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−"));
const side = (v: number | null) => (v === null ? "—" : `${tall(Math.abs(v))} ${v < 0 ? "V" : v > 0 ? "H" : ""}`.trim());
const verdi: CSSProperties = { fontFamily: TN.font.mono, fontSize: 13, whiteSpace: "nowrap" };

function Spredningsplott({ slag, navn }: { slag: Extract<Testvisning, { type: "pei" }>["slag"]; navn: string }) {
  const med = slag.filter((s) => s.iHull || (s.carry !== null && s.side !== null && s.target !== null));
  const lengst = Math.max(10, ...med.map((s) => (s.iHull ? 0 : Math.max(Math.abs(s.side!), Math.abs(s.carry! - s.target!)))));
  const k = 130 / (lengst * 1.1);
  const cx = 200, cy = 150;
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={`Spredning mot målet for ${navn}: ${med.length} slag`} style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }}>
      <line x1={cx} y1={10} x2={cx} y2={290} stroke="currentColor" strokeOpacity={0.15} />
      <line x1={10} y1={cy} x2={390} y2={cy} stroke="currentColor" strokeOpacity={0.15} />
      {[5, 10].map((r) => (
        <g key={r}>
          <circle cx={cx} cy={cy} r={r * k} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 3" />
          <text x={cx + r * k * 0.71 + 3} y={cy - r * k * 0.71 - 3} fontSize={11} fill="currentColor" fillOpacity={0.6}>{r} m</text>
        </g>
      ))}
      <text x={cx} y={20} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>lengre</text>
      <text x={cx} y={292} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>kortere</text>
      <text x={14} y={cy - 6} fontSize={11} fill="currentColor" fillOpacity={0.6}>venstre</text>
      <text x={386} y={cy - 6} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.6}>høyre</text>
      <circle cx={cx} cy={cy} r={4} fill="currentColor" />
      {med.map((s) => {
        const x = s.iHull ? cx : cx + s.side! * k;
        const y = s.iHull ? cy : cy - (s.carry! - s.target!) * k;
        return (
          <g key={s.nr}>
            <circle cx={x} cy={y} r={7} fill={s.tm ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} />
            <text x={x + 10} y={y + 4} fontSize={11} fill="currentColor">{s.nr}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function TnTestvisningSlag({ visning, navn }: { visning: Testvisning; navn: string }) {
  if (visning.type === "annet") return null;
  if (visning.type === "pei") {
    const harTm = visning.slag.some((s) => s.tm);
    return (
      <TnSeksjon tittel="Siste gjennomføring — slag" forklaring="Spredning mot målet. Fylt prikk er koblet til TrackMan, åpen er ført for hånd. PEI = avstand fra hullet / slaglengde.">
        <TnKort style={{ display: "grid", gap: 12, color: TN.navy900, minWidth: 0 }}>
          <Spredningsplott slag={visning.slag} navn={navn} />
          <div style={{ display: "grid", minWidth: 0 }}>
            {visning.slag.map((s) => (
              <div key={s.nr} style={{ display: "grid", gap: 2, padding: "8px 0", borderTop: `1px solid ${TN.ink100}`, minWidth: 0 }}>
                <span style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", alignItems: "baseline" }}>
                  <b style={{ fontSize: 14 }}>Slag {s.nr}{s.target !== null ? ` · ${s.target} m` : ""}</b>
                  <span style={verdi}>{s.iHull ? "I hull" : `Carry ${tall(s.carry)} · Side ${side(s.side)}`}</span>
                  <span style={verdi}>Fra hullet {s.fraHullet === null ? "—" : `${tall(s.fraHullet)} m`}</span>
                  <span style={verdi}>PEI {s.pei === null ? "—" : `${tall(s.pei * 100)} %`}</span>
                </span>
                <span style={{ fontSize: 12.5, color: TN.textSecondary, overflowWrap: "anywhere" }}>
                  {s.tm ? `TM · ${s.tm.club ?? "—"} · Club Speed ${tall(s.tm.clubSpeed)} mph · Smash Factor ${tall(s.tm.smashFactor, 2)} · Face to Path ${tall(s.tm.faceToPath)}° · Club Path ${tall(s.tm.clubPath)}° · Attack Angle ${tall(s.tm.attackAngle)}°${s.passerIkke ? " · koblet selv om slaget ikke passet" : ""}` : "TrackMan: —"}
                </span>
              </div>
            ))}
          </div>
          {!harTm ? <p style={{ margin: 0, fontSize: 12.5, color: TN.ink500 }}>Ingen slag er koblet til TrackMan. Panelet viser Carry og Side, og «—» for resten.</p> : null}
        </TnKort>
      </TnSeksjon>
    );
  }
  if (visning.type === "gate") {
    return (
      <TnSeksjon tittel="Siste gjennomføring — port og sone" forklaring={visning.medPoeng ? "Bom 0 poeng · Gjennom porten 1 · Porten og sonen 4." : "Godkjent eller bom per slag."}>
        <TnKort style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 8 }}>
            {visning.slag.map((s) => {
              const sone = s.valg === "I sonen" || s.valg === "Godkjent";
              const port = s.valg === "Gjennom porten";
              return (
                <div key={s.nr} style={{ border: `1.5px ${sone || port ? "solid" : "dashed"} ${TN.navy900}`, background: sone ? TN.navy900 : "transparent", color: sone ? TN.white : TN.navy900, borderRadius: 10, padding: "8px 10px", display: "grid", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>Slag {s.nr}</span>
                  <b style={{ fontSize: 13, overflowWrap: "anywhere" }}>{s.valg ?? "—"}</b>
                  {s.poeng !== null ? <span style={{ fontFamily: TN.font.mono, fontSize: 12 }}>{s.poeng} p</span> : null}
                </div>
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: TN.textSecondary }}>{visning.fordeling.map((f) => `${f.navn}: ${f.antall}`).join(" · ")}</p>
        </TnKort>
      </TnSeksjon>
    );
  }
  const maks = Math.max(1, ...visning.band.map((b) => b.antall));
  return (
    <TnSeksjon tittel="Siste gjennomføring — avstandsbånd" forklaring="Hvor puttene endte, gruppert etter avstand.">
      <TnKort style={{ display: "grid", gap: 8, minWidth: 0 }}>
        {visning.band.map((b) => (
          <div key={b.navn} style={{ display: "grid", gridTemplateColumns: "minmax(0, 9rem) minmax(0, 1fr) 2.5rem", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: TN.textSecondary, overflowWrap: "anywhere" }}>{b.navn}</span>
            <span aria-hidden style={{ height: 14, borderRadius: 7, background: TN.ink100, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(b.antall / maks) * 100}%`, background: TN.navy900 }} />
            </span>
            <b style={{ fontFamily: TN.font.mono, fontSize: 14, textAlign: "right" }}>{b.antall}</b>
          </div>
        ))}
      </TnKort>
    </TnSeksjon>
  );
}
