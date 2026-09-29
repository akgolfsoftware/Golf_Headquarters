"use client";

/**
 * AG-11-AR Workbench · årsplan og periode i Precision Athletics.
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-11-wb3.jsx
 * (AG-11-AR, AG-11-NY, AG-11-PER, AG-11-PERSKJEMA, AG-11-GRUPPE-AR) og
 * ui_kits/_shared/WB3-ar.jsx (runde 33).
 *
 * Samme data og samme skriveside som før: loadYear/loadPeriod (lesing),
 * coachLagrePeriode/coachSlettPeriode (spiller), coachLagreGruppePeriode/
 * coachSlettGruppePeriode/coachRullUtGruppeAarsplan (gruppe) og publishSessions
 * (publiser perioden). Ny er veilederen «Opprett årsplan» (coachOpprettArsplan).
 * Skjemaet lagrer det databasen har plass til: type, datoer, fokus, ukevolum og
 * økter per akse. Timer per akse og notat per periode, samt start/slutt på
 * selve årsplanen, er db_forslag og vises ikke som lagret.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, CalendarRange, ChevronLeft, ChevronRight, Check, Layers, Pencil, Plus, Send, Trash2, Users } from "lucide-react";
import { Ikon, Knapp, TomTilstand, AKSE_NAVN, type Akse } from "@/components/precision/pa";
import { Ark, Dialogboks, Nedtrekk, Side, SideHode, Skjemafelt, TekstOmrade, Tekstfelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { AKSER, Caps, Fremdrift, Valgpille, Velger, akseStil } from "@/components/precision/pa-workbench";
import { coachLagrePeriode, coachSlettPeriode } from "@/lib/workbench/session-actions";
import { coachOpprettArsplan } from "@/lib/workbench/arsplan-actions";
import { coachLagreGruppePeriode, coachRullUtGruppeAarsplan, coachSlettGruppePeriode } from "@/lib/workbench/gruppe-periode-actions";
import { publishSessions } from "@/lib/workbench/wb-actions";
import { validateWeek } from "@/lib/domain/workbench/operations";
import type { PeriodViewModel, PyramidArea, YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import {
  DAG, OKT_AKSER, PERIODE_TYPER, antallUker, isoMs, isoTilDmy, manederIn, omraadeAv, periodeEtikett, periodeType, plassering,
  skjemaFraPeriode, skjemaTilInput, sorter, timerTekst, tomtSkjema, ukenr,
  type Maned, type OktAkse, type PeriodeRad, type PeriodeSkjema, type SkjemaFeil,
} from "@/lib/workbench/arsplan-view";
import type { PeriodeInput } from "@/lib/workbench/perioder";
import { VelgerArk } from "./AG11Ark";
import "@/styles/precision-a9.css";
import "@/styles/precision-a1101.css";

/* ------------------------------------------------------------------ */
/* Felles                                                              */
/* ------------------------------------------------------------------ */

const akseAv = (a: OktAkse): Akse => a.toLowerCase() as Akse;
const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
type Resultat = { ok: boolean; periodeId?: string; error?: string };

export type PeriodeBlokk = {
  ukevolumMin: number | null;
  ukevolumMax: number | null;
  budsjett: Partial<Record<OktAkse, number>> | null;
  fraGruppe: boolean;
};

function tilRad(p: { id: string; type: string; startDate: string; endDate: string; focus: string | null }, b?: PeriodeBlokk): PeriodeRad {
  return {
    id: p.id, type: p.type as PeriodeRad["type"], startDate: p.startDate.slice(0, 10), endDate: p.endDate.slice(0, 10), focus: p.focus,
    ukevolumMin: b?.ukevolumMin ?? null, ukevolumMax: b?.ukevolumMax ?? null, budsjett: b?.budsjett ?? null, fraGruppe: b?.fraGruppe,
  };
}

function volumTekst(p: PeriodeRad): string {
  if (p.ukevolumMin == null && p.ukevolumMax == null) return "—";
  if (p.ukevolumMin != null && p.ukevolumMax != null && p.ukevolumMin !== p.ukevolumMax) return `${timerTekst(p.ukevolumMin).replace(" t", "")}–${timerTekst(p.ukevolumMax)}/uke`;
  return `${timerTekst(p.ukevolumMin ?? p.ukevolumMax)}/uke`;
}

function ukeTekst(p: PeriodeRad): string {
  const a = ukenr(p.startDate);
  const b = ukenr(p.endDate);
  return a === b ? `UKE ${a}` : `UKE ${a}–${b}`;
}

/** Beholderbredde med ResizeObserver. Før første måling regnes bredden som smal. */
function useBredde<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [bw, setBw] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setBw(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setBw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, bw] as const;
}

/* ------------------------------------------------------------------ */
/* Tidslinje: vannrett bånd (fra 700 px) og loddrett liste             */
/* ------------------------------------------------------------------ */

type TidslinjeProps = {
  fra: string; til: string; perioder: readonly PeriodeRad[]; valgtId: string | null; idag: string;
  onPeriode: (id: string) => void; onManed?: (nokkel: string) => void;
};

const TEGN = 7.2;
const tw = (s: string) => s.length * TEGN + 10;

function Tidslinje(p: TidslinjeProps) {
  const [ref, bw] = useBredde<HTMLDivElement>();
  return <div ref={ref} style={{ minWidth: 0 }}>{bw >= 700 ? <Bånd {...p} bw={bw} /> : <Liste {...p} />}</div>;
}

function Bånd({ fra, til, perioder, valgtId, idag, onPeriode, onManed, bw }: TidslinjeProps & { bw: number }) {
  const mn = manederIn(fra, til);
  const T0 = isoMs(fra);
  const span = isoMs(til) + DAG - T0;
  const pct = (t: number) => Math.max(0, Math.min(100, ((t - T0) / span) * 100));
  const items = perioder.map((p) => {
    const { l, r } = plassering(fra, til, p.startDate, p.endDate);
    const px = ((r - l) / 100) * bw - 2;
    const t = periodeType(p.type);
    const navn = t.navn.toUpperCase();
    const mode: "full" | "kode" | "ut" = tw(navn) <= px ? "full" : tw(t.kode) <= px && px >= 34 ? "kode" : "ut";
    return { p, l, r, spor: t.spor, navn, kode: t.kode, mode };
  });
  const ut = items.filter((i) => i.mode === "ut").sort((a, b) => a.l - b.l);
  const ender = [-99, -99];
  const plassert = ut.map((o) => {
    const w = Math.max(44, tw(o.kode));
    const cx = ((o.l + o.r) / 200) * bw;
    const x = Math.max(0, Math.min(bw - w, cx - w / 2));
    let rad = ender.findIndex((e) => x > e + 4);
    if (rad < 0) rad = 1;
    ender[rad] = x + w;
    return { ...o, rad, x, cx, w };
  });
  const rader = plassert.length ? Math.max(...plassert.map((o) => o.rad)) + 1 : 0;
  const forklaring = items.filter((i) => i.mode !== "full");
  const idagMs = isoMs(idag);
  return <div data-band="" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
    <div role="group" aria-label="Måneder" className="a1101-mnd" style={{ gridTemplateColumns: mn.map((m: Maned) => `minmax(0,${(Math.min(m.t1 + DAG, T0 + span) - Math.max(m.t0, T0)) / DAG}fr)`).join(" ") }}>
      {mn.map((m) => {
        const na = m.nokkel === idag.slice(0, 7);
        const tekst = bw / mn.length < 40 ? m.kort[0] : m.kort;
        return onManed
          ? <button key={m.nokkel} type="button" data-na={na} aria-label={`Åpne ${m.navn}`} onClick={() => onManed(m.nokkel)}>{tekst}</button>
          : <span key={m.nokkel} data-na={na}>{tekst}</span>;
      })}
    </div>
    <div role="group" aria-label="Perioder på tidslinjen" className="a1101-spor" style={{ height: 104 + rader * 52 }}>
      {mn.map((m) => <span key={m.nokkel} aria-hidden className="a1101-linje" style={{ height: 100, left: `${pct(m.t0)}%` }} />)}
      {items.map((i) => i.mode === "ut"
        ? <span key={i.p.id} aria-hidden className="a1101-bar" data-spor={i.spor} style={{ left: `${i.l}%`, width: `max(4px, calc(${i.r - i.l}% - 2px))`, top: 4 + i.spor * 52, pointerEvents: "none" }} />
        : <button key={i.p.id} type="button" className="a1101-bar" data-spor={i.spor} aria-pressed={valgtId === i.p.id}
          aria-label={`${periodeEtikett(i.p)}, ${isoTilDmy(i.p.startDate)}–${isoTilDmy(i.p.endDate)}`} onClick={() => onPeriode(i.p.id)}
          style={{ left: `${i.l}%`, width: `max(4px, calc(${i.r - i.l}% - 2px))`, top: 4 + i.spor * 52 }}>{i.mode === "full" ? i.navn : i.kode}</button>)}
      {plassert.map((o) => <span key={`u${o.p.id}`}>
        <span aria-hidden className="a1101-stolpe" style={{ left: o.cx, top: 4 + o.spor * 52 + 44, height: 104 - (4 + o.spor * 52 + 44) + o.rad * 52 + 2 }} />
        <button type="button" className="a1101-ut" aria-pressed={valgtId === o.p.id} aria-label={`${periodeEtikett(o.p)}, ${isoTilDmy(o.p.startDate)}–${isoTilDmy(o.p.endDate)}`}
          onClick={() => onPeriode(o.p.id)} style={{ left: o.x, top: 104 + o.rad * 52, width: o.w }}>{o.kode}</button>
      </span>)}
      {idagMs >= T0 && idagMs < T0 + span && <span aria-hidden className="a1101-idag" style={{ height: 100, left: `${pct(idagMs)}%` }} />}
    </div>
    {forklaring.length > 0 && <ul aria-label="Forkortelser" className="a1101-forkort">
      {forklaring.map((i) => <li key={i.p.id}><b>{i.kode}</b> {periodeEtikett(i.p)} · {ddmm(i.p.startDate)}{i.p.endDate !== i.p.startDate ? `–${ddmm(i.p.endDate)}` : ""}</li>)}
    </ul>}
    <div className="a9-rad"><Caps>STIPLET LINJE = I DAG {ddmm(idag)}</Caps><Caps>ØVERST PERIODER · NEDERST SAMLINGER, TESTUKER OG FERIE</Caps></div>
  </div>;
}

function Liste({ fra, til, perioder, valgtId, idag, onPeriode, onManed }: TidslinjeProps) {
  const mn = manederIn(fra, til);
  return <div data-band="" role="list" aria-label="Året måned for måned" className="a1101-liste">
    {mn.map((m) => {
      const aktive = perioder.filter((p) => isoMs(p.endDate) >= m.t0 && isoMs(p.startDate) <= m.t1);
      const na = idag.slice(0, 7) === m.nokkel;
      const navn = <>{m.kort} {String(m.y).slice(2)}{na && <Caps>I DAG {ddmm(idag)}</Caps>}</>;
      return <div key={m.nokkel} role="listitem" className="a1101-lmnd">
        {onManed
          ? <button type="button" className="a1101-lnavn" aria-label={`Åpne ${m.navn}`} onClick={() => onManed(m.nokkel)}>{navn}</button>
          : <span className="a1101-lnavn">{navn}</span>}
        <div className="a1101-lperioder">
          {aktive.length === 0 ? <span className="a1101-ingen"><Caps>INGEN PERIODE</Caps></span> : aktive.map((p) => {
            const a = isoMs(p.startDate) >= m.t0;
            const b = isoMs(p.endDate) <= m.t1;
            return <button key={p.id} type="button" className="a1101-lrad" data-spor={periodeType(p.type).spor} aria-pressed={valgtId === p.id} onClick={() => onPeriode(p.id)}>
              <span className="a1101-lrad__navn">{periodeEtikett(p)}</span>
              <Caps>{a && b ? `${ddmm(p.startDate)}${p.endDate !== p.startDate ? `–${ddmm(p.endDate)}` : ""}` : a ? `FRA ${ddmm(p.startDate)}` : b ? `TIL ${ddmm(p.endDate)}` : "HELE MÅNEDEN"}</Caps>
            </button>;
          })}
        </div>
      </div>;
    })}
  </div>;
}

/* ------------------------------------------------------------------ */
/* Periodeliste                                                        */
/* ------------------------------------------------------------------ */

function Periodeliste({ perioder, kildeTekst, onApne, onRediger }: {
  perioder: readonly PeriodeRad[]; kildeTekst: (p: PeriodeRad) => string; onApne: (id: string) => void; onRediger: (p: PeriodeRad) => void;
}) {
  if (perioder.length === 0) return <Caps>INGEN PERIODER ENNÅ · LEGG TIL MED «NY PERIODE»</Caps>;
  return <div role="list" aria-label="Perioder" className="a1101-prader">
    {perioder.map((p) => <div key={p.id} role="listitem" className="a1101-prad">
      <button type="button" className="a1101-prad__knapp" onClick={() => onApne(p.id)}>
        <span className="a1101-prad__navn">{periodeEtikett(p)}</span>
        <Caps>{[`${ddmm(p.startDate)}${p.endDate !== p.startDate ? `–${ddmm(p.endDate)}` : ""}`, ukeTekst(p), kildeTekst(p)].filter(Boolean).join(" · ")}</Caps>
      </button>
      <span className="a1101-tall">{volumTekst(p)}</span>
      <button type="button" className="pa-iconbtn" aria-label={`Rediger ${periodeType(p.type).navn}`} onClick={() => onRediger(p)}><Ikon icon={Pencil} size={18} /></button>
    </div>)}
  </div>;
}

/* ------------------------------------------------------------------ */
/* Periodeskjema (ark)                                                 */
/* ------------------------------------------------------------------ */

function PeriodeArk({ skjema: start, kicker, ny, onLagre, onSlett, onLukk, merknad }: {
  skjema: PeriodeSkjema; kicker: string; ny: boolean; onLagre: (input: PeriodeInput, id: string | null) => Promise<Resultat>;
  onSlett: (id: string) => Promise<{ ok: boolean; error?: string }>; onLukk: () => void; merknad: string;
}) {
  const [f, setF] = useState(start);
  const [feil, setFeil] = useState<SkjemaFeil>({});
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [slett, setSlett] = useState(false);
  const [travel, startT] = useTransition();
  const set = (o: Partial<PeriodeSkjema>) => setF((x) => ({ ...x, ...o }));

  function lagre() {
    const r = skjemaTilInput(f);
    if (!r.ok) { setFeil(r.feil); return; }
    setFeil({});
    setServerFeil(null);
    startT(async () => {
      const res = await onLagre(r.input, f.id);
      if (res.ok) onLukk(); else setServerFeil(res.error ?? "Perioden ble ikke lagret.");
    });
  }
  function bekreftSlett() {
    if (!f.id) return;
    const id = f.id;
    startT(async () => {
      const res = await onSlett(id);
      if (res.ok) onLukk(); else { setSlett(false); setServerFeil(res.error ?? "Perioden ble ikke slettet."); }
    });
  }

  return <>
    <Ark open onClose={onLukk} kicker={kicker} title={ny ? "Ny periode" : periodeType(f.type).navn}
      footer={<>
        <Knapp fullWidth icon={Check} loading={travel} onClick={lagre}>Lagre periode</Knapp>
        <Knapp variant="ghost" fullWidth onClick={onLukk} disabled={travel}>Avbryt</Knapp>
        {!ny && <Knapp variant="secondary" fullWidth icon={Trash2} onClick={() => setSlett(true)} disabled={travel}>Slett periode</Knapp>}
      </>}>
      <div className="a1101-skjema">
        {serverFeil && <InlineVarsel tone="signal" tittel="Periode">{serverFeil}</InlineVarsel>}
        {feil.generelt && <InlineVarsel tone="warn">{feil.generelt}</InlineVarsel>}
        <Skjemafelt label="Type"><Nedtrekk value={f.type} onChange={(v) => set({ type: v as PeriodeSkjema["type"] })} options={PERIODE_TYPER.map((t) => ({ value: t.verdi, label: t.navn }))} /></Skjemafelt>
        <div className="a1101-to">
          <Skjemafelt label="Start" error={feil.fra} required><Tekstfelt mono value={f.fra} onChange={(v) => set({ fra: v })} placeholder="dd.mm.åååå" /></Skjemafelt>
          <Skjemafelt label="Slutt" error={feil.til} required><Tekstfelt mono value={f.til} onChange={(v) => set({ til: v })} placeholder="dd.mm.åååå" /></Skjemafelt>
        </div>
        <Skjemafelt label="Fokus"><Tekstfelt value={f.fokus} onChange={(v) => set({ fokus: v })} placeholder="Styrke og hastighet" /></Skjemafelt>
        <div className="a1101-to">
          <Skjemafelt label="Volum per uke, fra (timer)" error={feil.volMin}><Tekstfelt mono inputMode="numeric" value={f.volMin} onChange={(v) => set({ volMin: v })} placeholder="6" /></Skjemafelt>
          <Skjemafelt label="Volum per uke, til (timer)" error={feil.volMax}><Tekstfelt mono inputMode="numeric" value={f.volMax} onChange={(v) => set({ volMax: v })} placeholder="8" /></Skjemafelt>
        </div>
        <Caps>ØKTER PER UKE PER AKSE</Caps>
        <div role="group" aria-label="Økter per uke per akse" className="a1101-timer">
          {OKT_AKSER.map((a) => <label key={a} style={akseStil(akseAv(a))}>
            <span className="a1101-timer__akse">{a}</span>
            <input className="a4-input a4-input--mono" inputMode="numeric" aria-label={`Økter per uke ${a}`} value={f.okter[a]} onChange={(e) => set({ okter: { ...f.okter, [a]: e.target.value } })} />
          </label>)}
        </div>
        {feil.okter && <p role="alert" className="a1101-hjelp" style={{ fontWeight: 600 }}>{feil.okter}</p>}
        <Caps>{merknad}</Caps>
        <Caps>TIMER PER AKSE OG NOTAT PER PERIODE LAGRES IKKE ENNÅ · FORSLAG TIL DATABASEN</Caps>
      </div>
    </Ark>
    <Dialogboks open={slett} onClose={() => setSlett(false)} title="Slette perioden?"
      footer={<><Knapp variant="ghost" onClick={() => setSlett(false)} disabled={travel}>Avbryt</Knapp><Knapp variant="signal" icon={Trash2} loading={travel} loadingText="Sletter …" onClick={bekreftSlett}>Slett periode</Knapp></>}>
      <p className="a1101-hjelp">{periodeType(f.type).navn} {f.fra}–{f.til} slettes fra planen. Økter som ligger i perioden blir stående. Sletting kan ikke angres.</p>
    </Dialogboks>
  </>;
}

/* ------------------------------------------------------------------ */
/* Opprett årsplan (veileder i tre steg)                               */
/* ------------------------------------------------------------------ */

type Kilde = "fjor" | "std" | "gruppe" | "tom";

function Valg({ på, disabled, tittel, under, onClick }: { på: boolean; disabled?: boolean; tittel: string; under?: string; onClick?: () => void }) {
  return <button type="button" role="radio" aria-checked={på} aria-disabled={disabled || undefined} className="a1101-valg" onClick={disabled ? undefined : onClick}>
    <span className="a1101-valg__prikk" aria-hidden />
    <span className="a1101-valg__tekst"><span className="a1101-valg__tittel">{tittel}</span>{under && <Caps>{under}</Caps>}</span>
  </button>;
}

function OpprettVeileder({ playerId, spillerNavn, aar, fjorAntall, onLukk }: { playerId: string; spillerNavn: string; aar: number; fjorAntall: number; onLukk: () => void }) {
  const router = useRouter();
  const [steg, setSteg] = useState<1 | 2 | 3>(1);
  const [kilde, setKilde] = useState<Kilde | null>(null);
  const [ar, setAr] = useState(String(aar));
  const [navn, setNavn] = useState("");
  const [sum, setSum] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const navnEllerStandard = navn.trim() || `Sesong ${ar}`;
  const stegNavn = ["Utgangspunkt", "Tidsrom", "Navn og sammendrag"];
  const fjorFeil = kilde === "fjor" && Number(ar) !== aar ? `Kopi av fjoråret er bare mulig for ${aar}. Velg ${aar}, eller bytt år i Workbench først.` : null;
  const kan = steg === 1 ? kilde === "fjor" || kilde === "tom" : steg === 2 ? Number.isInteger(Number(ar)) && !fjorFeil : navnEllerStandard.length > 0;

  function opprett() {
    setFeil(null);
    start(async () => {
      const res = await coachOpprettArsplan(playerId, { aar: Number(ar), navn: navnEllerStandard, sammendrag: sum.trim() || undefined, utgangspunkt: kilde === "fjor" ? "fjor" : "tom" });
      if (res.ok) { onLukk(); router.push(workbenchUrl(playerId, "aar", { aar: ar })); router.refresh(); } else setFeil(res.error ?? "Årsplanen ble ikke opprettet.");
    });
  }

  const aarValg = [aar - 1, aar, aar + 1, aar + 2].map((y) => ({ value: String(y), label: `Kalenderår ${y}` }));
  return <Ark open onClose={onLukk} kicker={`Steg ${steg} av 3 · ${stegNavn[steg - 1]} · for ${spillerNavn}`} title="Opprett årsplan"
    footer={<>
      {steg === 3
        ? <Knapp fullWidth icon={Check} disabled={!kan} loading={travel} loadingText="Oppretter …" onClick={opprett}>Opprett årsplan</Knapp>
        : <Knapp fullWidth disabled={!kan} onClick={() => setSteg((steg + 1) as 2 | 3)}>Neste</Knapp>}
      {steg > 1 ? <Knapp variant="ghost" fullWidth onClick={() => setSteg((steg - 1) as 1 | 2)} disabled={travel}>Tilbake</Knapp> : <Knapp variant="ghost" fullWidth onClick={onLukk}>Avbryt</Knapp>}
    </>}>
    <div className="a1101-skjema">
      <ol aria-label="Steg" className="a1101-steg">
        {stegNavn.map((s, i) => <li key={s} aria-current={steg === i + 1 ? "step" : undefined} data-ferdig={i < steg}>{s}</li>)}
      </ol>
      {feil && <InlineVarsel tone="signal" tittel="Årsplan">{feil}</InlineVarsel>}
      {steg === 1 && <div role="radiogroup" aria-label="Utgangspunkt" className="a1101-gruppe">
        <Valg på={kilde === "fjor"} disabled={fjorAntall === 0} tittel="Kopi av fjoråret" under={fjorAntall > 0 ? `${fjorAntall} PERIODER I ${aar - 1} · DATOENE FLYTTES ETT ÅR` : `INGEN PERIODER I ${aar - 1}`} onClick={() => setKilde("fjor")} />
        <Valg på={false} disabled tittel="Standardplan" under="INNHOLDET ER IKKE BESTEMT ENNÅ" />
        <Valg på={false} disabled tittel="Gruppas årsplan" under="IKKE BYGGET ENNÅ · RULL UT FRA GRUPPA I STEDET" />
        <Valg på={kilde === "tom"} tittel="Tom plan" under="DU LEGGER INN PERIODENE SELV" onClick={() => setKilde("tom")} />
      </div>}
      {steg === 2 && <>
        <Skjemafelt label="Tidsrom" hint="Årsplanen dekker hele kalenderåret."><Nedtrekk value={ar} onChange={setAr} options={aarValg} /></Skjemafelt>
        {fjorFeil && <p role="alert" className="a1101-hjelp" style={{ fontWeight: 600 }}>{fjorFeil}</p>}
        <Caps>SKOLEÅR (AUG–JUN) OG FRI START OG SLUTT KREVER NYE FELT PÅ ÅRSPLANEN · FORSLAG, IKKE BYGGET</Caps>
      </>}
      {steg === 3 && <>
        <Skjemafelt label="Navn"><Tekstfelt value={navn} onChange={setNavn} placeholder={`Sesong ${ar}`} /></Skjemafelt>
        <Skjemafelt label="Sammendrag"><TekstOmrade value={sum} onChange={setSum} placeholder="Fra kategori D mot C. Scoring 50–100 m og hastighet i vinter." /></Skjemafelt>
        <Caps>{(kilde === "fjor" ? "KOPI AV FJORÅRET" : "TOM PLAN")} · 01.01.{ar}–31.12.{ar}</Caps>
      </>}
    </div>
  </Ark>;
}

/* ------------------------------------------------------------------ */
/* Nivåfaner og hode                                                   */
/* ------------------------------------------------------------------ */

function NivaaFaner({ playerId, aar, valgt }: { playerId: string; aar: number; valgt: "ar" | "periode" }) {
  const uke = `${aar}-01-01`;
  const faner: [string, string, string][] = [
    ["ar", "År", workbenchUrl(playerId, "aar", { aar: String(aar) })],
    ["periode", "Periode", workbenchUrl(playerId, "periode", { aar: String(aar) })],
    ["maned", "Måned", workbenchUrl(playerId, "maned", { maned: `${aar}-01` })],
    ["uke", "Uke", workbenchUrl(playerId, "uke", {})],
    ["okt", "Økt", workbenchUrl(playerId, "okt", {})],
    ["mal", "Målsetninger", `/admin/workbench/${playerId}?vis=mal`],
    ["stall", "Stall", workbenchUrl(playerId, "stall", { uke })],
    ["live", "Live", workbenchUrl(playerId, "live", { uke })],
    ["min", "Min kalender", workbenchUrl(playerId, "min", { uke })],
  ];
  return <div role="tablist" aria-label="Nivå" className="a9-faner">
    {faner.map(([k, l, href]) => <Valgpille key={k} rolle="tab" valgt={k === valgt} href={href}>{l}</Valgpille>)}
  </div>;
}

/* ------------------------------------------------------------------ */
/* Spiller: År og Periode                                              */
/* ------------------------------------------------------------------ */

export type AG11ArProps = {
  playerId: string;
  spillerNavn: string;
  roster: readonly { id: string; navn: string }[];
  grupper: readonly { id: string; navn: string }[];
  niva: "ar" | "periode";
  aar: YearViewModel;
  /** Bare på nivå Periode. */
  periode: PeriodViewModel | null;
  plan: { navn: string | null; notater: string | null } | null;
  blokker: Record<string, PeriodeBlokk>;
  fjorAntall: number;
  idag: string;
  /** Åpner et ark ved første visning (brukes av skjermprøven). */
  startApen?: "veileder" | "skjema" | "ny-periode";
};

export function AG11Ar({ playerId, spillerNavn, roster, grupper, niva, aar, periode, plan, blokker, fjorAntall, idag, startApen }: AG11ArProps) {
  const router = useRouter();
  const [velger, setVelger] = useState<"spiller" | "gruppe" | null>(null);
  const year = aar.year;
  const perioder = useMemo(() => sorter(aar.periods.map((p) => tilRad(p, blokker[p.id]))), [aar.periods, blokker]);
  const førsteRad = (periode?.period ? perioder.find((p) => p.id === periode.period?.id) : undefined) ?? perioder[0];
  const [skjema, setSkjema] = useState<{ s: PeriodeSkjema; ny: boolean } | null>(
    startApen === "skjema" && førsteRad ? { s: skjemaFraPeriode(førsteRad), ny: false } : startApen === "ny-periode" ? { s: tomtSkjema(), ny: true } : null,
  );
  const [veileder, setVeileder] = useState(startApen === "veileder");
  const [publiser, setPubliser] = useState(false);
  const idx = roster.findIndex((p) => p.id === playerId);
  const spillerHref = (id: string) => workbenchUrl(id, niva === "ar" ? "aar" : "periode", { aar: String(year) });
  const gaaAar = (y: number) => router.push(workbenchUrl(playerId, niva === "ar" ? "aar" : "periode", { aar: String(y) }));
  const apnePeriode = (id: string) => router.push(workbenchUrl(playerId, "periode", { aar: String(year), periode: id }));
  const kilde = (p: PeriodeRad) => (p.fraGruppe ? "FRA GRUPPA" : "");
  const nyPeriode = () => setSkjema({ s: { ...tomtSkjema(), fra: "", til: "" }, ny: true });
  const rediger = (p: PeriodeRad) => setSkjema({ s: skjemaFraPeriode(p), ny: false });
  const lagre = async (input: PeriodeInput, id: string | null): Promise<Resultat> => {
    const res = await coachLagrePeriode(playerId, input, id ?? undefined);
    if (res.ok) router.refresh();
    return res;
  };
  const slett = async (id: string) => {
    const res = await coachSlettPeriode(playerId, id);
    if (res.ok) router.refresh();
    return res;
  };
  const harPlan = plan != null || perioder.length > 0;
  const tot = aar.plannedToDateMinutes;

  const arFlate = !harPlan ? (
    <TomTilstand icon={CalendarRange} title="Ingen årsplan ennå" text={`Lag en årsplan for ${spillerNavn.split(" ")[0]}, eller velg en annen spiller i velgeren.`}
      actions={<Knapp icon={Plus} onClick={() => setVeileder(true)}>Opprett årsplan</Knapp>} />
  ) : (
    <div className="a1101">
      <div className="a1101-hode">
        <div className="a1101-hode__tekst">
          <span className="a1101-tittel">{plan?.navn || `Årsplan ${year}`} · {spillerNavn}</span>
          <Caps>01.01.{year}–31.12.{year} · {perioder.length} PERIODER · {timerTekst(aar.completedMinutes)} AV {timerTekst(tot)} GJENNOMFØRT HITTIL</Caps>
        </div>
        <div className="a9-rad">
          <Knapp size="sm" icon={Plus} onClick={nyPeriode}>Ny periode</Knapp>
          <Knapp size="sm" variant="secondary" icon={CalendarPlus} onClick={() => setVeileder(true)}>Opprett årsplan</Knapp>
        </div>
      </div>
      {plan?.notater && <p className="a1101-hjelp">{plan.notater}</p>}
      <Caps>DU KAN LEGGE INN, ENDRE OG SLETTE PERIODENE TIL {spillerNavn.split(" ")[0].toUpperCase()}</Caps>
      {perioder.length > 0 && <Tidslinje fra={`${year}-01-01`} til={`${year}-12-31`} perioder={perioder} valgtId={null} idag={idag} onPeriode={apnePeriode}
        onManed={(n) => router.push(workbenchUrl(playerId, "maned", { maned: n }))} />}
      <div className="a1101-delt">
        <div className="a1101-delt__hode"><Caps>FORDELING PER AKSE · GJENNOMFØRT MOT PLAN</Caps></div>
        <div className="a9-fordeling">
          {AKSER.map((a) => {
            const py = AKSE_NAVN[a] as PyramidArea;
            const plann = aar.budget.byPyramid[py];
            const gj = aar.completedByPyramid[py];
            return <div key={a} className="a9-fordeling__rad" style={akseStil(a)}>
              <span className="a9-fordeling__topp"><span>{AKSE_NAVN[a]}</span><span>{timerTekst(gj)} av {timerTekst(plann)}</span></span>
              <Fremdrift pct={plann > 0 ? (gj / plann) * 100 : null} label={`${AKSE_NAVN[a]} gjennomført mot plan`} />
            </div>;
          })}
        </div>
      </div>
      <div className="a1101-delt">
        <div className="a1101-delt__hode"><Caps>PERIODER · {perioder.length}</Caps></div>
        <Periodeliste perioder={perioder} kildeTekst={kilde} onApne={apnePeriode} onRediger={rediger} />
      </div>
    </div>
  );

  /* ----- Periode ----- */
  const pv = periode;
  const lista = pv ? sorter(pv.periods.map((p) => tilRad(p, blokker[p.id]))) : [];
  const valgtRad = pv?.period ? tilRad(pv.period, blokker[pv.period.id]) : null;
  const i0 = valgtRad ? Math.max(0, lista.findIndex((p) => p.id === valgtRad.id)) : 0;
  const utkast = pv ? pv.sessions.filter((s) => s.status === "DRAFT") : [];
  const bud = valgtRad?.budsjett ?? null;
  const maxMin = pv ? Math.max(1, ...pv.distribution.map((d) => Math.max(d.plannedMinutes, d.completedMinutes))) : 1;

  const periodeFlate = !pv || !valgtRad ? (
    <TomTilstand icon={CalendarRange} title={perioder.length === 0 ? "Ingen perioder" : "Fant ikke perioden"} text={perioder.length === 0 ? `Årsplanen for ${year} har ingen perioder ennå.` : "Perioden finnes ikke i denne årsplanen."}
      actions={<><Knapp icon={Plus} onClick={nyPeriode}>Ny periode</Knapp><Knapp variant="secondary" icon={CalendarPlus} onClick={() => setVeileder(true)}>Opprett årsplan</Knapp></>} />
  ) : (
    <div className="a1101">
      <div className="a1101-nav">
        <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Forrige periode" disabled={i0 === 0} onClick={() => apnePeriode(lista[i0 - 1].id)}><Ikon icon={ChevronLeft} size={20} /></button>
        <span className="a1101-nav__midt"><span className="a1101-tittel">{periodeType(valgtRad.type).navn}</span>
          <Caps>{isoTilDmy(valgtRad.startDate)}–{isoTilDmy(valgtRad.endDate)} · {pv.weeks.length} {pv.weeks.length === 1 ? "UKE" : "UKER"}</Caps></span>
        <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Neste periode" disabled={i0 === lista.length - 1} onClick={() => apnePeriode(lista[i0 + 1].id)}><Ikon icon={ChevronRight} size={20} /></button>
      </div>
      <div className="a9-rad">
        <Knapp size="sm" variant="secondary" icon={Pencil} onClick={() => rediger(valgtRad)}>Rediger periode</Knapp>
        <Knapp size="sm" variant="secondary" icon={Plus} onClick={nyPeriode}>Ny periode</Knapp>
        <Knapp size="sm" variant="secondary" icon={Send} disabled={utkast.length === 0} onClick={() => setPubliser(true)}>Publiser periode</Knapp>
      </div>
      <Caps>{[kilde(valgtRad), `DU KAN LEGGE INN, ENDRE OG SLETTE PERIODENE TIL ${spillerNavn.split(" ")[0].toUpperCase()}`].filter(Boolean).join(" · ")}</Caps>
      <div className="a1101-delt"><div className="a1101-delt__hode"><Caps>FOKUS</Caps></div><p className="a1101-hjelp">{valgtRad.focus || "—"}</p></div>
      <div className="a1101-delt">
        <div className="a1101-delt__hode"><Caps>UKEVOLUM · {volumTekst(valgtRad).toUpperCase()}</Caps><Caps>{pv.sessions.length} ØKTER · {timerTekst(pv.plannedMinutes)} PLANLAGT · {timerTekst(pv.completedMinutes)} GJENNOMFØRT</Caps></div>
        <div role="list" aria-label="Planlagt og gjennomført per akse" className="a1101-akser">
          {AKSER.map((a) => {
            const d = pv.distribution.find((x) => x.pyramid === (AKSE_NAVN[a] as PyramidArea));
            const planl = d?.plannedMinutes ?? 0;
            const oAntall = bud?.[AKSE_NAVN[a] as OktAkse];
            return <div key={a} role="listitem" className="a1101-akse" style={akseStil(a)}>
              <span className="a1101-akse__navn">{AKSE_NAVN[a]}</span>
              <span aria-hidden className="a1101-akse__spor"><span className="a1101-akse__fyll" style={{ width: `${(planl / maxMin) * 100}%` }} /></span>
              <span className="a1101-akse__verdi">{timerTekst(planl)}{oAntall != null ? ` · ${oAntall} økt${oAntall === 1 ? "" : "er"}/uke` : ""}</span>
            </div>;
          })}
        </div>
        <Caps>PLANLAGT TID I ØKTENE I PERIODEN · ØKTER PER UKE ER DET SOM ER LAGT INN I PERIODEN</Caps>
      </div>
      <div className="a1101-delt">
        <div className="a1101-delt__hode"><Caps>UKENE</Caps></div>
        <div role="list" aria-label="Uker i perioden" className="a1101-uker">
          {pv.weeks.length === 0 ? <Caps>INGEN UKER</Caps> : pv.weeks.map((w) => <Link key={w.weekStart} role="listitem" href={workbenchUrl(playerId, "uke", { uke: w.weekStart })} className="a1101-uke">
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span className="a1101-prad__navn">Uke {w.weekNumber} · {ddmm(w.weekStart)}</span>
              <Caps>{w.sessionCount} ØKTER{w.completedMinutes > 0 ? ` · ${timerTekst(w.completedMinutes)} GJENNOMFØRT` : ""}</Caps></span>
            <span className="a1101-tall">{timerTekst(w.minutes)}</span>
          </Link>)}
        </div>
      </div>
    </div>
  );

  return <Side max={1440}>
    <div className="a9">
      <SideHode kicker="Workbench · Spiller" title="Workbench" />
      <Velger modus="spiller" navn={spillerNavn}
        onModus={(m) => { if (m === "gruppe") setVelger("gruppe"); }}
        onForrige={roster.length > 1 ? () => router.push(spillerHref(roster[(idx - 1 + roster.length) % roster.length].id)) : undefined}
        onNeste={roster.length > 1 ? () => router.push(spillerHref(roster[(idx + 1) % roster.length].id)) : undefined}
        onSok={() => setVelger("spiller")}
        meta={`${roster.length} ${roster.length === 1 ? "SPILLER" : "SPILLERE"} I STALLEN`} />
      <NivaaFaner playerId={playerId} aar={year} valgt={niva} />
      <div className="a9-ukenav" role="group" aria-label="Velg år">
        <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Forrige år" onClick={() => gaaAar(year - 1)}><Ikon icon={ChevronLeft} size={20} /></button>
        <div className="a9-ukenav__tittel">{year}</div>
        <button type="button" className="pa-iconbtn pa-iconbtn--secondary" aria-label="Neste år" onClick={() => gaaAar(year + 1)}><Ikon icon={ChevronRight} size={20} /></button>
      </div>
      <section aria-label={niva === "ar" ? "År" : "Periode"} className="pa-card a9-kort">{niva === "ar" ? arFlate : periodeFlate}</section>
    </div>
    {skjema && <PeriodeArk key={skjema.s.id ?? "ny"} skjema={skjema.s} ny={skjema.ny} kicker={`${skjema.ny ? "Ny periode" : "Rediger periode"} · ${spillerNavn}`}
      merknad={`${spillerNavn.split(" ")[0].toUpperCase()} SER ENDRINGEN`} onLagre={lagre} onSlett={slett} onLukk={() => setSkjema(null)} />}
    {veileder && <OpprettVeileder playerId={playerId} spillerNavn={spillerNavn} aar={year} fjorAntall={fjorAntall} onLukk={() => setVeileder(false)} />}
    {publiser && pv && <PubliserPeriodeArk okter={utkast} tittel={`${valgtRad ? periodeType(valgtRad.type).navn : "Periode"} · ${spillerNavn}`} onLukk={() => setPubliser(false)} onFerdig={() => router.refresh()} />}
    {velger && <VelgerArk modus={velger} liste={velger === "gruppe" ? grupper : roster} valgtId={velger === "gruppe" ? null : playerId}
      hrefFor={(id) => velger === "gruppe" ? `/admin/grupper/${id}/workbench` : spillerHref(id)} onLukk={() => setVelger(null)} />}
  </Side>;
}

/* ------------------------------------------------------------------ */
/* Publiser periode                                                    */
/* ------------------------------------------------------------------ */

function PubliserPeriodeArk({ okter, tittel, onLukk, onFerdig }: {
  okter: PeriodViewModel["sessions"]; tittel: string; onLukk: () => void; onFerdig: () => void;
}) {
  const opptatt = useMemo(() => new Set(validateWeek([...okter]).map((n) => n.sessionId).filter((x): x is string => Boolean(x))), [okter]);
  const [valgte, setValgte] = useState<Set<string>>(() => new Set(okter.filter((s) => !opptatt.has(s.id)).map((s) => s.id)));
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const veksle = (id: string) => setValgte((f) => { const n = new Set(f); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  function send() {
    const ider = okter.filter((s) => valgte.has(s.id)).map((s) => s.id);
    if (ider.length === 0) return;
    start(async () => {
      const res = await publishSessions(ider);
      if (res.ok) { onFerdig(); onLukk(); } else setFeil(res.error);
    });
  }
  return <Ark open onClose={onLukk} kicker="Publiser periode" title={tittel}
    footer={<><Knapp fullWidth icon={Send} disabled={valgte.size === 0} loading={travel} loadingText="Publiserer …" onClick={send}>Publiser {valgte.size} {valgte.size === 1 ? "økt" : "økter"}</Knapp><Knapp variant="ghost" fullWidth onClick={onLukk} disabled={travel}>Avbryt</Knapp></>}>
    <div className="a1101-skjema">
      {feil && <InlineVarsel tone="signal" tittel="Publisering">{feil}</InlineVarsel>}
      <Caps>{okter.length} UTKAST I PERIODEN · ØKTER MED OVERLAPP ER IKKE HUKET AV</Caps>
      <div role="list" className="a1101-uker">
        {okter.map((s) => <label key={s.id} role="listitem" className="a1101-avkryss">
          <input type="checkbox" checked={valgte.has(s.id)} onChange={() => veksle(s.id)} aria-label={s.title} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span className="a1101-prad__navn">{s.title}</span>
            <Caps>{ddmm(s.date)} · {s.pyramid}{opptatt.has(s.id) ? " · OVERLAPP" : ""}</Caps></span>
        </label>)}
      </div>
    </div>
  </Ark>;
}

/* ------------------------------------------------------------------ */
/* Gruppe: gruppas årsplan (AG-11-GRUPPE-AR)                           */
/* ------------------------------------------------------------------ */

export type AG11GruppeArProps = {
  gruppeId: string;
  gruppeNavn: string;
  medlemmer: number;
  perioder: readonly PeriodeRad[];
  idag: string;
};

export function AG11GruppeAr({ gruppeId, gruppeNavn, medlemmer, perioder: rå, idag }: AG11GruppeArProps) {
  const router = useRouter();
  const [skjema, setSkjema] = useState<{ s: PeriodeSkjema; ny: boolean } | null>(null);
  const [valgt, setValgt] = useState<string | null>(null);
  const [rull, setRull] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const perioder = useMemo(() => sorter(rå), [rå]);
  const omr = omraadeAv(perioder);
  const lagre = async (input: PeriodeInput, id: string | null): Promise<Resultat> => {
    const res = await coachLagreGruppePeriode(gruppeId, input, id ?? undefined);
    if (res.ok) router.refresh();
    return res;
  };
  const slett = async (id: string) => {
    const res = await coachSlettGruppePeriode(gruppeId, id);
    if (res.ok) router.refresh();
    return res;
  };
  const rediger = (p: PeriodeRad) => { setValgt(p.id); setSkjema({ s: skjemaFraPeriode(p), ny: false }); };
  const mtxt = `${medlemmer} ${medlemmer === 1 ? "MEDLEM" : "MEDLEMMER"}`;

  function rullUt() {
    start(async () => {
      const res = await coachRullUtGruppeAarsplan(gruppeId);
      const hoppet = res.hoppet && res.hoppet.length > 0
        ? ` Hoppet over: ${res.hoppet.map((h) => h.grunn === "KRYSSKILDE" ? `${h.navn} (kolliderer med annen plan${h.periode ? `: ${h.periode}` : ""})` : `${h.navn} (feil)`).join(" · ")}.` : "";
      setMelding(res.ok ? `Rullet ut til ${res.spillere} spillere (${res.perioderLagt} perioder).${hoppet}` : res.error ?? "Utrulling feilet.");
      setRull(false);
      router.refresh();
    });
  }

  return <div className="a1101">
    <div className="a1101-hode">
      <div className="a1101-hode__tekst">
        <span className="a1101-tittel">{gruppeNavn}</span>
        <Caps>{omr ? `${isoTilDmy(omr.fra)}–${isoTilDmy(omr.til)} · ` : ""}{perioder.length} PERIODER · RULLES UT TIL {mtxt}</Caps>
      </div>
      <div className="a9-rad">
        <Knapp size="sm" icon={Plus} onClick={() => { setValgt(null); setSkjema({ s: tomtSkjema(), ny: true }); }}>Ny periode</Knapp>
        {perioder.length > 0 && <Knapp size="sm" variant="secondary" icon={Users} disabled={travel} onClick={() => setRull(true)}>Rull ut til {medlemmer} spillere</Knapp>}
      </div>
    </div>
    <Caps>GRUPPA HAR EN EGEN PERIODISERING · SPILLERE MED EGNE PERIODER BEHOLDER DEM</Caps>
    {melding && <div role="status" data-wb-rullresultat><InlineVarsel tone="info" tittel="Utrulling">{melding}</InlineVarsel></div>}
    {perioder.length === 0
      ? <TomTilstand icon={CalendarRange} title="Ingen årsplan ennå" text="Legg inn gruppas første periode. Den kan rulles ut til medlemmene." actions={<Knapp icon={Plus} onClick={() => setSkjema({ s: tomtSkjema(), ny: true })}>Ny periode</Knapp>} />
      : <>
        {omr && <Tidslinje fra={omr.fra} til={omr.til} perioder={perioder} valgtId={valgt} idag={idag} onPeriode={(id) => { const p = perioder.find((x) => x.id === id); if (p) rediger(p); }} />}
        <div className="a1101-delt">
          <div className="a1101-delt__hode"><Caps>PERIODER · {perioder.length}</Caps></div>
          <Periodeliste perioder={perioder} kildeTekst={(p) => `${antallUker(p.startDate, p.endDate)} ${antallUker(p.startDate, p.endDate) === 1 ? "UKE" : "UKER"}`}
            onApne={(id) => { const p = perioder.find((x) => x.id === id); if (p) rediger(p); }} onRediger={rediger} />
        </div>
      </>}
    {skjema && <PeriodeArk key={skjema.s.id ?? "ny"} skjema={skjema.s} ny={skjema.ny} kicker={`${skjema.ny ? "Ny periode" : "Rediger periode"} · ${gruppeNavn}`}
      merknad={`RULLES UT TIL ${mtxt} · SPILLERE MED EGEN VERSJON BEHOLDER SIN`} onLagre={lagre} onSlett={slett} onLukk={() => setSkjema(null)} />}
    <Dialogboks open={rull} onClose={() => setRull(false)} title="Rull ut årsplanen"
      footer={<><Knapp variant="ghost" onClick={() => setRull(false)} disabled={travel}>Avbryt</Knapp><Knapp icon={Check} loading={travel} loadingText="Ruller ut …" onClick={rullUt}>Bekreft utrulling</Knapp></>}>
      <p className="a1101-hjelp"><Ikon icon={Layers} size={16} /> {perioder.length} perioder kopieres til {medlemmer} spilleres individuelle årsplaner. Spillere som allerede har en overlappende periode av samme type hoppes over. Ingenting overskrives.</p>
    </Dialogboks>
  </div>;
}

