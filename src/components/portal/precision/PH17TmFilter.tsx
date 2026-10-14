"use client";

/**
 * Felles filter for TrackMan-sidene (pakke 6). Filteret lever i adressen, så det
 * følger med mellom Økter, Alle køller og én økt. Brikkene fjerner ett valg om gangen.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  TM_FILTER_STANDARD, TM_PERIODE_NAVN, TM_PLAN_NAVN, tmFilterSok,
  type TmFilter, type TmHastValg, type TmPeriode, type TmPlanValg, type TmSted,
} from "@/lib/portal-analyse/trackman-stats";

type Props = {
  filter: TmFilter;
  /** Adressen filteret gjelder, uten søkestreng. */
  sti: string;
  /** Køllene spilleren har slag med i perioden. */
  koller: string[];
};

const STEDER: TmSted[] = ["Simulator", "Range", "Nett", "Bane"];
const HAST: TmHastValg[] = ["Full", "Lav"];
const PLAN: TmPlanValg[] = ["koblet", "ikke"];

function veksle<T>(liste: T[], v: T): T[] {
  return liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v];
}

export function TmFilterLinje({ filter, sti, koller }: Props) {
  const router = useRouter();
  const ark = useRef<HTMLDialogElement>(null);
  const [utkast, setUtkast] = useState<TmFilter>(filter);
  const href = (f: TmFilter) => `${sti}${tmFilterSok(f)}`;

  function apne() {
    setUtkast(filter);
    ark.current?.showModal();
  }
  function bruk() {
    ark.current?.close();
    router.push(href(utkast));
  }

  const brikker: { tekst: string; uten: TmFilter }[] = [
    ...filter.kolle.map((k) => ({ tekst: k, uten: { ...filter, kolle: filter.kolle.filter((x) => x !== k) } })),
    ...filter.sted.map((s) => ({ tekst: s, uten: { ...filter, sted: filter.sted.filter((x) => x !== s) } })),
    ...filter.hast.map((h) => ({ tekst: `${h} hastighet`, uten: { ...filter, hast: filter.hast.filter((x) => x !== h) } })),
    ...filter.plan.map((p) => ({ tekst: TM_PLAN_NAVN[p], uten: { ...filter, plan: filter.plan.filter((x) => x !== p) } })),
    ...(filter.ekstreme ? [{ tekst: "Med ekstreme slag", uten: { ...filter, ekstreme: false } }] : []),
  ];
  const kolleValg = [...new Set([...koller, ...filter.kolle])];

  return (
    <div className="phn-filterlinje">
      <button type="button" className="phn-knapp sek" onClick={apne} aria-haspopup="dialog">
        <SlidersHorizontal className="phn-ikon" aria-hidden />
        Filter
      </button>
      <span className="phn-brikke fast">{TM_PERIODE_NAVN[filter.periode]}</span>
      {brikker.map((b) => (
        <Link key={b.tekst} className="phn-brikke" href={href(b.uten)} aria-label={`Fjern ${b.tekst}`}>
          {b.tekst}
          <X className="phn-ikon" aria-hidden />
        </Link>
      ))}

      <dialog ref={ark} className="phn-ark" aria-labelledby="tm-filter-tittel">
        <div className="phn-ark-kropp">
          <div className="phn-ark-topp">
            <h2 id="tm-filter-tittel">Filter</h2>
            <button type="button" className="phn-lukk" onClick={() => ark.current?.close()} aria-label="Lukk">
              <X className="phn-ikon" aria-hidden />
            </button>
          </div>
          <Gruppe navn="Periode">
            {(Object.keys(TM_PERIODE_NAVN) as TmPeriode[]).map((p) => (
              <Valg key={p} paa={utkast.periode === p} onClick={() => setUtkast({ ...utkast, periode: p })}>{TM_PERIODE_NAVN[p]}</Valg>
            ))}
          </Gruppe>
          {kolleValg.length > 0 && (
            <Gruppe navn="Kølle">
              {kolleValg.map((k) => (
                <Valg key={k} paa={utkast.kolle.includes(k)} onClick={() => setUtkast({ ...utkast, kolle: veksle(utkast.kolle, k) })}>{k}</Valg>
              ))}
            </Gruppe>
          )}
          <Gruppe navn="Sted">
            {STEDER.map((s) => (
              <Valg key={s} paa={utkast.sted.includes(s)} onClick={() => setUtkast({ ...utkast, sted: veksle(utkast.sted, s) })}>{s}</Valg>
            ))}
          </Gruppe>
          <Gruppe navn="Hastighet">
            {HAST.map((h) => (
              <Valg key={h} paa={utkast.hast.includes(h)} onClick={() => setUtkast({ ...utkast, hast: veksle(utkast.hast, h) })}>{h} hastighet</Valg>
            ))}
          </Gruppe>
          <Gruppe navn="Teknisk plan">
            {PLAN.map((p) => (
              <Valg key={p} paa={utkast.plan.includes(p)} onClick={() => setUtkast({ ...utkast, plan: veksle(utkast.plan, p) })}>{TM_PLAN_NAVN[p]}</Valg>
            ))}
          </Gruppe>
          <Gruppe navn="Ekstreme slag">
            <Valg paa={!utkast.ekstreme} onClick={() => setUtkast({ ...utkast, ekstreme: false })}>Skjul</Valg>
            <Valg paa={utkast.ekstreme} onClick={() => setUtkast({ ...utkast, ekstreme: true })}>Vis</Valg>
          </Gruppe>
          <div className="phn-knapper">
            <button type="button" className="phn-knapp pri" onClick={bruk}>Vis</button>
            <button type="button" className="phn-knapp sek" onClick={() => setUtkast(TM_FILTER_STANDARD)}>Nullstill</button>
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

function Valg({ paa, onClick, children }: { paa: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={paa} onClick={onClick}>{children}</button>;
}
