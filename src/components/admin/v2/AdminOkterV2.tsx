"use client";

/**
 * AgencyOS Økter — v2 (retning C «Presis»). Coach-kontekst: ukas
 * treningsøkter (TrainingPlanSession) på tvers av hele stallen, gruppert per
 * ukedag som en agenda. Ingen mockup fantes — komponert utelukkende av
 * v2-biblioteket (src/components/v2): ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen
 * (src/app/admin/okter/page.tsx):
 *   - Ukas økter, gruppert mandag→søndag (norsk ukestart), tid + varighet.
 *   - KPI-tall: totalt, gjennomført, planlagt, forfalt (planlagt + passert),
 *     kansellert (inkl. hoppet over). Live-antall i hodet.
 *   - Snitt-pyramide for uka (timer per akse) via TidsPyramide.
 *   - Hver rad lenker til planen (/admin/plans/[planId]).
 *   - Ærlig tom-tilstand når uka er tom.
 *
 * Nytt i v2 (ekte data, ingen fabrikasjon): interaktive filtre på akse og
 * status som den ekte skjermen bare tegnet visuelt (v1 hadde ingen filter-state).
 *
 * Mobil: agenda-stabel (ett dagskort under hverandre). Desktop: to-kolonners
 * dagsrutenett for å bruke bredden. KPI 2→5 kolonner, filtre brytes.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  AkseChip,
  StatusPill,
  FilterChips,
  TomTilstand,
  InnsiktChip,
  CTAPill,
  TidsPyramide,
  T,
  type StatusTone,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra TrainingPlanSession i ruten) ───────
export interface OkterOkt {
  id: string;
  tittel: string;
  akse: AkseKey;
  spillerNavn: string;
  planNavn: string;
  planId: string;
  /** Starttidspunkt, "07:15". */
  tid: string;
  /** Varighet i minutter (for meta-tekst). */
  durationMin: number;
  /** PLANNED + starttid passert = forfalt (anbefaling, aldri sperre). */
  erForfalt: boolean;
  /** ACTIVE = pågår nå. */
  naa: boolean;
  /** Klarspråk-status: Planlagt/Aktiv/Gjennomført/…. */
  statusLabel: string;
  /** Filterkategori (utledet, aldri fabrikert). */
  kat: StatusKat;
}
export interface OkterDag {
  /** getDay() 0=søn..6=lør — for stabil sortering/nøkkel. */
  wd: number;
  /** «mandag», «tirsdag», … */
  label: string;
  okter: OkterOkt[];
}
export interface AdminOkterData {
  ukenr: number;
  /** «7. jul – 13. jul». */
  periodeLabel: string;
  kpi: {
    total: number;
    gjennomfort: number;
    planlagt: number;
    forfalt: number;
    kansellert: number;
    liveNa: number;
  };
  /** Timer per akse for uka, øverst = topp av pyramiden (kun akser > 0). */
  pyramide: { akse: AkseKey; timer: number }[];
  /** Dager med minst én økt, mandag→søndag. */
  dager: OkterDag[];
}

export type StatusKat =
  | "Live"
  | "Forfalt"
  | "Planlagt"
  | "Gjennomført"
  | "Kansellert";

// Status → pille-tone (klarspråk, aldri sperre-språk).
const KAT_TONE: Record<StatusKat, StatusTone> = {
  Live: "down",
  Forfalt: "warn",
  Planlagt: "info",
  Gjennomført: "up",
  Kansellert: "down",
};

const AKSE_ORDEN: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const STATUS_ORDEN: StatusKat[] = [
  "Live",
  "Forfalt",
  "Planlagt",
  "Gjennomført",
  "Kansellert",
];

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

export function AdminOkterV2({ data }: { data: AdminOkterData }) {
  const router = useRouter();
  const [akseAktiv, setAkseAktiv] = useState<string[]>([]);
  const [statAktiv, setStatAktiv] = useState<string[]>([]);

  const { kpi } = data;

  const toggle = (arr: string[], set: (v: string[]) => void) => (x: string) =>
    set(arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x));

  // Tilgjengelige filtre = kun det som finnes i ukas data (ingen døde chips).
  const akserTilstede = AKSE_ORDEN.filter((a) =>
    data.dager.some((d) => d.okter.some((o) => o.akse === a)),
  );
  const statuserTilstede = STATUS_ORDEN.filter((s) =>
    data.dager.some((d) => d.okter.some((o) => o.kat === s)),
  );

  // Filtrér innen hver dag; skjul dager som blir tomme.
  const passer = (o: OkterOkt) =>
    (akseAktiv.length === 0 || akseAktiv.indexOf(o.akse) !== -1) &&
    (statAktiv.length === 0 || statAktiv.indexOf(o.kat) !== -1);

  const dagerFiltrert = data.dager
    .map((d) => ({ ...d, okter: d.okter.filter(passer) }))
    .filter((d) => d.okter.length > 0);

  const antallSynlig = dagerFiltrert.reduce((n, d) => n + d.okter.length, 0);
  const harFilter = akseAktiv.length > 0 || statAktiv.length > 0;

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <Caps>{`Uke ${data.ukenr} · ${data.periodeLabel} · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="økter.">{kpi.total}</Tittel>
        </div>
      </div>
      <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
        {kpi.liveNa > 0 && (
          <StatusPill tone="down">
            Live · {pl(kpi.liveNa, "økt pågår", "økter pågår")}
          </StatusPill>
        )}
        <Link href="/admin/kalender" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="calendar">
            Åpne kalender
          </CTAPill>
        </Link>
      </div>
    </div>
  );

  // Tom uke: ærlig tom-tilstand, ingen KPI-rad med bare nuller.
  if (data.dager.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen planlagte økter denne uka"
            sub={`Det er ingen treningsøkter i uke ${data.ukenr} (${data.periodeLabel}). Lag en plan i Workbench eller åpne kalenderen.`}
          />
        </Kort>
        <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
          <InnsiktChip cta="Planlegg i Workbench">
            Uka er åpen — bruk roen til å planlegge økter samlet i Workbench.
          </InnsiktChip>
        </Link>
      </div>
    );
  }

  // ── KPI-flis (alle ukas nøkkeltall) ───────────────────────────
  const kpiRad = (
    <div className="grid grid-cols-2 md:grid-cols-5" style={{ gap: T.gap }}>
      <KpiFlis label="Økter denne uka" value={kpi.total} />
      <KpiFlis label="Gjennomført" value={kpi.gjennomfort} />
      <KpiFlis label="Planlagt" value={kpi.planlagt} />
      <KpiFlis label="Forfalt" value={kpi.forfalt} varsle={kpi.forfalt > 0} />
      <KpiFlis label="Kansellert" value={kpi.kansellert} />
    </div>
  );

  // ── Snitt-pyramide (timer per akse for hele uka) ──────────────
  const pyramide =
    data.pyramide.length > 0 ? (
      <TidsPyramide data={data.pyramide} periode={`uke ${data.ukenr}`} />
    ) : null;

  // ── Filtre (akse + status) ────────────────────────────────────
  const filterRad = (
    label: string,
    items: string[],
    active: string[],
    onToggle: (x: string) => void,
    axis?: boolean,
  ) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Caps size={9} style={{ width: 64, flex: "none" }}>
        {label}
      </Caps>
      <FilterChips items={items} active={active} onToggle={onToggle} axis={axis} />
    </div>
  );
  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {akserTilstede.length > 0 &&
        filterRad("Akse", akserTilstede, akseAktiv, toggle(akseAktiv, setAkseAktiv), true)}
      {statuserTilstede.length > 0 &&
        filterRad("Status", statuserTilstede, statAktiv, toggle(statAktiv, setStatAktiv))}
    </div>
  );

  // ── Dagskort (agenda) ─────────────────────────────────────────
  const dagKort = (d: OkterDag) => (
    <Kort
      key={d.wd}
      eyebrow={d.label}
      action={<Caps size={9}>{pl(d.okter.length, "økt", "økter")}</Caps>}
    >
      {d.okter.map((o, i) => (
        <Rad
          key={o.id}
          onClick={() => router.push(`/admin/plans/${o.planId}`)}
          leading={
            <span
              style={{
                width: 44,
                flex: "none",
                fontFamily: T.mono,
                fontSize: 11,
                fontWeight: 700,
                color: o.naa ? T.lime : T.mut,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {o.tid}
            </span>
          }
          title={o.spillerNavn}
          sub={`${o.tittel} · ${o.planNavn} · ${o.durationMin} min`}
          meta={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AkseChip a={o.akse} />
              {!o.naa && <StatusPill tone={KAT_TONE[o.kat]}>{o.statusLabel}</StatusPill>}
            </span>
          }
          naa={o.naa}
          trailing={null}
          last={i === d.okter.length - 1}
        />
      ))}
    </Kort>
  );

  const liste =
    dagerFiltrert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="filter"
          title="Ingen økter passer filteret"
          sub="Ingen av ukas økter matcher valgt akse eller status. Fjern et filter for å se flere."
        />
      </Kort>
    ) : (
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ gap: T.gap, alignItems: "start" }}
      >
        {dagerFiltrert.map(dagKort)}
      </div>
    );

  // ── AI-innsikt → Workbench ────────────────────────────────────
  const innsiktTekst = harFilter
    ? `Viser ${pl(antallSynlig, "økt", "økter")} av ${kpi.total} denne uka — planlegg oppfølging samlet i Workbench.`
    : kpi.forfalt > 0
      ? `${pl(kpi.forfalt, "forfalt økt", "forfalte økter")} denne uka — følg opp og planlegg videre i Workbench.`
      : `${pl(kpi.total, "økt", "økter")} planlagt denne uka — juster uka i Workbench.`;
  const innsikt = (
    <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Planlegg i Workbench">{innsiktTekst}</InnsiktChip>
    </Link>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpiRad}
      {pyramide}
      {filtre}
      {liste}
      {innsikt}
    </div>
  );
}
