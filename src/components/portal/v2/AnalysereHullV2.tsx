"use client";

/**
 * PlayerHQ Hull-analyse — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  PillTabs,
  Rad,
  TomTilstand,
  SgKategorier,
  MiniSpark,
  Scorekort,
  VarmeKart,
  HjelpTips,
  Icon,
  hoverKapabel,
} from "@/components/v2";
import { MIN_RUNDER, type HullVarmeCelle, type HullVarmeResultat } from "@/lib/domain/hole-heatmap";

/* ── Datakontrakt (mappes fra Prisma i ruten) ──────────────────────────── */

export interface HullSone {
  id: "tee" | "app" | "arg" | "putt";
  /** Fagkode for SG-stolpene (OTT/APP/ARG/PUTT). */
  kode: "OTT" | "APP" | "ARG" | "PUTT";
  label: string;
  sub: string;
  /** Siste SG-registrering for sonen — null når ikke registrert. */
  sg: number | null;
  /** SG-trend eldste → nyeste (kan være tom). */
  trend: number[];
  /** Trening siste 30 dager. */
  okter: number;
  minutter: number;
}

export interface HullRundeHull {
  holeNumber: number;
  par: number;
  strokes: number;
}

export interface HullRunde {
  courseName: string;
  /** Registrert totalscore for runden (brutto). */
  totalScore: number;
  /** Sum (slag − par) over alle registrerte hull. */
  parDiff: number;
  holeCount: number;
  holes: HullRundeHull[];
}

export interface AnalysereHullV2Data {
  soner: HullSone[];
  /** Antall SG-registreringer datagrunnlaget bygger på. */
  sgRegistreringer: number;
  runde: HullRunde | null;
  /** Varmekart-aggregat (snitt avvik fra par per hull) — se src/lib/domain/hole-heatmap.ts. */
  hullVarme: HullVarmeResultat;
}

/* ── Hjelpere ──────────────────────────────────────────────────────────── */

function fmtSignedNb(n: number): string {
  return n === 0 ? "E" : (n > 0 ? "+" : "−") + String(Math.abs(n));
}

/** Rutenett-form for varmekartet: ≤ 9 hull → én rad; ellers UT (1–9) / INN
 *  (10–18) i to rader — jf. designkontrakten («hold gridet lite, ≤ ~10×8»). */
function byggVarmeGrid(celler: HullVarmeCelle[]): {
  rows: string[];
  cols: string[];
  values: number[][];
  raw: (HullVarmeCelle | null)[][];
} {
  if (celler.length === 0) return { rows: [], cols: [], values: [], raw: [] };
  const byNr = new Map(celler.map((c) => [c.holeNumber, c]));
  const maxHull = Math.max(...celler.map((c) => c.holeNumber));

  const lagRad = (fra: number, til: number) =>
    Array.from({ length: til - fra + 1 }, (_, i) => byNr.get(fra + i) ?? null);

  const raw = maxHull <= 9 ? [lagRad(1, maxHull)] : [lagRad(1, 9), lagRad(10, 18)];
  const cols = Array.from({ length: raw[0].length }, (_, i) => String(i + 1));
  const rows = raw.length === 1 ? ["Hull"] : ["UT", "INN"];
  const values = raw.map((rad) => rad.map((c) => c?.intensitet ?? 0));

  return { rows, cols, values, raw };
}

/* ── Sone-diagram — illustrativt, bane-uavhengig «vei mot green» ───────────
   (tee → innspill → nærspill → putt). IKKE et geografisk kart — aggregert på
   tvers av spillerens runder, se docs/design-bestillinger/v2-sonekart-hull-
   analyse.md for hvorfor et ekte banekart (golfdata HoleAnalysis / Mapbox
   CourseMap) ble forkastet. Tap/hover-popover per sone er en 1:1-kopi av
   VarmeKartCelle-mønsteret i src/components/v2/datavis.tsx: ekte hover-enhet
   åpner ved museover, touch åpner/lukker ved trykk, Escape/fokus-tap lukker.
   Ny visning av SAMME data som Rad-listen under viser — ingen ny query. ── */

const SONE_IKON: Record<HullSone["id"], string> = {
  tee: "target",
  app: "crosshair",
  arg: "footprints",
  putt: "flag",
};

function SoneDiagramBlokk({
  sone,
  harData,
  align,
}: {
  sone: HullSone;
  harData: boolean;
  align: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const kanHover = useRef(false);
  useEffect(() => {
    kanHover.current = hoverKapabel();
  }, []);

  // Tom-tilstand (0 SG-registreringer totalt): nøytral T.mut uansett fortegn
  // — aldri fabrikker et tall når datagrunnlaget mangler.
  const visSg = harData && sone.sg != null;
  const farge = visSg ? (sone.sg! >= 0 ? T.up : T.down) : T.mut;
  const sgTekst = visSg ? `${fmtSg(sone.sg!)} slag` : "—";
  const kortTekst = `${sone.label}: ${sgTekst}`;

  return (
    <span
      style={{ position: "relative", display: "flex", flex: 1, minWidth: 0 }}
      onMouseEnter={() => { if (kanHover.current) setOpen(true); }}
      onMouseLeave={() => { if (kanHover.current) setOpen(false); }}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={kortTekst}
        aria-expanded={open}
        title={kortTekst}
        className="v2-focus"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "12px 4px 10px",
          borderRadius: T.rRow,
          cursor: "pointer",
          background: T.panel2,
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon name={SONE_IKON[sone.id]} size={16} style={{ color: farge }} />
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>
          {sone.kode}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: farge, fontVariantNumeric: "tabular-nums" }}>
          {visSg ? fmtSg(sone.sg!) : "—"}
        </span>
        <span style={{ width: "70%", height: 4, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
          <span
            style={{
              display: "block",
              height: "100%",
              borderRadius: 9999,
              background: farge,
              width: visSg ? `${Math.min(100, Math.abs(sone.sg!) * 40 + 14)}%` : "0%",
            }}
          />
        </span>
      </span>

      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            [align === "right" ? "right" : "left"]: 0,
            zIndex: 50,
            width: "max-content",
            maxWidth: 220,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "11px 13px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{sone.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, marginTop: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>mot Broadie scratch</span>
            <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: farge }}>{sgTekst}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <MiniSpark verdier={sone.trend} />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.5, margin: "8px 0 0", paddingTop: 7, borderTop: `1px solid ${T.border}` }}>
            {sone.okter} økter · {sone.minutter} min siste 30 d
          </p>
        </div>
      )}
    </span>
  );
}

function SoneDiagram({ soner, harData }: { soner: HullSone[]; harData: boolean }) {
  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Sone-kart <HjelpTips k="soneDiagram" size={11} />
        </span>
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
        {soner.map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && (
              <span
                aria-hidden
                style={{ flex: "0 1 10px", minWidth: 6, height: 2, borderRadius: 2, background: T.border, alignSelf: "center", marginTop: 20 }}
              />
            )}
            <SoneDiagramBlokk sone={s} harData={harData} align={i < soner.length / 2 ? "left" : "right"} />
          </Fragment>
        ))}
      </div>
    </Kort>
  );
}

/* ── Fane 1: Sone-kart (SG + trening per sone) ─────────────────────────── */

function SoneFane({ soner, sgRegistreringer }: { soner: HullSone[]; sgRegistreringer: number }) {
  const harData = sgRegistreringer > 0;
  const kategorier = soner
    .filter((s): s is HullSone & { sg: number } => s.sg != null)
    .map((s) => ({ akse: s.kode, sg: s.sg }));

  return (
    <>
      <SoneDiagram soner={soner} harData={harData} />

      {harData && kategorier.length > 0 ? (
        <SgKategorier
          kategorier={kategorier}
          baseline="Broadie scratch"
          hjelp="sgOmrade"
        />
      ) : (
        <Kort eyebrow="SG per sone">
          <TomTilstand
            icon="flag"
            title="Ingen SG-registreringer ennå"
            sub="Logg en runde med Strokes Gained, så fylles sonene med dine faktiske tall."
          />
        </Kort>
      )}

      <Kort
        eyebrow="Per sone"
        action={
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
            trening siste 30 dager · {sgRegistreringer} SG-registreringer
          </span>
        }
      >
        {soner.map((s, i) => (
          <Rad
            key={s.id}
            last={i === soner.length - 1}
            title={s.label}
            sub={`${s.sub} · ${s.okter} økter · ${s.minutter} min siste 30 d`}
            meta={<MiniSpark verdier={s.trend} />}
            trailing={
              <span
                style={{
                  width: 84,
                  flex: "none",
                  textAlign: "right",
                  fontFamily: T.mono,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: s.sg == null ? T.mut : s.sg >= 0 ? T.up : T.down,
                }}
              >
                {s.sg == null ? "—" : `${fmtSg(s.sg)} slag`}
              </span>
            }
          />
        ))}
      </Kort>
    </>
  );
}

/* ── Fane 2: Hull for hull (siste runde) ───────────────────────────────── */

function VarmekartKort({ hullVarme }: { hullVarme: HullVarmeResultat }) {
  const grid = byggVarmeGrid(hullVarme.celler);
  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Varmekart · hvor du taper slag <HjelpTips k="hullVarme" size={11} />
        </span>
      }
      action={
        hullVarme.harNokData ? (
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
            {hullVarme.rundeAntall} runder m/ hull-for-hull
          </span>
        ) : undefined
      }
    >
      {hullVarme.harNokData ? (
        <div style={{ overflowX: "auto" }}>
          <VarmeKart
            rows={grid.rows}
            cols={grid.cols}
            values={grid.values}
            color={T.down}
            fmt={(_v, ri, ci) => {
              const c = grid.raw[ri]?.[ci];
              if (!c) return "Ingen data på dette hullet";
              return `${fmtSg(c.snittDiff)} mot par · ${c.rundeAntall} ${c.rundeAntall === 1 ? "runde" : "runder"}`;
            }}
          />
        </div>
      ) : (
        <TomTilstand
          icon="flag"
          title="For få runder til varmekart"
          sub={`Logg minst ${MIN_RUNDER} runder hull for hull, så vises varmekartet over banen.`}
        />
      )}
    </Kort>
  );
}

function HullFane({ runde, hullVarme }: { runde: HullRunde | null; hullVarme: HullVarmeResultat }) {
  if (!runde) {
    return (
      <Kort eyebrow="Hull for hull">
        <TomTilstand
          icon="flag"
          title="Ingen runder med hull-score ennå"
          sub="Logg en runde hull for hull, så ser du fordelingen her."
        />
      </Kort>
    );
  }

  const snittDiff = runde.parDiff / runde.holeCount;
  const snittTekst =
    (snittDiff >= 0 ? "+" : "−") +
    Math.abs(snittDiff).toLocaleString("nb-NO", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  const parSum = runde.holes.reduce((s, h) => s + h.par, 0);
  const slagSum = runde.holes.reduce((s, h) => s + h.strokes, 0);

  return (
    <>
      <Caps>Siste runde · {runde.courseName}</Caps>

      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Score (brutto)" value={runde.totalScore} instant />
        <KpiFlis label="Mot par" value={fmtSignedNb(runde.parDiff)} instant />
        <KpiFlis label="Snitt per hull" value={snittTekst} instant />
      </div>

      <Scorekort
        hull={runde.holes.map((h) => ({
          nr: h.holeNumber,
          par: h.par,
          score: h.strokes,
          sg: null,
        }))}
        sammendrag={{ score: slagSum, par: parSum, sg: null }}
        baseline="Broadie scratch"
        hjelp="sgTotal"
      />

      <VarmekartKort hullVarme={hullVarme} />
    </>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────────── */

type TabKey = "sone" | "hull";

export function AnalysereHullV2({ data }: { data: AnalysereHullV2Data }) {
  const [tab, setTab] = useState<TabKey>("sone");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · Hull-analyse</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="slag?">Hvor taper du</Tittel>
        </div>
      </div>

      <PillTabs
        tabs={[
          { id: "sone", l: "Sone-kart" },
          { id: "hull", l: "Hull for hull" },
        ]}
        value={tab}
        onChange={(id) => setTab(id as TabKey)}
      />

      {tab === "sone" ? (
        <SoneFane soner={data.soner} sgRegistreringer={data.sgRegistreringer} />
      ) : (
        <HullFane runde={data.runde} hullVarme={data.hullVarme} />
      )}
    </div>
  );
}
