"use client";

/**
 * AgencyOS Compliance — v2 (retning C «Presis»). Plan møter virkelighet på
 * tvers av stallen, drevet av EKTE ComplianceData fra loadComplianceData
 * (Prisma). Bygget utelukkende av v2-komponentbiblioteket (src/components/v2)
 * — ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Tre nivåer i samme språk (bevart fra v10-flaten):
 *   1) spillerpanel  — plan-fullføring for ÉN spiller (ring + uke-strip + akse-barometer + diagnose)
 *   2) stall-liste   — etterlevelse-% per spiller m/ uke-sparkline + sist-logget
 *   3) drill-økt      — planlagte drills i siste loggede økt for valgt spiller
 *
 * Ærlige tomrom bevares: panel/drillSession = null og tomme lister gir
 * TomTilstand — aldri fabrikerte tall. Periode- og spillervalg er server-drevet
 * (router.push med ?periode / ?studentId), fordi panelet + drill-økten kun
 * beregnes for valgt spiller i loaderen.
 */

import { usePathname, useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  AvatarInit,
  AkseBar,
  AkseChip,
  RingMaaler,
  ProgresjonsBar,
  InnsiktChip,
  TomTilstand,
  PillVelger,
  Icon,
  UkeStripe,
  etterlevFarge,
  type EtterlevBand,
  T,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { ComplianceData, ComplianceAxis, StallRow } from "@/lib/admin-compliance/compliance-data";

/* ── Oversettere (loader → v2-idiom) ────────────────────────────── */
const AKSE: Record<ComplianceAxis, AkseKey> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

const LOGG_FARGE: Record<StallRow["lastLogBand"], string> = {
  ok: T.up,
  warn: T.warn,
  bad: T.down,
};

const PERIODER = [
  { v: "7d", l: "7 d", days: 7 },
  { v: "30d", l: "30 d", days: 30 },
  { v: "90d", l: "90 d", days: 90 },
  { v: "365d", l: "1 år", days: 365 },
] as const;

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

const RING_ZONER = [
  { from: 0, to: 60, color: T.down, label: "Bak plan" },
  { from: 60, to: 75, color: T.warn, label: "Følg opp" },
  { from: 75, to: 100, color: T.up, label: "I rute" },
  { from: 100, to: 100000, color: T.lime, label: "Over plan" },
];

export function AdminComplianceV2({ data }: { data: ComplianceData }) {
  const router = useRouter();
  const pathname = usePathname();

  const curKode = PERIODER.find((p) => p.days === data.windowDays)?.v ?? "30d";
  const gaaTil = (periode: string, studentId: string | null) => {
    const q = new URLSearchParams();
    q.set("periode", periode);
    if (studentId) q.set("studentId", studentId);
    router.push(`${pathname}?${q.toString()}`);
  };

  // ── Hode + periodevelger ──────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.periodLabel} · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="etterlevelse.">Plan &amp;</Tittel>
        </div>
      </div>
      <PillVelger
        options={PERIODER.map((p) => ({ v: p.v, l: p.l }))}
        value={curKode}
        onChange={(v) => gaaTil(v, data.selectedPlayerId)}
      />
    </div>
  );

  // Tom stall → ærlig tomrom, ingen resten.
  if (data.stall.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Ingen aktive spillere er koblet til deg ennå — etterlevelse måles når det finnes planer å følge." />
        </Kort>
      </div>
    );
  }

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const medPlan = data.stall.filter((s) => s.planned > 0).length;
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Stall-snitt" value={data.cohortAvg != null ? `${data.cohortAvg} %` : "—"} />
      <KpiFlis label="Median" value={data.cohortMedian != null ? `${data.cohortMedian} %` : "—"} />
      <KpiFlis label="Uten fersk logg" value={data.staleCount} varsle={data.staleCount > 0} />
      <KpiFlis label="Spillere med plan" value={`${medPlan} / ${data.stall.length}`} />
    </div>
  );

  // ── Spillerpanel (valgt spiller) ──────────────────────────────
  const panel = data.panel;
  const panelStall = panel ? data.stall.find((s) => s.playerId === panel.playerId) ?? null : null;
  const panelMeta = panelStall
    ? [panelStall.hcp != null ? `Hcp ${panelStall.hcp}` : null, panelStall.homeClub].filter(Boolean).join(" · ")
    : "";

  const spillerpanel = (
    <Kort eyebrow="Plan-etterlevelse · spiller" action={panel ? <Caps size={9}>{panel.playerName}</Caps> : undefined}>
      {!panel ? (
        <TomTilstand icon="user" title="Ingen spiller valgt" sub="Velg en spiller i lista for å se plan-fullføringen." />
      ) : panel.totalPlanned === 0 ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <AvatarInit navn={panel.playerName} size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>{panel.playerName}</div>
              {panelMeta && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{panelMeta}</div>}
            </div>
          </div>
          <TomTilstand icon="calendar" title="Ingen planlagte økter" sub="Ingen plan i denne perioden å måle etterlevelse mot." />
        </>
      ) : (
        <>
          {/* Spillerhode + ring side ved side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <RingMaaler
              label="Gjennomført"
              value={panel.pct}
              min={0}
              max={100}
              unit="%"
              size={120}
              zones={RING_ZONER}
            />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AvatarInit navn={panel.playerName} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{panel.playerName}</div>
                  {panelMeta && <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>{panelMeta}</div>}
                </div>
              </div>
              <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 12.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
                {panel.totalDone} av {panel.totalPlanned} økter fullført
              </div>
            </div>
          </div>

          {/* Uke-strip (8 uker) */}
          <div style={{ marginTop: 20 }}>
            <Caps size={9}>Uke for uke · fullføring</Caps>
            <div style={{ marginTop: 12 }}>
              <UkeStripe uker={panel.weeks} />
            </div>
          </div>

          {/* Akse-barometer */}
          <div style={{ marginTop: 18 }}>
            <Caps size={9}>Etterlevelse per akse</Caps>
            <div style={{ marginTop: 6 }}>
              {panel.axes.length === 0 ? (
                <TomTilstand icon="list" title="Ingen aksedata" sub="Planen har ingen økter fordelt på akser i denne perioden." />
              ) : (
                panel.axes.map((a, i) => (
                  <AkseBar
                    key={a.axis}
                    a={AKSE[a.axis]}
                    v={a.pct}
                    m={100}
                    max={100}
                    enhet="%"
                    last={i === panel.axes.length - 1}
                  />
                ))
              )}
            </div>
          </div>

          {panel.diagnosis && (
            <div style={{ marginTop: 16 }}>
              <InnsiktChip>{panel.diagnosis}</InnsiktChip>
            </div>
          )}
        </>
      )}
    </Kort>
  );

  // ── Drill-økt (siste loggede for valgt spiller) ───────────────
  const ds = data.drillSession;
  const drillkort = (
    <Kort tint eyebrow="Siste loggede økt">
      {!ds ? (
        <TomTilstand icon="activity" title="Ingen logget økt" sub="Ingen startet eller fullført plan-økt for denne spilleren ennå." />
      ) : (
        <>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{ds.title}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>
            {ds.playerName} · {ds.dateLabel} · {ds.durationMin} min
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgresjonsBar variant="segment" total={ds.plannedCount} filled={ds.doneCount} label="drills gjennomført" />
          </div>
          <div style={{ marginTop: 8 }}>
            {ds.drills.map((d, i) => (
              <Rad
                key={d.id}
                leading={<Icon name={d.done ? "check-circle" : "circle"} size={16} style={{ color: d.done ? T.up : T.mut, flex: "none" }} />}
                title={d.name}
                sub={d.planned}
                meta={d.axis ? <AkseChip a={AKSE[d.axis]} /> : undefined}
                trailing={null}
                last={i === ds.drills.length - 1}
              />
            ))}
          </div>
        </>
      )}
    </Kort>
  );

  // ── Stall-liste (etterlevelse per spiller) ────────────────────
  const StallRad = (s: StallRow, last: boolean) => {
    const valgt = s.playerId === data.selectedPlayerId;
    const pctFarge = etterlevFarge(s.band as EtterlevBand);
    const meta = [
      s.hcp != null ? `Hcp ${s.hcp}` : null,
      s.homeClub,
      s.planned > 0 ? `${s.done}/${s.planned} økter` : "Ingen plan",
    ]
      .filter(Boolean)
      .join(" · ");
    const velg = () => gaaTil(curKode, s.playerId);

    return (
      <div key={s.playerId}>
        {/* Desktop: tett rad m/ uke-sparkline */}
        <div
          onClick={velg}
          className="v2-row-h hidden md:flex"
          style={{
            alignItems: "center",
            gap: 12,
            padding: "11px 10px",
            margin: "0 -10px",
            borderRadius: 10,
            borderBottom: last ? "none" : `1px solid ${T.border}`,
            cursor: "pointer",
          }}
        >
          <AvatarInit navn={s.playerName} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.playerName}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div>
          </div>
          <div className="hidden lg:block" style={{ flex: "none" }}>
            <UkeStripe uker={s.spark.map((fill, i) => ({ label: `U${i + 1}`, done: 0, planned: 1, fill, band: s.band as EtterlevBand, isNow: i === s.spark.length - 1 }))} kompakt />
          </div>
          <span style={{ width: 52, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: s.planned > 0 ? pctFarge : T.mut, fontVariantNumeric: "tabular-nums" }}>
            {s.planned > 0 ? `${s.pct} %` : "—"}
          </span>
          <span style={{ width: 80, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, color: LOGG_FARGE[s.lastLogBand], fontVariantNumeric: "tabular-nums" }}>
            {s.lastLog}
          </span>
          <span style={{ width: 2, height: 22, borderRadius: 2, background: valgt ? T.lime : "transparent", flex: "none" }} />
        </div>

        {/* Mobil: kort-rad (sparkline droppet, sist-logget under navn) */}
        <div className="md:hidden">
          <Rad
            onClick={velg}
            leading={<AvatarInit navn={s.playerName} size={32} />}
            title={s.playerName}
            sub={`${s.planned > 0 ? `${s.done}/${s.planned} økter` : "Ingen plan"} · ${s.lastLog}`}
            meta={
              <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: s.planned > 0 ? pctFarge : T.mut, fontVariantNumeric: "tabular-nums" }}>
                {s.planned > 0 ? `${s.pct} %` : "—"}
              </span>
            }
            trailing={valgt ? <span style={{ width: 2, height: 20, borderRadius: 2, background: T.lime, flex: "none" }} /> : undefined}
            last={last}
          />
        </div>
      </div>
    );
  };

  const stalliste = (
    <Kort eyebrow="Stallen · etterlevelse" action={<Caps size={9}>{pl(data.stall.length, "spiller", "spillere")}</Caps>}>
      <div className="hidden md:block" style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 10px 8px", margin: "0 -10px", borderBottom: `1px solid ${T.borderS}` }}>
          <span style={{ width: 32, flex: "none" }} />
          <Caps size={9} style={{ flex: 1 }}>Spiller</Caps>
          <span className="hidden lg:block" style={{ flex: "none" }}><Caps size={9}>Uke for uke</Caps></span>
          <Caps size={9} style={{ width: 52, flex: "none", textAlign: "right" }}>%</Caps>
          <Caps size={9} style={{ width: 80, flex: "none", textAlign: "right" }}>Sist logg</Caps>
          <span style={{ width: 2, flex: "none" }} />
        </div>
      </div>
      {data.stall.map((s, i) => StallRad(s, i === data.stall.length - 1))}
      <div style={{ marginTop: 12 }}>
        <InnsiktChip>Sortert med de som ligger lengst bak plan øverst. Trykk en spiller for å se panelet og siste økt.</InnsiktChip>
      </div>
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {spillerpanel}
        {drillkort}
      </div>
      {stalliste}
    </div>
  );
}
