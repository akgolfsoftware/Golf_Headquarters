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
  TomTilstand,
  Icon,
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
function MalRad({ m, last }: { m: PlanMalRad; last?: boolean }) {
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
      className="v2-row-h"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 10px",
        margin: "0 -10px",
        borderRadius: T.rRow,
        borderBottom: last ? "none" : `1px solid ${T.border}`,
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
}: {
  tittel: string;
  teller: string;
  notat: string;
  maler: PlanMalRad[];
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
          <MalRad key={m.id} m={m} last={i === synlige.length - 1 && skjulte === 0} />
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

export function AdminPlanMalerV2({ data }: { data: AdminPlanMalerData }) {
  const [fase, setFase] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);

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
          />
        )}
        {utkast.length > 0 && (
          <Gruppe
            tittel="Utkast"
            teller={String(utkast.length)}
            notat="Utkast kan ikke rulles ut til grupper. De må godkjennes først."
            maler={utkast}
          />
        )}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {filtre}
      {liste}
    </div>
  );
}
