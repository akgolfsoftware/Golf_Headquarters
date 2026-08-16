"use client";

/**
 * AgencyOS Plan-maler — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Gjenbrukbare plan-skjeletter.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Kort,
  Knapp,
  StatusPill,
  TomTilstand,
  Icon,
  AKSE_NAVN,
  Inspektorpanel,
  InspektorBlokk,
  InspektorKpi,
  InspektorLinje,
  InspektorTom,
  MasterDetalj,
  useInspektorSynlig,
  T,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { LPhase } from "@/generated/prisma/enums";

// ── Datakontrakt (mappes fra PlanTemplate i ruten) ──────────────
export interface PlanMalFordeling {
  akse: AkseKey;
  /** Andel av planen for denne aksen, i prosent (0–100). */
  value: number;
}
/** Sammenhengende ukeblokk med samme dominerende pyramide-område — se bygUkeOversikt. */
export interface PlanMalUkeblokk {
  fraUke: number;
  tilUke: number;
  omrade: AkseKey;
  oktAntall: number;
}
export interface PlanMalRad {
  id: string;
  navn: string;
  /** NgfKategori (A–K) som streng. */
  kategori: string;
  fase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  usageCount: number;
  /** Antall øktrader i malen (PlanTemplateSession-count). */
  oktAntall: number;
  /** Disiplin-fordeling (topp→base av pyramiden). Tom = ingen gyldig kilde. */
  fordeling: PlanMalFordeling[];
  /** Godkjent kan rulles ut til grupper/spillere. Utkast kan ikke (fasit: agencyos-planbibliotek). */
  godkjent: boolean;
  /** Uke-for-uke — sammenhengende blokker med dominerende pyramide-område. Tom = ingen økter ennå. */
  ukeOversikt: PlanMalUkeblokk[];
  /** Gjennomsnittlig SG-Total-delta fra PlanEffectiveness. null = ingen målinger ennå. */
  effektAvg: number | null;
  /** Antall PlanEffectiveness-rader (fullførte planer) bak effektAvg. */
  effektAntall: number;
}
export interface AdminPlanMalerData {
  maler: PlanMalRad[];
}

const FASE_IKON: Record<LPhase, string> = {
  GRUNN: "sprout",
  SPESIAL: "target",
  TURNERING: "trophy",
  TESTUKE: "badge-check",
  FERIE: "sun",
  TRENINGSSAMLING: "users",
  HELDAGSSAMLING: "clock",
};
const FASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};
const FASE_FILTRE = ["Grunnfase", "Spesialfase", "Turneringsfase"] as const;

/** Rader per gruppe før «Vis N til». Holder mobilsiden på én skjermlengde. */
const VIS_ANTALL = 8;

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/**
 * Kompakt malrad — fasitens `.rad` i `agencyos-planbibliotek.html`:
 * navn, én metalinje, tynn andelsstripe og prosentnøkler. Ikke et kort.
 * Utkast vises uten stripe (fasit viser den kun for godkjente maler).
 */
function MalRad({
  m,
  last,
  valgt,
  visPanel,
  onVelg,
}: {
  m: PlanMalRad;
  last?: boolean;
  valgt?: boolean;
  /** true når inspektørpanelet er synlig (≥1024px) — klikk velger da i panelet i stedet for å navigere. */
  visPanel: boolean;
  onVelg: (id: string) => void;
}) {
  const bruk =
    m.usageCount === 0 ? "aldri brukt" : `brukt ${pl(m.usageCount, "gang", "ganger")}`;
  const meta = `${pl(m.oktAntall, "økt", "økter")} · ${bruk} · ${m.godkjent ? "godkjent" : "utkast"}`;
  const andeler = m.fordeling.filter((f) => f.value > 0);
  const visStripe = m.godkjent && andeler.length > 0;
  // Fasit viser alle andelene, største først, og lar linja brytes.
  const nokler = andeler.slice().sort((a, b) => b.value - a.value);

  return (
    <Link
      href={`/admin/plan-templates/${m.id}`}
      aria-current={valgt ? "true" : undefined}
      onClick={(e) => {
        // Desktop (≥1024px): inspektørpanelet er synlig — klikk velger malen der
        // i stedet for å navigere bort fra lista. Mobil: naviger til detaljruten
        // som før (ingen panel å velge inn i).
        if (visPanel) {
          e.preventDefault();
          onVelg(m.id);
        }
      }}
      className="v2-row-h"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 10px",
        margin: "0 -10px",
        borderRadius: T.rRow,
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        background: valgt ? T.panel3 : undefined,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flex: "none",
          borderRadius: 9,
          background: T.panel3,
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon name={FASE_IKON[m.fase]} size={16} style={{ color: T.lime }} />
      </span>

      {/* minWidth 0: uten den sprenger nowrap-teksten kolonnen (gotcha 10.08) */}
      <span style={{ flex: 1, minWidth: 0, display: "block" }}>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {m.navn}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 11.5,
            color: T.mut,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta}
        </span>

        {visStripe && (
          <>
            <span
              style={{ display: "flex", gap: 2, height: 6, borderRadius: 999, overflow: "hidden", marginTop: 7 }}
              aria-hidden
            >
              {andeler.map((f) => (
                <span key={f.akse} style={{ display: "block", flex: f.value, background: T.ax[f.akse] }} />
              ))}
            </span>
            <span
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 5,
                fontFamily: T.mono,
                fontSize: 10,
                color: T.mut,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {nokler.map((f) => (
                <span key={f.akse}>
                  {f.akse} <b style={{ fontWeight: 500, color: T.fg }}>{f.value} %</b>
                </span>
              ))}
            </span>
          </>
        )}
      </span>

      <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none" }} />
    </Link>
  );
}

/** Gruppeseksjon med tittel, teller og forklaringsnotat — fasitens `.grp`. */
function Gruppe({
  tittel,
  teller,
  notat,
  maler,
  valgtId,
  visPanel,
  onVelg,
}: {
  tittel: string;
  teller: string;
  notat: string;
  maler: PlanMalRad[];
  valgtId: string | null;
  visPanel: boolean;
  onVelg: (id: string) => void;
}) {
  const [visAlle, setVisAlle] = useState(false);
  const synlige = visAlle ? maler : maler.slice(0, VIS_ANTALL);
  const skjulte = maler.length - synlige.length;

  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <h2 style={{ margin: 0, fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>{tittel}</h2>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
          {teller}
        </span>
      </div>
      <p style={{ margin: "6px 0 4px", fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.45, color: T.mut }}>
        {notat}
      </p>
      <div style={{ minWidth: 0 }}>
        {synlige.map((m, i) => (
          <MalRad
            key={m.id}
            m={m}
            last={i === synlige.length - 1 && skjulte === 0}
            valgt={m.id === valgtId}
            visPanel={visPanel}
            onVelg={onVelg}
          />
        ))}
      </div>
      {skjulte > 0 && (
        <Knapp icon="chevron-down" ghost full onClick={() => setVisAlle(true)}>
          Vis {skjulte} til
        </Knapp>
      )}
    </Kort>
  );
}

const STATUS_FILTRE = ["Godkjent", "Utkast"] as const;

/**
 * Filterpille med teller — fasitens `.chip` med `<span class="n">`.
 * Valgt = invertert blekk (fg-flate, bg-tekst), aldri oransje: den kanalen
 * er reservert «Én ting nå» (maks én oransje handling per skjerm).
 */
function FilterChip({
  etikett,
  antall,
  aktiv,
  onClick,
}: {
  etikett: string;
  antall: number;
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="v2-press v2-focus"
      aria-pressed={aktiv}
      onClick={onClick}
      style={{
        appearance: "none",
        cursor: "pointer",
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
        padding: "0 14px",
        borderRadius: T.rPill,
        whiteSpace: "nowrap",
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: 500,
        background: aktiv ? T.fg : T.panel3,
        color: aktiv ? T.bg : T.fg,
        border: `1px solid ${aktiv ? T.fg : T.borderS}`,
      }}
    >
      {etikett}
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          opacity: 0.7,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {antall}
      </span>
    </button>
  );
}

/**
 * Malinspektøren — fasitens `<aside class="panel">` (agencyos-planbibliotek.html),
 * bygget på det delte Inspektorpanel-primitivet (A2). Vises kun ≥1024px.
 *
 * Avvik fra fasit (dokumentert per CLAUDE.md-regel — aldri oppdiktede tall):
 * - «Brukes nå av»-lista er utelatt. Det finnes ingen relasjon fra TrainingPlan
 *   tilbake til PlanTemplate den ble opprettet fra (kun PlanEffectiveness.templateId,
 *   som først settes når en plan er FULLFØRT — ikke mens den er aktiv), så «hvilke
 *   spillere kjører denne malen akkurat nå» kan ikke besvares ærlig med dagens skjema.
 * - «Effekt»-blokka viser gjennomsnittlig SG-Total-delta fra PlanEffectiveness
 *   (samme kilde som allerede brukes i AdminPlanMalDetaljV2), ikke fasitens
 *   spesifikke «SG nærspill +0,41, 24 av 31 utrullinger med ≥10 runder etter» —
 *   den nedbrytningen finnes ikke i data.
 * - «Uke for uke» viser malens ekte dominerende pyramide-område per ukeblokk
 *   (bygUkeOversikt), ikke fasitens narrative fasenavn («kartlegging» osv.), som
 *   ikke er lagret noe sted.
 */
function PlanMalInspektor({ mal }: { mal: PlanMalRad }) {
  return (
    <Inspektorpanel
      tittel={mal.navn}
      tag={<StatusPill tone={mal.godkjent ? "up" : "warn"}>{mal.godkjent ? "Godkjent" : "Utkast"}</StatusPill>}
      fot={
        <>
          <Link href={`/admin/plan-templates/${mal.id}/rediger`} style={{ textDecoration: "none" }}>
            <Knapp ghost full icon="pencil">
              Rediger
            </Knapp>
          </Link>
          <Link href="/admin/grupper" style={{ textDecoration: "none" }}>
            <Knapp full icon="send">
              Rull ut
            </Knapp>
          </Link>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InspektorKpi
          label="Varighet"
          verdi={`${mal.varighetUker} uker`}
          sub={`${pl(mal.oktAntall, "økt", "økter")} · ${mal.ukentligOktAntall} per uke`}
        />
        <InspektorKpi
          label="Brukt"
          verdi={String(mal.usageCount)}
          sub={mal.usageCount === 1 ? "gang" : "ganger"}
        />
      </div>

      {mal.effektAvg != null && mal.effektAntall > 0 && (
        <InspektorBlokk label="Effekt">
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, lineHeight: 1.55, color: T.mut }}>
            Spillere som fullførte malen endret SG-Total med{" "}
            <span style={{ color: T.fg, fontWeight: 600 }}>
              {mal.effektAvg >= 0 ? "+" : ""}
              {mal.effektAvg.toFixed(2).replace(".", ",")}
            </span>{" "}
            i snitt, målt over {pl(mal.effektAntall, "fullført plan", "fullførte planer")}.
          </p>
        </InspektorBlokk>
      )}

      <InspektorBlokk label="Uke for uke">
        {mal.ukeOversikt.length === 0 ? (
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
            Ingen økter lagt inn i malen ennå.
          </p>
        ) : (
          mal.ukeOversikt.map((b, i) => (
            <InspektorLinje
              key={i}
              label={`${b.fraUke === b.tilUke ? `Uke ${b.fraUke}` : `Uke ${b.fraUke}–${b.tilUke}`} · ${AKSE_NAVN[b.omrade]}`}
              verdi={pl(b.oktAntall, "økt", "økter")}
            />
          ))
        )}
      </InspektorBlokk>
    </Inspektorpanel>
  );
}

export function AdminPlanMalerV2({ data }: { data: AdminPlanMalerData }) {
  const [fase, setFase] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  // Inspektørpanel (≥1024px): malen som er valgt inn — default første godkjente
  // (fasitens «list-mal-1» har aria-current), ellers første i lista.
  const [valgtId, setValgtId] = useState<string | null>(
    () => data.maler.find((m) => m.godkjent)?.id ?? data.maler[0]?.id ?? null,
  );
  const visPanel = useInspektorSynlig();

  const toggle = (x: string) =>
    setFase((arr) => (arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x)));
  const toggleStatus = (x: string) =>
    setStatus((arr) => (arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x)));

  const total = data.maler.length;
  const totalBruk = data.maler.reduce((sum, m) => sum + m.usageCount, 0);
  const totalGodkjent = data.maler.filter((m) => m.godkjent).length;

  const filtrert = data.maler.filter(
    (m) =>
      (fase.length === 0 || fase.indexOf(FASE_LABEL[m.fase]) !== -1) &&
      (status.length === 0 ||
        status.indexOf(m.godkjent ? STATUS_FILTRE[0] : STATUS_FILTRE[1]) !== -1),
  );

  // ── Hode — fasitens `.top` (agencyos-planbibliotek.html) ──────
  // Tittel + tellende undertittel til venstre, handling til høyre. Fasiten har
  // verken KPI-fliser eller full-bredde aksentknapp her: tallene bor i
  // undertittelen, og «Ny mal» er en vanlig knapp. Tidligere lå det fire
  // KpiFlis og en oransje full-bredde CTA over lista — de dyttet selve
  // biblioteket under skjermkanten på mobil.
  const undertittel =
    total === 0
      ? "Ingen maler ennå"
      : `${pl(total, "mal", "maler")} · brukt ${totalBruk} ${totalBruk === 1 ? "gang" : "ganger"}`;

  const nyMalKnapp = (
    <Link href="/admin/plan-templates/ny" style={{ textDecoration: "none" }}>
      <Knapp icon="plus">Ny mal</Knapp>
    </Link>
  );

  const hode = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div data-paper-pattern-topp data-paper-slug="agencyos-planbibliotek" style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Planer og maler</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {undertittel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>{nyMalKnapp}</div>
    </div>
  );

  if (total === 0) {
    return (
      <div data-paper-wave-h="plan-maler" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="layers"
            title="Ingen maler ennå"
            sub="Opprett den første malen for å spare tid når du lager nye planer."
          />
        </Kort>
      </div>
    );
  }

  // ── Filterrad med tellere — fasitens `.filters` ────────────────
  // Én rad, ikke to merkede grupper: status først, deretter fase.
  // Tellerne er faste tall for hele biblioteket (som fasiten), så de ikke
  // hopper mens du filtrerer.
  //
  // Valg med 0 treff vises ikke — verken status eller fase. En knapp som aldri
  // kan gi et resultat er støy: den ser klikkbar ut, og svaret er alltid en tom
  // liste. Gjelder begge kanaler; «Utkast 0» sto igjen da fasene ble ryddet.
  const statusMedTall = [
    { navn: STATUS_FILTRE[0], antall: totalGodkjent },
    { navn: STATUS_FILTRE[1], antall: total - totalGodkjent },
  ].filter((s) => s.antall > 0);

  const faseMedTall = FASE_FILTRE.map((navn) => ({
    navn,
    antall: data.maler.filter((m) => FASE_LABEL[m.fase] === navn).length,
  })).filter((f) => f.antall > 0);

  const filtre = (
    <div
      className="scrollbar-none"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        overflowX: "auto",
        padding: "10px 12px",
        borderRadius: T.rCard,
        background: T.panel2,
        border: `1px solid ${T.borderS}`,
      }}
    >
      {statusMedTall.map((s) => (
        <FilterChip
          key={s.navn}
          etikett={s.navn}
          antall={s.antall}
          aktiv={status.indexOf(s.navn) !== -1}
          onClick={() => toggleStatus(s.navn)}
        />
      ))}
      {faseMedTall.map((f) => (
        <FilterChip
          key={f.navn}
          etikett={f.navn}
          antall={f.antall}
          aktiv={fase.indexOf(f.navn) !== -1}
          onClick={() => toggle(f.navn)}
        />
      ))}
    </div>
  );

  // ── Grupper: Mest brukt (godkjent) + Utkast — fasitens `.grp` ──
  const godkjente = filtrert.filter((m) => m.godkjent);
  const utkast = filtrert.filter((m) => !m.godkjent);

  const liste =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand icon="filter" title="Ingen maler her" sub="Ingen maler passer filteret akkurat nå." />
      </Kort>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
        {godkjente.length > 0 && (
          <Gruppe
            tittel="Mest brukt"
            teller={pl(godkjente.length, "godkjent", "godkjente")}
            notat="Rekkefølgen følger bruk, ikke navn — malen du rullet ut sist ligger derfor ikke nødvendigvis øverst."
            maler={godkjente}
            valgtId={valgtId}
            visPanel={visPanel}
            onVelg={setValgtId}
          />
        )}
        {utkast.length > 0 && (
          <Gruppe
            tittel="Utkast"
            teller={String(utkast.length)}
            notat="Utkast kan ikke rulles ut til grupper. De må godkjennes først."
            maler={utkast}
            valgtId={valgtId}
            visPanel={visPanel}
            onVelg={setValgtId}
          />
        )}
      </div>
    );

  // Panelet følger valgtId uavhengig av filtrering — bytter du fane mens en mal
  // er valgt, skal panelet fortsatt vise den (som fasitens statiske utvalg).
  const valgtMal = data.maler.find((m) => m.id === valgtId) ?? null;

  return (
    <MasterDetalj
      panel={
        valgtMal ? (
          <PlanMalInspektor mal={valgtMal} />
        ) : (
          <InspektorTom
            tittel="Ingen mal valgt"
            tekst="Velg en mal i lista, så ser du innhold, effekt og utrulling her."
          />
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
        {hode}
        {filtre}
        {liste}
      </div>
    </MasterDetalj>
  );
}
