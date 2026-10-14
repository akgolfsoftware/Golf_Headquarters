/**
 * Felles biter for TrackMan-skjermene i pakke 6 (PH-17): datoformat, «Alle tall» og tilbakelenke.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TM_PARAM, TM_PARAM_GRUPPER, formaterTm, type TmParamKey } from "@/lib/portal-analyse/trackman-stats";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";

const DAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" });
const LANG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" });
const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** «Man. 28. sep.» */
export const tmDag = (iso: string) => stor(DAG.format(new Date(iso)));
/** «mandag 28. september» */
export const tmLangDag = (iso: string) => LANG.format(new Date(iso));
/** «28. sep.» */
export const tmKortDag = (iso: string) => KORT.format(new Date(iso));

export function TmTilbake({ href, tekst }: { href: string; tekst: string }) {
  return (
    <Link className="phn-tilbake" href={href}>
      <ChevronLeft className="phn-ikon" aria-hidden />
      {tekst}
    </Link>
  );
}

/** Alle 17 TrackMan-tall i tre grupper: Ballen, Ballbanen og Kølla. */
export function TmAlleTall({ verdier }: { verdier: Record<TmParamKey, number | null> | null }) {
  return (
    <>
      {TM_PARAM_GRUPPER.map((g) => (
        <div className="phn-grp" key={g}>
          <b className="phn-undertittel">{g}</b>
          <dl className="phn-param">
            {TM_PARAM.filter((p) => p.gruppe === g).map((p) => (
              <div key={p.key}>
                <dt>{p.navn}</dt>
                <dd>{verdier ? formaterTm(p, verdier[p.key]) : "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </>
  );
}

/** Lastetilstand for TrackMan-skjermene. Ingen "use client": loading.tsx importerer aldri fra en klientmodul. */
export function TmLaster({ tekst }: { tekst: string }) {
  return (
    <div className="phn" aria-busy="true" aria-label={tekst}>
      <div className="phn-topp">
        <span className="phn-skjelett" style={{ width: 180, height: 14 }} />
        <span className="phn-skjelett" style={{ width: 140, height: 32 }} />
        <span className="phn-skjelett" style={{ width: 120, height: 52 }} />
      </div>
      <span className="phn-skjelett" style={{ width: 110, height: 44 }} />
      <div className="phn-to-kol">
        <div className="phn-kol">{[0, 1, 2].map((i) => <span key={i} className="phn-skjelett" style={{ height: 96 }} />)}</div>
        <div className="phn-kol"><span className="phn-skjelett" style={{ height: 240 }} /></div>
      </div>
      <p className="phn-kilde" role="status">{tekst} …</p>
    </div>
  );
}
