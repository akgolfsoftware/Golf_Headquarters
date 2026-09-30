"use client";

/**
 * PH-RD-01/02/03/05 · Registrer runde live — Precision Athletics (Claude Design
 * 7d7c2994, ui_kits/playerhq/screens/PH-RD-1.jsx og PH-RD-live.jsx, runde 24).
 *
 * Styrer hele føringen på /portal/runde/live:
 *   oppsett (PH-RD-02) → føring → ferdig (PH-RD-08)
 * Føringen har to nivåer (PH-RD-01): slag for slag (PH-RD-03/04, PH08RundeLive)
 * og bare score per hull (rask stepper, PH-RD-03 fra runde 21). Fra stepperen
 * åpnes SG hittil (PH-RD-05).
 *
 * Tilstanden er den samme som før: LoggetHull i kladden (localStorage, per
 * bruker), lagring via lagreLoggetRunde i PHRD08Ferdig. Ingen ny server-kode.
 * Slag som er påbegynt på et hull, men ikke ferdig, lagres i en egen lokal
 * nøkkel så et sideskift ikke mister dem.
 *
 * Bevisste avvik fra tegningen:
 *   - Tee/lengdemal er ikke valg: baneregisteret har ikke tee-varianter. Par og
 *     lengde hentes per hull og kan rettes for hånd (tegningen sier «legg inn
 *     manuelt» når banen mangler).
 *   - Hullrutenettet i stepperen bryter om til 44 px brede ruter (tegningen har
 *     9 like kolonner, 36 px på 390): treffmålet er minst 44 px.
 *   - Import (PH-RD-07) finnes ikke i koden og er ikke bygget. Forslag i PR-en.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChartNoAxesColumn, Check, Flag, Info, Minus, Play, Plus, Route } from "lucide-react";
import { hentBaneHull } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { lesKladdCached, lesKladdServer, lagreKladd, slettKladd } from "@/lib/runde-logg/draft";
import { syntetiserHurtigHull, scoreFraHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, Knapp, KnappLenke, Meta, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Dialogboks, Nedtrekk, Skjemafelt } from "@/components/precision/pa-a4";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { InlineVarsel, KortHode, Kort } from "@/components/precision/pa-a5";
import { PH08RundeLive, type SpiltHull, type UtkastSlag } from "./PH08RundeLive";
import { PHRD08Ferdig } from "./PHRD08Ferdig";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";

const STANDARD_LENGDE: Record<number, number> = { 3: 150, 4: 350, 5: 480 };
const UTKAST_NOKKEL = "akgolf.runde-logg.utkast.v1";
const abonnerIngen = () => () => {};

const erFerdig = (h: LoggetHull) => h.slag.at(-1)?.resultat.iHull === true;
const toPar = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "±0");
const sgf = (v: number) => `${v > 0.04 ? "+" : v < -0.04 ? "−" : "±"}${Math.abs(v).toFixed(1).replace(".", ",")}`;

type Steg = "oppsett" | "foring" | "ferdig";
type Modus = "slag" | "hurtig";
type Visning = "foring" | "sg";
type Hullvalg = "18" | "ut" | "inn";
type RundeType = "turnering" | "trening";
type OppsettHull = { holeNumber: number; par: number; lengdeMeter: number };
type OppsettInfo = { courseId: string; courseNavn: string; roundType: RundeType; hullValg: Hullvalg; playedAt: string };

export type PHRDLiveProve = {
  steg: Steg;
  modus?: Modus;
  visning?: Visning;
  oppsett?: OppsettInfo;
  hullData?: LoggetHull[];
  idx?: number;
  kladd?: boolean;
  feil?: string;
};
type Props = { baner: Array<{ id: string; name: string }>; prove?: PHRDLiveProve };

function iDagISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

function standardHull(v: Hullvalg): OppsettHull[] {
  const start = v === "inn" ? 10 : 1;
  return Array.from({ length: v === "18" ? 18 : 9 }, (_, i) => ({ holeNumber: start + i, par: 4, lengdeMeter: STANDARD_LENGDE[4] }));
}

/* ---------- Utkast: slag som er påbegynt på ett hull ---------- */

function lesUtkast(eierId: string | null): Record<number, UtkastSlag[]> {
  const n = byggLagringsNokkel(UTKAST_NOKKEL, eierId);
  if (!n || typeof window === "undefined") return {};
  try {
    const raa = window.localStorage.getItem(n);
    const j = raa ? (JSON.parse(raa) as unknown) : null;
    return j && typeof j === "object" && !Array.isArray(j) ? (j as Record<number, UtkastSlag[]>) : {};
  } catch { return {}; }
}
function skrivUtkast(eierId: string | null, u: Record<number, UtkastSlag[]>) {
  const n = byggLagringsNokkel(UTKAST_NOKKEL, eierId);
  if (!n || typeof window === "undefined") return;
  try {
    if (Object.values(u).every((l) => l.length === 0)) window.localStorage.removeItem(n);
    else window.localStorage.setItem(n, JSON.stringify(u));
  } catch { /* full kvote eller privat modus: føringen fortsetter uten */ }
}

/* ---------- PH-RD-02 Oppsett ---------- */

function Oppsett({ baner, kladd, onStart, onFortsett, onForkast }: {
  baner: Array<{ id: string; name: string }>;
  kladd: { courseNavn: string; ferdige: number } | null;
  onStart: (o: OppsettInfo & { hull: OppsettHull[]; modus: Modus }) => void;
  onFortsett: () => void;
  onForkast: () => void;
}) {
  const [courseId, setCourseId] = useState(baner[0]?.id ?? "");
  const [roundType, setRoundType] = useState<RundeType>("turnering");
  const [antall, setAntall] = useState<"9" | "18">("18");
  const [start, setStart] = useState<"1" | "10">("1");
  const [playedAt, setPlayedAt] = useState(iDagISO());
  const [modus, setModus] = useState<Modus>("slag");
  const [hull, setHull] = useState<OppsettHull[]>(() => standardHull("18"));
  const [fraRegister, setFraRegister] = useState(false);
  const [henter, startHenting] = useTransition();
  const [forkast, setForkast] = useState(false);
  const hullValg: Hullvalg = antall === "18" ? "18" : start === "10" ? "inn" : "ut";

  useEffect(() => {
    if (!courseId) return;
    startHenting(async () => {
      try {
        const reg = await hentBaneHull(courseId);
        const basis = standardHull(hullValg);
        if (!Array.isArray(reg) || reg.length === 0) { setHull(basis); setFraRegister(false); return; }
        const perHull = new Map(reg.map((h) => [h.holeNumber, h]));
        setHull(basis.map((b) => {
          const r = perHull.get(b.holeNumber);
          const par = r?.par ?? 4;
          return { holeNumber: b.holeNumber, par, lengdeMeter: r?.lengdeMeter ?? STANDARD_LENGDE[par] ?? 350 };
        }));
        setFraRegister(true);
      } catch { setHull(standardHull(hullValg)); setFraRegister(false); }
    });
  }, [courseId, hullValg]);

  const settPar = (i: number, par: number) => setHull((h) => h.map((x, j) => (j === i ? { ...x, par } : x)));
  const settLengde = (i: number, v: string) => setHull((h) => h.map((x, j) => (j === i ? { ...x, lengdeMeter: Number(v.replace(/\D/g, "").slice(0, 3)) || 0 } : x)));
  const gyldig = courseId !== "" && hull.every((h) => h.lengdeMeter >= 40 && h.lengdeMeter <= 700);
  const courseNavn = baner.find((b) => b.id === courseId)?.name ?? "";
  const banePar = hull.reduce((a, h) => a + h.par, 0);
  const meter = hull.reduce((a, h) => a + h.lengdeMeter, 0);
  const tall = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const hode = <Sidehode kicker="Runde · Oppsett" title="Registrer runde" sub="Velg hvor mye du vil føre, bane, dato og antall hull. Par og hull-lengde hentes fra banen." />;

  if (baner.length === 0) {
    return <div className="pa-side">{hode}
      <TomTilstand icon={Flag} title="Ingen baner registrert" text="Banen legges inn av klubben eller coach. Uten bane kan ikke runden føres live." actions={<KnappLenke variant="secondary" href="/portal/analysere" icon={ArrowLeft} iconName="arrow-left">Til Analyse</KnappLenke>} />
    </div>;
  }

  return <div className="pa-side" style={{ maxWidth: 900 }}>
    {hode}
    {kladd && <InlineVarsel tone="warn" tittel="Du har en uferdig runde.">
      {kladd.courseNavn} · {kladd.ferdige} hull ført, lagret på denne telefonen.{" "}
      <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <Knapp size="sm" variant="secondary" onClick={onFortsett}>Fortsett kladden</Knapp>
        <Knapp size="sm" variant="ghost" onClick={() => setForkast(true)}>Forkast kladd</Knapp>
      </span>
    </InlineVarsel>}

    <Kort>
      <KortHode tittel="Føringsnivå" aside="DU KAN ALLTID LEGGE TIL MER ETTERPÅ" />
      <SegmentertValg label="Føringsnivå" value={modus} onChange={setModus} options={[{ id: "slag", label: "Slag for slag" }, { id: "hurtig", label: "Bare score per hull" }]} />
      <Meta>{modus === "slag" ? "ALLE SLAG MED AVSTAND, UNDERLAG OG KØLLE · FULL STROKES GAINED" : "BARE SLAG PER HULL · SG BLIR ET GROVT ESTIMAT · SLAG FOR SLAG KAN LEGGES TIL PÅ ETT HULL"}</Meta>
    </Kort>

    <Kort>
      <KortHode tittel="Runde" aside={<StatusPille tone="ok">Lagres på telefonen</StatusPille>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 12 }}>
        <Skjemafelt label="Bane"><Nedtrekk value={courseId} onChange={setCourseId} options={baner.map((b) => ({ value: b.id, label: b.name }))} /></Skjemafelt>
        <Skjemafelt label="Dato"><input className="a4-input a4-input--mono" type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} aria-label="Dato" /></Skjemafelt>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Skjemafelt label="Rundetype"><SegmentertValg label="Rundetype" value={roundType} onChange={setRoundType} options={[{ id: "turnering", label: "Turnering" }, { id: "trening", label: "Trening" }]} /></Skjemafelt>
        <Skjemafelt label="Antall hull"><SegmentertValg label="Antall hull" value={antall} onChange={setAntall} options={[{ id: "9", label: "9 hull" }, { id: "18", label: "18 hull" }]} /></Skjemafelt>
        {antall === "9" && <Skjemafelt label="Start på hull"><SegmentertValg label="Start på hull" value={start} onChange={setStart} options={[{ id: "1", label: "Hull 1" }, { id: "10", label: "Hull 10" }]} /></Skjemafelt>}
      </div>
      <Meta>{henter ? "HENTER BANEN …" : `PAR ${banePar} · ${tall(meter)} M · ${fraRegister ? "FRA BANEREGISTERET" : "BANEN MANGLER HULLDATA · RETT PAR OG LENGDE UNDER"}`}</Meta>
      <details>
        <summary style={{ minHeight: 44, display: "flex", alignItems: "center", cursor: "pointer", font: "500 14px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Rett par og lengde per hull</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
          {hull.map((h, i) => <div key={h.holeNumber} style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) minmax(0,1fr)", gap: 8, alignItems: "center" }}>
            <Meta>H{h.holeNumber}</Meta>
            <Nedtrekk value={String(h.par)} onChange={(v) => settPar(i, Number(v))} options={[3, 4, 5, 6].map((p) => ({ value: String(p), label: `Par ${p}` }))} />
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <input className="a4-input a4-input--mono" inputMode="numeric" aria-label={`Lengde hull ${h.holeNumber} i meter`} value={h.lengdeMeter || ""} onChange={(e) => settLengde(i, e.target.value)} style={{ minWidth: 0 }} />
              <Meta>M</Meta>
            </span>
          </div>)}
        </div>
      </details>
      {!gyldig && courseId !== "" && <InlineVarsel tone="warn" tittel="Sjekk lengdene.">Hull-lengde må være mellom 40 og 700 meter.</InlineVarsel>}
    </Kort>

    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <KnappLenke variant="ghost" href="/portal/runde/logg">Etterregistrer en spilt runde</KnappLenke>
      <Knapp size="lg" icon={Play} iconName="play" disabled={!gyldig || henter} onClick={() => onStart({ courseId, courseNavn, roundType, hullValg, playedAt, hull, modus })}>Start runde</Knapp>
    </div>

    <Dialogboks open={forkast} onClose={() => setForkast(false)} title="Forkaste kladden?" footer={<>
      <Knapp variant="secondary" onClick={() => setForkast(false)}>Behold</Knapp>
      <Knapp onClick={() => { setForkast(false); onForkast(); }}>Forkast</Knapp>
    </>}>
      Slagene som er ført på telefonen slettes. Kan ikke angres.
    </Dialogboks>
  </div>;
}

/* ---------- Rask føring: score per hull (PH-RD-03 fra runde 21) ---------- */

function Hurtig({ bane, hullData, idx, onIdx, onSett, onNeste, onSlag, onSg, onAvslutt }: {
  bane: string; hullData: LoggetHull[]; idx: number; onIdx: (i: number) => void; onSett: (i: number, slag: number) => void;
  onNeste: () => void; onSlag: () => void; onSg: () => void; onAvslutt: () => void;
}) {
  const h = hullData[idx];
  const scores = hullData.map((x) => scoreFraHull(x));
  const v = scores[idx] ?? h.par;
  const spilt = scores.filter((s) => s != null).length;
  const tot = scores.reduce<number>((a, s) => a + (s ?? 0), 0);
  const parHittil = scores.reduce<number>((a, s, i) => a + (s != null ? hullData[i].par : 0), 0);
  const stor = { width: 88, height: 88 } as const;
  const siste = idx === hullData.length - 1;
  return <div className="pa-root" data-design="precision-athletics" data-theme="night" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
    <main id="pa-innhold" style={{ flex: 1, width: "100%", maxWidth: 600, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56, flexWrap: "wrap" }}>
        <Link href="/portal/planlegge" className="pa-iconbtn" aria-label="Til planen. Kladden beholdes" style={{ width: 56, height: 56 }}><Ikon icon={ArrowLeft} name="arrow-left" size={20} /></Link>
        <StatusPille tone="live">Live</StatusPille>
        <Meta style={{ overflowWrap: "anywhere", flex: "1 1 120px" }}>HULL {h.holeNumber} · PAR {h.par} · {h.lengdeMeter} M</Meta>
        <Meta>{spilt ? `${tot} (${toPar(tot - parHittil)})` : "—"}</Meta>
      </div>
      <Meta style={{ overflowWrap: "anywhere" }}>{bane.toUpperCase()} · LAGRES PÅ TELEFONEN FOR HVERT HULL</Meta>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "12px 0" }}>
        <button type="button" className="pa-btn pa-btn--secondary" aria-label="Ett slag mindre" style={{ ...stor, padding: 0 }} onClick={() => v > 1 && onSett(idx, v - 1)}><Ikon icon={Minus} size={28} name="minus" /></button>
        <div style={{ textAlign: "center", minWidth: 96 }}>
          <div style={{ font: "600 72px/1 var(--font-mono)", color: "var(--text-primary)" }} aria-live="polite">{v}</div>
          <Meta>{toPar(v - h.par)} · BRUTTO</Meta>
        </div>
        <button type="button" className="pa-btn pa-btn--secondary" aria-label="Ett slag mer" style={{ ...stor, padding: 0 }} onClick={() => onSett(idx, scores[idx] == null ? h.par : v + 1)}><Ikon icon={Plus} size={28} name="plus" /></button>
      </div>
      <InlineVarsel tone="info" tittel="Bare score på dette hullet.">SG kan ikke beregnes for hull {h.holeNumber} uten slag for slag. Du kan legge til slag på hullet.</InlineVarsel>
      <div role="list" aria-label="Hulloversikt" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(44px,1fr))", gap: 4 }}>
        {hullData.map((x, i) => <button key={x.holeNumber} role="listitem" type="button" onClick={() => onIdx(i)} aria-current={i === idx ? "true" : undefined} aria-label={`Hull ${x.holeNumber}, ${scores[i] ?? "ikke ført"}`}
          style={{ height: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: "var(--radius-inner)", border: `1px solid ${i === idx ? "var(--border-ink)" : "var(--border-hairline)"}`, background: "var(--surface-card)", cursor: "pointer", padding: 0, minWidth: 0 }}>
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{x.holeNumber}</span>
          <span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)" }}>{scores[i] ?? "—"}</span>
        </button>)}
      </div>
      <Knapp variant="ghost" icon={ChartNoAxesColumn} iconName="chart-no-axes-column" onClick={onSg} disabled={spilt === 0} style={{ height: 56 }}>SG hittil · {spilt} hull</Knapp>
      <Knapp variant="ghost" icon={Check} iconName="check" onClick={onAvslutt} disabled={spilt === 0} style={{ height: 56 }}>Avslutt runden</Knapp>
    </main>
    <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 }}>
        <Knapp size="xl" fullWidth variant="secondary" icon={Route} iconName="route" onClick={onSlag}>Slag for slag på hull {h.holeNumber}</Knapp>
        <Knapp size="xl" fullWidth iconRight={ArrowRight} onClick={onNeste}>{siste ? `Lagre ${v} og avslutt` : `Lagre ${v} og neste hull`}</Knapp>
      </div>
    </div>
  </div>;
}

/* ---------- PH-RD-05 SG hittil ---------- */

function SgHittil({ bane, hullData, onTilbake }: { bane: string; hullData: LoggetHull[]; onTilbake: () => void }) {
  const ferdige = hullData.filter(erFerdig);
  let sg: ReturnType<typeof beregnSg> | null = null;
  try { if (ferdige.length > 0) sg = beregnSg(rundeTilSgShots(ferdige)); } catch { sg = null; }
  const kat: Array<[string, string, number | null]> = [["OTT", "Utslag", sg?.ott ?? null], ["APP", "Innspill", sg?.app ?? null], ["ARG", "Nærspill", sg?.arg ?? null], ["PUTT", "Putting", sg?.putt ?? null]];
  const maks = Math.max(1, ...kat.map(([, , v]) => Math.abs(v ?? 0)));
  return <div className="pa-root" data-design="precision-athletics" data-theme="night" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
    <main id="pa-innhold" style={{ flex: 1, width: "100%", maxWidth: 600, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
        <button type="button" className="pa-iconbtn" aria-label="Tilbake til runden" onClick={onTilbake} style={{ width: 56, height: 56 }}><Ikon icon={ArrowLeft} name="arrow-left" size={20} /></button>
        <div style={{ flex: 1, minWidth: 0 }}><div className="kicker">SG hittil</div><div style={{ font: "600 17px/1.2 var(--font-sans)", overflowWrap: "anywhere" }}>{bane}</div></div>
        <StatusPille tone="live">Live</StatusPille>
      </div>
      {!sg ? <TomTilstand icon={ChartNoAxesColumn} title="Ingen fullførte hull" text="SG vises når første hull er ført og ballen er i hull." />
        : <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><StatusPille>Estimat</StatusPille><StatusPille tone="warn">{ferdige.length} av {hullData.length} hull</StatusPille></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ font: "600 56px/1 var(--font-mono)", color: "var(--text-primary)" }}>{sgf(sg.total)}</span>
            <Meta>SG TOTALT · {ferdige.length} AV {hullData.length} HULL</Meta>
          </div>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {kat.map(([k, l, v]) => <div role="listitem" key={k} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr) 56px", gap: 10, alignItems: "center", minHeight: 44 }}>
              <span><span style={{ font: "600 14px/1 var(--font-mono)" }}>{k}</span><br /><Meta>{l.toUpperCase()}</Meta></span>
              <span aria-hidden style={{ height: 10, background: "var(--surface-sunken)", position: "relative", display: "block" }}>
                {v != null && <span style={{ position: "absolute", top: 0, bottom: 0, left: v >= 0 ? "50%" : `${50 - (Math.abs(v) / maks) * 50}%`, width: `${(Math.abs(v) / maks) * 50}%`, background: "var(--text-primary)" }} />}
                <span style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 1, background: "var(--border-strong)" }} />
              </span>
              <span style={{ font: "600 15px/1 var(--font-mono)", textAlign: "right" }}>{v == null ? "—" : sgf(v)}</span>
            </div>)}
          </div>
          <Meta>NULL = BASELINE KATEGORI D · LIK SKALA OVER OG UNDER</Meta>
          <InlineVarsel tone="info" tittel="Bare fullførte hull.">Hull uten slag for slag er en grov kjede fra scoren. Tallene regnes på nytt og lagres av serveren når runden lagres.</InlineVarsel>
        </>}
    </main>
    <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <Knapp size="xl" fullWidth icon={ArrowLeft} iconName="arrow-left" onClick={onTilbake}>Tilbake til runden</Knapp>
      </div>
    </div>
  </div>;
}

/* ---------- Styring ---------- */

export function PHRDLive({ baner, prove }: Props) {
  const eierId = useLokalDataEier();
  const [steg, setSteg] = useState<Steg>(prove?.steg ?? "oppsett");
  const [modus, setModus] = useState<Modus>(prove?.modus ?? "slag");
  const [visning, setVisning] = useState<Visning>(prove?.visning ?? "foring");
  const [oppsett, setOppsett] = useState<OppsettInfo | null>(prove?.oppsett ?? null);
  const [hullData, setHullData] = useState<LoggetHull[]>(prove?.hullData ?? []);
  const [idx, setIdx] = useState(prove?.idx ?? 0);
  const [kladdHandtert, setKladdHandtert] = useState(false);
  const [lagringsfeil, setLagringsfeil] = useState(false);
  const utkastRef = useRef<Record<number, UtkastSlag[]>>({});

  const snapshot = useCallback(() => lesKladdCached(eierId), [eierId]);
  const lagret = useSyncExternalStore(abonnerIngen, snapshot, lesKladdServer);
  const kladd = kladdHandtert || prove ? null : lagret;

  const startet = steg !== "oppsett" && oppsett != null && !prove;
  useEffect(() => {
    if (!startet || !oppsett) return;
    const ok = lagreKladd(eierId, {
      versjon: 1, modus: "live", foringsModus: modus === "slag" ? "slag" : "hurtig",
      steg: steg === "ferdig" ? "oppsummering" : "foring",
      oppsett: { courseId: oppsett.courseId, courseNavn: oppsett.courseNavn, roundType: oppsett.roundType, hullValg: oppsett.hullValg, playedAt: oppsett.playedAt },
      hullData, aktivtHullIdx: idx,
    });
    const t = window.setTimeout(() => setLagringsfeil(!ok), 0);
    return () => window.clearTimeout(t);
  }, [startet, steg, modus, oppsett, hullData, idx, eierId]);

  const start = (v: OppsettInfo & { hull: OppsettHull[]; modus: Modus }) => {
    setOppsett({ courseId: v.courseId, courseNavn: v.courseNavn, roundType: v.roundType, hullValg: v.hullValg, playedAt: v.playedAt });
    setHullData(v.hull.map((h) => ({ holeNumber: h.holeNumber, par: h.par, lengdeMeter: h.lengdeMeter, slag: [] })));
    utkastRef.current = {}; skrivUtkast(eierId, {});
    setIdx(0); setModus(v.modus); setVisning("foring"); setSteg("foring"); setKladdHandtert(true);
  };

  const fortsett = () => {
    if (!kladd) return;
    setOppsett({ courseId: kladd.oppsett.courseId ?? "", courseNavn: kladd.oppsett.courseNavn, roundType: kladd.oppsett.roundType, hullValg: kladd.oppsett.hullValg, playedAt: kladd.oppsett.playedAt });
    setHullData(kladd.hullData);
    setIdx(Math.min(kladd.aktivtHullIdx, Math.max(kladd.hullData.length - 1, 0)));
    utkastRef.current = lesUtkast(eierId);
    setModus(kladd.foringsModus === "hurtig" ? "hurtig" : "slag");
    setSteg(kladd.steg === "oppsummering" ? "ferdig" : "foring");
    setVisning("foring"); setKladdHandtert(true);
  };

  const forkast = () => { slettKladd(eierId); skrivUtkast(eierId, {}); utkastRef.current = {}; setKladdHandtert(true); };

  const hull = hullData[idx];
  const spilte: SpiltHull[] = useMemo(() => hullData.flatMap((h) => {
    if (!erFerdig(h)) return [];
    const s = scoreFraHull(h);
    return s == null ? [] : [{ par: h.par, slag: s }];
  }), [hullData]);

  const nesteUferdige = (fra: number, data: LoggetHull[]): number | null => {
    for (let s = 1; s <= data.length; s++) {
      const i = (fra + s) % data.length;
      if (!erFerdig(data[i])) return i;
    }
    return null;
  };

  const ferdigHull = (slag: LoggetSlag[], lengde: number) => {
    const ny = hullData.map((h, i) => (i === idx ? { ...h, slag, lengdeMeter: Math.min(700, Math.max(40, lengde)) } : h));
    setHullData(ny);
    utkastRef.current = { ...utkastRef.current, [idx]: [] }; skrivUtkast(eierId, utkastRef.current);
    const n = nesteUferdige(idx, ny);
    if (n == null) setSteg("ferdig"); else setIdx(n);
  };

  const settScore = (i: number, strokes: number) => setHullData((d) => d.map((h, j) => (j === i ? syntetiserHurtigHull({ holeNumber: h.holeNumber, par: h.par, lengdeMeter: h.lengdeMeter, strokes }) : h)));
  const hurtigNeste = () => {
    if (!hull) return;
    if (scoreFraHull(hull) == null) settScore(idx, hull.par);
    if (idx < hullData.length - 1) setIdx(idx + 1); else setSteg("ferdig");
  };

  if (steg === "oppsett" || !oppsett) {
    return <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <Oppsett baner={baner} kladd={kladd ? { courseNavn: kladd.oppsett.courseNavn, ferdige: kladd.hullData.filter(erFerdig).length } : prove?.kladd ? { courseNavn: "Fredrikstad GK", ferdige: 11 } : null} onStart={start} onFortsett={fortsett} onForkast={forkast} />
    </PlayerHQSkall>;
  }

  if (steg === "ferdig") {
    return <PHRD08Ferdig courseId={oppsett.courseId} courseNavn={oppsett.courseNavn} playedAt={oppsett.playedAt} roundType={oppsett.roundType} hullData={hullData} startFeil={prove?.feil ?? null}
      onTilbake={() => { setSteg("foring"); setVisning("foring"); }} />;
  }

  if (!hull) return null;
  const melding = lagringsfeil ? <div className="pa-alert pa-alert--warn" role="alert" style={{ margin: "0 16px" }}><Ikon icon={Info} size={18} /><span>Kunne ikke lagre runden på denne telefonen. Hold siden åpen og prøv igjen før du går ut.</span></div> : null;

  if (visning === "sg") return <SgHittil bane={oppsett.courseNavn} hullData={hullData} onTilbake={() => setVisning("foring")} />;

  if (modus === "hurtig") {
    return <>
      {melding}
      <Hurtig bane={oppsett.courseNavn} hullData={hullData} idx={idx} onIdx={setIdx} onSett={settScore} onNeste={hurtigNeste}
        onSlag={() => setModus("slag")} onSg={() => setVisning("sg")} onAvslutt={() => setSteg("ferdig")} />
    </>;
  }

  return <>
    {melding}
    <PH08RundeLive key={hull.holeNumber} tilstand="data" tema="night" bane={oppsett.courseNavn} hullNr={hull.holeNumber} antallHull={hullData.length}
      par={hull.par} lengdeMeter={hull.lengdeMeter} spilte={spilte} utkast={utkastRef.current[idx] ?? []}
      onUtkast={(u) => { utkastRef.current = { ...utkastRef.current, [idx]: [...u] }; skrivUtkast(eierId, utkastRef.current); }}
      onFerdigHull={(slag, lengde) => ferdigHull(slag, lengde)}
      onAvslutt={() => setSteg("ferdig")}
      onTilbake={() => { setModus("hurtig"); }} />
  </>;
}
