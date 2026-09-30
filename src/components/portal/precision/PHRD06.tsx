"use client";

/**
 * PH-RD-06 Etterregistrering og hull for hull — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-RD-2.jsx, etag 1790575336603608).
 *
 * To flater deler scorekortet:
 *   - PHRD06Etterregistrering  /portal/runde/logg    (ny runde etterpå)
 *   - PHRD06Rediger            /portal/mal/runder/[id]/hull  (rett en lagret runde)
 *
 * Lagringen er uendret fra før (samme server actions og samme syntetiserHurtigHull);
 * bare visningen er byttet.
 *
 * Bevisste avvik fra tegningen:
 *   - Seksjonen «Manuell SG · fra annen app» er ikke med. Den fantes ikke på denne
 *     skjermen fra før; manuell SG føres i «Ny runde» og under rundens SG-fane.
 *   - Rundetype (Turnering/Trening) er ikke med: Round har ikke felt for det.
 *     Forslag i PR-en, ikke gjort.
 *   - «Lagre delvis» er ikke egen knapp: delvis runde er alltid lov (minst ett hull),
 *     og «Lagre runde» lagrer de hullene som er ført.
 *   - Hull starter tomme («—»), ikke på par. Første trykk på − eller + setter par som
 *     utgangspunkt. Ingen score fabrikkeres.
 *   - Actionraden er ikke klistret nederst: den ligger under skjemaet, over faneraden.
 */
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleAlert, List, MapPinOff, Plus, RotateCw } from "lucide-react";
import { lagreLoggetRunde, hentBaneHull } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";
import { lagreHullScorer } from "@/app/portal/mal/runder/[id]/actions";
import { syntetiserHurtigHull } from "@/lib/runde-logg/syntetiser-hurtig";
import { parTemplate } from "@/lib/portal-runder/par-template";
import { Ikon, Knapp, KnappLenke, Meta, Tall, LasterTilstand, FeilTilstand, TomTilstand, Sidehode } from "@/components/precision/pa";
import { Kolonner, Kort, Nedtrekk, Skjemafelt, Tekstfelt } from "@/components/precision/pa-a4";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { InlineVarsel, KortHode } from "@/components/precision/pa-a5";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";

const STANDARD_LENGDE: Record<number, number> = { 3: 150, 4: 350, 5: 480 };

export type HullRad = {
  nr: number;
  par: number;
  lengde: number | null;
  strokes: number | null;
  putts: number | null;
  fairway: boolean | null;
  gir: boolean | null;
};

const toPar = (d: number) => (d === 0 ? "±0" : d > 0 ? `+${d}` : `−${Math.abs(d)}`);

/* ---------- Scorekortet: ett kort per hull ---------- */

function TriValg({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  const v = value == null ? "u" : value ? "j" : "n";
  return <SegmentertValg label={label} value={v} onChange={(x) => onChange(x === "u" ? null : x === "j")}
    options={[{ id: "u", label: "—" }, { id: "j", label: "Ja" }, { id: "n", label: "Nei" }]} />;
}

function Minus1Pluss({ label, verdi, min, max, onEndre, start }: {
  label: string; verdi: number | null; min: number; max: number; start: number; onEndre: (v: number) => void;
}) {
  const ned = () => onEndre(verdi == null ? start : Math.max(min, verdi - 1));
  const opp = () => onEndre(verdi == null ? start : Math.min(max, verdi + 1));
  return <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
    <button type="button" aria-label={`${label} ett mindre`} onClick={ned} className="pa-iconbtn pa-iconbtn--sm" style={{ border: "1px solid var(--border-strong)" }}>−</button>
    <span style={{ flex: 1, textAlign: "center", font: "600 17px/1 var(--font-mono)" }} aria-live="polite">{verdi ?? "—"}</span>
    <button type="button" aria-label={`${label} ett mer`} onClick={opp} className="pa-iconbtn pa-iconbtn--sm" style={{ border: "1px solid var(--border-strong)" }}>+</button>
  </div>;
}

export function HullRute({ hull, detaljer, onEndre }: {
  hull: HullRad[]; detaljer: boolean; onEndre: (nr: number, patch: Partial<HullRad>) => void;
}) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,${detaljer ? 176 : 148}px),1fr))`, gap: 6 }}>
    {hull.map((h) => <div key={h.nr} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8, borderRadius: "var(--radius-inner)", border: "1px solid var(--border-hairline)", minWidth: 0 }}>
      <Meta>{`H${h.nr} · P${h.par}${h.lengde ? ` · ${h.lengde} M` : ""}`}</Meta>
      <Minus1Pluss label={`Hull ${h.nr}, slag`} verdi={h.strokes} min={1} max={15} start={h.par} onEndre={(v) => onEndre(h.nr, { strokes: v })} />
      {detaljer && <>
        <Meta>PUTTER</Meta>
        <Minus1Pluss label={`Hull ${h.nr}, putter`} verdi={h.putts} min={0} max={10} start={2} onEndre={(v) => onEndre(h.nr, { putts: v })} />
        {h.par > 3 && <><Meta>FAIRWAY</Meta><TriValg label={`Hull ${h.nr}, fairway`} value={h.fairway} onChange={(v) => onEndre(h.nr, { fairway: v })} /></>}
        <Meta>GIR</Meta>
        <TriValg label={`Hull ${h.nr}, green i regulation`} value={h.gir} onChange={(v) => onEndre(h.nr, { gir: v })} />
      </>}
    </div>)}
  </div>;
}

function Sum({ score, par, hull }: { score: number | null; par: number; hull: number }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
    <Tall style={{ font: "600 40px/1 var(--font-mono)" }}>{score ?? "—"}</Tall>
    <Meta>{score == null ? "OPPGI SCORE" : `BRUTTO · ${toPar(score - par)} · PAR ${par} · ${hull} HULL`}</Meta>
  </div>;
}

/** Tall-velger for totalscore (min 18, maks 199, som tegningen). Tom til første trykk. */
function TotalVelger({ verdi, start, onEndre, label, min, max }: {
  verdi: number | null; start: number; onEndre: (v: number) => void; label: string; min: number; max: number;
}) {
  return <div className="pa-stepper">
    <span className="pa-field__label">{label}</span>
    <div className="pa-stepper__row">
      <button type="button" className="pa-stepper__btn" aria-label={`${label}, ett mindre`} onClick={() => onEndre(verdi == null ? start : Math.max(min, verdi - 1))}>−</button>
      <span className="pa-stepper__val" aria-live="polite">{verdi ?? "—"}</span>
      <button type="button" className="pa-stepper__btn" aria-label={`${label}, ett mer`} onClick={() => onEndre(verdi == null ? start : Math.min(max, verdi + 1))}>+</button>
    </div>
  </div>;
}

/* ---------- Laster ---------- */

export function PHRD06Laster() {
  return <div className="pa-side"><LasterTilstand text="Henter baner …" /></div>;
}

/* ---------- Etterregistrering ---------- */

export type SisteRunde = { dato: string; bane: string; slag: number };
export type PHRD06Props = {
  baner: Array<{ id: string; name: string }>;
  siste: SisteRunde[];
  /** Bare for skjermprøven: start i feiltilstand. */
  startFeil?: boolean;
};

function iDagISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

const tomHull = (n: number): HullRad[] => Array.from({ length: n }, (_, i) => ({
  nr: i + 1, par: 4, lengde: STANDARD_LENGDE[4], strokes: null, putts: null, fairway: null, gir: null,
}));

export function PHRD06Etterregistrering({ baner, siste, startFeil = false }: PHRD06Props) {
  const [modus, setModus] = useState<"hull" | "total">("hull");
  const [antall, setAntall] = useState<"9" | "18">("18");
  const [detaljer, setDetaljer] = useState(false);
  const [dato, setDato] = useState(iDagISO());
  const [courseId, setCourseId] = useState(baner[0]?.id ?? "");
  const [hull, setHull] = useState<HullRad[]>(() => tomHull(18));
  const [total, setTotal] = useState<number | null>(null);
  const [totalPutt, setTotalPutt] = useState<number | null>(null);
  const [lagrer, startLagring] = useTransition();
  const [feil, setFeil] = useState(startFeil);
  const [melding, setMelding] = useState<string | null>(null);
  const [kvittering, setKvittering] = useState<{ roundId: string; hull: number; slag: number; rel: string } | null>(null);

  // Par og lengde fra baneregisteret når banen endres. Ført score beholdes.
  useEffect(() => {
    if (!courseId) return;
    let aktiv = true;
    (async () => {
      try {
        const reg = await hentBaneHull(courseId);
        if (!aktiv || !Array.isArray(reg)) return;
        const perHull = new Map(reg.map((h) => [h.holeNumber, h]));
        setHull((prev) => prev.map((p) => {
          const r = perHull.get(p.nr);
          if (!r) return { ...p, par: 4, lengde: STANDARD_LENGDE[4] };
          return { ...p, par: r.par, lengde: r.lengdeMeter ?? STANDARD_LENGDE[r.par] ?? null };
        }));
      } catch { /* behold standardpar */ }
    })();
    return () => { aktiv = false; };
  }, [courseId]);

  const n = Number(antall);
  const synlige = useMemo(() => hull.slice(0, n), [hull, n]);
  const fylte = synlige.filter((h) => h.strokes != null);
  const sumSlag = fylte.reduce((a, h) => a + (h.strokes ?? 0), 0);
  const sumPar = fylte.reduce((a, h) => a + h.par, 0);
  const banePar = synlige.reduce((a, h) => a + h.par, 0);
  const niTotal = antall === "9" && modus === "total";
  const brutto = modus === "hull" ? (fylte.length ? sumSlag : null) : total;
  const kanLagre = !niTotal && !!courseId && !!dato && (modus === "hull" ? fylte.length > 0 : total != null);

  const endreHull = (nr: number, patch: Partial<HullRad>) => setHull((p) => p.map((h) => (h.nr === nr ? { ...h, ...patch } : h)));

  const lagre = () => {
    if (!kanLagre) return;
    setFeil(false); setMelding(null);
    startLagring(async () => {
      try {
        if (modus === "hull") {
          const rader = synlige.filter((h) => h.strokes != null).map((h) => syntetiserHurtigHull({
            holeNumber: h.nr, par: h.par, lengdeMeter: h.lengde ?? STANDARD_LENGDE[h.par] ?? 350, strokes: h.strokes as number,
          }));
          const res = await lagreLoggetRunde({
            courseId, playedAt: new Date(dato).toISOString(), hull: rader,
            // Syntetisert fra hullscore, ikke ekte lie og avstand: SG merkes estimert.
            estimert: true,
          });
          setKvittering({ roundId: res.roundId, hull: rader.length, slag: res.score, rel: toPar(sumSlag - sumPar) });
        } else {
          // Round uten hullrader. Actionen sender selv videre til rundelista.
          await logRoundManual({ courseId, playedAt: new Date(dato).toISOString(), score: total as number, putts: totalPutt ?? undefined });
        }
      } catch (e) {
        const digest = (e as { digest?: string } | null)?.digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
        setFeil(true);
      }
    });
  };

  const nullstill = () => { setHull((p) => p.map((h) => ({ ...h, strokes: null, putts: null, fairway: null, gir: null }))); setTotal(null); setTotalPutt(null); setKvittering(null); };

  const hode = <Sidehode kicker="Runde · Etterregistrering · Brutto score" title="Registrer runde" sub="Score per hull eller total. Par og hull-lengde hentes fra banen." />;

  if (baner.length === 0) {
    return <div className="pa-side">{hode}
      <TomTilstand icon={MapPinOff} title="Ingen baner registrert" text="Banen legges inn av klubben eller coach. Uten bane kan ikke runden lagres." actions={<KnappLenke variant="secondary" href="/portal/analysere" icon={ArrowLeft} iconName="arrow-left">Til Analyse</KnappLenke>} />
    </div>;
  }

  if (kvittering) {
    return <div className="pa-side">{hode}
      <InlineVarsel tone="ok" tittel="Runden er lagret.">{kvittering.hull} hull · {kvittering.slag} slag ({kvittering.rel}) · brutto. Runden ligger i Analyse og teller i statistikken din.</InlineVarsel>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke href={`/portal/mal/runder/${kvittering.roundId}`} icon={List} iconName="list">Se runden i Analyse</KnappLenke>
        <Knapp variant="secondary" icon={Plus} iconName="plus" onClick={nullstill}>Logg en runde til</Knapp>
      </div>
    </div>;
  }

  if (feil) {
    return <div className="pa-side">{hode}
      <FeilTilstand icon={CircleAlert} title="Klarte ikke å lagre runden" text="Det du har tastet er ikke tapt her på skjermen. Prøv igjen når som helst."
        code="FEIL · RUNDE · LOGG" retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={() => setFeil(false)}>Prøv igjen</Knapp>} />
    </div>;
  }

  return <div className="pa-side">{hode}
    <Kolonner mal="repeat(auto-fit,minmax(min(100%,340px),1fr))">
      <Kort>
        <KortHode tittel="Scorekort" aside="BRUTTO" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 12 }}>
          <Skjemafelt label="Bane">
            <Nedtrekk value={courseId} onChange={setCourseId} options={baner.map((b) => ({ value: b.id, label: b.name }))} />
          </Skjemafelt>
          <Skjemafelt label="Dato"><Tekstfelt mono value={dato} onChange={setDato} placeholder="ÅÅÅÅ-MM-DD" /></Skjemafelt>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <SegmentertValg label="Registreringsmåte" value={modus} onChange={setModus} options={[{ id: "hull", label: "Hull for hull" }, { id: "total", label: "Kun total" }]} />
          <SegmentertValg label="Antall hull" value={antall} onChange={setAntall} options={[{ id: "9", label: "9" }, { id: "18", label: "18" }]} />
          {modus === "hull" && <button type="button" className="pa-choice" aria-pressed={detaljer} onClick={() => setDetaljer((d) => !d)}>Putter · FW · GIR</button>}
        </div>
        {niTotal && <InlineVarsel tone="warn" tittel="9 hull krever hull for hull.">Velg Hull for hull slik at riktig antall hull lagres.</InlineVarsel>}
        {modus === "total"
          ? <>
              <TotalVelger label="Brutto totalscore" verdi={total} start={banePar} min={18} max={199} onEndre={setTotal} />
              <TotalVelger label="Putter totalt (valgfritt)" verdi={totalPutt} start={32} min={0} max={99} onEndre={setTotalPutt} />
              <Meta>UTEN HULL FOR HULL BLIR SG ET ESTIMAT, MERKET EST I ANALYSE</Meta>
            </>
          : <HullRute hull={synlige} detaljer={detaljer} onEndre={endreHull} />}
        <Sum score={brutto} par={modus === "hull" ? sumPar : banePar} hull={modus === "hull" ? fylte.length : n} />
      </Kort>
      <Kort>
        <KortHode tittel="Sist loggført" aside="DINE SISTE RUNDER" />
        {siste.length === 0
          ? <InlineVarsel tone="info" tittel="Ingen runder loggført ennå.">Den første runden gir Analyse noe å jobbe med. Hull for hull gir mest, men bare totalen teller også.</InlineVarsel>
          : <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
              {siste.map((r, i) => <li key={i} style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : undefined }}>
                <span style={{ minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{r.bane}</span><br /><Meta>{r.dato}</Meta></span>
                <Tall>{r.slag}</Tall>
              </li>)}
            </ul>}
        <Meta>KUN BRUTTO SCORE · NETTO VISES ALDRI</Meta>
      </Kort>
    </Kolonner>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <KnappLenke variant="ghost" href="/portal/analysere">Avbryt</KnappLenke>
      <Knapp icon={Check} iconName="check" disabled={!kanLagre} loading={lagrer} onClick={lagre}>Lagre runde</Knapp>
    </div>
  </div>;
}

/* ---------- Rediger hull for hull ---------- */

export type RedigerHull = { nr: number; par: number; strokes: number; putts: number | null; fairway: boolean | null; gir: boolean | null };
export type PHRD06RedigerProps = {
  roundId: string; bane: string; datoTekst: string; coursePar: number; initial: RedigerHull[];
  /** Bare for skjermprøven: start med feilmelding. */
  startFeil?: string | null;
};

export function PHRD06Rediger({ roundId, bane, datoTekst, coursePar, initial, startFeil = null }: PHRD06RedigerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(startFeil);
  const [hull, setHull] = useState<HullRad[]>(() => initial.map((h) => ({ ...h, lengde: null })));
  const [detaljer, setDetaljer] = useState(() => initial.some((h) => h.putts != null || h.fairway != null || h.gir != null));

  // 9/18 vises bare når det ikke fabrikkerer hull: tomt kort eller standard 9/18.
  const kanVelgeAntall = initial.length === 0 || initial.length === 9 || initial.length === 18;
  const velgAntall = (a: "9" | "18") => {
    const pars = parTemplate(coursePar);
    setHull((prev) => {
      if (a === "9") return prev.filter((h) => h.nr <= 9);
      const bak = prev.filter((h) => h.nr > 9);
      const forste = prev.filter((h) => h.nr <= 9);
      return [...forste, ...(bak.length ? bak : pars.slice(9).map((par, i) => ({ nr: 10 + i, par, lengde: null, strokes: par, putts: null, fairway: null, gir: null })))];
    });
  };
  const startMedAntall = (a: 9 | 18) => setHull(parTemplate(coursePar).slice(0, a).map((par, i) => ({ nr: i + 1, par, lengde: null, strokes: par, putts: null, fairway: null, gir: null })));
  const endre = (nr: number, patch: Partial<HullRad>) => setHull((p) => p.map((h) => (h.nr === nr ? { ...h, ...patch } : h)));

  const ført = hull.filter((h) => h.strokes != null);
  const sum = ført.reduce((a, h) => a + (h.strokes ?? 0), 0);
  const par = hull.reduce((a, h) => a + h.par, 0);

  const lagre = () => {
    if (hull.length === 0) return;
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await lagreHullScorer(roundId, hull.map((h) => ({
          holeNumber: h.nr, par: h.par, strokes: h.strokes as number, putts: h.putts, fairway: h.fairway, gir: h.gir,
        })));
        if (res.ok) { router.push(`/portal/mal/runder/${roundId}`); router.refresh(); }
        else setFeil(res.error ?? "Kunne ikke lagre. Prøv igjen.");
      } catch { setFeil("Kunne ikke lagre. Prøv igjen."); }
    });
  };

  return <div className="pa-side">
    <Link href={`/portal/mal/runder/${roundId}`} className="pa-btn pa-btn--ghost pa-btn--icon-l" style={{ alignSelf: "flex-start" }}>
      <Ikon icon={ArrowLeft} name="arrow-left" size={18} />Tilbake til runden
    </Link>
    <Sidehode kicker={`Runde · ${bane} · ${datoTekst}`} title="Rediger hull for hull" sub="Scorekortet er brutto tall per hull." />
    <InlineVarsel tone="info" tittel="Strokes Gained røres ikke her.">Endrer du slag-tallet på et hull der slag-kjeden er ført, fjernes kjeden for det hullet. Strokes Gained beregnes bare fra en komplett slag-for-slag-kjede.</InlineVarsel>
    {hull.length === 0
      ? <Kort>
          <KortHode tittel="Denne runden er logget uten hulldata" />
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Hvor mange hull spilte du?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Knapp variant="secondary" onClick={() => startMedAntall(9)}>9 hull</Knapp>
            <Knapp variant="secondary" onClick={() => startMedAntall(18)}>18 hull</Knapp>
          </div>
        </Kort>
      : <Kort>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {kanVelgeAntall && <SegmentertValg label="Antall hull" value={hull.length <= 9 ? "9" : "18"} onChange={velgAntall} options={[{ id: "9", label: "9 hull" }, { id: "18", label: "18 hull" }]} />}
            <button type="button" className="pa-choice" aria-pressed={detaljer} onClick={() => setDetaljer((d) => !d)}>Putter · FW · GIR</button>
          </div>
          <Sum score={ført.length ? sum : null} par={par} hull={hull.length} />
          <HullRute hull={hull} detaljer={detaljer} onEndre={endre} />
        </Kort>}
    {feil && <InlineVarsel tone="signal" tittel="Kunne ikke lagre.">{feil}</InlineVarsel>}
    {hull.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <KnappLenke variant="ghost" href={`/portal/mal/runder/${roundId}`}>Avbryt</KnappLenke>
      <Knapp icon={Check} iconName="check" loading={pending} onClick={lagre}>Lagre scorekortet</Knapp>
    </div>}
  </div>;
}
