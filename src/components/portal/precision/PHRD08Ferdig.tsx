"use client";

/**
 * PH-RD-08 Runde ferdig — Precision Athletics, runde 24 (Claude Design
 * 7d7c2994, ui_kits/playerhq/screens/PH-RD-live.jsx › Done, etag 1790581706716380).
 * Natt, én kolonne, én fullbredde handling nederst.
 *
 * Lagringen er uendret fra RundeRecap (lagreLoggetRunde, kladden slettes først
 * når serveren har svart). SG regnes på nytt av serveren ved lagring; tallene
 * her er visning. Brutto score, alltid.
 *
 * Bevisste avvik fra tegningen:
 *   - «Tiger 5» og «Planen din oppdateres» (runde-agentene) er ikke med: verdiene
 *     finnes ikke i klienten før runden er lagret. Forslag i PR-en, ikke gjort.
 *   - Handlingen nederst er «Lagre runde» (tegningen har «Se runden i Stats»):
 *     runden er ikke lagret før dette trykket, så lagringen må ligge her.
 *   - SG per hull vises som liten tekst under scoren i hullrutenettet (som i
 *     PH-RD-08 fra runde 21); tegningen fra runde 24 har bare kategoriene.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Flag, TriangleAlert } from "lucide-react";
import { lagreLoggetRunde } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import { slettKladd } from "@/lib/runde-logg/draft";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots, hullTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { Ikon, Knapp, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

const erFerdig = (h: LoggetHull) => h.slag.at(-1)?.resultat.iHull === true;
const toPar = (d: number) => (d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "±0");
const sgf = (v: number) => `${v > 0.04 ? "+" : v < -0.04 ? "−" : "±"}${Math.abs(v).toFixed(1).replace(".", ",")}`;

export type PHRD08Props = {
  courseId: string;
  courseNavn: string;
  playedAt: string;
  roundType: "turnering" | "trening";
  hullData: LoggetHull[];
  onTilbake: () => void;
  /** Bare for skjermprøven: start i feiltilstand. */
  startFeil?: string | null;
  /** Bare for skjermprøven: hopp over lokal kladdesletting og navigasjon. */
  onLagret?: (roundId: string) => void;
};

const Sek = ({ k, meta, children }: { k: string; meta?: string; children: React.ReactNode }) => (
  <section aria-label={k} style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>
      {meta && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>
);

const Rad = ({ a, b, forste }: { a: string; b: string; forste: boolean }) => (
  <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 48, borderTop: forste ? "none" : "1px solid var(--border-hairline)" }}>
    <span style={{ font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)", minWidth: 0 }}>{a}</span>
    <span style={{ font: "600 16px/1 var(--font-mono)", color: "var(--text-primary)" }}>{b}</span>
  </div>
);

export function PHRD08Ferdig({ courseId, courseNavn, playedAt, roundType, hullData, onTilbake, startFeil = null, onLagret }: PHRD08Props) {
  const router = useRouter();
  const eierId = useLokalDataEier();
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(startFeil);

  const ferdige = hullData.filter(erFerdig);
  const delvis = ferdige.length < hullData.length;

  let score = 0;
  let putter = 0;
  let sg: ReturnType<typeof beregnSg> | null = null;
  let hullScores: ReturnType<typeof deriverRundeScore>["hullScores"] = [];
  if (ferdige.length > 0) {
    try {
      const d = deriverRundeScore(ferdige);
      hullScores = d.hullScores;
      score = d.totalScore;
      putter = hullScores.reduce((s, h) => s + h.putts, 0);
      sg = beregnSg(rundeTilSgShots(ferdige));
    } catch {
      sg = null;
    }
  }
  const sumPar = ferdige.reduce((s, h) => s + h.par, 0);
  const fwMulig = hullScores.filter((h) => h.fairway != null).length;
  const fwTreff = hullScores.filter((h) => h.fairway === true).length;
  const girTreff = hullScores.filter((h) => h.gir).length;

  const sgPerHull = new Map<number, number>();
  for (const h of ferdige) {
    try { sgPerHull.set(h.holeNumber, beregnSg(hullTilSgShots(h)).total); } catch { /* ufullstendig kjede: vises uten SG */ }
  }

  const lagre = async () => {
    setLagrer(true);
    setFeil(null);
    try {
      const res = await lagreLoggetRunde({ courseId, playedAt: new Date(playedAt).toISOString(), hull: ferdige, roundType });
      slettKladd(eierId);
      if (onLagret) onLagret(res.roundId);
      else router.push(`/portal/mal/runder/${res.roundId}?lagret=1`);
    } catch (e) {
      setFeil(e instanceof Error && e.message.startsWith("Ugyldig runde-logg") ? e.message : "Fikk ikke kontakt. Slagene ligger trygt på telefonen. Prøv igjen når du har dekning.");
      setLagrer(false);
    }
  };

  const tom = ferdige.length === 0;
  const kat: Array<[string, number | null]> = [["Utslag (OTT)", sg?.ott ?? null], ["Innspill (APP)", sg?.app ?? null], ["Nærspill (ARG)", sg?.arg ?? null], ["Putting (PUTT)", sg?.putt ?? null]];
  const rader = hullData.length > 9 ? [hullData.slice(0, 9), hullData.slice(9)] : [hullData];

  return <div className="pa-root" data-design="precision-athletics" data-theme="night" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
    <main id="pa-innhold" style={{ flex: 1, width: "100%", maxWidth: 600, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
        <button type="button" className="pa-iconbtn" aria-label="Tilbake til runden" onClick={onTilbake} disabled={lagrer} style={{ width: 56, height: 56 }}><Ikon icon={ArrowLeft} name="arrow-left" size={20} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker">Runde ferdig</div>
          <Meta style={{ overflowWrap: "anywhere" }}>{courseNavn.toUpperCase()}</Meta>
        </div>
        {delvis && !tom && <StatusPille tone="warn">Delvis</StatusPille>}
      </div>

      {tom ? <TomTilstand icon={Flag} title="Ingen slag registrert" text="Runden lagres ikke før minst ett hull er ferdig." actions={<Knapp variant="secondary" icon={ArrowLeft} iconName="arrow-left" onClick={onTilbake}>Tilbake til runden</Knapp>} /> : <>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Meta>BRUTTO SCORE</Meta>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span style={{ font: "600 56px/1 var(--font-mono)", color: "var(--text-primary)" }}>{score}</span>
            <span style={{ font: "600 22px/1 var(--font-mono)", color: "var(--text-secondary)" }}>{toPar(score - sumPar)}</span>
          </div>
          <Meta>PAR {sumPar} · {putter} PUTTER{fwMulig > 0 ? ` · FAIRWAY ${fwTreff} AV ${fwMulig}` : ""} · GIR {girTreff} AV {hullScores.length}</Meta>
        </div>

        <Sek k="Strokes Gained" meta={sg ? "BASELINE KATEGORI D · ESTIMAT TIL LAGRET" : "IKKE BEREGNET"}>
          <div role="list">
            {kat.map(([k, v], i) => <Rad key={k} forste={i === 0} a={k} b={v == null ? "—" : sgf(v)} />)}
            <Rad forste={false} a="Totalt" b={sg ? sgf(sg.total) : "—"} />
          </div>
        </Sek>

        <Sek k="Hull for hull" meta="TALL = BRUTTO · UNDER = HULL-SG">
          {rader.map((rad, ri) => <div key={ri} role="list" style={{ display: "grid", gridTemplateColumns: `repeat(${rad.length},minmax(0,1fr))`, gap: 4 }}>
            {rad.map((h) => {
              const hs = hullScores.find((x) => x.holeNumber === h.holeNumber);
              const s = sgPerHull.get(h.holeNumber);
              return <div role="listitem" key={h.holeNumber} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 2px", borderRadius: "var(--radius-inner)", border: "1px solid var(--border-hairline)", minWidth: 0 }}>
                <Meta>{h.holeNumber}</Meta>
                <span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)" }}>{hs ? hs.strokes : "—"}</span>
                <Meta style={{ fontSize: 10 }}>{s == null ? "—" : sgf(s)}</Meta>
              </div>;
            })}
          </div>)}
        </Sek>

        {delvis && <Meta>KUN DE {ferdige.length} FULLFØRTE HULLENE LAGRES · SERVEREN REGNER SG PÅ NYTT VED LAGRING</Meta>}
        {feil && <div className="pa-alert pa-alert--signal" role="alert"><Ikon icon={TriangleAlert} size={18} /><span><span className="pa-alert__title">Runden ble ikke lagret. </span>{feil}</span></div>}
      </>}
    </main>
    {!tom && <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <Knapp size="xl" fullWidth icon={Check} iconName="check" loading={lagrer} disabled={lagrer} style={{ height: 64 }} onClick={lagre}>
          {feil ? "Prøv igjen" : delvis ? `Lagre ${ferdige.length} hull` : "Lagre runde"}
        </Knapp>
      </div>
    </div>}
  </div>;
}
