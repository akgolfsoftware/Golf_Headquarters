"use client";

/**
 * Stats › Historikk i nytt design (PlayerHQ pakke 13, godkjent av Anders 16.10.2026).
 * Runder, økter, tester og TrackMan per måned, med filter i et ark (periode, type, akse, rekkefølge).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «historikk».
 * Stil: playerhq-ny-statsresten-historikk.css. Erstatter HistorikkV2 og HistorikkFilterSheet.
 *
 * Avvik:
 *   - Økter viser minutter, ikke belastning: historikken leser gjennomførte økter, og belastning
 *     lagres ikke der. TrackMan viser antall slag, ikke snitt carry.
 *   - Testresultatet vises som tallet slik det er lagret, uten enhet (som før).
 *   - Rekkefølgen har i tillegg «Best SG først» fra den gamle siden, så funksjonen ikke forsvinner.
 *     Sonefilteret (Tee, Innspill, Nærspill, Putt) er erstattet av akse, som i utkastet.
 *   - Runder har ingen akse (grafitt prikk, som i utkastet) og faller bort når en akse er valgt.
 *   - Brikkene for aktive valg fjerner valget ved trykk; perioden står fast.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsresten-historikk.css";

export type HistorikkType = "runde" | "okt" | "test" | "trackman";
export type HistorikkAkse = "fys" | "tek" | "slag" | "spill" | "turn";
type Periode = "30" | "90" | "sesong" | "alt";
type Sort = "ny" | "gammel" | "sg";

export type HistorikkRad = {
  id: string;
  type: HistorikkType;
  /** Dag i måneden, «4». */
  dag: string;
  /** Ukedag, «lør». */
  ukedag: string;
  /** Månedsoverskrift, «Oktober 2026». */
  maaned: string;
  dagerSiden: number;
  iSesong: boolean;
  navn: string;
  meta: string[];
  /** Aksen som vises på raden. Null for runder (grafitt). */
  akse: HistorikkAkse | null;
  /** Alle aksene raden har, for filteret. */
  akser: HistorikkAkse[];
  verdi: string;
  verdiTekst: string;
  sg: number | null;
  href: string | null;
};

type Filter = { periode: Periode; typer: HistorikkType[]; akse: HistorikkAkse | "alle"; sort: Sort };

const ALLE_TYPER: HistorikkType[] = ["runde", "okt", "test", "trackman"];
const STANDARD: Filter = { periode: "90", typer: ALLE_TYPER, akse: "alle", sort: "ny" };
const PERIODER: { v: Periode; navn: string }[] = [
  { v: "30", navn: "30 dager" }, { v: "90", navn: "90 dager" }, { v: "sesong", navn: "Sesong" }, { v: "alt", navn: "Alt" },
];
const TYPE_NAVN: Record<HistorikkType, string> = { runde: "Runder", okt: "Økter", test: "Tester", trackman: "TrackMan" };
const AKSER: HistorikkAkse[] = ["fys", "tek", "slag", "spill", "turn"];
const AKSE_NAVN: Record<HistorikkAkse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
const SORT_NAVN: Record<Sort, string> = { ny: "Nyeste først", gammel: "Eldste først", sg: "Best SG først" };

function treff(rader: HistorikkRad[], f: Filter): HistorikkRad[] {
  const ut = rader.filter((r) => {
    if (f.periode === "30" && r.dagerSiden > 30) return false;
    if (f.periode === "90" && r.dagerSiden > 90) return false;
    if (f.periode === "sesong" && !r.iSesong) return false;
    if (!f.typer.includes(r.type)) return false;
    if (f.akse !== "alle" && !r.akser.includes(f.akse)) return false;
    return true;
  });
  if (f.sort === "gammel") ut.reverse();
  if (f.sort === "sg") ut.sort((a, b) => (b.sg ?? -Infinity) - (a.sg ?? -Infinity));
  return ut;
}

const periodeNavn = (p: Periode) => PERIODER.find((x) => x.v === p)!.navn;

export function PH16eHistorikk({ rader }: { rader: HistorikkRad[] }) {
  const [filter, setFilter] = useState<Filter>(STANDARD);
  const [utkast, setUtkast] = useState<Filter>(STANDARD);
  const ark = useRef<HTMLDialogElement>(null);
  const liste = treff(rader, filter);

  function apne() {
    setUtkast(filter);
    ark.current?.showModal();
  }
  function bruk() {
    setFilter(utkast);
    ark.current?.close();
  }
  function veksleType(t: HistorikkType) {
    setUtkast((u) => {
      const har = u.typer.includes(t);
      if (har && u.typer.length === 1) return u;
      return { ...u, typer: har ? u.typer.filter((x) => x !== t) : ALLE_TYPER.filter((x) => x === t || u.typer.includes(x)) };
    });
  }

  const brikker: { tekst: string; uten: Filter }[] = [
    ...(filter.typer.length < ALLE_TYPER.length ? [{ tekst: filter.typer.map((t) => TYPE_NAVN[t]).join(", "), uten: { ...filter, typer: ALLE_TYPER } }] : []),
    ...(filter.akse !== "alle" ? [{ tekst: AKSE_NAVN[filter.akse], uten: { ...filter, akse: "alle" as const } }] : []),
    ...(filter.sort !== "ny" ? [{ tekst: SORT_NAVN[filter.sort], uten: { ...filter, sort: "ny" as const } }] : []),
  ];

  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere" tekst="Stats" />
      <div className="phn-topp">
        <div>
          <div className="phn-dato">Stats · alle økter, runder og tester</div>
          <h1 className="phn-tittel">Historikk</h1>
        </div>
        {rader.length > 0 && (
          <div className="phn-hi-filter">
            <span className="phn-brikke fast">{periodeNavn(filter.periode)}</span>
            {brikker.map((b) => (
              <button key={b.tekst} type="button" className="phn-brikke" onClick={() => setFilter(b.uten)} aria-label={`Fjern ${b.tekst}`}>
                {b.tekst}
                <X className="phn-ikon" aria-hidden />
              </button>
            ))}
            <button type="button" className="phn-hi-apne" onClick={apne} aria-haspopup="dialog">
              <SlidersHorizontal className="phn-ikon" aria-hidden />
              Filter
            </button>
          </div>
        )}
      </div>

      {rader.length === 0 ? (
        <section className="phn-kort dempet">
          <h2>Ingenting her ennå</h2>
          <p className="phn-forklar">Gjennomførte økter, runder, tester og TrackMan-økter samles her.</p>
          <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal">Til I dag</Link></div>
        </section>
      ) : (
        <div className="phn-hist">
          <p className="phn-kilde">{liste.length} av {rader.length} · runder, økter, tester og TrackMan</p>
          {liste.length === 0 && (
            <section className="phn-kort dempet">
              <h2>Ingen treff på dette filteret</h2>
              <p className="phn-forklar">Prøv en lengre periode eller flere typer.</p>
              <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => setFilter(STANDARD)}>Nullstill filteret</button></div>
            </section>
          )}
          {liste.map((r, i) => {
            const ny = filter.sort !== "sg" && r.maaned !== liste[i - 1]?.maaned;
            return <HistorikkRadVis key={`${r.type}-${r.id}`} r={r} overskrift={ny ? r.maaned : null} />;
          })}
        </div>
      )}

      <dialog ref={ark} className="phn-ark" aria-labelledby="hi-filter-tittel">
        <div className="phn-ark-kropp">
          <div className="phn-ark-topp">
            <h2 id="hi-filter-tittel">Filtrer historikk</h2>
            <button type="button" className="phn-lukk" onClick={() => ark.current?.close()} aria-label="Lukk">
              <X className="phn-ikon" aria-hidden />
            </button>
          </div>
          <Gruppe navn="Periode">
            {PERIODER.map((p) => (
              <button key={p.v} type="button" aria-pressed={utkast.periode === p.v} onClick={() => setUtkast({ ...utkast, periode: p.v })}>{p.navn}</button>
            ))}
          </Gruppe>
          <Gruppe navn="Type">
            {ALLE_TYPER.map((t) => (
              <button key={t} type="button" aria-pressed={utkast.typer.includes(t)} onClick={() => veksleType(t)}>{TYPE_NAVN[t]}</button>
            ))}
          </Gruppe>
          <Gruppe navn="Akse">
            <button type="button" aria-pressed={utkast.akse === "alle"} onClick={() => setUtkast({ ...utkast, akse: "alle" })}>Alle</button>
            {AKSER.map((a) => (
              <button key={a} type="button" aria-pressed={utkast.akse === a} onClick={() => setUtkast({ ...utkast, akse: a })}>
                <i className={`akse-${a}`} aria-hidden />
                {AKSE_NAVN[a]}
              </button>
            ))}
          </Gruppe>
          <Gruppe navn="Rekkefølge">
            {(Object.keys(SORT_NAVN) as Sort[]).map((s) => (
              <button key={s} type="button" aria-pressed={utkast.sort === s} onClick={() => setUtkast({ ...utkast, sort: s })}>{SORT_NAVN[s]}</button>
            ))}
          </Gruppe>
          <div className="phn-hi-ark-fot">
            <button type="button" className="phn-knapp sek" onClick={() => setUtkast(STANDARD)}>Nullstill</button>
            <button type="button" className="phn-knapp pri" onClick={bruk}>Vis {treff(rader, utkast).length} treff</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function Gruppe({ navn, children }: { navn: string; children: React.ReactNode }) {
  return (
    <div className="phn-felt" role="group" aria-label={navn}>
      <span className="phn-etikett">{navn}</span>
      <div className="phn-velg-brikker">{children}</div>
    </div>
  );
}

function HistorikkRadVis({ r, overskrift }: { r: HistorikkRad; overskrift: string | null }) {
  const innhold = (
    <>
      <span className="phn-hr-dag">{r.dag}<small>{r.ukedag}</small></span>
      <span>
        <b className="phn-hr-navn">{r.navn}</b>
        <span className="phn-hr-meta">
          <span><i className={r.akse ? `akse-${r.akse}` : undefined} aria-hidden />{r.akse ? AKSE_NAVN[r.akse] : "Runde"}</span>
          {r.meta.map((m) => <span key={m}>{m}</span>)}
        </span>
      </span>
      <span className="phn-hr-tall">{r.verdi}<small>{r.verdiTekst}</small></span>
    </>
  );
  return (
    <>
      {overskrift && <div className="phn-hist-mnd">{overskrift}</div>}
      {r.href ? <Link className="phn-hrad" href={r.href}>{innhold}</Link> : <div className="phn-hrad">{innhold}</div>}
    </>
  );
}
