"use client";

/**
 * PlayerHQ Hull-analyse — v2 (retning C «Presis»). To faner (samme fane-logikk
 * som gamle HullTabs.tsx):
 *   1. «Sone-kart»    — spillerens EKTE SG- og treningsdata per sone
 *                       (Tee → Innspill → Nærspill → Putt). Det illustrative
 *                       top-down-banekartet (golfdata HoleAnalysis) har ingen
 *                       v2-motpart — dataene bæres i stedet av SgKategorier
 *                       (divergerende SG-stolper) + sone-rader m/ MiniSpark
 *                       (gap meldt, ikke improvisert kart).
 *   2. «Hull for hull» — score fra siste runde (ekte HoleScore-data) i
 *                       v2-Scorekort. SG per hull er ikke beregnet → vises
 *                       ærlig som «—» (aldri fabrikkert 0).
 * All data lastes i page.tsx (server) og sendes hit som props — komponenten
 * fabrikkerer ingenting. Kun v2-primitiver, ingen rå hex (kun T.*).
 */

import { useState } from "react";
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

/* ── Fane 1: Sone-kart (SG + trening per sone) ─────────────────────────── */

function SoneFane({ soner, sgRegistreringer }: { soner: HullSone[]; sgRegistreringer: number }) {
  const harData = sgRegistreringer > 0;
  const kategorier = soner
    .filter((s): s is HullSone & { sg: number } => s.sg != null)
    .map((s) => ({ akse: s.kode, sg: s.sg }));

  return (
    <>
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
