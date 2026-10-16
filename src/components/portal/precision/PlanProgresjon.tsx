/**
 * Plan med farge og progresjon — felles deler for PlayerHQ (utkast 3, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-farge.html. Stil: src/styles/playerhq-ny.css §Plan med farge.
 *
 * Ring i aksefargene, aksestolper, ukesøyler, «I rute»-setning og hendelsesliste. Brukes av
 * Måned, År og Periode, og kan brukes av andre PlayerHQ-skjermer i samme stil.
 * Farge betyr akse; grønt og gult er bare status.
 *
 * Avvik:
 *   - Ringen og stolpene måles mot lagt inn når ingenting er fordelt, og ringen sier det.
 *   - Kort varighet under ukesøylene («14 t 5») som i utkastet; ellers formaterVarighet.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, Check, Info, Target, Triangle, Trophy } from "lucide-react";
import type { PyramidArea } from "@/lib/domain/workbench/types";
import { formaterVarighet } from "@/lib/format-tall";
import { AKSER, avrund1, prosent, sum, type Akser, type DelAkser, type Tempo } from "@/lib/workbench/plan-progresjon";

export const AKSE_FARGE: Record<PyramidArea, string> = {
  FYS: "var(--phn-fys)", TEK: "var(--phn-tek)", SLAG: "var(--phn-slag)", SPILL: "var(--phn-spill)", TURN: "var(--phn-turn)",
};
export const AKSE_INK: Record<PyramidArea, string> = {
  FYS: "var(--phn-fys-ink)", TEK: "var(--phn-tek-ink)", SLAG: "var(--phn-slag-ink)", SPILL: "var(--phn-spill-ink)", TURN: "var(--phn-turn-ink)",
};

/** Varighet; 0 blir «0», manglende tall blir «—». */
export const varighet = (min: number | null | undefined) => (min == null ? "—" : min > 0 ? formaterVarighet(min) : "0");

/** Kort varighet under ukesøylene: «14 t 5», «3 t», «45 min». */
export const kortVarighet = (min: number) => {
  const t = Math.floor(min / 60), m = Math.round(min % 60);
  return t ? `${t} t${m ? ` ${m}` : ""}` : `${m} min`;
};

/** Segmentert ring: gjennomført mørkt, resten av grunnlaget lyst i samme aksefarge. */
export function AkseRing({ gj, grunnlag, under, storrelse = 150 }: { gj: DelAkser; grunnlag: Akser; under: string; storrelse?: number }) {
  const r = 62, o = 2 * Math.PI * r, tot = sum(grunnlag);
  const pst = prosent(sum(gj), tot);
  let x = 0;
  const seg: ReactNode[] = [];
  for (const a of AKSER) {
    const f = grunnlag[a];
    if (!f) continue;
    const lf = (f / tot) * o, lg = (Math.min(gj?.[a] ?? 0, f) / tot) * o;
    seg.push(<circle key={`${a}l`} cx="75" cy="75" r={r} fill="none" stroke={AKSE_FARGE[a]} strokeOpacity=".26" strokeWidth="16" strokeDasharray={`${avrund1(Math.max(0, lf - 2))} ${avrund1(o)}`} strokeDashoffset={avrund1(-x)} />);
    if (lg > 0) seg.push(<circle key={`${a}g`} className="phn-ring-seg" cx="75" cy="75" r={r} fill="none" stroke={AKSE_FARGE[a]} strokeWidth="16" strokeDasharray={`${avrund1(Math.max(0, lg - 2))} ${avrund1(o)}`} strokeDashoffset={avrund1(-x)} />);
    x += lf;
  }
  return <div className="phn-ring" style={{ width: storrelse, height: storrelse }} role="img" aria-label={pst === null ? "Ingen timer å måle mot" : `${pst} prosent ${under} gjennomført`}>
    <svg viewBox="0 0 150 150" aria-hidden><circle cx="75" cy="75" r={r} fill="none" stroke="var(--phn-sand-150)" strokeWidth="16" />{seg}</svg>
    <div className="phn-ring-tall"><strong>{pst === null ? "—" : <>{pst}<small>%</small></>}</strong><span>{under}</span></div>
  </div>;
}

/** Én stolpe per akse med «gjennomført / av grunnlag». Akser uten grunnlag vises ikke. */
export function AkseStolper({ gj, grunnlag }: { gj: DelAkser; grunnlag: Akser }) {
  return <div className="phn-akser">
    {AKSER.filter((a) => grunnlag[a] > 0).map((a) => {
      const g = gj?.[a] ?? 0;
      return <div key={a} className="phn-akse">
        <b style={{ color: AKSE_INK[a] }}>{a}</b>
        <div className="phn-stolpe"><em style={{ background: AKSE_FARGE[a] }} /><span style={{ width: `${Math.min(100, prosent(g, grunnlag[a]) ?? 0)}%`, background: AKSE_FARGE[a] }} /></div>
        <span className="phn-akse-t">{varighet(g)}<small>av {varighet(grunnlag[a])}</small></span>
      </div>;
    })}
  </div>;
}

/** Stolper for en fast fordeling (f.eks. timer per vanlig uke), skalert mot største akse. */
export function FordelingStolper({ m }: { m: DelAkser }) {
  const maks = Math.max(1, ...AKSER.map((a) => m?.[a] ?? 0));
  return <div className="phn-akser">
    {AKSER.filter((a) => (m?.[a] ?? 0) > 0).map((a) => <div key={a} className="phn-akse">
      <b style={{ color: AKSE_INK[a] }}>{a}</b>
      <div className="phn-stolpe"><span style={{ width: `${((m?.[a] ?? 0) / maks) * 100}%`, background: AKSE_FARGE[a] }} /></div>
      <span className="phn-akse-t">{varighet(m?.[a] ?? 0)}</span>
    </div>)}
  </div>;
}

export type TempoStatus = "rute" | "bak" | "noy";

/** Grønn «I rute», gul «Bak» eller nøytral setning. */
export function TempoLinje({ status, children }: { status: TempoStatus; children: ReactNode }) {
  const Ikon = status === "rute" ? Check : status === "bak" ? AlertCircle : Info;
  return <div className={`phn-tempo ${status}`}><Ikon className="phn-ikon" aria-hidden /><span>{children}</span></div>;
}

/**
 * Setningen under ringen. `hva` er «måneden», «perioden» eller «året».
 * Ukjent gir en nøytral setning, aldri en gjetning.
 */
export function tempoSetning(t: Tempo, o: { hva: string; ferdig: boolean; startet: boolean; lagtDenneUka?: number }): { status: TempoStatus; tekst: ReactNode } {
  const denneUka = o.lagtDenneUka ? ` ${varighet(o.lagtDenneUka)} er lagt inn denne uka.` : "";
  if (t.status === "ukjent") {
    if (!o.startet) return { status: "noy", tekst: <>{storForbokstav(o.hva)} har ikke startet ennå.</> };
    if (t.grunn === "ingen-gatt") return { status: "noy", tekst: <>Første uke er i gang.{denneUka || " Ingenting er lagt inn denne uka ennå."}</> };
    return { status: "noy", tekst: <>Ingen timer var fordelt i ukene som er gått, så det er ikke noe å måle mot.{denneUka}</> };
  }
  const tall = o.ferdig
    ? `Du gjorde ${varighet(t.gjort)} av ${varighet(t.skulle)} som var fordelt.`
    : `Du har gjort ${varighet(t.gjort)} av ${varighet(t.skulle)} som skulle vært gjort til nå.`;
  return { status: t.status, tekst: <><b>{t.status === "rute" ? "I rute." : "Bak."}</b> {tall}{o.ferdig ? "" : denneUka}</> };
}

const storForbokstav = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Heltekortet: ring, tittel, aksestolper og «I rute»-setning. */
export function HeltKort({ tittel, gj, grunnlag, kilde, under, tempo, fase, className, label }: {
  tittel: string; gj: DelAkser; grunnlag: Akser; kilde: "fordelt" | "lagt inn" | null; under: string;
  tempo: { status: TempoStatus; tekst: ReactNode }; fase?: ReactNode; className?: string; label: string;
}) {
  return <section className={`phn-kort${className ? ` ${className}` : ""}`} aria-label={label}>
    <div className="phn-helt">
      <AkseRing gj={gj} grunnlag={grunnlag} under={kilde === "lagt inn" ? "av lagt inn" : under} />
      <div className="phn-helt-tekst">
        <div className="phn-helt-topp"><h2>{tittel}</h2>{kilde && <span>{varighet(sum(gj))} av {varighet(sum(grunnlag))}{kilde === "lagt inn" ? " lagt inn" : ""}</span>}</div>
        {kilde ? <AkseStolper gj={gj} grunnlag={grunnlag} /> : <p className="phn-forklar">Ingen timer er fordelt eller lagt inn ennå.</p>}
        {fase}
      </div>
    </div>
    <TempoLinje status={tempo.status}>{tempo.tekst}</TempoLinje>
  </section>;
}

export type SoyleUke = {
  nokkel: string;
  weekNumber: number;
  href: string;
  gj: DelAkser;
  lagtInn: DelAkser;
  /** Fordelt i uka (sum). Null = ikke fordelt. */
  fordelt: number | null;
  na: boolean;
  gatt: boolean;
  merke?: "Endret" | "Testuke" | null;
  dato: string;
};

/** Ukene som søyler: mørk = gjennomført, lys = lagt inn, stiplet strek = fordelt. Over 6 uker blir kompakt på mobil. */
export function UkeSoyler({ uker, hoyde = 130 }: { uker: SoyleUke[]; hoyde?: number }) {
  const maks = Math.max(1, ...uker.map((u) => Math.max(u.fordelt ?? 0, sum(u.lagtInn), sum(u.gj))));
  return <div className={`phn-uker${uker.length > 6 ? " mange" : ""}`} style={{ ["--n" as string]: uker.length }}>
    {uker.map((u, k) => {
      const lagt = sum(u.lagtInn), gj = sum(u.gj);
      const pst = u.fordelt ? prosent(gj, u.fordelt) : null;
      const deler: ReactNode[] = [];
      for (const a of AKSER) {
        const g = u.gj?.[a] ?? 0, l = Math.max(0, (u.lagtInn?.[a] ?? 0) - g);
        if (g) deler.push(<i key={`${a}g`} style={{ height: (g / maks) * hoyde, background: AKSE_FARGE[a], animationDelay: `${k * 60}ms` }} />);
        if (l) deler.push(<i key={`${a}l`} className="lys" style={{ height: (l / maks) * hoyde, background: AKSE_FARGE[a], animationDelay: `${k * 60}ms` }} />);
      }
      const label = `Uke ${u.weekNumber}: ${u.gatt ? `${varighet(gj)} gjennomført` : `${varighet(lagt)} lagt inn`} av ${u.fordelt ? varighet(u.fordelt) : "ikke fordelt"}`;
      return <Link key={u.nokkel} href={u.href} className={`phn-uke${u.na ? " na" : ""}`} aria-label={label}>
        <div className="phn-soyle" style={{ height: hoyde }}>
          {deler}
          {u.fordelt ? <u style={{ bottom: Math.min((u.fordelt / maks) * hoyde, hoyde - 2) }} /> : null}
        </div>
        <b><span className="phn-uo">Uke </span>{u.weekNumber}</b>
        {u.na ? <span className="phn-merke">Nå</span> : u.merke === "Endret" ? <span className="phn-merke endret">Endret</span> : u.merke ? <span className="phn-merke test">Test<span className="phn-uo">uke</span></span> : <small>{u.dato}</small>}
        <small>{u.gatt ? (pst !== null ? `${pst} %` : gj > 0 ? kortVarighet(gj) : "—") : <>{kortVarighet(lagt)}<br />av {u.fordelt ? kortVarighet(u.fordelt) : "—"}</>}</small>
      </Link>;
    })}
  </div>;
}

export function SoyleForklaring({ lys = "Lagt inn", strek = true }: { lys?: string; strek?: boolean }) {
  return <div className="phn-forklaring">
    <span><i />Gjennomført</span><span><i className="lys" />{lys}</span>{strek && <span><i className="strek" />Fordelt</span>}
  </div>;
}

export type PlanHendelse = { type: "test" | "samling" | "turn"; navn: string; tekst?: string; dato: string };
const HENDELSE_IKON = { test: Target, samling: Triangle, turn: Trophy } as const;

export function HendelseListe({ liste, tom }: { liste: PlanHendelse[]; tom: string }) {
  if (liste.length === 0) return <p className="phn-forklar">{tom}</p>;
  return <div className="phn-hendelser-liste">
    {liste.map((h, i) => {
      const Ikon = HENDELSE_IKON[h.type];
      return <div key={i} className="phn-hend">
        <span className={`phn-hend-ik ${h.type}`}><Ikon className="phn-ikon" aria-hidden /></span>
        <span><b>{h.navn}</b>{h.tekst && <span className="phn-kilde">{h.tekst}</span>}</span>
        <small>{h.dato}</small>
      </div>;
    })}
  </div>;
}

/** Liten fremdriftsring (månedsknappene i År). */
export function MiniRing({ pst, farge }: { pst: number | null; farge: string }) {
  const r = 19, o = 2 * Math.PI * r, d = (Math.min(100, pst ?? 0) / 100) * o;
  return <svg className="phn-miniring" viewBox="0 0 48 48" aria-hidden>
    <circle cx="24" cy="24" r={r} fill="none" stroke="var(--phn-sand-150)" strokeWidth="6" />
    {d > 0 && <circle cx="24" cy="24" r={r} fill="none" stroke={farge} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${avrund1(d)} ${avrund1(o)}`} />}
  </svg>;
}
