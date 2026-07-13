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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import { T, Icon, Kort, Knapp, AkseChip, BunnArk } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { WeekEvent } from "@/lib/workbench/week-types";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
import type { PlanStatus } from "@/generated/prisma/client";
import { fmtVarighet, toKl } from "@/lib/workbench/v2-format";
import { resolvePlanSessionLiveHref } from "@/lib/workbench/session-actions";
import { sokOvelser, hentOktKomponist } from "@/lib/workbench/ovelse-sok";
import { dateForDayIndex, weekRefDate, toIsoDateLocal, weeksBetweenMondays, WEEK_OFFSET_MIN, WEEK_OFFSET_MAX } from "@/lib/workbench/session-move-math";
import { OvelseSkjemaFelter } from "./NyOvelseArk";
import { useEffect } from "react";
import { planSessionStartHref, v2SessionStartHref, type V2OktUiStatus } from "@/lib/portal/session-hrefs";

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
  applyTemplate?: (templateId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Bølge 3: «Legg til målsetning» i Balanse — kun spiller-siden binder denne
      (createGoal oppretter på innlogget bruker; coach-siden utelater → skjult). */
  createGoal?: (input: { type: string; title: string; targetValue?: number | null; targetDate?: string | null }) => Promise<void>;
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

function Felt({ label, children }: { label: string; children: ReactNode }) {
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
        }}
      >
        {label}
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
};

export interface NyOktInput {
  title: string;
  dayIndex: number;
  /** Absolutt uke-offset for datoen brukeren valgte — IKKE nødvendigvis
      den uka man ser på (se dato-feltet i OktArkSkjema, 2026-07-13). */
  weekOffset: number;
  akse: AkseKey;
  hour: number;
  minute: number;
  durMin: number;
  lFase: string | null;
  miljo: string | null;
  drills: OktArkDrill[];
}
export interface NyOktArkProps {
  defaultDayIndex: number;
  /** Uka man ser på når arket åpnes — seeder dato-feltet (2026-07-13). */
  weekOffset: number;
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
}

export function NyOktArk({ defaultDayIndex, weekOffset, defaultTid, defaultTitle, defaultAkse, defaultDurMin, defaultDrills, onLukk, onOpprett }: NyOktArkProps) {
  return (
    <OktArkSkjema
      overskrift="Ny økt"
      submitLabel="Opprett økt"
      lagrerLabel="Oppretter…"
      submitIcon="plus"
      initial={{
        title: defaultTitle ?? "",
        dato: toIsoDateLocal(dateForDayIndex(defaultDayIndex, 0, 0, weekRefDate(weekOffset))),
        tid: defaultTid ?? "09:00",
        durMin: defaultDurMin ?? 60,
        akse: defaultAkse ?? "TEK",
        lFase: null,
        miljo: null,
        drills: defaultDrills ?? [],
      }}
      tittelPlaceholder="F.eks. Wedge 60–100 m"
      onLukk={onLukk}
      onSubmit={(s) =>
        onOpprett({
          title: s.title.trim() || "Ny økt",
          dayIndex: s.dayIndex,
          weekOffset: s.weekOffset,
          akse: s.akse,
          hour: s.hour,
          minute: s.minute,
          durMin: s.durMin,
          lFase: s.lFase,
          miljo: s.miljo,
          drills: s.drills,
        })
      }
    />
  );
}

type OktArkState = {
  title: string;
  /** ISO-dato (`YYYY-MM-DD`, lokal) — erstatter ukedag-piller (2026-07-13).
      dayIndex/weekOffset avledes fra denne ved lagring (session-move-math). */
  dato: string;
  tid: string;
  durMin: number;
  akse: AkseKey;
  lFase: string | null;
  miljo: string | null;
  drills: OktArkDrill[];
};

/** ±52 uker fra i dag — samme grense som WEEK_OFFSET_MIN/MAX i planleggeren. */
function datoGrenser(): { min: string; max: string } {
  const now = new Date();
  const min = new Date(now); min.setDate(min.getDate() + WEEK_OFFSET_MIN * 7);
  const max = new Date(now); max.setDate(max.getDate() + WEEK_OFFSET_MAX * 7);
  return { min: toIsoDateLocal(min), max: toIsoDateLocal(max) };
}

const L_FASER = ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"] as const;
const MILJOER = ["M0", "M1", "M2", "M3", "M4", "M5"] as const;

function OktArkSkjema({
  overskrift,
  submitLabel,
  lagrerLabel,
  submitIcon,
  initial,
  tittelPlaceholder,
  onLukk,
  onSubmit,
}: {
  overskrift: string;
  submitLabel: string;
  lagrerLabel: string;
  submitIcon: "plus" | "check";
  initial: OktArkState;
  tittelPlaceholder?: string;
  onLukk: () => void;
  onSubmit: (state: OktArkState & { hour: number; minute: number; dayIndex: number; weekOffset: number }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [title, setTitle] = useState(initial.title);
  const [dato, setDato] = useState(initial.dato);
  const [tid, setTid] = useState(initial.tid);
  const [durMin, setDurMin] = useState(initial.durMin);
  const [akse, setAkse] = useState<AkseKey>(initial.akse);
  const [lFase, setLFase] = useState<string | null>(initial.lFase);
  const [miljo, setMiljo] = useState<string | null>(initial.miljo);
  const [drills, setDrills] = useState<OktArkDrill[]>(initial.drills);
  const [drillSok, setDrillSok] = useState("");
  const [drillTreff, setDrillTreff] = useState<{ id: string; name: string; pyramidArea: string }[]>([]);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  /** Bytter arkets innhold til «Ny øvelse»-skjemaet — samme BunnArk, aldri
      modal-i-modal (mesterens-monstre.md forbyr modal-inception). */
  const [visning, setVisning] = useState<"skjema" | "ny-ovelse">("skjema");
  const datoGrense = datoGrenser();

  useEffect(() => {
    const q = drillSok.trim();
    const t = window.setTimeout(() => {
      if (q.length < 2) { setDrillTreff([]); return; }
      sokOvelser(q, akse).then(setDrillTreff).catch(() => setDrillTreff([]));
    }, q.length < 2 ? 0 : 250);
    return () => window.clearTimeout(t);
  }, [drillSok, akse]);

  const sykleLFase = () => {
    const i = lFase ? L_FASER.indexOf(lFase as (typeof L_FASER)[number]) : -1;
    setLFase(i === L_FASER.length - 1 ? null : L_FASER[i + 1]);
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
    const valgtDato = new Date(`${dato}T00:00:00`);
    const dayIndex = (valgtDato.getDay() + 6) % 7;
    const weekOffset = Math.max(WEEK_OFFSET_MIN, Math.min(WEEK_OFFSET_MAX, weeksBetweenMondays(valgtDato, new Date())));
    setLagrer(true);
    setFeil(null);
    const res = await onSubmit({ title, dato, tid, durMin: Math.max(5, Math.min(480, durMin)), akse, lFase, miljo, drills, hour, minute, dayIndex, weekOffset });
    setLagrer(false);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke lagre økten.");
  };

  if (visning === "ny-ovelse") {
    return (
      <BunnArk tittel="Ny øvelse" under="Legges i banken og rett inn i denne økta." onLukk={() => setVisning("skjema")} laast={lagrer}>
        <OvelseSkjemaFelter
          defaultAkse={akse}
          onLagrerChange={setLagrer}
          onAvbryt={() => setVisning("skjema")}
          lagreLabel="Lagre og legg i økt"
          onLagret={(ovelse) => {
            setDrills([...drills, { exerciseId: ovelse.id, navn: ovelse.name, minutter: null, sett: null, reps: null, nivaa: "vanlig" }]);
            setVisning("skjema");
          }}
        />
      </BunnArk>
    );
  }

  return (
    <BunnArk tittel={overskrift} onLukk={onLukk} laast={lagrer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <Felt label="Tittel">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tittelPlaceholder} maxLength={120} style={inputStyle} />
          </Felt>
          <Felt label="Dato">
            <input type="date" value={dato} min={datoGrense.min} max={datoGrense.max} onChange={(e) => setDato(e.target.value)} style={inputStyle} />
          </Felt>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Felt label="Klokkeslett">
              <input type="time" value={tid} onChange={(e) => setTid(e.target.value)} style={inputStyle} />
            </Felt>
            <Felt label="Varighet (min)">
              <input type="number" min={5} max={480} step={5} value={durMin} onChange={(e) => setDurMin(Number(e.target.value) || 60)} style={inputStyle} />
            </Felt>
          </div>
          <Felt label="Område — trykk for å bytte">
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

          {/* 8c.7: AK-formel — sykle-chips (valgfritt, aldri sperre) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Felt label="L-fase — trykk for å bytte">
              <button type="button" onClick={sykleLFase} className="v2-press v2-focus" data-wb-lfasechip data-klar style={chipStil(!!lFase)}>
                {lFase ? lFase.replace("L_", "L-").replace("KROPP", "Kropp").replace("ARM", "Arm").replace("KOLLE", "Kølle").replace("BALL", "Ball").replace("AUTO", "Auto") : "Ikke satt"}
                <Icon name="refresh-cw" size={11} style={{ color: T.mut }} />
              </button>
            </Felt>
            <Felt label="Miljø — trykk for å bytte">
              <button type="button" onClick={sykleMiljo} className="v2-press v2-focus" data-wb-miljochip style={chipStil(!!miljo)}>
                {miljo ?? "Ikke satt"}
                <Icon name="refresh-cw" size={11} style={{ color: T.mut }} />
              </button>
            </Felt>
          </div>

          {/* 8c.7: driller i økta — fra banken eller egen */}
          <Felt label={`Driller (${drills.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {drills.map((d, i) => (
                <div key={i} data-wb-drillrad style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
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
              ))}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={drillSok}
                  onChange={(e) => setDrillSok(e.target.value)}
                  placeholder="Legg til drill — søk i øvelsesbanken…"
                  style={{ ...inputStyle, flex: 1 }}
                  data-wb-drillsok
                />
                <button
                  type="button"
                  onClick={() => setVisning("ny-ovelse")}
                  className="v2-press v2-focus"
                  data-wb-ny-ovelse
                  title="Opprett en helt ny øvelse i banken"
                  style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, color: T.fg2, fontFamily: T.ui, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flex: "none" }}
                >
                  <Icon name="plus-circle" size={13} style={{ color: T.mut }} />
                  Ny øvelse
                </button>
              </div>
              {drillSok.trim().length >= 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {drillTreff.map((t) => (
                    <button key={t.id} type="button" className="v2-press" onClick={() => { setDrills([...drills, { exerciseId: t.id, navn: t.name, minutter: null, sett: null, reps: null, nivaa: "vanlig" }]); setDrillSok(""); }} style={{ appearance: "none", textAlign: "left", padding: "7px 10px", borderRadius: 9, background: T.panel2, border: `1px dashed ${T.borderS}`, color: T.fg, fontFamily: T.ui, fontSize: 12, cursor: "pointer" }}>
                      + {t.name} <span style={{ color: T.mut, fontFamily: T.mono, fontSize: 9 }}>({t.pyramidArea})</span>
                    </button>
                  ))}
                  <button type="button" className="v2-press" data-wb-egen-drill onClick={() => { setDrills([...drills, { navn: drillSok.trim(), minutter: null, sett: null, reps: null, nivaa: "vanlig" }]); setDrillSok(""); }} style={{ appearance: "none", textAlign: "left", padding: "7px 10px", borderRadius: 9, background: `color-mix(in srgb, ${T.lime} 8%, ${T.panel2})`, border: `1px dashed color-mix(in srgb, ${T.lime} 40%, transparent)`, color: T.fg, fontFamily: T.ui, fontSize: 12, cursor: "pointer" }}>
                    + Lag egen drill: «{drillSok.trim()}» (lagres i banken)
                  </button>
                </div>
              )}
            </div>
          </Felt>
        </div>

        {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down, display: "block", marginTop: 10 }}>{feil}</span>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Knapp ghost onClick={onLukk} disabled={lagrer}>Avbryt</Knapp>
          <Knapp icon={submitIcon} onClick={submit} disabled={lagrer}>{lagrer ? lagrerLabel : submitLabel}</Knapp>
        </div>
    </BunnArk>
  );
}

/* ── Legg til målsetning — lett skjema-ark (Bølge 3) ─────────────
   Regelen «Mål bor i Oversikt, redigeres i Workbench»: spilleren kan sette
   et mål direkte herfra uten å forlate planleggingen. Full veiviser
   (/portal/mal/bygger) lenkes for de som vil ha hele løypa. Kun spiller-
   rollen — createGoal oppretter målet på innlogget bruker. */
export function NyttMaalArk({ onLukk, onOpprett }: {
  onLukk: () => void;
  /** createGoal-wrapper fra siden — holder Sheets fri for Prisma/actions-import. */
  onOpprett: (input: { type: string; title: string; targetValue?: number | null; targetDate?: string | null }) => Promise<void>;
}) {
  const [tittel, setTittel] = useState("");
  const [verdi, setVerdi] = useState("");
  const [dato, setDato] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const opprett = async () => {
    if (!tittel.trim() || lagrer) return;
    setLagrer(true);
    setFeil(null);
    try {
      const tall = parseFloat(verdi.replace(",", "."));
      await onOpprett({
        type: "FREE_TEXT",
        title: tittel.trim(),
        targetValue: Number.isFinite(tall) ? tall : null,
        targetDate: dato || null,
      });
      onLukk();
    } catch {
      setFeil("Kunne ikke lagre målet. Prøv igjen.");
    } finally {
      setLagrer(false);
    }
  };

  return (
    <BunnArk tittel="Legg til målsetning" under="Målet vises i Mine mål og på Hjem." onLukk={onLukk} laast={lagrer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        <Felt label="Hva vil du oppnå?">
          <input
            style={inputStyle}
            value={tittel}
            onChange={(e) => setTittel(e.target.value)}
            placeholder="F.eks. HCP under 5 før sesongslutt"
            maxLength={500}
            autoFocus
          />
        </Felt>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Felt label="Målverdi (valgfritt)">
              <input type="text" inputMode="decimal" style={inputStyle} value={verdi} onChange={(e) => setVerdi(e.target.value)} placeholder="F.eks. 5" disabled={lagrer} />
            </Felt>
          </div>
          <div style={{ flex: 1 }}>
            <Felt label="Frist (valgfritt)">
              <input type="date" style={inputStyle} value={dato} onChange={(e) => setDato(e.target.value)} disabled={lagrer} />
            </Felt>
          </div>
        </div>

        {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Link href="/portal/mal/bygger" style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, textDecoration: "none" }}>
            Full veiviser →
          </Link>
          <span style={{ flex: 1 }} />
          <Knapp ghost onClick={onLukk} disabled={lagrer}>Avbryt</Knapp>
          <Knapp icon="target" onClick={opprett} disabled={lagrer || !tittel.trim()}>
            {lagrer ? "Lagrer…" : "Lagre mål"}
          </Knapp>
        </div>
      </div>
    </BunnArk>
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
    <BunnArk
      tittel="Forslag til uka"
      under={usedAi
        ? "Tre varianter basert på nivået ditt, fokusområdet og planen din. Velg den som passer uka."
        : "Standardforslag (uten AI) — tre varianter du kan bruke som utgangspunkt."}
      onLukk={onLukk}
      laast={brukes != null}
      bredde={760}
    >
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
    </BunnArk>
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
  useEffect(() => {
    let aktiv = true;
    if (!okt.id || !erPlanKilde(okt)) {
      // Asynkront (mikrotask) — regelen forbyr synkron setState i effekt-kropp.
      Promise.resolve().then(() => { if (aktiv) setOktDrills(null); });
      return () => { aktiv = false; };
    }
    hentOktKomponist(okt.id).then((res) => {
      if (aktiv) setOktDrills(res.ok ? (res.drills ?? []) : null);
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
          <div role="alertdialog" aria-label="Bekreft sletting" style={{ position: "relative", width: "min(400px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
        dato: toIsoDateLocal(dateForDayIndex(dag, 0, 0, weekRefDate(weekOffset))),
        tid: toKl(okt.h, okt.m),
        durMin: okt.durMin,
        akse: (okt.ax?.toUpperCase() as AkseKey) ?? "TEK",
        lFase: res.ok ? (res.lFase ?? null) : null,
        miljo: res.ok ? (res.miljo ?? null) : null,
        drills: res.ok ? (res.drills ?? []).map((d) => ({ ...d })) : [],
      });
    });
    return () => { aktiv = false; };
  }, [okt, dag, weekOffset]);

  if (!initial) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div onClick={onLukk} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
        <div role="dialog" aria-label="Rediger økt" style={{ position: "relative", width: "min(420px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
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
          })),
        });
        if (!res.ok) return res;
        const flyttetUke = s.weekOffset !== weekOffset;
        if (s.dayIndex !== dag || flyttetUke) {
          const flytt = await actions.moveSession(okt.id, s.dayIndex, s.weekOffset);
          if (!flytt.ok) {
            return { ok: false, error: flytt.error ?? "Endringene ble lagret, men flytting feilet." };
          }
        }
        onLukk();
        if (flyttetUke) {
          // Dato lagt i en annen uke enn den man ser på — hopp dit i stedet for
          // at økta «forsvinner» stille (interaksjonsregel: endringer skal
          // reflekteres umiddelbart, se interaksjonsstandarder.md §3).
          const params = new URLSearchParams(searchParams.toString());
          if (s.weekOffset === 0) params.delete("uke"); else params.set("uke", String(s.weekOffset));
          params.delete("okt");
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname);
        } else {
          onEndret();
        }
        return { ok: true };
      }}
    />
  );
}
