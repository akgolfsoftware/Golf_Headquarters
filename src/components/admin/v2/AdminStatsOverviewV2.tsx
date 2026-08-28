import { TL } from "@/lib/v2/train-lock";
import type { ReactNode } from "react";
import Link from "next/link";
import { Caps, Kort, StatusPill, CTAPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { RaskeHandlingerV2 } from "@/components/admin/v2/AdminStatsRaskeHandlingerV2";

/**
 * AgencyOS Stats-oversikt — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Admin-dashboard for plattformtall. T.* only.
 */

export type SyncStatus = "ok" | "stale" | "warning" | "error";
export interface SyncRad {
  navn: string;
  status: SyncStatus;
  tid: string;
  detalj: string;
}
export interface AdminStatsOverviewV2Data {
  totalBrukere: number;
  brukereSomHarSgInputs: number;
  totalSgInputs: number;
  totalSammenligninger: number;
  ventendeManuelleTurneringer: number;
  syncRader: SyncRad[];
  totalPgaSpillere: number;
  totalTurneringer: number;
  totalDeltakerRader: number;
  totalNorskeSpillere: number;
  sisteCommits: { hash: string; melding: string }[];
  sistOppdatertLabel: string;
}

const SYNC_COLOR: Record<SyncStatus, string> = { ok: TL.ok, warning: TL.warn, stale: TL.warn, error: TL.danger };
const SYNC_ICON: Record<SyncStatus, string> = { ok: "check", warning: "triangle-alert", stale: "triangle-alert", error: "triangle-alert" };

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: TL.fill }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: TL.fill }} />
      {children}
    </span>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 24, lineHeight: 1.2, letterSpacing: "-0.02em", color: TL.text }}>{title}</h2>
    </Reveal>
  );
}

function MiniStat({ label, value, haster }: { label: string; value: number; haster?: boolean }) {
  return (
    <div style={{ borderRadius: TL.radius.card, border: `1px solid ${haster ? TL.danger : TL.hair}`, background: haster ? `color-mix(in srgb, ${TL.danger} 6%, transparent)` : TL.elev, padding: 20 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: haster ? TL.danger : TL.mute }}>{label}</div>
      <div style={{ marginTop: 8, fontFamily: TL.font.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: haster ? TL.danger : TL.text, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString("nb-NO")}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: number; sub: ReactNode; accent?: boolean }) {
  return (
    <div style={{ borderRadius: TL.radius.card, border: `1px solid ${TL.hair}`, background: accent ? TL.fill : TL.elev, padding: "16px 18px" }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: accent ? TL.fill : TL.mute }}>{label}</div>
      <div style={{ marginTop: 8, fontFamily: TL.font.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: accent ? TL.fill : TL.text, fontVariantNumeric: "tabular-nums" }}>
        <CountUp value={value} />
      </div>
      <div style={{ marginTop: 10, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: accent ? "color-mix(in srgb, " + TL.fill + " 70%, transparent)" : TL.mute }}>{sub}</div>
    </div>
  );
}

function PlausibleCard({ delay, title }: { delay: number; title: string }) {
  return (
    <Reveal delay={delay}>
      <Kort>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Eyebrow>{title}</Eyebrow>
          <span style={{ borderRadius: 6, background: `color-mix(in srgb, ${TL.warn} 12%, transparent)`, padding: "4px 8px", fontFamily: TL.font.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.10em", color: TL.warn }}>
            Krever Plausible-integrasjon
          </span>
        </div>
        <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, lineHeight: 1.6, color: TL.mute }}>
          Data hentes fra Plausible Analytics.
          <br />
          Koble til Plausible API-nøkkel for å aktivere.
        </div>
      </Kort>
    </Reveal>
  );
}

export function AdminStatsOverviewV2({ data }: { data: AdminStatsOverviewV2Data }) {
  return (
    <div data-paper-wave-h="statsoverview" data-paper-pattern  style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
        <div>
          <Caps>AgencyOS · Stats</Caps>
          <h1 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.025em", color: TL.text }}>
            Plattformen i <em style={{ fontStyle: "italic", fontWeight: 400, color: TL.fill }}>tall</em>.
          </h1>
          <p style={{ marginTop: 6, maxWidth: 760, fontSize: 13, lineHeight: 1.6, color: TL.mute }}>
            Admin-dashboard for AK Golf Stats — brukere, SG-data, turneringsdatabase og pipeline-status, alt live fra databasen.
          </p>
        </div>
        <StatusPill tone={data.ventendeManuelleTurneringer > 0 ? "warn" : "lime"}>
          {data.ventendeManuelleTurneringer > 0
            ? `${data.ventendeManuelleTurneringer} venter`
            : `Oppdatert ${data.sistOppdatertLabel}`}
        </StatusPill>
      </div>

      {/* B: én primær CTA */}
      <div style={{ marginBottom: 12 }}>
        <Link href="/admin/stats/moderering" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="shield-check" full>
            Åpne moderering
          </CTAPill>
        </Link>
      </div>

      <Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, paddingTop: 12 }}>
          <KpiCard label="Totale brukere" value={data.totalBrukere} sub={<>{data.brukereSomHarSgInputs} med SG-data</>} />
          <KpiCard label="SG-inputs" value={data.totalSgInputs} sub={<>{data.totalSammenligninger} sammenligninger</>} />
          <KpiCard label="Turneringer i DB" value={data.totalTurneringer} sub={<>{data.totalDeltakerRader.toLocaleString("nb-NO")} deltakerrader</>} />
          <KpiCard label="Norske spillere" value={data.totalNorskeSpillere} sub={<>av {data.totalPgaSpillere.toLocaleString("nb-NO")} PGA-spillere</>} accent />
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, paddingTop: 20 }}>
        <PlausibleCard delay={0} title="Top 5 sider" />
        <PlausibleCard delay={100} title="Trafikkilder" />
      </div>

      <section style={{ paddingTop: 28 }}>
        <SectionHead eyebrow="Database-status" title="Stats-databasen live." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            { lbl: "PGA-spillere", n: data.totalPgaSpillere },
            { lbl: "Turneringer", n: data.totalTurneringer },
            { lbl: "Deltakerrader", n: data.totalDeltakerRader },
            { lbl: "Norske spillere", n: data.totalNorskeSpillere },
          ].map((rad, i) => (
            <Reveal key={rad.lbl} delay={i * 40}>
              <MiniStat label={rad.lbl} value={rad.n} />
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 28, borderTop: `1px solid ${TL.hair}`, paddingTop: 28 }}>
        <SectionHead eyebrow="Sync-status" title="Pipeline — siste kjøring." />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
          {data.syncRader.map((s, i) => {
            const c = SYNC_COLOR[s.status];
            return (
              <Reveal key={s.navn} delay={i * 40}>
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto", alignItems: "center", gap: 16, borderRadius: TL.radius.card, border: `1px solid color-mix(in srgb, ${c} 35%, ${TL.hair})`, background: `color-mix(in srgb, ${c} 6%, transparent)`, padding: 14 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 9999, background: `color-mix(in srgb, ${c} 15%, transparent)` }}>
                    <Icon name={SYNC_ICON[s.status]} size={14} style={{ color: c }} />
                  </span>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{s.navn}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{s.tid}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: c }}>{s.detalj}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: 28, borderTop: `1px solid ${TL.hair}`, paddingTop: 28 }}>
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
            <div>
              <Eyebrow>Modereringskø</Eyebrow>
              <h2 style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 24, lineHeight: 1.2, letterSpacing: "-0.02em", color: TL.text }}>
                {data.ventendeManuelleTurneringer} ventende turneringer.
              </h2>
            </div>
            <Link
              href="/admin/stats/moderering"
              style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 8, borderRadius: 9999, background: TL.fill, padding: "10px 20px", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.onFill, textDecoration: "none" }}
            >
              Til moderering
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            { lbl: "Manuelle turneringer", n: data.ventendeManuelleTurneringer, haster: data.ventendeManuelleTurneringer > 5 },
            { lbl: "SG-inputs", n: data.totalSgInputs, haster: false },
            { lbl: "Sammenligninger", n: data.totalSammenligninger, haster: false },
            { lbl: "PGA-spillere i DB", n: data.totalPgaSpillere, haster: false },
          ].map((m, i) => (
            <Reveal key={m.lbl} delay={i * 40}>
              <MiniStat label={m.lbl} value={m.n} haster={m.haster} />
            </Reveal>
          ))}
        </div>
      </section>

      {data.sisteCommits.length > 0 && (
        <section style={{ marginTop: 28, borderTop: `1px solid ${TL.hair}`, paddingTop: 28 }}>
          <SectionHead eyebrow="Siste commits" title="Kodehistorikk — main branch." />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
            {data.sisteCommits.map((c, i) => (
              <Reveal key={c.hash} delay={i * 30}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 12, borderRadius: TL.radius.card, border: `1px solid ${TL.hair}`, background: TL.elev, padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 6, background: `color-mix(in srgb, ${TL.fill} 10%, transparent)`, padding: "4px 8px", fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.fill }}>
                    <Icon name="git-commit-horizontal" size={12} />
                    {c.hash}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, fontWeight: 600, color: TL.text }}>{c.melding}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 28, borderTop: `1px solid ${TL.hair}`, paddingTop: 28, paddingBottom: 8 }}>
        <SectionHead eyebrow="Raske handlinger" title="Cron + admin-snarveier." />
        <RaskeHandlingerV2 />
      </section>
    </div>
  );
}
