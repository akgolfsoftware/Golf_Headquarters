"use client";

/**
 * Logg økt (/portal/trening/logg) i nytt design (pakke 13, vedtak 16.10.2026 §STATS-RESTEN punkt 2).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «logg». Stil: playerhq-ny-statsresten.css.
 * Økta lagres i TrainingLog og teller i total treningstid i Stats › Trening, aldri mot planen
 * (verken «lagt inn mot fordelt» eller etterlevelsen).
 *
 * Avvik:
 *   - Stedene er en fast liste (Range, Simulator, …), ikke anleggets egne navn som «Range 3».
 *   - Øvelse er fritekst; søk i øvelsesbanken finnes ikke her ennå.
 *   - Belastning og fokus står i to rader på fem under 520 px, så hvert tall er minst 44 px bredt.
 *   - Ingen forhåndsvalg på belastning og fokus: spilleren velger selv, og Lagre venter til begge er satt.
 */
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterVarighet } from "@/lib/format-tall";
import { LOGG_OMRADER, LOGG_STEDER } from "@/lib/portal-analyse/logg-okt";
import { TRENING_AKSER, type TreningAkse } from "@/lib/portal-analyse/trening-stats";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten.css";

const DAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "short" });

function Skala({ navn, verdi, sett, lav, hoy }: { navn: string; verdi: number | null; sett: (n: number) => void; lav: string; hoy: string }) {
  return (
    <div className="phn-felt" role="group" aria-label={navn}>
      <span>{navn}</span>
      <div className="phn-sr-skala">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" aria-pressed={verdi === n} onClick={() => sett(n)}>{n}</button>
        ))}
      </div>
      <div className="phn-sr-skala-tekst"><span>{lav}</span><span>{hoy}</span></div>
    </div>
  );
}

export function PH17LoggOkt({ iDag, lagre }: { iDag: string; lagre?: (body: Record<string, unknown>) => Promise<boolean> }) {
  const [akse, setAkse] = useState<TreningAkse>("SLAG");
  const [omrade, setOmrade] = useState<string>(LOGG_OMRADER.SLAG[0]!);
  const [dato, setDato] = useState(iDag);
  const [sted, setSted] = useState<string>("");
  const [min, setMin] = useState(45);
  const [ovelse, setOvelse] = useState("");
  const [belastning, setBelastning] = useState<number | null>(null);
  const [fokus, setFokus] = useState<number | null>(null);
  const [notat, setNotat] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState<string | null>(null);
  const fys = akse === "FYS";
  const klar = belastning != null && (fys || fokus != null) && !!dato;

  function velgAkse(a: TreningAkse) {
    setAkse(a);
    setOmrade(LOGG_OMRADER[a][0]!);
    if (a === "FYS") setFokus(null);
  }

  async function send() {
    if (!klar) return;
    setLagrer(true);
    setFeil(null);
    const body = {
      date: dato, pyramid: akse, area: omrade, minutes: min, effort: belastning,
      ...(fys ? {} : { focus: fokus }),
      ...(sted ? { location: sted } : {}),
      ...(ovelse.trim() ? { drillName: ovelse.trim() } : {}),
      ...(notat.trim() ? { notes: notat.trim() } : {}),
    };
    try {
      const ok = lagre
        ? await lagre(body)
        : (await fetch("/api/portal/trening/logg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).ok;
      if (!ok) throw new Error();
      setLagret(DAG.format(new Date(`${dato}T12:00:00Z`)));
    } catch {
      setFeil("Økta kunne ikke lagres. Ingenting er endret. Prøv igjen.");
    } finally {
      setLagrer(false);
    }
  }

  function nullstill() {
    setLagret(null); setOvelse(""); setNotat(""); setBelastning(null); setFokus(null); setMin(45); setDato(iDag);
  }

  return (
    <div className="phn">
      <TmTilbake href="/portal/planlegge" tekst="Plan" />
      <div className="phn-sr-smal">
        <div className="phn-topp">
          <div><div className="phn-dato">Økt ført i etterkant</div><h1 className="phn-tittel">Logg økt</h1></div>
          <p className="phn-forklar">For trening som ikke lå i planen. Den teller i total treningstid, men ikke mot planen.</p>
        </div>

        {lagret ? (
          <section className="phn-lagret" role="status">
            <b><Check className="phn-ikon" aria-hidden /> Lagret {lagret}.</b>
            <span>{formaterVarighet(min)} {akse} · {omrade}. Den teller i total treningstid, ikke mot planen.</span>
            <div className="phn-knapper">
              <Link className="phn-knapp pri" href="/portal/analysere?del=tren">Se i Stats</Link>
              <button type="button" className="phn-knapp sek" onClick={nullstill}>Logg en økt til</button>
            </div>
          </section>
        ) : (
          <form className="phn-sr-skjema" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <div className="phn-felt" role="group" aria-label="Pyramide">
              <span>Pyramide</span>
              <div className="phn-sr-akser">
                {TRENING_AKSER.map((a) => (
                  <button key={a} type="button" className={a.toLowerCase()} aria-pressed={akse === a} onClick={() => velgAkse(a)}>
                    <i className={`akse-${a.toLowerCase()}`} aria-hidden />{a}
                  </button>
                ))}
              </div>
            </div>
            <div className="phn-felt" role="group" aria-label="Område">
              <span>Område</span>
              <div className="phn-velg-brikker">
                {LOGG_OMRADER[akse].map((o) => <button key={o} type="button" aria-pressed={omrade === o} onClick={() => setOmrade(o)}>{o}</button>)}
              </div>
            </div>
            <div className="phn-to-felt">
              <label className="phn-felt"><span>Dato</span><input type="date" value={dato} max={iDag} required onChange={(e) => setDato(e.target.value > iDag ? iDag : e.target.value)} /></label>
              <label className="phn-felt"><span>Sted</span>
                <select value={sted} onChange={(e) => setSted(e.target.value)}>
                  <option value="">Ikke satt</option>
                  {LOGG_STEDER.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div className="phn-felt" role="group" aria-label="Varighet">
              <span>Varighet</span>
              <div className="phn-sr-teller">
                <button type="button" aria-label="5 minutter mindre" disabled={min <= 5} onClick={() => setMin((m) => Math.max(5, m - 5))}>−</button>
                <output aria-live="polite">{formaterVarighet(min)}</output>
                <button type="button" aria-label="5 minutter mer" disabled={min >= 240} onClick={() => setMin((m) => Math.min(240, m + 5))}>+</button>
              </div>
            </div>
            <label className="phn-felt"><span>Øvelse <small className="phn-kilde">valgfritt</small></span>
              <input value={ovelse} maxLength={100} placeholder="Hva trente du på?" onChange={(e) => setOvelse(e.target.value)} />
            </label>
            <Skala navn={fys ? "Hvor tungt" : "Belastning"} verdi={belastning} sett={setBelastning} lav="Lett" hoy="Maks" />
            {!fys && <Skala navn="Fokus" verdi={fokus} sett={setFokus} lav="Tankene andre steder" hoy="Helt til stede" />}
            <label className="phn-felt"><span>Notat <small className="phn-kilde">valgfritt</small></span>
              <textarea rows={3} maxLength={500} value={notat} placeholder="Hva gikk bra, hva vil du ta med?" onChange={(e) => setNotat(e.target.value)} />
            </label>
            {feil && <p className="phn-sd-varsel" role="alert">{feil}</p>}
            <div className="phn-sr-festet">
              <button type="submit" className="phn-knapp pri phn-sr-stor" disabled={!klar || lagrer}>{lagrer ? "Lagrer økta …" : "Lagre økt"}</button>
              {!klar && <p className="phn-kilde">Velg {belastning == null ? (fys ? "hvor tungt" : "belastning") : ""}{belastning == null && !fys && fokus == null ? " og " : ""}{!fys && fokus == null ? "fokus" : ""} for å lagre.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
