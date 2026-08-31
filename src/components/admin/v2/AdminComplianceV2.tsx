"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS Compliance — Train-lock EC-02 (PX-6, 29.08.2026).
 *
 * Fasit: designsystem/train-lock/EC-02 AS Compliance.dc.html (EC-02a
 * iPhone / EC-02b iPad / EC-02c Mac / EC-02d tom lys / EC-02e Mac lys).
 * Plan møter virkelighet på tvers av stallen, drevet av EKTE ComplianceData
 * fra loadComplianceData (Prisma). Bygget utelukkende av `TL.*`
 * (train-lock.ts) — ingen ad-hoc UI, ingen rå hex.
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
 *
 * MASTERPLAN 15.8 (31.08.2026): dette er nå «etterlevelse»-fanen på
 * `/admin/analyse` (uendret spørring/innhold — `/admin/analysere/compliance`
 * er en ren redirect dit, ?periode/?studentId bevart). `somFane` skjuler
 * egen h1+«AgencyOS»-etikett når sidens `AnalyseHode` allerede viser tittelen
 * — periodevelgeren (`PillVelger`) beholdes uendret.
 */

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import { Caps, Kort, Rad, KpiFlis, AvatarInit, AkseBar, AkseChip, RingMaaler, ProgresjonsBar, InnsiktChip, TomTilstand, PillVelger, Icon, Knapp, UkeStripe, HjelpTips, etterlevFarge, type EtterlevBand } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/format";
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
  ok: TL.ok,
  warn: TL.warn,
  bad: TL.danger,
};

const PERIODER = [
  { v: "7d", l: "7 d", days: 7 },
  { v: "30d", l: "30 d", days: 30 },
  { v: "90d", l: "90 d", days: 90 },
  { v: "365d", l: "1 år", days: 365 },
] as const;

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

const RING_ZONER = [
  { from: 0, to: 60, color: TL.danger, label: "Bak plan" },
  { from: 60, to: 75, color: TL.warn, label: "Følg opp" },
  { from: 75, to: 100, color: TL.ok, label: "I rute" },
  { from: 100, to: 100000, color: TL.fill, label: "Over plan" },
];

export function AdminComplianceV2({ data, somFane }: { data: ComplianceData; somFane?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const curKode = PERIODER.find((p) => p.days === data.windowDays)?.v ?? "30d";
  const gaaTil = (periode: string, studentId: string | null) => {
    const q = new URLSearchParams();
    q.set("periode", periode);
    if (studentId) q.set("studentId", studentId);
    router.push(`${pathname}?${q.toString()}`);
  };

  // ── Send melding direkte fra stall-raden (prefylt kontekst) ────
  const [meldingTil, setMeldingTil] = useState<string | null>(null);
  const [meldingTekst, setMeldingTekst] = useState("");
  const [meldingFeil, setMeldingFeil] = useState<string | null>(null);
  const [sendtTil, setSendtTil] = useState<string | null>(null);
  const [sender, startSending] = useTransition();

  function apneMelding(s: StallRow) {
    setMeldingFeil(null);
    setSendtTil(null);
    if (meldingTil === s.playerId) {
      setMeldingTil(null);
      return;
    }
    setMeldingTil(s.playerId);
    setMeldingTekst(
      s.staleDays != null && s.staleDays >= 7
        ? `Hei ${s.playerName.split(" ")[0]}, jeg ser du ikke har logget økt på ${s.staleDays} dager — alt i orden?`
        : s.planned > 0 && s.pct < 60
          ? `Hei ${s.playerName.split(" ")[0]}, jeg ser du ligger litt bak planen (${s.done}/${s.planned} økter) — trenger du en hånd?`
          : `Hei ${s.playerName.split(" ")[0]}, `,
    );
  }

  function sendStallMelding(playerId: string) {
    const tekst = meldingTekst.trim();
    if (!tekst) return;
    startSending(async () => {
      const res = await sendMeldingTilSpiller(playerId, tekst);
      if (res.ok) {
        setMeldingTil(null);
        setMeldingTekst("");
        setSendtTil(playerId);
      } else {
        setMeldingFeil(res.error ?? "Kunne ikke sende melding");
      }
    });
  }

  // ── Hode + periodevelger ──────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      {!somFane && (
        <div>
          <div data-paper-pattern-topp>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Compliance</h1>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
          </div>
        </div>
      )}
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
      <div data-paper-wave-h="compliance" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
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
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
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
              <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 18, color: TL.text }}>{panel.playerName}</div>
              {panelMeta && <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2 }}>{panelMeta}</div>}
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
                  <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>{panel.playerName}</div>
                  {panelMeta && <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 2 }}>{panelMeta}</div>}
                </div>
              </div>
              <div style={{ marginTop: 12, fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {panel.totalDone} av {panel.totalPlanned} økter fullført
              </div>
            </div>
          </div>

          {/* Uke-strip (8 uker) */}
          <div style={{ marginTop: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Caps size={9}>Uke for uke · fullføring</Caps>
              <HjelpTips k="planEtterlevelse" size={11} />
            </span>
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
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>{ds.title}</div>
          <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>
            {ds.playerName} · {ds.dateLabel} · {ds.durationMin} min
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgresjonsBar variant="segment" total={ds.plannedCount} filled={ds.doneCount} label="drills gjennomført" />
          </div>
          <div style={{ marginTop: 8 }}>
            {ds.drills.map((d, i) => (
              <Rad
                key={d.id}
                leading={<Icon name={d.done ? "check-circle" : "circle"} size={16} style={{ color: d.done ? TL.ok : TL.mute, flex: "none" }} />}
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
    const meldingApen = meldingTil === s.playerId;

    const meldingKnapp = (
      <span
        role="button"
        tabIndex={0}
        aria-label={`Send melding til ${s.playerName}`}
        onClick={(e) => {
          e.stopPropagation();
          apneMelding(s);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            e.preventDefault();
            apneMelding(s);
          }
        }}
        className="v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 8,
          flex: "none",
          cursor: "pointer",
          background: meldingApen ? TL.dim : "transparent",
          border: `1px solid ${meldingApen ? TL.hair : "transparent"}`,
        }}
      >
        <Icon name="message-circle" size={14} style={{ color: sendtTil === s.playerId ? TL.ok : TL.mute }} />
      </span>
    );

    const meldingsboks = meldingApen && (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "10px 12px",
          margin: "0 -10px 4px",
          borderRadius: 10,
          background: TL.dock,
          border: `1px solid ${TL.hair}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <textarea
          autoFocus
          value={meldingTekst}
          onChange={(e) => setMeldingTekst(e.target.value)}
          rows={2}
          maxLength={4000}
          style={{
            width: "100%",
            resize: "vertical",
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.text,
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: 8,
            padding: "8px 10px",
          }}
        />
        {meldingFeil && (
          <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.danger }}>{meldingFeil}</span>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost onClick={() => setMeldingTil(null)}>Avbryt</Knapp>
          <Knapp icon="send" onClick={() => sendStallMelding(s.playerId)} disabled={sender || !meldingTekst.trim()}>
            Send
          </Knapp>
        </div>
      </div>
    );

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
            borderBottom: last && !meldingApen ? "none" : `1px solid ${TL.hair}`,
            cursor: "pointer",
          }}
        >
          <AvatarInit navn={s.playerName} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.playerName}</div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div>
          </div>
          <div className="hidden lg:block" style={{ flex: "none" }}>
            <UkeStripe uker={s.spark.map((fill, i) => ({ label: `U${i + 1}`, done: 0, planned: 1, fill, band: s.band as EtterlevBand, isNow: i === s.spark.length - 1 }))} kompakt />
          </div>
          <span style={{ width: 52, flex: "none", textAlign: "right", fontFamily: TL.font.mono, fontSize: 14, fontWeight: 700, color: s.planned > 0 ? pctFarge : TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {s.planned > 0 ? `${s.pct} %` : "—"}
          </span>
          <span style={{ width: 80, flex: "none", textAlign: "right", fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 600, color: LOGG_FARGE[s.lastLogBand], fontVariantNumeric: "tabular-nums" }}>
            {s.lastLog}
          </span>
          {meldingKnapp}
          <span style={{ width: 2, height: 22, borderRadius: 2, background: valgt ? TL.fill : "transparent", flex: "none" }} />
        </div>
        <div className="hidden md:block" style={{ margin: meldingApen ? "8px -10px 0" : 0 }}>{meldingsboks}</div>

        {/* Mobil: kort-rad (sparkline droppet, sist-logget under navn) */}
        <div className="md:hidden">
          <Rad
            onClick={velg}
            leading={<AvatarInit navn={s.playerName} size={32} />}
            title={s.playerName}
            sub={`${s.planned > 0 ? `${s.done}/${s.planned} økter` : "Ingen plan"} · ${s.lastLog}`}
            meta={
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: s.planned > 0 ? pctFarge : TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {s.planned > 0 ? `${s.pct} %` : "—"}
                </span>
                {meldingKnapp}
              </span>
            }
            trailing={valgt ? <span style={{ width: 2, height: 20, borderRadius: 2, background: TL.fill, flex: "none" }} /> : undefined}
            last={last && !meldingApen}
          />
          <div style={{ margin: meldingApen ? "8px 0 4px" : 0 }}>{meldingsboks}</div>
        </div>
      </div>
    );
  };

  const stalliste = (
    <Kort eyebrow="Stallen · etterlevelse" action={<Caps size={9}>{pl(data.stall.length, "spiller", "spillere")}</Caps>}>
      <div className="hidden md:block" style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 10px 8px", margin: "0 -10px", borderBottom: `1px solid ${TL.hair}` }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {hode}
      {kpi}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: 16, alignItems: "start" }}>
        {spillerpanel}
        {drillkort}
      </div>
      {stalliste}
    </div>
  );
}
