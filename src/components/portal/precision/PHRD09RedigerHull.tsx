"use client";

/**
 * PH-RD-09 Rediger hull for hull (/portal/mal/runder/[id]/hull) i nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, malen «rediger». Stil: playerhq-ny.css og playerhq-ny-runder.css.
 *
 * Samme lagring og validering som HullRedigerForm: lagreHullScorer (eiersjekk med assertRoundOwner, zod-skjemaet
 * manuellHullListe, slett-slag-bekreftelse når slag-tallet endres på et hull med slag-kjede). 9/18 hull velges
 * bare når det ikke fabrikkerer hull. Detaljene putter, fairway og GIR starter som «ikke ført».
 *
 * Avvik:
 *   - Scorekortet er knapper per hull (rader à 6 eller 9) i stedet for tabellen: et trykk velger hullet som rettes.
 *   - Valgt hull har par, score, putter, fairway og GIR. Slagene på hullet vises ikke her; de rettes i «Rediger slag».
 *   - Strokes Gained-kortet viser ikke tallet, bare regelen: SG regnes bare fra en komplett slag-for-slag-kjede.
 *   - «Endringer og kilde» er ikke med: det finnes ingen endringslogg for runden.
 *   - «Slett runden» er ikke med her: sletting ligger på rundesiden.
 *   - Bekreftelsen når slag-kjeden slettes, er et ark med rust knapp (det eneste rust på skjermen).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-09.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";
import { lagreHullScorer } from "@/app/portal/mal/runder/[id]/actions";
import { parTemplate } from "@/lib/portal-runder/par-template";
import { nyeHull, summerHull, MIN_SLAG, MAX_SLAG, type HullVerdi } from "@/components/portal/runde-ny/hull-editor";
import { SkMerke, Tilbake, tilParTekst } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

const MAX_PUTTER = 10;

export type PHRD09Props = {
  roundId: string;
  baneNavn: string;
  dato: string;
  coursePar: number;
  initial: HullVerdi[];
};

function TreValg({ navn, verdi, onEndre }: { navn: string; verdi: boolean | null; onEndre: (v: boolean | null) => void }) {
  const valg: Array<[string, boolean | null]> = [["Ikke ført", null], ["Ja", true], ["Nei", false]];
  return (
    <div className="phr-felt">
      <span className="phr-etikett">{navn}</span>
      <div className="phr-ruter lav" role="group" aria-label={navn}>
        {valg.map(([t, v]) => <button key={t} type="button" aria-pressed={verdi === v} onClick={() => onEndre(v)}>{t}</button>)}
      </div>
    </div>
  );
}

function BekreftArk({ tekst, pending, onJa, onLukk }: { tekst: string; pending: boolean; onJa: () => void; onLukk: () => void }) {
  const ark = useRef<HTMLDialogElement>(null);
  useEffect(() => { ark.current?.showModal(); }, []);
  return (
    <dialog ref={ark} className="phn-ark" aria-label="Slette slagene?" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>Slette slagene?</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        <p className="phn-forklar">{tekst}</p>
        <p className="phn-kilde">Strokes Gained for hullene regnes på nytt. Det kan ikke angres.</p>
        <div className="phn-ark-fot">
          <button type="button" className="phn-knapp rust" disabled={pending} onClick={onJa}>{pending ? "Lagrer …" : "Slett slagene og lagre"}</button>
          <button type="button" className="phn-knapp sek" onClick={() => ark.current?.close()}>Behold slagene</button>
        </div>
      </div>
    </dialog>
  );
}

export function PHRD09RedigerHull({ roundId, baneNavn, dato, coursePar, initial }: PHRD09Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [bekreftelse, setBekreftelse] = useState<{ token: string; tekst: string } | null>(null);
  const [hull, setHull] = useState<HullVerdi[]>(initial);
  const [valgt, setValgt] = useState<number>(initial[0]?.nr ?? 1);

  const kanVelgeAntall = initial.length === 0 || initial.length === 9 || initial.length === 18;
  const harHull = hull.length > 0;
  const sum = summerHull(hull);
  const h = hull.find((x) => x.nr === valgt) ?? hull[0];
  const opprinnelig = new Map(initial.map((x) => [x.nr, x]));
  const endret = (x: HullVerdi) => {
    const o = opprinnelig.get(x.nr);
    return !o || o.par !== x.par || o.strokes !== x.strokes || o.putts !== x.putts || o.fairway !== x.fairway || o.gir !== x.gir;
  };

  function velgAntall(n: 9 | 18) {
    const pars = parTemplate(coursePar);
    setHull((prev) => n === 9
      ? prev.filter((x) => x.nr <= 9)
      : [...prev.filter((x) => x.nr <= 9), ...(prev.some((x) => x.nr > 9) ? prev.filter((x) => x.nr > 9) : nyeHull(pars.slice(9), 10))]);
    if (n === 9 && valgt > 9) setValgt(1);
  }

  function endre(patch: Partial<HullVerdi>) {
    if (!h) return;
    setHull((prev) => prev.map((x) => (x.nr === h.nr ? { ...x, ...patch } : x)));
  }

  /* Samme regler som HullEditor: putter aldri over slag; «ikke ført» + starter på 2; − under 0 blir «ikke ført». */
  function stegSlag(delta: number) {
    if (!h) return;
    const nye = Math.max(MIN_SLAG, Math.min(MAX_SLAG, h.strokes + delta));
    endre(h.putts != null && h.putts > nye ? { strokes: nye, putts: nye } : { strokes: nye });
  }

  function stegPutter(delta: number) {
    if (!h) return;
    const maks = Math.min(MAX_PUTTER, h.strokes);
    if (h.putts == null) { if (delta > 0) endre({ putts: Math.min(2, maks) }); return; }
    const nye = h.putts + delta;
    endre({ putts: nye < 0 ? null : Math.min(maks, nye) });
  }

  function lagre(bekreftSlettSlag?: string) {
    if (!harHull) return;
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await lagreHullScorer(
          roundId,
          hull.map((x) => ({ holeNumber: x.nr, par: x.par, strokes: x.strokes, putts: x.putts, fairway: x.fairway, gir: x.gir })),
          bekreftSlettSlag,
        );
        if (res.ok) {
          setBekreftelse(null);
          router.push(`/portal/mal/runder/${roundId}`);
          router.refresh();
        } else if (res.krevBekreftelse && res.bekreftelse) {
          setBekreftelse({ token: res.bekreftelse, tekst: res.error ?? "Endringen fjerner slag-kjeden på hull der slagene er ført." });
        } else {
          setBekreftelse(null);
          setFeil(res.error ?? "Kunne ikke lagre. Prøv igjen.");
        }
      } catch {
        setFeil("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <div className="phn phn-skra" data-od-id="playerhq-runde-rediger-hull">
      <SkraTopp
        lav
        etikett="Rediger hull"
        bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
        overlinje={`Rediger runde · ${baneNavn} · ${dato}`}
        tittel="Rediger hull for hull"
        ingress={harHull ? "Trykk på et hull i scorekortet for å rette det." : "Runden er lagret uten hulldata. Hvor mange hull spilte du?"}
        handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Tilbake href={`/portal/mal/runder/${roundId}`} tekst="Runden" /></span></span>}
      />
      <SkraFlyt lav>

      {!harHull ? (
        <section className="phn-kort" aria-label="Antall hull">
          <div className="phn-valg" role="group" aria-label="Antall hull">
            {([9, 18] as const).map((n) => (
              <button key={n} type="button" aria-pressed={false} onClick={() => { setHull(nyeHull(parTemplate(coursePar).slice(0, n))); setValgt(1); }}>{n} hull</button>
            ))}
          </div>
          <p className="phn-kilde">Scorekortet starter på par for hvert hull. Du retter hullene etterpå.</p>
        </section>
      ) : (
        <div className="phr-grid phr-to">
          <div>
            <section className="phn-kort" aria-label="Scorekort">
              <div className="phn-sek-topp">
                <h2 className="phr-undertittel">Scorekort</h2>
                <span className="phn-kilde">{hull.length} hull</span>
              </div>
              {kanVelgeAntall && (
                <div className="phn-valg" role="group" aria-label="Antall hull">
                  <button type="button" aria-pressed={hull.length <= 9} onClick={() => velgAntall(9)}>9 hull</button>
                  <button type="button" aria-pressed={hull.length > 9} onClick={() => velgAntall(18)}>18 hull</button>
                </div>
              )}
              <div className="phrd-hullvalg" role="group" aria-label="Velg hull">
                {hull.map((x) => (
                  <button key={x.nr} type="button" aria-pressed={x.nr === h?.nr} className={endret(x) ? "endret" : undefined}
                    aria-label={`Hull ${x.nr}, par ${x.par}, ${x.strokes} slag${endret(x) ? ", endret" : ""}`} onClick={() => setValgt(x.nr)}>
                    <i>{x.nr}</i><SkMerke slag={x.strokes} par={x.par} />
                  </button>
                ))}
              </div>
              <div className="phrd-sum">
                <span>Brutto <b>{sum.score}</b> ({tilParTekst(sum.score - sum.par)})</span>
                <span>Par <b>{sum.par}</b></span>
              </div>
              <div className="phr-sk-forklar">
                <span><span className="phr-sk b">3</span>Under par</span>
                <span><span className="phr-sk bo">5</span>Over par</span>
                <span><i style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--phn-spill-ink)" }} />Endret</span>
              </div>
            </section>

            {h && (
              <section className="phn-kort" aria-label="Valgt hull">
                <div className="phn-sek-topp"><h2 className="phr-undertittel">Hull {h.nr} · par {h.par}</h2></div>
                <div className="phr-felt">
                  <span className="phr-etikett">Par</span>
                  <div className="phr-ruter lav" role="group" aria-label="Par">
                    {[3, 4, 5].map((p) => <button key={p} type="button" aria-pressed={h.par === p}
                      onClick={() => endre({ par: p, fairway: p === 3 ? null : h.fairway })}>Par {p}</button>)}
                  </div>
                </div>
                <div className="phrd-to-trinn">
                  <div className="phr-felt">
                    <span className="phr-etikett">Score</span>
                    <div className="phr-trinn">
                      <button type="button" aria-label="Ett slag færre" disabled={h.strokes <= MIN_SLAG} onClick={() => stegSlag(-1)}>−</button>
                      <output aria-live="polite">{h.strokes}</output>
                      <button type="button" aria-label="Ett slag til" disabled={h.strokes >= MAX_SLAG} onClick={() => stegSlag(1)}>+</button>
                    </div>
                  </div>
                  <div className="phr-felt">
                    <span className="phr-etikett">Putter</span>
                    <div className="phr-trinn">
                      <button type="button" aria-label="Én putt færre" disabled={h.putts == null}
                        onClick={() => stegPutter(-1)}>−</button>
                      <output aria-live="polite" className={h.putts == null ? "tom" : undefined}>{h.putts ?? "—"}</output>
                      <button type="button" aria-label="Én putt til" disabled={h.putts != null && h.putts >= Math.min(MAX_PUTTER, h.strokes)}
                        onClick={() => stegPutter(1)}>+</button>
                    </div>
                  </div>
                </div>
                {h.par !== 3 && <TreValg navn="Fairway truffet" verdi={h.fairway} onEndre={(v) => endre({ fairway: v })} />}
                <TreValg navn="Green i regulation" verdi={h.gir} onEndre={(v) => endre({ gir: v })} />
                <p className="phn-kilde">Putter, fairway og GIR er valgfrie. «—» betyr ikke ført.</p>
              </section>
            )}
          </div>

          <div>
            <section className="phn-kort phr-kort-dempet" aria-label="Strokes Gained">
              <div className="phn-sek-topp"><h2 className="phr-undertittel">Strokes Gained</h2><span className="phn-pille noy">Låst</span></div>
              <p className="phr-laast">
                <Lock className="phn-ikon" aria-hidden />
                <span>Scorekortet er brutto tall per hull. Endrer du slag-tallet på et hull der slag-kjeden er ført, fjernes kjeden for det hullet. Strokes Gained beregnes kun fra en komplett slag-for-slag-kjede.</span>
              </p>
            </section>
            {feil && <p className="phr-melding" role="alert">{feil}</p>}
            <button type="button" className="phn-knapp pri phr-knapp-stor" disabled={pending} onClick={() => lagre()}>
              {pending ? "Lagrer …" : "Lagre endringene"}
            </button>
          </div>
        </div>
      )}

      {bekreftelse && (
        <BekreftArk tekst={bekreftelse.tekst} pending={pending} onJa={() => lagre(bekreftelse.token)} onLukk={() => setBekreftelse(null)} />
      )}
      </SkraFlyt>
    </div>
  );
}
