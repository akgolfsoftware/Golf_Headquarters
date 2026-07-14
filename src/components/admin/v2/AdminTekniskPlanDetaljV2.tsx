/**
 * AgencyOS v2 — Teknisk-plan-detalj (`/admin/teknisk-plan/[spillerId]`,
 * AgencyOS Bølge 3.8, 2026-07-14). Port fra
 * `(legacy)/teknisk-plan/[spillerId]/page.tsx` — samme datamodell (aktiv
 * TrainingPlan → TEK-økter gruppert per L-fase, drill-aggregering m/ snitt
 * CS), ren visning. `HjelpTips` på CS-nivå/L-fase/HCP per design-regelen.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Rad, StatusPill, Icon, T, type StatusTone } from "@/components/v2";
import { HjelpTips } from "@/components/v2/hjelp";

const LFASE_LABELS: Record<string, string> = { GRUNN: "Grunnfase", SPESIAL: "Spesialfase", TURNERING: "Turneringsfase" };
const STATUS_TONE: Record<string, StatusTone> = { COMPLETED: "up", ACTIVE: "lime", PLANNED: "info", PAUSED: "warn" };

export interface DrillAggV2 {
  name: string;
  lPhase: string | null;
  antall: number;
  snittCs: number | null;
}

export interface TekOktV2 {
  id: string;
  dato: string;
  varighetMin: number;
  tittel: string;
  antallOvelser: number;
  planNavn: string;
  csAchieved: number | null;
  status: string;
}

export interface FaseGruppeV2 {
  fase: string;
  label: string;
  okter: TekOktV2[];
}

export interface AdminTekniskPlanDetaljV2Data {
  spillerId: string;
  spillerNavn: string;
  hcpTekst: string;
  hjemmeklubb: string | null;
  antallTekOkter: number;
  fullfortAntall: number;
  drillAgg: DrillAggV2[];
  faseGrupper: FaseGruppeV2[];
  harData: boolean;
}

export function AdminTekniskPlanDetaljV2({ spillerId, spillerNavn, hcpTekst, hjemmeklubb, antallTekOkter, fullfortAntall, drillAgg, faseGrupper, harData }: AdminTekniskPlanDetaljV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 820 }}>
      <Link href="/admin/teknisk-plan" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={13} /> Teknisk Plan
      </Link>

      <div>
        <Caps size={9}>Teknisk plan</Caps>
        <Tittel>{spillerNavn}</Tittel>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>HCP {hcpTekst}{hjemmeklubb ? ` · ${hjemmeklubb}` : ""}</span>
          <HjelpTips k="hcp" size={12} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: T.gap }}>
        <Kort>
          <Caps size={9}>TEK-økter</Caps>
          <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg }}>{antallTekOkter}</div>
        </Kort>
        <Kort>
          <Caps size={9}>Fullført</Caps>
          <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg }}>{fullfortAntall}</div>
          <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 11, color: T.mut }}>{antallTekOkter > 0 ? `${Math.round((fullfortAntall / antallTekOkter) * 100)}%` : "—"}</div>
        </Kort>
        <Kort>
          <Caps size={9}>Øvelser</Caps>
          <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg }}>{drillAgg.length}</div>
        </Kort>
      </div>

      {!harData ? (
        <Kort>
          <div style={{ padding: "34px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Ingen teknisk plan for denne spilleren ennå</div>
            <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Opprett en plan med TEK-økter fra Plan-oversikten for å bygge teknisk progresjon.</p>
            <Link href={`/admin/plans/new?player=${spillerId}`} style={{ display: "inline-block", marginTop: 14, textDecoration: "none" }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 18px", borderRadius: 9999, background: T.lime, color: T.onLime, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600 }}>Opprett plan</span>
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          <Kort eyebrow={`Fremgang per teknisk element · ${drillAgg.length} øvelser`} pad="6px 14px">
            {drillAgg.map((d, i) => (
              <Rad
                key={d.name}
                last={i === drillAgg.length - 1}
                title={d.name}
                sub={d.lPhase ? LFASE_LABELS[d.lPhase] ?? d.lPhase : undefined}
                meta={
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg }}>{d.antall}×</div>
                      <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>gjentatt</div>
                    </div>
                    {d.snittCs != null ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: d.snittCs >= 75 ? T.up : T.fg }}>{d.snittCs}%</span>
                          <HjelpTips k="csNivaa" size={11} />
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>snitt CS</div>
                      </div>
                    ) : (
                      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>—</span>
                    )}
                  </div>
                }
              />
            ))}
          </Kort>

          {faseGrupper.map((fg) => (
            <Kort key={fg.fase} pad="0">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Caps size={9}>{fg.label} · {fg.okter.length} TEK-økter</Caps>
                  <HjelpTips k="lFase" size={11} />
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{fg.okter.filter((s) => s.status === "COMPLETED").length}/{fg.okter.length} fullført</span>
              </div>
              <div style={{ padding: "0 14px" }}>
                {fg.okter.map((s, i) => (
                  <Rad
                    key={s.id}
                    last={i === fg.okter.length - 1}
                    leading={<div style={{ width: 56, flex: "none" }}><div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{s.dato}</div><div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{s.varighetMin} min</div></div>}
                    title={s.tittel}
                    sub={`${s.antallOvelser} øvelser · ${s.planNavn}`}
                    meta={
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {s.csAchieved != null ? (
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: s.csAchieved >= 75 ? T.up : T.fg }}>{s.csAchieved}%</span>
                          </div>
                        ) : (
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>—</span>
                        )}
                        <StatusPill tone={STATUS_TONE[s.status] ?? "info"}>{s.status}</StatusPill>
                      </div>
                    }
                  />
                ))}
              </div>
            </Kort>
          ))}

          <Kort>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Icon name="target" size={17} style={{ color: T.mut }} />
              <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.mut, minWidth: 200 }}>Se full 360-profil for treningshistorikk, runder og TrackMan-data.</span>
              <Link href={`/admin/spillere/${spillerId}?tab=plan`} style={{ textDecoration: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 32, padding: "0 16px", borderRadius: 9999, border: `1px solid ${T.borderS}`, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg }}>Åpne 360-profil</span>
              </Link>
            </div>
          </Kort>
        </>
      )}
    </div>
  );
}
