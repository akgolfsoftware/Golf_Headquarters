"use client";

/**
 * Én målsetning — nytt design (godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, malen «maal».
 * Stil: src/styles/playerhq-ny.css, playerhq-ny-kommunikasjon.css og playerhq-ny-maal.css.
 *
 * Handlingene er de samme som før (goals-actions): «Endre målsetning» → endreGoal,
 * «Avslutt» med grunnen Nådd → markeerGoalSomOppnaadd, de andre grunnene → avbrytGoal
 * (grunnen lagres som abandonReason). Bare eieren ser knappene; coach ser siden uten dem.
 *
 * Avvik:
 *   - Fremdriftslinjen start → burde vært → målsetning vises bare når start, målsetning og frist er kjent
 *     (i dag bare SG-målsetninger). Ellers står start og målsetning med «—» der tallet mangler.
 *   - Kurven tegnes bare fra ekte målepunkter: SG per runde (SG-målsetninger) og testresultater
 *     (testmålsetninger). HCP, runder, økter og fritekst har ingen målehistorikk, og får tomteksten.
 *   - Kurven viser hver måling, ikke «snitt av fire».
 *   - «Øktene som jobber mot målet» vises bare for øktfrekvens-målsetninger med treningsområde
 *     (Workbench-økter i området, sju dager bak og 14 frem). Andre målsetninger har ingen kobling til
 *     økter, og seksjonen er utelatt. Øktkortene har ikke bilde.
 *   - Prognosen «I dette tempoet når du … innen fristen» og sammenligningen mot neste kategori er ikke med:
 *     tallene finnes ikke.
 *   - Endre-arket har i tillegg type, SG-område, test og treningskategori, så ingenting fra det gamle
 *     skjemaet forsvinner. Nivået kan settes til «Automatisk fra frist».
 *   - Grunnen «Nådd» lagres ikke som tekst; målsetningen markeres som nådd med dato, og coach varsles.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { avbrytGoal, endreGoal, markeerGoalSomOppnaadd, type GoalInput } from "@/app/portal/(legacy)/mal/goals-actions";
import { PLAN_NIVAAER, PLAN_NIVAA_LABEL, erPlanNivaa } from "@/lib/domain/maal-plannivaa";
import { SG_OMRADER, SG_OMRADE_NAVN, erSgOmrade } from "@/lib/domain/maal-fremdrift";
import { PYR_LABEL, PYR_REKKEFOLGE } from "@/lib/pyramide";
import { formatTall, kurveKoordinater, type MaalEnNy } from "@/lib/portal-mal/maal-ny";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-maal.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

export type PHMalsetningProps = {
  data: MaalEnNy | null;
  testOptions?: { id: string; name: string }[];
  state?: "data" | "laster" | "feil";
  onRetry?: () => void;
};

const GRUNNER = ["Nådd", "Skade eller helse", "Endret prioritet", "Urealistisk frist", "Annet"] as const;
const GOAL_TYPES = [
  { value: "HCP_TARGET", label: "Handicap" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned" },
  { value: "SG_AREA", label: "Strokes Gained" },
  { value: "SESSION_FREQUENCY", label: "Øktfrekvens" },
  { value: "TEST_SCORE", label: "Testresultat" },
  { value: "FREE_TEXT", label: "Fritekst" },
];
const KURVE = { x0: 40, x1: 348, y0: 20, y1: 130 };
const kortDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

function Tilbake() {
  return <Link href="/portal/mal" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Målsetninger</Link>;
}

function Kurve({ kurve, akse }: { kurve: NonNullable<MaalEnNy["kurve"]>; akse: MaalEnNy["akse"] }) {
  const verdier = kurve.punkter.map((p) => p.verdi);
  const pkt = kurveKoordinater(verdier, KURVE);
  const min = Math.min(...verdier), max = Math.max(...verdier);
  const linje = pkt.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const forste = kurve.punkter[0], siste = kurve.punkter[kurve.punkter.length - 1];
  const fmt = (v: number) => formatTall(v, 2) ?? "—";
  const farge = akse ? { ["--m-farge" as string]: `var(--phn-${akse})` } : undefined;
  return (
    <svg className="phn-m-kurve" viewBox="0 0 360 160" role="img" style={farge}
      aria-label={`Fra ${fmt(forste.verdi)} ${kortDato.format(new Date(forste.dato))} til ${fmt(siste.verdi)} ${kortDato.format(new Date(siste.dato))}`}>
      <line className="rute" x1={KURVE.x0} y1={KURVE.y0} x2={KURVE.x1} y2={KURVE.y0} />
      <line className="rute" x1={KURVE.x0} y1={KURVE.y1} x2={KURVE.x1} y2={KURVE.y1} />
      <text x="0" y={KURVE.y0 + 4}>{fmt(max)}</text>
      <text x="0" y={KURVE.y1 + 4}>{fmt(min)}</text>
      <path className="flate" d={`${linje} L${pkt[pkt.length - 1].x} ${KURVE.y1} L${pkt[0].x} ${KURVE.y1} Z`} />
      <path className="linje" d={linje} />
      {pkt.map((p, i) => <circle key={i} className={i === pkt.length - 1 ? "sist" : undefined} cx={p.x} cy={p.y} r={i === pkt.length - 1 ? 5 : 3.5} />)}
      <text x={KURVE.x0 - 6} y="154">{kortDato.format(new Date(forste.dato))}</text>
      <text x={KURVE.x1} y="154" textAnchor="end">{kortDato.format(new Date(siste.dato))}</text>
    </svg>
  );
}

function EndreArk({ data, testOptions, pending, feil, onLagre, onLukk }: {
  data: MaalEnNy; testOptions: { id: string; name: string }[]; pending: boolean; feil: string | null;
  onLagre: (input: GoalInput) => void; onLukk: () => void;
}) {
  const i = data.initial;
  const [title, setTitle] = useState(i.title);
  const [category, setCategory] = useState(i.category);
  const [type, setType] = useState(i.type);
  const [verdi, setVerdi] = useState(i.targetValue != null ? String(i.targetValue).replace(".", ",") : "");
  const [frist, setFrist] = useState(i.targetDate ?? "");
  const [niva, setNiva] = useState(i.planNivaa ?? "");
  const [sg, setSg] = useState(i.sgOmrade ?? "");
  const [test, setTest] = useState(i.linkedTestId ?? "");
  const [omrade, setOmrade] = useState(i.linkedPyramidArea ?? "");
  const tall = verdi.trim() ? Number(verdi.replace(",", ".").replace("−", "-")) : null;
  const ugyldig = !title.trim() || (tall != null && !Number.isFinite(tall)) || (type === "SG_AREA" && !sg);

  return (
    <div className="phn-ark-kropp">
      <div className="phn-ark-topp">
        <h2 id="phn-m-endre-tittel">Endre målsetning</h2>
        <button type="button" className="phn-lukk" aria-label="Lukk" onClick={onLukk}><X className="phn-ikon" aria-hidden /></button>
      </div>
      <label className="phn-felt">Navn<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <div className="phn-k-typer" role="group" aria-label="Type målsetning">
        <button type="button" aria-pressed={category === "OUTCOME"} onClick={() => setCategory("OUTCOME")}><b>Resultatmål</b><span>Et tall du vil nå</span></button>
        <button type="button" aria-pressed={category === "PROCESS"} onClick={() => setCategory("PROCESS")}><b>Prosessmål</b><span>Noe du vil gjøre jevnlig</span></button>
      </div>
      <div className="phn-m-to-felt">
        <label className="phn-felt">Målverdi<input inputMode="decimal" value={verdi} onChange={(e) => setVerdi(e.target.value)} /></label>
        <label className="phn-felt">Frist<input type="date" value={frist} onChange={(e) => setFrist(e.target.value)} /></label>
      </div>
      <label className="phn-felt">Nivå
        <select value={niva} onChange={(e) => setNiva(e.target.value)}>
          <option value="">Automatisk fra frist</option>
          {PLAN_NIVAAER.map((n) => <option key={n} value={n}>{PLAN_NIVAA_LABEL[n]}</option>)}
        </select>
      </label>
      <label className="phn-felt">Hva måles
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {GOAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      {type === "SG_AREA" && (
        <label className="phn-felt">SG-område
          <select value={sg} onChange={(e) => setSg(e.target.value)}>
            <option value="">Velg område</option>
            {SG_OMRADER.map((o) => <option key={o} value={o}>{SG_OMRADE_NAVN[o]}</option>)}
          </select>
        </label>
      )}
      {type === "TEST_SCORE" && testOptions.length > 0 && (
        <label className="phn-felt">Test
          <select value={test} onChange={(e) => setTest(e.target.value)}>
            <option value="">Velg test</option>
            {testOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}
      {type === "SESSION_FREQUENCY" && (
        <label className="phn-felt">Treningsområde
          <select value={omrade} onChange={(e) => setOmrade(e.target.value)}>
            <option value="">Velg område</option>
            {PYR_REKKEFOLGE.map((a) => <option key={a} value={a}>{PYR_LABEL[a]}</option>)}
          </select>
        </label>
      )}
      {feil && <p className="phn-k-feil" role="alert">{feil}</p>}
      <button type="button" className="phn-knapp pri phn-k-stor" disabled={pending || ugyldig} onClick={() => onLagre({
        type,
        category,
        title: title.trim(),
        targetValue: tall,
        targetDate: frist || null,
        linkedPyramidArea: type === "SESSION_FREQUENCY" && omrade ? (omrade as GoalInput["linkedPyramidArea"]) : null,
        linkedTestId: type === "TEST_SCORE" && test ? test : null,
        sgOmrade: type === "SG_AREA" && erSgOmrade(sg) ? sg : null,
        planNivaa: erPlanNivaa(niva) ? niva : null,
      })}>{pending ? "Lagrer …" : "Lagre"}</button>
    </div>
  );
}

export function PHMalsetning({ data, testOptions = [], state = "data", onRetry }: PHMalsetningProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visEndre, setVisEndre] = useState(false);
  const [visAvslutt, setVisAvslutt] = useState(false);
  const [grunn, setGrunn] = useState<(typeof GRUNNER)[number] | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const endreRef = useRef<HTMLDialogElement>(null);
  const avsluttRef = useRef<HTMLDialogElement>(null);

  useEffect(() => { if (visEndre) endreRef.current?.showModal(); else endreRef.current?.close(); }, [visEndre]);
  useEffect(() => { if (visAvslutt) avsluttRef.current?.showModal(); else avsluttRef.current?.close(); }, [visAvslutt]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  if (state === "laster") {
    return (
      <div className="phn phn-m" aria-busy="true">
        <Tilbake />
        <span className="phn-skjelett" style={{ height: 64 }} />
        <div className="phn-m-grid">
          <div><span className="phn-skjelett" style={{ height: 200 }} /><span className="phn-skjelett" style={{ height: 180 }} /></div>
          <aside><span className="phn-skjelett" style={{ height: 160 }} /></aside>
        </div>
      </div>
    );
  }

  if (state === "feil" || !data) {
    return (
      <div className="phn phn-m">
        <Tilbake />
        <section className="phn-kort">
          <b className="phn-k-undertittel">{state === "feil" ? "Målsetningen kunne ikke hentes" : "Fant ikke målsetningen"}</b>
          <p className="phn-forklar">{state === "feil" ? "Ingenting er endret. Prøv igjen." : "Den finnes ikke, eller den tilhører en annen spiller."}</p>
          <div className="phn-knapper">
            {state === "feil" && onRetry
              ? <button type="button" className="phn-knapp sek" onClick={onRetry}>Prøv igjen</button>
              : <Link className="phn-knapp sek" href="/portal/mal">Til Målsetninger</Link>}
          </div>
        </section>
      </div>
    );
  }

  const d = data;
  const aktiv = d.status === "ACTIVE";
  const trendKlasse = d.status === "ABANDONED" || d.tempo === "ingen-data" ? "" : d.tempo === "bak" ? "ned" : "opp";

  function lagre(input: GoalInput) {
    setFeil(null);
    startTransition(async () => {
      try {
        await endreGoal(d.id, input);
        setVisEndre(false);
        setToast("Lagret. Målsetningene er oppdatert.");
        router.refresh();
      } catch {
        setFeil("Endringen ble ikke lagret. Prøv igjen.");
      }
    });
  }

  function avslutt() {
    if (!grunn) return;
    setFeil(null);
    startTransition(async () => {
      try {
        if (grunn === "Nådd") await markeerGoalSomOppnaadd(d.id);
        else await avbrytGoal(d.id, grunn);
        setVisAvslutt(false);
        setToast(grunn === "Nådd" ? "Målsetningen er markert som nådd. Coach får beskjed." : "Målsetningen er avsluttet. Målingene er beholdt.");
        router.refresh();
      } catch {
        setFeil("Målsetningen ble ikke avsluttet. Prøv igjen.");
      }
    });
  }

  return (
    <div className="phn phn-m phn-skra">
    <SkraTopp
      lav
      etikett="Målsetning"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={d.overlinje}
      tittel={d.navn}
      handling={<span className="skra-tilbake"><Tilbake /></span>}
    />
    <SkraFlyt lav>
      <div className="phn-m-merker">
        <span className="phn-pille noy">{d.kategori === "OUTCOME" ? "Resultatmål" : "Prosessmål"}</span>
        {d.akseTekst && <span className="phn-m-akse"><i className={d.akse ? `akse-${d.akse}` : undefined} />{d.akseTekst}</span>}
      </div>

      <div className="phn-m-grid">
        <div>
          <section className="phn-kort" aria-label="Hvor du er nå">
            <div className="phn-hoved">
              <strong>{d.naa ?? "—"}{d.naa && d.enhet && <small>{d.enhet}</small>}</strong>
              <span className={`phn-trend ${trendKlasse}`}>{d.trendTekst}</span>
            </div>
            {d.fremdrift ? (
              <div className="phn-m-framdrift">
                <div className="phn-m-spor" role="img" aria-label={`${d.fremdrift.pst} prosent av veien. Etter tidsplanen burde du vært på ${d.fremdrift.burdePst} prosent.`}>
                  <span style={{ width: `${d.fremdrift.pst}%`, background: d.akse ? `var(--phn-${d.akse})` : undefined }} />
                  <em style={{ left: `${d.fremdrift.burdePst}%` }} />
                </div>
                <div className="phn-m-tall">
                  <span>Start<b>{d.fremdrift.start}</b></span>
                  <span>Burde vært<b>{d.fremdrift.burde}</b></span>
                  <span>Målsetning<b>{d.fremdrift.maal}</b></span>
                </div>
              </div>
            ) : (
              <div className="phn-m-tall">
                <span>Start<b>{d.start ?? "—"}</b></span>
                <span>Burde vært<b>—</b></span>
                <span>Målsetning<b>{d.maal ?? "—"}</b></span>
              </div>
            )}
            <p className="phn-forklar">{d.avsluttTekst ?? d.forklar}</p>
            {d.kildeTekst && <p className="phn-kilde">{d.kildeTekst}</p>}
          </section>

          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Utviklingen</h2>{d.kurve && <span className="phn-kilde">{d.kurve.kilde}</span>}</div>
            {d.kurve ? <Kurve kurve={d.kurve} akse={d.akse} /> : <p className="phn-forklar">{d.malingerTom}</p>}
          </section>

          {d.malinger.length > 0 && (
            <section className="phn-seksjon">
              <div className="phn-sek-topp"><h2>Siste målinger</h2></div>
              <ul className="phn-m-malinger">
                {d.malinger.map((m) => <li key={m.id}><span>{m.tekst}</span><b>{m.verdi}</b><span className="phn-kilde">{m.kilde}</span></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside>
          {d.okter && (
            <section className="phn-seksjon">
              <div className="phn-sek-topp"><h2>Øktene som jobber mot målet</h2></div>
              {d.okter.liste.length > 0 ? (
                <div className="phn-m-okter">
                  {d.okter.liste.map((o) => (
                    <div key={o.id} className={`phn-okt ${o.akse ?? ""}`}>
                      <span className="phn-okt-tekst">
                        <span className="phn-okt-s">{o.tid}</span>
                        <span className="phn-navn">{o.navn}</span>
                        <span className="phn-m-info">{o.info.map((x) => <span key={x}>{x}</span>)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="phn-forklar">Ingen økter i området denne og de to neste ukene.</p>}
              <p className="phn-kilde">{d.okter.kilde}</p>
            </section>
          )}
          {d.erEget && aktiv && (
            <div className="phn-knapper">
              <button type="button" className="phn-knapp pri" onClick={() => { setFeil(null); setVisEndre(true); }}>Endre målsetning</button>
              <button type="button" className="phn-knapp sek" onClick={() => { setFeil(null); setGrunn(null); setVisAvslutt(true); }}>Avslutt</button>
            </div>
          )}
        </aside>
      </div>

      {toast && <div className="phn-k-toast" role="status">{toast}</div>}

    </SkraFlyt>
      <dialog ref={endreRef} className="phn-ark" aria-labelledby="phn-m-endre-tittel" onClose={() => setVisEndre(false)}>
        {visEndre && <EndreArk data={d} testOptions={testOptions} pending={pending} feil={feil} onLagre={lagre} onLukk={() => setVisEndre(false)} />}
      </dialog>

      <dialog ref={avsluttRef} className="phn-k-dialog" role="alertdialog" aria-labelledby="phn-m-avs-tittel" onClose={() => setVisAvslutt(false)}>
        {visAvslutt && (
          <div className="phn-k-dialog-kropp">
            <h2 id="phn-m-avs-tittel">Avslutte målsetningen?</h2>
            <div className="phn-m-grunner" role="group" aria-label="Grunn">
              {GRUNNER.map((g) => <button key={g} type="button" aria-pressed={grunn === g} onClick={() => setGrunn(g)}>{g}</button>)}
            </div>
            <p className="phn-kilde">Målingene beholdes. Du finner målsetningen under Avsluttet.</p>
            {feil && <p className="phn-k-feil" role="alert">{feil}</p>}
            <div className="phn-k-knapper-stablet">
              <button type="button" className="phn-knapp rust phn-k-stor" disabled={!grunn || pending} onClick={avslutt}>{pending ? "Avslutter …" : "Avslutt målsetningen"}</button>
              <button type="button" className="phn-knapp sek" onClick={() => setVisAvslutt(false)}>Behold</button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
