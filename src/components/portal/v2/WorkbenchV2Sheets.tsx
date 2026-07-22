"use client";

/**
 * WORKBENCH V2 — aksjons-ark og «valgt økt»-handlinger. Utskilt fra
 * WorkbenchV2.tsx (~300-linjer-regelen): «Ny økt»-skjema, delt dag-pille-rad,
 * og flytt/slett-panelet for valgt økt i Balanse-kolonnen.
 *
 * Ærlighet (prosjekt-regel): kun v2-primitiver (T/Icon/Kort/Knapp/AkseChip) —
 * ingen rå hex, ingen ad-hoc UI utenom layout-divs (samme mønster som
 * WorkbenchV2.tsx for øvrig). Alle mutasjoner går via `actions`-prop fra
 * siden (spiller- eller coach-server-actions) — komponentene her kjenner
 * ikke Prisma.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import { T, Icon, Kort, Knapp, AkseChip, HjelpTips } from "@/components/v2";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";
import type { AkseKey } from "@/lib/v2/tokens";
import type { WeekEvent } from "@/lib/workbench/week-types";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
import type { PlanStatus } from "@/generated/prisma/client";
import { fmtVarighet, toKl } from "@/lib/workbench/v2-format";
import { resolvePlanSessionLiveHref } from "@/lib/workbench/session-actions";
import { sokOvelser, hentOktKomponist } from "@/lib/workbench/ovelse-sok";
import { useEffect } from "react";
import { planSessionStartHref, v2SessionStartHref, type V2OktUiStatus } from "@/lib/portal/session-hrefs";
import type { LFase } from "@/generated/prisma/client";
import { FASE_STEG_KEYS, lFaseTilSteg, stegTilLFase, faseLabel, type FaseSteg } from "@/lib/ak-formel-visning";

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

/** 8c.7: liten sykle-chip-stil for AK-formel-aksene i økt-komponisten. */
function chipStil(satt: boolean): CSSProperties {
  return {
    appearance: "none", display: "inline-flex", alignItems: "center", gap: 7,
    padding: "8px 12px", borderRadius: 9999, cursor: "pointer",
    background: satt ? `color-mix(in srgb, ${T.lime} 10%, ${T.panel2})` : T.panel2,
    border: `1px solid ${satt ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.border}`,
    color: satt ? T.fg : T.mut, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600,
    transition: "all 140ms",
  };
}

/** I6-hjelpere: samme kilde-/ferdig-logikk som ValgtOktSeksjon bruker ellers. */
function erPlanKilde(okt: WeekEvent): boolean {
  return (okt.source ?? "plan") === "plan";
}
function erFerdig(okt: WeekEvent): boolean {
  const st = okt.status ?? "PLANNED";
  return st === "COMPLETED" || st === "ABANDONED" || st === "SKIPPED" || st === "CANCELLED";
}
const AKSER: { v: AkseKey; l: string }[] = [
  { v: "FYS", l: "Fysisk" },
  { v: "TEK", l: "Teknikk" },
  { v: "SLAG", l: "Slag" },
  { v: "SPILL", l: "Spill" },
  { v: "TURN", l: "Turnering" },
];

/* ── Delt kontrakt: spiller- og coach-varianten av Workbench-mutasjonene ── */
export interface WorkbenchV2Actions {
  addSession: (input: {
    dayIndex: number;
    title: string;
    durMin: number;
    area: AkseKey;
    hour: number;
    minute: number;
    weekOffset?: number;
    /** AK-formel fra økt-arket (renses server-side). */
    akFormel?: { lFase?: string | null; miljo?: string | null };
    /** Driller fra økt-arket — samme kontrakt som updateSession (replace). */
    drills?: import("@/lib/workbench/session-update").OktDrillInput[];
  }) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
  moveSession: (
    sessionId: string,
    dayIndex: number,
    weekOffset?: number,
  ) => Promise<{ ok: boolean; error?: string }>;
  removeSession: (sessionId: string) => Promise<{ ok: boolean; error?: string }>;
  /** I6: inline-redigering av valgt økt (tittel/akse/tid/varighet). */
  /** 8c.5+8c.7: universalpopupen — patch følger SessionUpdateInput (inkl. AK-formel + drills). */
  updateSession?: (
    sessionId: string,
    patch: import("@/lib/workbench/session-update").SessionUpdateInput,
  ) => Promise<{ ok: boolean; error?: string }>;
  publish: () => Promise<{ ok: boolean; error?: string; status?: PlanStatus }>;
  /** WB4: diff mot forrige publisering — vises i bekreft-modalen før publish. */
  publishDiff?: () => Promise<{ ok: boolean; diff?: import("@/lib/workbench/publish-actions").PubliserDiff; error?: string }>;
  /** 8c.6: coach-notat i inspektøren (kun coach — bind-es bare i admin-siden). */
  coachNotat?: {
    hent: () => Promise<{ ok: boolean; notater?: { id: string; content: string; createdAt: string }[] }>;
    lagre: (tekst: string) => Promise<{ ok: boolean; error?: string }>;
  };
  /** 8c.4: Cmd+D — dupliser økt til neste dag samme tid (Notion-stil). */
  duplicateSession?: (sessionId: string) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
  /** 8c.2: årsplan-canvaset — opprett/oppdater og slett periodeblokker. */
  lagrePeriode?: (input: import("@/lib/workbench/perioder").PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; periodeId?: string; error?: string }>;
  slettPeriode?: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Kun spiller-rolle. Utelatt → knappen skjules. */
  suggestWeek?: (weekOffset?: number) => Promise<{
    ok: boolean;
    suggestions?: WeekSuggestion[];
    usedAi?: boolean;
    message?: string;
  }>;
  /** Legg en valgt forslag-variant inn i uka. Kreves for ForslagArk. */
  applySuggestion?: (
    variant: WeekSuggestion,
    weekOffset?: number,
  ) => Promise<{ ok: boolean; count?: number; error?: string }>;
  /** Kun coach-rolle. Utelatt → knappen skjules. */
  duplicateWeek?: (weekOffset?: number) => Promise<{ ok: boolean; count?: number; error?: string }>;
  /** G7/fasit: legg inn mal-uke 1 fra en godkjent planmal (coldstart + bibliotek). */
  /**
   * B40 §4 (fasilitetskonsekvens): `justeringer` er myke avviks-meldinger for
   * økter adaptTemplateWeek droppet pga. manglende fasilitet — se
   * apply-template-actions.ts. Må vises til brukeren, ikke bare telles.
   */
  applyTemplate?: (templateId: string) => Promise<{ ok: boolean; error?: string; justeringer?: string[] }>;
  /** Runde 2: søk i spillerens tekniske oppgaver for "koble til oppgave"-velgeren på drill-rader. */
  searchTeknisk?: (query: string) => Promise<{ id: string; tittel: string; pNummer: string }[]>;
}

/* ── Delt dag-pille-rad (7 dager, Man–Søn) ─────────────── */
export function DagPillRow({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {DAGER.map((d, i) => {
        const on = value === i;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onChange(i)}
            style={{
              appearance: "none",
              cursor: disabled ? "default" : "pointer",
              flex: 1,
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              padding: "7px 0",
              borderRadius: 8,
              border: `1px solid ${on ? "transparent" : T.border}`,
              background: on ? T.lime : T.panel2,
              color: on ? T.onLime : T.fg2,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function Felt({ label, hjelp, children }: { label: string; hjelp?: HjelpNokkel; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.mut,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {label}
        {hjelp && <HjelpTips k={hjelp} size={11} />}
      </span>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  appearance: "none",
  background: T.panel2,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "9px 11px",
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  outline: "none",
};

/* ── Felles økt-ark — «Ny økt» og «Rediger økt» er LIKE (Anders, 2026-07-13) ──
   Samme felter i begge moduser: tittel, dag, tid, varighet, pyramide-område,
   L-fase, miljø og driller (søk i banken + minutter/sett/reps/nivå). */

export type OktArkDrill = {
  exerciseId?: string;
  navn: string;
  minutter: number | null;
  sett: number | null;
  reps: number | null;
  nivaa: "uten" | "lav" | "vanlig";
  /** Kobling til teknisk-plan-oppgave — reps logges automatisk mot den ved fullføring. */
  positionTaskId?: string;
  positionTaskTittel?: string;
};

export interface NyOktInput {
  title: string;
  dayIndex: number;
  akse: AkseKey;
  hour: number;
  minute: number;
  durMin: number;
  lFase: string | null;
  miljo: string | null;
  drills: OktArkDrill[];
  /** Totalt antall forekomster (1 = kun denne uka). */
  gjentaUker: number;
  /** Steg mellom forekomster i uker (1 = hver uke, 2 = annenhver uke). */
  gjentaStegUker: number;
}
export interface NyOktArkProps {
  defaultDayIndex: number;
  /** «HH:MM» fra trykk på tom luke i tidslinja (I1). */
  defaultTid?: string;
  /** Forhåndsutfylling fra bibliotek-brikke (ett-klikks «legg til»). */
  defaultTitle?: string;
  defaultAkse?: AkseKey;
  defaultDurMin?: number;
  /** Biblioteks-øktas driller — vises og kan justeres før opprettelse. */
  defaultDrills?: OktArkDrill[];
  onLukk: () => void;
  onOpprett: (input: NyOktInput) => Promise<{ ok: boolean; error?: string }>;
  searchTeknisk?: (query: string) => Promise<{ id: string; tittel: string; pNummer: string }[]>;
}

export function NyOktArk({ defaultDayIndex, defaultTid, defaultTitle, defaultAkse, defaultDurMin, defaultDrills, onLukk, onOpprett, searchTeknisk }: NyOktArkProps) {
  return (
    <OktArkSkjema
      overskrift="Ny økt"
      submitLabel="Opprett økt"
      lagrerLabel="Oppretter…"
      submitIcon="plus"
      searchTeknisk={searchTeknisk}
      initial={{
        title: defaultTitle ?? "",
        dayIndex: defaultDayIndex,
        tid: defaultTid ?? "09:00",
        durMin: defaultDurMin ?? 60,
        akse: defaultAkse ?? "TEK",
        lFase: null,
        miljo: null,
        drills: defaultDrills ?? [],
      }}
      tittelPlaceholder="F.eks. Wedge 60–100 m"
      visGjenta
      onLukk={onLukk}
      onSubmit={(s) =>
        onOpprett({
          title: s.title.trim() || "Ny økt",
          dayIndex: s.dayIndex,
          akse: s.akse,
          hour: s.hour,
          minute: s.minute,
          durMin: s.durMin,
          lFase: s.lFase,
          miljo: s.miljo,
          drills: s.drills,
          gjentaUker: s.gjentaUker,
          gjentaStegUker: s.gjentaStegUker,
        })
      }
    />
  );
}

type OktArkState = {
  title: string;
  dayIndex: number;
  tid: string;
  durMin: number;
  akse: AkseKey;
  lFase: string | null;
  miljo: string | null;
  drills: OktArkDrill[];
};

const MILJOER = ["M0", "M1", "M2", "M3", "M4", "M5"] as const;

function OktArkSkjema({
  overskrift,
  submitLabel,
  lagrerLabel,
  submitIcon,
  initial,
  tittelPlaceholder,
  visGjenta,
  onLukk,
  onSubmit,
  searchTeknisk,
}: {
  overskrift: string;
  submitLabel: string;
  lagrerLabel: string;
  submitIcon: "plus" | "check";
  initial: OktArkState;
  tittelPlaceholder?: string;
  /** Ny økt: vis «Gjenta ukentlig»-velgeren (kalendermønster). Rediger: skjult. */
  visGjenta?: boolean;
  onLukk: () => void;
  onSubmit: (state: OktArkState & { hour: number; minute: number; gjentaUker: number; gjentaStegUker: number }) => Promise<{ ok: boolean; error?: string }>;
  searchTeknisk?: (query: string) => Promise<{ id: string; tittel: string; pNummer: string }[]>;
}) {
  const [title, setTitle] = useState(initial.title);
  const [dayIndex, setDayIndex] = useState(initial.dayIndex);
  const [tid, setTid] = useState(initial.tid);
  const [durMin, setDurMin] = useState(initial.durMin);
  const [akse, setAkse] = useState<AkseKey>(initial.akse);
  const [lFase, setLFase] = useState<string | null>(initial.lFase);
  const [miljo, setMiljo] = useState<string | null>(initial.miljo);
  const [drills, setDrills] = useState<OktArkDrill[]>(initial.drills);
  /** Av | hver uke | annenhver uke (Apple/Notion-mønster). */
  const [gjentaModus, setGjentaModus] = useState<"av" | "uke" | "2uker">("av");
  /** Antall ganger totalt når gjenta er på (inkl. første). */
  const [gjentaAntall, setGjentaAntall] = useState(4);
  const [drillSok, setDrillSok] = useState("");
  const [drillTreff, setDrillTreff] = useState<{ id: string; name: string; pyramidArea: string }[]>([]);
  const [manuellApen, setManuellApen] = useState(false);
  const [manuellNavn, setManuellNavn] = useState("");
  const [manuellMin, setManuellMin] = useState<number | "">("");
  const [manuellSett, setManuellSett] = useState<number | "">("");
  const [manuellReps, setManuellReps] = useState<number | "">("");
  const [oppgaveKobler, setOppgaveKobler] = useState<number | null>(null);
  const [oppgaveSok, setOppgaveSok] = useState("");
  const [oppgaveTreff, setOppgaveTreff] = useState<{ id: string; tittel: string; pNummer: string }[]>([]);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const gjentaUker = gjentaModus === "av" ? 1 : Math.max(2, Math.min(26, gjentaAntall));
  const gjentaStegUker = gjentaModus === "2uker" ? 2 : 1;

  useEffect(() => {
    const q = drillSok.trim();
    const t = window.setTimeout(() => {
      if (q.length < 2) { setDrillTreff([]); return; }
      sokOvelser(q, akse).then(setDrillTreff).catch(() => setDrillTreff([]));
    }, q.length < 2 ? 0 : 250);
    return () => window.clearTimeout(t);
  }, [drillSok, akse]);

  useEffect(() => {
    if (!searchTeknisk || oppgaveKobler === null) return;
    const q = oppgaveSok.trim();
    const t = window.setTimeout(() => {
      searchTeknisk(q).then(setOppgaveTreff).catch(() => setOppgaveTreff([]));
    }, q.length < 2 ? 0 : 250);
    return () => window.clearTimeout(t);
  }, [oppgaveSok, oppgaveKobler, searchTeknisk]);

  const sykleLFase = () => {
    // Sykler gjennom de 3 visnings-stegene (Uten ball / Lav hastighet / Auto) og
    // lagrer representativ L-fase. Bevarer motor-satt finkornet verdi i gruppen.
    const rekkefolge: (FaseSteg | null)[] = [null, ...FASE_STEG_KEYS];
    const naa = lFaseTilSteg(lFase as LFase | null);
    const i = rekkefolge.indexOf(naa);
    const neste = rekkefolge[(i + 1) % rekkefolge.length];
    setLFase(stegTilLFase(neste, lFase as LFase | null));
  };
  const sykleMiljo = () => {
    const i = miljo ? MILJOER.indexOf(miljo as (typeof MILJOER)[number]) : -1;
    setMiljo(i === MILJOER.length - 1 ? null : MILJOER[i + 1]);
  };
  const sykleAkse = () => {
    const i = AKSER.findIndex((a) => a.v === akse);
    setAkse(AKSER[(i + 1) % AKSER.length].v);
  };
  const akseLabel = AKSER.find((a) => a.v === akse)?.l ?? akse;

  const submit = async () => {
    if (lagrer) return;
    const [hStr, mStr] = tid.split(":");
    const hour = Math.max(0, Math.min(23, Number(hStr) || 0));
    const minute = Math.max(0, Math.min(59, Number(mStr) || 0));
    setLagrer(true);
    setFeil(null);
    const res = await onSubmit({
      title,
      dayIndex,
      tid,
      durMin: Math.max(5, Math.min(480, durMin)),
      akse,
      lFase,
      miljo,
      drills,
      hour,
      minute,
      gjentaUker: visGjenta ? gjentaUker : 1,
      gjentaStegUker: visGjenta ? gjentaStegUker : 1,
    });
    setLagrer(false);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke lagre økten.");
  };

  const leggTilManuell = () => {
    const navn = manuellNavn.trim();
    if (!navn) return;
    setDrills([
      ...drills,
      {
        navn,
        minutter: manuellMin === "" ? null : Number(manuellMin),
        sett: manuellSett === "" ? null : Number(manuellSett),
        reps: manuellReps === "" ? null : Number(manuellReps),
        nivaa: "vanlig",
      },
    ]);
    setManuellNavn("");
    setManuellMin("");
    setManuellSett("");
    setManuellReps("");
    setManuellApen(false);
  };

  // Kalendermønster: beregnet sluttid + varighet i klartekst («16:00 → 17:30 · 1,5 t»).
  const sluttTid = (() => {
    const [hStr, mStr] = tid.split(":");
    const start = (Number(hStr) || 0) * 60 + (Number(mStr) || 0);
    const slutt = Math.min(24 * 60 - 1, start + durMin);
    return `${String(Math.floor(slutt / 60)).padStart(2, "0")}:${String(slutt % 60).padStart(2, "0")}`;
  })();
  const dagNavn = DAGER[dayIndex] ?? "Dag";
  const gjentaOppsummering =
    gjentaModus === "av"
      ? `${dagNavn} ${tid} · én gang`
      : gjentaModus === "uke"
        ? `${dagNavn} ${tid} · hver uke · ${gjentaAntall} ganger`
        : `${dagNavn} ${tid} · annenhver uke · ${gjentaAntall} ganger`;
  const effektivSubmitLabel =
    visGjenta && gjentaModus !== "av" ? `Opprett ${gjentaAntall} økter` : submitLabel;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={lagrer ? undefined : onLukk} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
      <div
        role="dialog"
        aria-label={overskrift}
        className="v2-sheet-in"
        style={{
          position: "relative",
          width: "min(880px, calc(100vw - 32px))",
          maxHeight: "92vh",
          overflowY: "auto",
          background: T.panel,
          border: `1px solid ${T.borderS}`,
          borderRadius: 20,
          padding: "22px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>{overskrift}</h2>
          <button onClick={onLukk} className="v2-press" aria-label="Lukk" style={{ background: T.panel3, border: `1px solid ${T.border}`, borderRadius: 9, color: T.mut, cursor: "pointer", padding: 6, display: "inline-flex" }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={tittelPlaceholder}
          maxLength={120}
          autoFocus
          aria-label="Tittel"
          style={{ appearance: "none", width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, borderRadius: 0, padding: "12px 0 12px", marginTop: 8, color: T.fg, fontFamily: T.disp, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", outline: "none" }}
        />

        {/* Desktop: to kolonner · mobil: stack */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginTop: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Felt label="Dag">
              <DagPillRow value={dayIndex} onChange={setDayIndex} disabled={lagrer} />
            </Felt>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Felt label="Klokkeslett">
                <input type="time" value={tid} onChange={(e) => setTid(e.target.value)} style={inputStyle} />
              </Felt>
              <Felt label="Varighet (min)">
                <input type="number" min={5} max={480} step={5} value={durMin} onChange={(e) => setDurMin(Number(e.target.value) || 60)} style={inputStyle} />
              </Felt>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{tid} → {sluttTid} · {fmtVarighet(durMin)}</span>
              <span style={{ display: "inline-flex", gap: 4, marginLeft: "auto" }}>
                {[30, 45, 60, 90, 120].map((m) => (
                  <button key={m} type="button" onClick={() => setDurMin(m)} className="v2-press" aria-label={`${m} minutter`} style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 9, fontWeight: 700, padding: "4px 8px", borderRadius: 9999, background: durMin === m ? T.lime : T.panel2, border: `1px solid ${durMin === m ? "transparent" : T.border}`, color: durMin === m ? T.onLime : T.fg2 }}>
                    {m}
                  </button>
                ))}
              </span>
            </div>

            {visGjenta && (
              <Felt label="Gjenta" hjelp="gjentaOkt">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(
                    [
                      { v: "av" as const, l: "Av" },
                      { v: "uke" as const, l: "Hver uke" },
                      { v: "2uker" as const, l: "Hver 2. uke" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => {
                        setGjentaModus(o.v);
                        if (o.v !== "av" && gjentaAntall < 2) setGjentaAntall(4);
                      }}
                      className="v2-press v2-focus"
                      disabled={lagrer}
                      aria-pressed={gjentaModus === o.v}
                      style={{
                        appearance: "none",
                        cursor: "pointer",
                        fontFamily: T.ui,
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: "8px 14px",
                        borderRadius: 9999,
                        background: gjentaModus === o.v ? T.lime : T.panel2,
                        border: `1px solid ${gjentaModus === o.v ? "transparent" : T.border}`,
                        color: gjentaModus === o.v ? T.onLime : T.fg2,
                      }}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                {gjentaModus !== "av" && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Slutter etter antall ganger</span>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {[2, 4, 8, 12, 16].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setGjentaAntall(n)}
                          className="v2-press"
                          aria-pressed={gjentaAntall === n}
                          style={{
                            appearance: "none",
                            cursor: "pointer",
                            fontFamily: T.mono,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "6px 11px",
                            borderRadius: 9999,
                            background: gjentaAntall === n ? T.panel3 : T.panel2,
                            border: `1px solid ${gjentaAntall === n ? T.lime : T.border}`,
                            color: T.fg,
                          }}
                        >
                          {n}×
                        </button>
                      ))}
                    </div>
                    <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.4 }}>{gjentaOppsummering}</span>
                  </div>
                )}
                {gjentaModus === "av" && (
                  <span style={{ display: "block", marginTop: 8, fontFamily: T.ui, fontSize: 12, color: T.mut }}>{gjentaOppsummering}</span>
                )}
              </Felt>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Felt label="Område — trykk for å bytte" hjelp="pyramideAkse">
              <button
                type="button"
                onClick={sykleAkse}
                className="v2-press v2-focus"
                data-wb-syklechip
                aria-label={`Pyramideområde: ${akseLabel}. Trykk for neste.`}
                style={{ appearance: "none", display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", padding: "9px 14px", borderRadius: 9999, background: `color-mix(in srgb, ${T.ax[akse]} 14%, ${T.panel2})`, border: `1px solid color-mix(in srgb, ${T.ax[akse]} 55%, transparent)`, cursor: "pointer", transition: "all 140ms" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: T.ax[akse] }} />
                <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{akseLabel}</span>
                <Icon name="refresh-cw" size={12} style={{ color: T.mut }} />
              </button>
            </Felt>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Felt label="Læringsfase — trykk for å bytte" hjelp="lFase">
                <button type="button" onClick={sykleLFase} className="v2-press v2-focus" data-wb-lfasechip data-klar style={chipStil(!!lFase)}>
                  {lFase ? faseLabel(lFase as LFase) : "Ikke satt"}
                  <Icon name="refresh-cw" size={11} style={{ color: T.mut }} />
                </button>
              </Felt>
              <Felt label="Miljø — trykk for å bytte" hjelp="miljo">
                <button type="button" onClick={sykleMiljo} className="v2-press v2-focus" data-wb-miljochip style={chipStil(!!miljo)}>
                  {miljo ?? "Ikke satt"}
                  <Icon name="refresh-cw" size={11} style={{ color: T.mut }} />
                </button>
              </Felt>
            </div>

            {/* Driller: + manuell først, søk sekundært */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
                  Driller ({drills.length})
                </span>
                <button
                  type="button"
                  onClick={() => { setManuellApen(true); setDrillSok(""); }}
                  className="v2-press v2-focus"
                  data-wb-egen-drill
                  aria-label="Legg til manuell øvelse"
                  title="Manuell øvelse"
                  style={{
                    appearance: "none",
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: T.lime,
                    border: "none",
                    color: T.onLime,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="plus" size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {drills.map((d, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div data-wb-drillrad style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
                      <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.navn}</span>
                      <input type="number" min={1} max={240} placeholder="min" value={d.minutter ?? ""} onChange={(e) => setDrills(drills.map((x, j) => j === i ? { ...x, minutter: e.target.value ? Number(e.target.value) : null } : x))} style={{ ...inputStyle, width: 56, padding: "5px 7px", fontSize: 11 }} aria-label="Minutter" />
                      <input type="number" min={1} max={50} placeholder="sett" value={d.sett ?? ""} onChange={(e) => setDrills(drills.map((x, j) => j === i ? { ...x, sett: e.target.value ? Number(e.target.value) : null } : x))} style={{ ...inputStyle, width: 50, padding: "5px 7px", fontSize: 11 }} aria-label="Sett" />
                      <input type="number" min={1} max={500} placeholder="reps" value={d.reps ?? ""} onChange={(e) => setDrills(drills.map((x, j) => j === i ? { ...x, reps: e.target.value ? Number(e.target.value) : null } : x))} style={{ ...inputStyle, width: 54, padding: "5px 7px", fontSize: 11 }} aria-label="Reps" />
                      <button type="button" onClick={() => setDrills(drills.map((x, j) => j === i ? { ...x, nivaa: x.nivaa === "uten" ? "lav" : x.nivaa === "lav" ? "vanlig" : "uten" } : x))} className="v2-press" title="Intensitet — trykk for å bytte" style={{ appearance: "none", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, padding: "5px 8px", borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg2, cursor: "pointer", flex: "none" }}>
                        {d.nivaa === "uten" ? "uten ball" : d.nivaa === "lav" ? "lav fart" : "vanlig"}
                      </button>
                      <button type="button" onClick={() => setDrills(drills.filter((_, j) => j !== i))} className="v2-press" aria-label="Fjern drill" style={{ appearance: "none", background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 2, flex: "none" }}>
                        <Icon name="x" size={13} />
                      </button>
                    </div>
                    {searchTeknisk && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 4 }}>
                        <button
                          type="button"
                          className="v2-press"
                          onClick={() => { setOppgaveKobler(oppgaveKobler === i ? null : i); setOppgaveSok(""); setOppgaveTreff([]); }}
                          style={{ appearance: "none", display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: T.mono, fontSize: 9.5, color: d.positionTaskId ? T.lime : T.mut }}
                        >
                          <Icon name="link-2" size={10} />
                          {d.positionTaskId ? `Koblet: ${d.positionTaskTittel ?? "teknisk oppgave"}` : "Koble til teknisk oppgave"}
                        </button>
                        {d.positionTaskId && (
                          <button type="button" className="v2-press" aria-label="Fjern kobling" onClick={() => setDrills(drills.map((x, j) => j === i ? { ...x, positionTaskId: undefined, positionTaskTittel: undefined } : x))} style={{ appearance: "none", background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 0 }}>
                            <Icon name="x" size={10} />
                          </button>
                        )}
                      </div>
                    )}
                    {oppgaveKobler === i && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 4 }}>
                        <input
                          value={oppgaveSok}
                          onChange={(e) => setOppgaveSok(e.target.value)}
                          placeholder="Søk i tekniske oppgaver…"
                          style={{ ...inputStyle, padding: "6px 9px", fontSize: 11 }}
                          autoFocus
                        />
                        {oppgaveTreff.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className="v2-press"
                            onClick={() => {
                              setDrills(drills.map((x, j) => j === i ? { ...x, positionTaskId: t.id, positionTaskTittel: t.tittel } : x));
                              setOppgaveKobler(null);
                            }}
                            style={{ appearance: "none", textAlign: "left", padding: "6px 9px", borderRadius: 8, background: T.panel3, border: `1px dashed ${T.borderS}`, color: T.fg, fontFamily: T.ui, fontSize: 11, cursor: "pointer" }}
                          >
                            {t.pNummer} · {t.tittel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {manuellApen && (
                  <div
                    data-wb-manuell-drill
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      background: `color-mix(in srgb, ${T.lime} 8%, ${T.panel2})`,
                      border: `1px solid color-mix(in srgb, ${T.lime} 35%, transparent)`,
                    }}
                  >
                    <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.fg }}>Ny manuell øvelse</span>
                    <input
                      value={manuellNavn}
                      onChange={(e) => setManuellNavn(e.target.value)}
                      placeholder="Navn på øvelse"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); leggTilManuell(); } }}
                      style={inputStyle}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <input type="number" min={1} max={240} placeholder="Min" value={manuellMin} onChange={(e) => setManuellMin(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
                      <input type="number" min={1} max={50} placeholder="Sett" value={manuellSett} onChange={(e) => setManuellSett(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
                      <input type="number" min={1} max={500} placeholder="Reps" value={manuellReps} onChange={(e) => setManuellReps(e.target.value ? Number(e.target.value) : "")} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Knapp ghost onClick={() => setManuellApen(false)}>Avbryt</Knapp>
                      <Knapp icon="plus" onClick={leggTilManuell} disabled={!manuellNavn.trim()}>Legg til</Knapp>
                    </div>
                  </div>
                )}

                <input
                  value={drillSok}
                  onChange={(e) => setDrillSok(e.target.value)}
                  placeholder="Søk i øvelsesbanken…"
                  style={inputStyle}
                  data-wb-drillsok
                />
                {drillSok.trim().length >= 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {drillTreff.map((t) => (
                      <button key={t.id} type="button" className="v2-press" onClick={() => { setDrills([...drills, { exerciseId: t.id, navn: t.name, minutter: null, sett: null, reps: null, nivaa: "vanlig" }]); setDrillSok(""); }} style={{ appearance: "none", textAlign: "left", padding: "7px 10px", borderRadius: 9, background: T.panel2, border: `1px dashed ${T.borderS}`, color: T.fg, fontFamily: T.ui, fontSize: 12, cursor: "pointer" }}>
                        + {t.name} <span style={{ color: T.mut, fontFamily: T.mono, fontSize: 9 }}>({t.pyramidArea})</span>
                      </button>
                    ))}
                    {drillTreff.length === 0 && (
                      <button type="button" className="v2-press" onClick={() => { setManuellNavn(drillSok.trim()); setManuellApen(true); setDrillSok(""); }} style={{ appearance: "none", textAlign: "left", padding: "7px 10px", borderRadius: 9, background: `color-mix(in srgb, ${T.lime} 8%, ${T.panel2})`, border: `1px dashed color-mix(in srgb, ${T.lime} 40%, transparent)`, color: T.fg, fontFamily: T.ui, fontSize: 12, cursor: "pointer" }}>
                        + Opprett manuell: «{drillSok.trim()}»
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down, display: "block", marginTop: 10 }}>{feil}</span>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Knapp ghost onClick={onLukk} disabled={lagrer}>Avbryt</Knapp>
          <Knapp icon={submitIcon} onClick={submit} disabled={lagrer}>{lagrer ? lagrerLabel : effektivSubmitLabel}</Knapp>
        </div>
      </div>
    </div>
  );
}

/* ── Ukeforslag — 3 variantkort (konservativ/standard/aggressiv) ──
   AI-forslag er alltid en anbefaling spilleren aktivt tar i bruk — aldri
   auto-lagt inn. usedAi=false vises ærlig som standardforslag uten AI. */
const VARIANT_LABEL: Record<WeekSuggestion["variant"], string> = {
  konservativ: "Konservativ",
  standard: "Standard",
  aggressiv: "Aggressiv",
};

export interface ForslagArkProps {
  suggestions: WeekSuggestion[];
  usedAi: boolean;
  onLukk: () => void;
  /** Kalles med valgt variant; parent kaller applySuggestion + refresh. */
  onBruk: (variant: WeekSuggestion) => Promise<{ ok: boolean; count?: number; error?: string }>;
}

export function ForslagArk({ suggestions, usedAi, onLukk, onBruk }: ForslagArkProps) {
  const [brukes, setBrukes] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const bruk = async (variant: WeekSuggestion) => {
    if (brukes) return;
    setBrukes(variant.variant);
    setFeil(null);
    const res = await onBruk(variant);
    setBrukes(null);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke legge inn forslaget.");
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={brukes ? undefined : onLukk}
        style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      />
      <div
        className="v2-sheet-in"
        style={{
          position: "relative", width: "min(760px, 100%)", maxHeight: "88vh", overflowY: "auto",
          background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
              Forslag til uka
            </h2>
            <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, display: "block", marginTop: 4 }}>
              {usedAi
                ? "Tre varianter basert på nivået ditt, fokusområdet og planen din. Velg den som passer uka."
                : "Standardforslag (uten AI) — tre varianter du kan bruke som utgangspunkt."}
            </span>
          </div>
          <button
            type="button"
            onClick={onLukk}
            disabled={brukes != null}
            style={{
              appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8,
              background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex",
              alignItems: "center", justifyContent: "center", flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          {suggestions.map((s) => (
            <Kort key={s.variant} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>
                  {VARIANT_LABEL[s.variant]}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
                  {s.totalSessions} økter
                </span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fg2 }}>{s.focusBlend}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {s.sessions.map((okt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, width: 26, flex: "none" }}>
                      {DAGER[okt.day] ?? ""}
                    </span>
                    <AkseChip a={okt.pyramidArea} />
                    <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {okt.title}
                    </span>
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, flex: "none" }}>
                      {fmtVarighet(okt.durationMin)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <Knapp
                  icon="plus"
                  onClick={() => bruk(s)}
                  disabled={brukes != null}
                >
                  {brukes === s.variant ? "Legger inn…" : "Bruk forslag"}
                </Knapp>
              </div>
            </Kort>
          ))}
        </div>

        {feil && (
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down, display: "block", marginTop: 12 }}>
            {feil}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Valgt økt — flytt/slett-panel (Balanse-kolonnen) ──── */
export interface ValgtOktSeksjonProps {
  okt: WeekEvent;
  /** Dagindeks (0=man) for økten — vises i slett-popupen. -1/undefined = utelates. */
  dag?: number;
  actions?: WorkbenchV2Actions;
  weekOffset: number;
  /** Kalles etter vellykket flytt/sletting — parent kaller router.refresh(). */
  onEndret: () => void;
}
export function ValgtOktSeksjon({ okt, dag, actions, weekOffset, onEndret }: ValgtOktSeksjonProps) {
  const router = useRouter();
  const [flyttApen, setFlyttApen] = useState(false);
  const [flyttLoading, setFlyttLoading] = useState(false);
  // I6: inline-redigering — hvilket felt er i redigeringsmodus.
  const [rediger, setRediger] = useState<null | "tittel" | "akse" | "tid">(null);
  const [tittelUtkast, setTittelUtkast] = useState(okt.ttl);
  const [tidUtkast, setTidUtkast] = useState(toKl(okt.h, okt.m));
  const [durUtkast, setDurUtkast] = useState(okt.durMin);
  const [lagrerFelt, setLagrerFelt] = useState(false);
  const kanRedigere = !!actions?.updateSession && !!okt.id && erPlanKilde(okt) && !erFerdig(okt);

  const lagreFelt = async (patch: Parameters<NonNullable<WorkbenchV2Actions["updateSession"]>>[1]) => {
    if (!actions?.updateSession || !okt.id || lagrerFelt) return;
    setLagrerFelt(true);
    setFeil(null);
    const res = await actions.updateSession(okt.id, patch);
    setLagrerFelt(false);
    if (res.ok) {
      setRediger(null);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke lagre endringen.");
    }
  };
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [sletterLoading, setSletterLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  // Kilde styrer handlingene: flytt/slett-actions slår opp TrainingPlanSession
  // og ville feilet på en v2-id; v2-økter lenkes rett til live-flyten i stedet.
  const erPlan = (okt.source ?? "plan") === "plan";
  const status = okt.status ?? "PLANNED";
  const ferdig = status === "COMPLETED" || status === "ABANDONED" || status === "SKIPPED" || status === "CANCELLED";

  const startOkt = async () => {
    if (!okt.id || startLoading) return;
    setStartLoading(true);
    setFeil(null);
    const res = await resolvePlanSessionLiveHref(okt.id);
    setStartLoading(false);
    if (res.ok && res.href) router.push(res.href);
    else setFeil(res.error ?? "Kunne ikke starte økten.");
  };

  const flytt = async (dayIndex: number) => {
    if (!actions || !okt.id) return;
    setFlyttLoading(true);
    setFeil(null);
    const res = await actions.moveSession(okt.id, dayIndex, weekOffset);
    setFlyttLoading(false);
    if (res.ok) {
      setFlyttApen(false);
      onEndret();
    } else {
      setFeil(res.error ?? "Kunne ikke flytte økten.");
    }
  };

  // WB5 (fasit G4): øktas driller i inspektøren — navn + dose i rekkefølge.
  const [oktDrills, setOktDrills] = useState<{ navn: string; minutter: number | null; sett: number | null; reps: number | null; nivaa: string }[] | null>(null);
  // AK-formel på valgt økt (læringsfase + miljø) — first-class i Balanse-panelet.
  const [oktFormel, setOktFormel] = useState<{ lFase: string | null; miljo: string | null } | null>(null);
  useEffect(() => {
    let aktiv = true;
    if (!okt.id || !erPlanKilde(okt)) {
      // Asynkront (mikrotask) — regelen forbyr synkron setState i effekt-kropp.
      Promise.resolve().then(() => {
        if (aktiv) {
          setOktDrills(null);
          setOktFormel(null);
        }
      });
      return () => { aktiv = false; };
    }
    hentOktKomponist(okt.id).then((res) => {
      if (!aktiv) return;
      if (res.ok) {
        setOktDrills(res.drills ?? []);
        setOktFormel({ lFase: res.lFase ?? null, miljo: res.miljo ?? null });
      } else {
        setOktDrills(null);
        setOktFormel(null);
      }
    });
    return () => { aktiv = false; };
    // dep på hele okt-objektet: refetch etter router.refresh (nye objekter),
    // ellers vises ikke driller lagt til via biblioteket før ny økt velges.
  }, [okt]);

  const [dupliserer, setDupliserer] = useState(false);
  const dupliser = async () => {
    if (!actions?.duplicateSession || !okt.id || dupliserer) return;
    setDupliserer(true);
    setFeil(null);
    const res = await actions.duplicateSession(okt.id);
    setDupliserer(false);
    if (res.ok) onEndret();
    else setFeil(res.error ?? "Kunne ikke duplisere økten.");
  };

  const slett = async () => {
    if (!actions || !okt.id) return;
    setSletterLoading(true);
    setFeil(null);
    const res = await actions.removeSession(okt.id);
    setSletterLoading(false);
    setBekreftSlett(false);
    if (res.ok) onEndret();
    else setFeil(res.error ?? "Kunne ikke slette økten.");
  };

  return (
    <Kort tint pad="13px 14px">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {kanRedigere ? (
          <button
            type="button"
            onClick={() => setRediger(rediger === "akse" ? null : "akse")}
            title="Trykk for å endre område"
            className="v2-press v2-focus"
            style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", display: "inline-flex" }}
          >
            <AkseChip a={okt.eb as AkseKey} />
          </button>
        ) : (
          <AkseChip a={okt.eb as AkseKey} />
        )}
      </div>
      {rediger === "akse" && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {AKSER.map((a) => (
            <button
              key={a.v}
              type="button"
              disabled={lagrerFelt}
              onClick={() => lagreFelt({ pyramidArea: a.v })}
              style={{
                appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 9999,
                border: `1px solid ${okt.eb === a.v ? "transparent" : T.border}`,
                background: okt.eb === a.v ? T.lime : T.panel2, color: okt.eb === a.v ? T.onLime : T.fg2,
                fontFamily: T.ui, fontSize: 11, fontWeight: 600, opacity: lagrerFelt ? 0.5 : 1,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: okt.eb === a.v ? T.onLime : T.ax[a.v] }} />
              {a.l}
            </button>
          ))}
        </div>
      )}
      {rediger === "tittel" ? (
        <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
          <input
            autoFocus
            value={tittelUtkast}
            maxLength={120}
            disabled={lagrerFelt}
            onChange={(e) => setTittelUtkast(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") lagreFelt({ title: tittelUtkast.trim() || okt.ttl }); if (e.key === "Escape") setRediger(null); }}
            style={{ ...inputStyle, fontFamily: T.disp, fontSize: 15, fontWeight: 700 }}
          />
          <Knapp icon="check" disabled={lagrerFelt} onClick={() => lagreFelt({ title: tittelUtkast.trim() || okt.ttl })}>{""}</Knapp>
        </div>
      ) : (
        <div
          onClick={kanRedigere ? () => { setTittelUtkast(okt.ttl); setRediger("tittel"); } : undefined}
          title={kanRedigere ? "Trykk for å endre tittel" : undefined}
          style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, marginTop: 9, cursor: kanRedigere ? "text" : "default" }}
        >
          {okt.ttl}
        </div>
      )}
      {rediger === "tid" ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
          <input type="time" value={tidUtkast} disabled={lagrerFelt} onChange={(e) => setTidUtkast(e.target.value)} style={{ ...inputStyle, width: 110 }} />
          <input type="number" min={5} max={480} step={5} value={durUtkast} disabled={lagrerFelt} onChange={(e) => setDurUtkast(Math.max(5, Math.min(480, Number(e.target.value) || okt.durMin)))} style={{ ...inputStyle, width: 84 }} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>min</span>
          <Knapp
            icon="check"
            disabled={lagrerFelt}
            onClick={() => {
              const [h, m] = tidUtkast.split(":").map(Number);
              lagreFelt({ hour: Math.max(0, Math.min(23, h || 0)), minute: Math.max(0, Math.min(59, m || 0)), durationMin: durUtkast });
            }}
          >{""}</Knapp>
        </div>
      ) : (
        <div
          onClick={kanRedigere ? () => { setTidUtkast(toKl(okt.h, okt.m)); setDurUtkast(okt.durMin); setRediger("tid"); } : undefined}
          title={kanRedigere ? "Trykk for å endre tid og varighet" : undefined}
          style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4, cursor: kanRedigere ? "pointer" : "default" }}
        >
          {toKl(okt.h, okt.m)} · {fmtVarighet(okt.durMin)}
          {okt.meta.filter(([ic]) => ic === "map-pin").map(([, t]) => ` · ${t}`).join("")}
        </div>
      )}

      {(oktFormel?.lFase || oktFormel?.miljo) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }} data-wb-formel-chips>
          {oktFormel.lFase && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: T.fg2,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 9999,
                  padding: "4px 9px",
                }}
                title="Læringsfase"
              >
                {faseLabel(oktFormel.lFase as LFase)}
              </span>
              <HjelpTips k="lFase" size={11} />
            </span>
          )}
          {oktFormel.miljo && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: T.fg2,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 9999,
                  padding: "4px 9px",
                }}
                title="Miljø"
              >
                {oktFormel.miljo}
              </span>
              <HjelpTips k="miljo" size={11} />
            </span>
          )}
        </div>
      )}

      {okt.id && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Exit til gjennomføring: Start (plan, via live-flyt) / Se økt (ferdig eller v2) */}
          {erPlan ? (
            ferdig ? (
              <Link href={planSessionStartHref(okt.id, status as Parameters<typeof planSessionStartHref>[1])} style={{ textDecoration: "none", display: "block" }}>
                <Knapp ghost icon="eye" full>Se økt</Knapp>
              </Link>
            ) : (
              <Knapp icon="play" full disabled={startLoading} onClick={startOkt}>
                {startLoading ? "Åpner…" : status === "ACTIVE" || status === "PAUSED" ? "Fortsett økt" : "Start økt"}
              </Knapp>
            )
          ) : (
            <Link
              href={v2SessionStartHref(okt.id, (status === "COMPLETED" ? "done" : status === "ACTIVE" ? "now" : "upcoming") satisfies V2OktUiStatus)}
              style={{ textDecoration: "none", display: "block" }}
            >
              <Knapp ghost icon={ferdig ? "eye" : "play"} full>{ferdig ? "Se økt" : "Åpne økt"}</Knapp>
            </Link>
          )}
        </div>
      )}

      {okt.id && feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down, display: "block", marginTop: 8 }}>{feil}</span>}

      {oktDrills && oktDrills.length > 0 && (
        <div style={{ marginTop: 10 }} data-wb-inspektordrills>
          <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Driller ({oktDrills.length})</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
            {oktDrills.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 9px", borderRadius: 9, background: T.panel2, border: `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.mut, flex: "none" }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 11.5, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.navn}</span>
                <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, flex: "none" }}>
                  {[d.minutter != null ? `${d.minutter} min` : null, d.sett != null && d.reps != null ? `${d.sett}×${d.reps}` : null, d.nivaa === "uten" ? "uten ball" : d.nivaa === "lav" ? "lav fart" : null].filter(Boolean).join(" · ") || "—"}
                </span>
              </div>
            ))}
          </div>
          <span style={{ display: "block", marginTop: 5, fontFamily: T.mono, fontSize: 8, color: T.mut }}>Rediger driller: trykk økten i tidslinja.</span>
        </div>
      )}

      {actions && okt.id && erPlan && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {flyttApen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <DagPillRow value={-1} onChange={flytt} disabled={flyttLoading} />
              <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>Velg ny dag — klokkeslettet beholdes</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Knapp ghost icon="calendar" full disabled={flyttLoading} onClick={() => setFlyttApen((v) => !v)}>
                {flyttApen ? "Lukk" : "Flytt"}
              </Knapp>
            </div>
            {actions?.duplicateSession && !ferdig && (
              <div style={{ flex: 1 }}>
                <Knapp ghost icon="copy" full disabled={dupliserer} onClick={dupliser}>
                  {dupliserer ? "Kopierer…" : "Dupliser"}
                </Knapp>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <Knapp ghost icon="trash-2" full onClick={() => setBekreftSlett(true)}>
                Slett
              </Knapp>
            </div>
          </div>
        </div>
      )}

      {/* WB1(c): sletting bekreftes i popup (Anders-logikken: alt som fjernes
          fra canvas → bekreftelses-popup) — samme mønster som mal-bekreft. */}
      {bekreftSlett && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={sletterLoading ? undefined : () => setBekreftSlett(false)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div role="alertdialog" aria-label="Bekreft sletting" className="v2-sheet-in" style={{ position: "relative", width: "min(400px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="trash-2" size={16} style={{ color: T.down }} />
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>Slett økt</h2>
            </div>
            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{okt.ttl}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 3 }}>{dag != null && dag >= 0 ? `${DAGER[dag]} · ` : ""}{toKl(okt.h, okt.m)} · {okt.durMin} min</div>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "10px 0 0", lineHeight: 1.5 }}>
              Økten fjernes fra planen. Dette kan ikke angres.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Knapp ghost onClick={() => setBekreftSlett(false)} disabled={sletterLoading}>Avbryt</Knapp>
              <Knapp icon="trash-2" onClick={slett} disabled={sletterLoading}>{sletterLoading ? "Sletter…" : "Bekreft sletting"}</Knapp>
            </div>
          </div>
        </div>
      )}
    </Kort>
  );
}

/* ── 8c.5: universell økt-popup — trykk en økt HVOR SOM HELST ─
   Alt redigerbart der og da: tittel, dag, tid, varighet — og pyramide-
   chippen SYKLER (Fysisk → Teknikk → Slag → Spill → Turnering) ved trykk
   (Anders: «trykk på pyramide, så switcher den bare»). Lagre = updateSession
   (+ moveSession ved dagbytte). Samme overlay-språk som Ny økt. */
export function RedigerOktArk({ okt, dag, weekOffset, actions, onLukk, onEndret }: {
  okt: WeekEvent;
  dag: number;
  weekOffset: number;
  actions: WorkbenchV2Actions;
  onLukk: () => void;
  onEndret: () => void;
}) {
  // Nåtilstanden (AK-formel + driller) lastes FØR skjemaet vises, så
  // hent-svaret aldri kan overskrive noe brukeren har trykket på (race-vernet
  // komponistKlar er dermed unødvendig — skjemaet starter komplett).
  const [initial, setInitial] = useState<OktArkState | null>(null);
  useEffect(() => {
    if (!okt.id) return;
    let aktiv = true;
    hentOktKomponist(okt.id).then((res) => {
      if (!aktiv) return;
      setInitial({
        title: okt.ttl,
        dayIndex: dag,
        tid: toKl(okt.h, okt.m),
        durMin: okt.durMin,
        akse: (okt.ax?.toUpperCase() as AkseKey) ?? "TEK",
        lFase: res.ok ? (res.lFase ?? null) : null,
        miljo: res.ok ? (res.miljo ?? null) : null,
        drills: res.ok ? (res.drills ?? []).map((d) => ({ ...d })) : [],
      });
    });
    return () => { aktiv = false; };
  }, [okt, dag]);

  if (!initial) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div onClick={onLukk} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
        <div role="dialog" aria-label="Rediger økt" className="v2-sheet-in" style={{ position: "relative", width: "min(420px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Laster økt …</span>
        </div>
      </div>
    );
  }

  return (
    <OktArkSkjema
      overskrift="Rediger økt"
      submitLabel="Lagre"
      lagrerLabel="Lagrer…"
      submitIcon="check"
      initial={initial}
      searchTeknisk={actions.searchTeknisk}
      onLukk={onLukk}
      onSubmit={async (s) => {
        if (!okt.id || !actions.updateSession) return { ok: false, error: "Ingen skrivetilgang." };
        const res = await actions.updateSession(okt.id, {
          title: s.title.trim() || okt.ttl,
          pyramidArea: s.akse,
          hour: s.hour,
          minute: s.minute,
          durationMin: s.durMin,
          lFase: (s.lFase ?? null) as never,
          miljo: (s.miljo ?? null) as never,
          drills: s.drills.map((d) => ({
            exerciseId: d.exerciseId,
            nyNavn: d.exerciseId ? undefined : d.navn,
            nyPyramidArea: d.exerciseId ? undefined : s.akse,
            minutter: d.minutter,
            sett: d.sett,
            reps: d.reps,
            nivaa: d.nivaa,
            positionTaskId: d.positionTaskId,
          })),
        });
        if (!res.ok) return res;
        if (s.dayIndex !== dag) {
          const flytt = await actions.moveSession(okt.id, s.dayIndex, weekOffset);
          if (!flytt.ok) {
            return { ok: false, error: flytt.error ?? "Endringene ble lagret, men flytting feilet." };
          }
        }
        onLukk();
        onEndret();
        return { ok: true };
      }}
    />
  );
}
