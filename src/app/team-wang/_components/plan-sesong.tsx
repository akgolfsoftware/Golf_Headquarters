"use client";

/**
 * Årsplanen — elevens Plan · Sesong.
 *
 * Kjernen i redesignet: årsplanen er TO ting samtidig, og før viste flaten
 * bare den ene. Øverst gruppetreningen (fellesøktene), rett under elevens egen
 * utviklingsplan — låst til samme periodeakse, så «hva trener gruppa på» og
 * «hva skal jeg jobbe med» leses i samme blikk.
 *
 * Sporene deler kolonner på desktop og stables på mobil, men rekkefølgen er
 * den samme begge steder: periode for periode, aldri to uavhengige lister.
 */

import { Sesongband, type SesongbandPeriode } from "./sesongband";
import {
  AkseChip,
  MaalStatusChip,
  VurderingPrikker,
  formaterEgentid,
} from "./ak-primitiver";
import { Ikon } from "./primitiver";
import {
  COMPS,
  MON_SHORT,
  MONTH_ORDER,
  PERIODS,
  PERIOD_COL,
  TESTS,
  TOTAL_WEEKS,
  daysUntil,
  pct,
  seasonWeek,
  type PeriodeKey,
} from "../_data/wang-plan";
import {
  FOKUS_DEMO,
  summerEgentid,
  type Fokusomraade,
  type PeriodeFokus,
} from "../_data/fokusomraader";

// ---- Hjelpere ----------------------------------------------------------

const MS_UKE = 7 * 864e5;

function ukerMellom(startIso: string, sluttIso: string): number {
  const ms =
    new Date(`${sluttIso}T00:00:00Z`).getTime() -
    new Date(`${startIso}T00:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / MS_UKE));
}

function kortDato(iso: string): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  return `${dt.getUTCDate()}. ${MON_SHORT[dt.getUTCMonth()]}`;
}

/** Milepælene er ekte data: turneringer og testuker slått sammen og sortert. */
function byggMilepaeler(naaIso: string) {
  return [
    ...TESTS.map((t) => ({
      iso: t.iso,
      navn: t.name,
      farge: "var(--cat-yellow)",
    })),
    ...COMPS.map((c) => ({
      iso: c.iso,
      navn: c.name,
      farge: "var(--cat-orange)",
    })),
  ]
    .filter((m) => m.iso >= naaIso)
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .slice(0, 6);
}

// ---- Seksjonshode ------------------------------------------------------

function SporHode({
  tittel,
  undertittel,
  ikon,
}: {
  tittel: string;
  undertittel: string;
  ikon: string;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-icon-chip)",
          background: "var(--tint-navy)",
          color: "var(--wang-navy)",
          display: "grid",
          placeItems: "center",
          flex: "none",
        }}
      >
        <Ikon name={ikon} size={16} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--text-primary)",
          }}
        >
          {tittel}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 12,
            color: "var(--text-secondary)",
            marginTop: 1,
          }}
        >
          {undertittel}
        </span>
      </span>
    </div>
  );
}

// ---- Spor 1: gruppetrening --------------------------------------------

function GruppeKort({
  periode,
  naa,
  ukeIPeriode,
  antallUker,
}: {
  periode: (typeof PERIODS)[number];
  naa: boolean;
  ukeIPeriode: number;
  antallUker: number;
}) {
  return (
    <div
      className="wang-card"
      style={{
        padding: "14px 16px",
        boxShadow: naa ? "var(--shadow-float)" : "var(--shadow-card-sm)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
      >
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "var(--radius-chip)",
            flex: "none",
            background: PERIOD_COL[periode.key],
          }}
        />
        <b
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: 13.5,
            color: "var(--text-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {periode.name}
        </b>
        {naa ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 20,
              padding: "0 8px",
              borderRadius: "var(--radius-chip)",
              background: "var(--tint-orange)",
              color: "var(--cat-orange-text)",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: 10,
              flex: "none",
              marginLeft: "auto",
            }}
          >
            Uke {ukeIPeriode}/{antallUker}
          </span>
        ) : null}
      </div>

      <span
        style={{
          display: "block",
          marginTop: 6,
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: 11.5,
          color: "var(--text-secondary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {periode.label} · {antallUker} uker
      </span>

      <p
        style={{
          margin: "8px 0 0",
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--text-secondary)",
        }}
      >
        {periode.focus}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 10px",
          marginTop: 11,
          paddingTop: 11,
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 11.5,
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700 }}>
          3 fellesøkter i uka
        </span>
        <span style={{ minWidth: 0 }}>{periode.loc}</span>
      </div>
    </div>
  );
}

// ---- Spor 2: elevens utviklingsplan ------------------------------------

function FokusRad({ f, siste }: { f: Fokusomraade; siste: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: siste ? "none" : "1px solid var(--border-subtle)",
        minWidth: 0,
      }}
    >
      <AkseChip akse={f.akse} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-primary)",
            lineHeight: 1.4,
          }}
        >
          {f.tittel}
        </span>
        <span
          style={{
            display: "block",
            marginTop: 2,
            fontSize: 11.5,
            color: "var(--text-secondary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formaterEgentid(f.egentidMinUke)} egentrening
        </span>
        {/* Er perioden evaluert i IUP-samtalen, vises begge vurderingene her —
            eleven skal se sin egen og trenerens ved siden av hverandre. */}
        {f.egenvurdering !== null || f.trenervurdering !== null ? (
          <span
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 14px",
              marginTop: 6,
              alignItems: "center",
            }}
          >
            <VurderingPrikker
              verdi={f.egenvurdering}
              farge="var(--wang-teal)"
              label="Egenvurdering"
            />
            <VurderingPrikker
              verdi={f.trenervurdering}
              farge="var(--wang-navy)"
              label="Trenervurdering"
            />
          </span>
        ) : null}
      </span>
      <MaalStatusChip status={f.status} />
    </div>
  );
}

function IupKort({
  fokus,
  farge,
  tom,
}: {
  fokus: PeriodeFokus | null;
  farge: string;
  tom: string;
}) {
  if (!fokus || fokus.omraader.length === 0) {
    return (
      <div
        className="wang-card"
        style={{
          padding: "14px 16px",
          boxShadow: "var(--shadow-card-sm)",
          borderLeft: `3px solid ${farge}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          {tom}
        </p>
      </div>
    );
  }

  const sum = summerEgentid(fokus.omraader);

  return (
    <div
      className="wang-card"
      style={{
        padding: "14px 16px",
        boxShadow: "var(--shadow-card-sm)",
        borderLeft: `3px solid ${farge}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: 12,
            color: "var(--text-primary)",
          }}
        >
          {fokus.omraader.length} fokusområde
          {fokus.omraader.length === 1 ? "" : "r"}
        </span>
        {/* Totalbelastningen skal være synlig FØR perioden starter. */}
        <span
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 12,
            color: "var(--wang-teal-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formaterEgentid(sum)} egentid/uke
        </span>
      </div>

      <div style={{ marginTop: 6 }}>
        {fokus.omraader.map((f, i) => (
          <FokusRad key={f.id} f={f} siste={i === fokus.omraader.length - 1} />
        ))}
      </div>

      <p
        style={{
          margin: "10px 0 0",
          paddingTop: 10,
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "var(--text-secondary)",
        }}
      >
        {fokus.maaling}
      </p>
    </div>
  );
}

// ---- Milepælstripe -----------------------------------------------------

function Milepaeler({ naaIso }: { naaIso: string }) {
  const liste = byggMilepaeler(naaIso);
  if (liste.length === 0) return null;

  return (
    <section className="wang-card" style={{ padding: "14px 16px" }}>
      <span
        className="t-label"
        style={{
          display: "block",
          color: "var(--text-secondary)",
          marginBottom: 10,
        }}
      >
        Milepæler
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 10px" }}>
        {liste.map((m) => (
          <span
            key={`${m.iso}-${m.navn}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 12px",
              borderRadius: "var(--radius-chip)",
              background: "var(--neutral-50)",
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "var(--radius-chip)",
                flex: "none",
                background: m.farge,
              }}
            />
            <b
              style={{
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--text-primary)",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {m.navn}
            </b>
            <span
              style={{
                fontSize: 11.5,
                color: "var(--text-secondary)",
                fontVariantNumeric: "tabular-nums",
                flex: "none",
              }}
            >
              {kortDato(m.iso)}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

// ---- Skjermen ----------------------------------------------------------

export interface PlanSesongProps {
  naaIso: string;
  /**
   * Elevens lagrede fokusområder gruppert på periodenøkkel. Null = ingen
   * IUP-samtale kjørt ennå → demoen vises, med tydelig merking.
   */
  fokusPerPeriode: Record<PeriodeKey, PeriodeFokus> | null;
}

export function PlanSesong({ naaIso, fokusPerPeriode }: PlanSesongProps) {
  const uke = Math.min(TOTAL_WEEKS, Math.max(1, seasonWeek(naaIso)));

  const perioderMedUker = PERIODS.map((p) => ({
    ...p,
    antallUker: ukerMellom(p.start, p.end),
    naa: naaIso >= p.start && naaIso <= p.end,
  }));

  const aktivIndeks = Math.max(
    0,
    perioderMedUker.findIndex((p) => p.naa),
  );
  const aktiv = perioderMedUker[aktivIndeks];
  const ukeIPeriode = Math.max(
    1,
    Math.ceil((daysUntil(naaIso, aktiv.start) + 1) / 7),
  );
  const ukerIgjen = Math.max(0, Math.ceil(daysUntil(aktiv.end, naaIso) / 7));

  const nesteMilepael = byggMilepaeler(naaIso)[0];
  const undertittel = nesteMilepael
    ? `${ukerIgjen} uker igjen av perioden. Neste milepæl: ${nesteMilepael.navn} ${kortDato(nesteMilepael.iso)}.`
    : `${ukerIgjen} uker igjen av perioden.`;

  const bandPerioder: SesongbandPeriode[] = perioderMedUker.map((p) => ({
    key: p.key,
    navn: p.name,
    farge: PERIOD_COL[p.key],
    vekt: p.antallUker,
    naa: p.naa,
  }));

  const maaneder = MONTH_ORDER.map(([m]) => {
    const n = MON_SHORT[m];
    return n.charAt(0).toUpperCase() + n.slice(1);
  });

  const brukerDemo = fokusPerPeriode === null;
  const fokus = fokusPerPeriode ?? FOKUS_DEMO;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Sesongband
        overtittel={`Uke ${uke} av ${TOTAL_WEEKS} · Periode ${aktivIndeks + 1} av ${PERIODS.length}`}
        tittel={aktiv.name}
        undertittel={undertittel}
        perioder={bandPerioder}
        naaPct={Math.max(0, Math.min(100, pct(naaIso)))}
        naaLabel={`Du er her · ${kortDato(naaIso)}`}
        maaneder={maaneder}
      />

      {/* De to sporene deler kolonner så de leses i samme blikk. */}
      <section
        className="wang-card"
        style={{
          padding: "16px 16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <SporHode
          tittel="Gruppetrening"
          undertittel="Fellesøkter for hele golfgruppa"
          ikon="users"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${PERIODS.length}, minmax(0, 1fr))`,
            gap: 12,
          }}
          className="wang-spor"
        >
          {perioderMedUker.map((p) => (
            <GruppeKort
              key={p.key}
              periode={p}
              naa={p.naa}
              ukeIPeriode={ukeIPeriode}
              antallUker={p.antallUker}
            />
          ))}
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        <SporHode
          tittel="Min utviklingsplan"
          undertittel={
            brukerDemo
              ? "Eksempel — settes i IUP-samtalen med trener"
              : "Avtalt med trener i IUP-samtalen"
          }
          ikon="target"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${PERIODS.length}, minmax(0, 1fr))`,
            gap: 12,
          }}
          className="wang-spor"
        >
          {perioderMedUker.map((p) => (
            <IupKort
              key={p.key}
              fokus={fokus[p.key] ?? null}
              farge={PERIOD_COL[p.key]}
              tom="Fokusområdene for denne perioden settes i IUP-samtalen med treneren."
            />
          ))}
        </div>
      </section>

      <Milepaeler naaIso={naaIso} />
    </div>
  );
}
