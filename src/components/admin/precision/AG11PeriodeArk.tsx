"use client";

/**
 * Periodeskjema for coachens Workbench i nytt design (pakke 4): ny, endre og
 * slette en periode, for én spiller (coachLagrePeriode/coachSlettPeriode) eller
 * for gruppas årsplan (coachLagreGruppePeriode/coachSlettGruppePeriode).
 * Fasit: docs/design-system/utkast-agencyos/workbench.html, «Ny periode» i
 * AG-11-GRUPPE-AR, og PH-11-PERSKJEMA for feltene (samme PeriodeInput).
 * Periodenavn etter beslutninger.md §PERIODENE HETER … (28.09).
 * Rust bare på «Slett periode», i dialogen.
 *
 * Avvik:
 *   - Utkastet viser ikke periodeskjemaet; feltene følger PH-11-PERSKJEMA (samme PeriodeInput).
 *   - Treningssamling, Heldagssamling og Testuke er med som typer, siden appen lagrer dem som perioder.
 */
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { PeriodeInput } from "@/lib/workbench/perioder";
import { formaterVarighet } from "@/lib/format-tall";

export type PeriodeType = PeriodeInput["lPhase"];
export const PERIODE_NAVN: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", TURNERING: "Turneringsperiode", EVALUERING: "Evaluering", FERIE: "Ferie", RESTITUSJON: "Restitusjon",
  TESTUKE: "Testuke", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling",
};
/** Klasse for periodebåndet: grafitt og grått, aldri aksefarge (farge betyr akse). */
export const PERIODE_KLASSE: Record<PeriodeType, string> = {
  GRUNN: "p-grunn", SPESIAL: "p-spes", TURNERING: "p-turn", EVALUERING: "p-eval", FERIE: "p-ferie", RESTITUSJON: "p-rest",
  TESTUKE: "p-hend", TRENINGSSAMLING: "p-hend", HELDAGSSAMLING: "p-hend",
};
const TYPER: PeriodeType[] = ["GRUNN", "SPESIAL", "TURNERING", "EVALUERING", "FERIE", "RESTITUSJON", "TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"];
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
type Akse = (typeof AKSER)[number];
type Akser = Record<Akse, number>;
const TOM: Akser = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
const AKSE_KLASSE: Record<Akse, string> = { FYS: "f", TEK: "t", SLAG: "s", SPILL: "p", TURN: "u" };
const sum = (m: Partial<Record<Akse, number>> | null | undefined) => AKSER.reduce((s, a) => s + (m?.[a] ?? 0), 0);

export type PeriodeArkPeriode = {
  id: string;
  type: PeriodeType;
  startDate: string;
  endDate: string;
  focus: string | null;
  notat?: string | null;
  axisMinutes?: Partial<Record<Akse, number>> | null;
  axisMinutesLight?: Partial<Record<Akse, number>> | null;
  fraGruppe?: boolean;
};

export function PeriodeArk({ periode, year, hvem, onLukk, onLagret, onLagre, onSlett }: {
  periode: PeriodeArkPeriode | null;
  year: number;
  /** «spilleren» eller «gruppa»: brukes i kildeteksten. */
  hvem: "spiller" | "gruppe";
  onLukk: () => void;
  onLagret: () => void;
  onLagre: (input: PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; error?: string }>;
  onSlett: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [type, setType] = useState<PeriodeType>(periode?.type ?? "GRUNN");
  const [fra, setFra] = useState(periode?.startDate ?? `${year}-01-01`);
  const [til, setTil] = useState(periode?.endDate ?? `${year}-03-31`);
  const [fokus, setFokus] = useState(periode?.focus ?? "");
  const [notat, setNotat] = useState(periode?.notat ?? "");
  const [vanlig, setVanlig] = useState<Akser>({ ...TOM, ...(periode?.axisMinutes ?? {}) });
  const [lett, setLett] = useState<Akser>({ ...TOM, ...(periode?.axisMinutesLight ?? {}) });
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();

  const tilAkser = (m: Akser) => (sum(m) > 0 ? m : null);
  const lagre = () => start(async () => {
    setFeil(null);
    const r = await onLagre({ lPhase: type, startDato: fra, sluttDato: til, fokus: fokus.trim() || undefined, notat: notat.trim() || null, axisMinutes: tilAkser(vanlig), axisMinutesLight: tilAkser(lett) }, periode?.id);
    if (!r.ok) { setFeil(r.error ?? "Perioden ble ikke lagret."); return; }
    onLagret();
  });
  const slett = () => periode && start(async () => {
    setFeil(null);
    const r = await onSlett(periode.id);
    if (!r.ok) { setFeil(r.error ?? "Perioden ble ikke slettet."); return; }
    onLagret();
  });

  const steppere = (m: Akser, sett: (f: (m: Akser) => Akser) => void, hva: string) => <div className="akse-steppere">
    {AKSER.map((a) => <div key={a} className="akse-stepper">
      <b><i className={`akse-prikk a-${a.toLowerCase()}`} aria-hidden />{a}</b>
      <span className="stolpe"><span className={AKSE_KLASSE[a]} style={{ width: `${Math.min(100, (m[a] / 420) * 100)}%` }} /></span>
      <button type="button" aria-label={`15 minutter mindre ${a}, ${hva}`} disabled={m[a] === 0 || lagrer} onClick={() => sett((x) => ({ ...x, [a]: Math.max(0, x[a] - 15) }))}>−</button>
      <output aria-live="polite">{m[a] ? formaterVarighet(m[a]) : "0"}</output>
      <button type="button" aria-label={`15 minutter mer ${a}, ${hva}`} disabled={m[a] >= 3000 || lagrer} onClick={() => sett((x) => ({ ...x, [a]: Math.min(3000, x[a] + 15) }))}>+</button>
    </div>)}
  </div>;

  const kilde = periode ? (periode.fraGruppe ? "Fra gruppa" : hvem === "gruppe" ? "Gruppas årsplan" : "Egen") : "Ny";
  return <div className="ark-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !lagrer) onLukk(); }}>
    <div className="ark" role="dialog" aria-modal="true" aria-label={periode ? `Endre ${PERIODE_NAVN[periode.type]}` : "Ny periode"}>
      <div className="ark-topp">
        <div><span className="dato">Periode · {kilde}</span><h2>{periode ? PERIODE_NAVN[periode.type] : "Ny periode"}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onLukk} disabled={lagrer}><X className="ikon" aria-hidden /></button>
      </div>
      {feil && <p className="varsel advarsel" role="alert">{feil}</p>}
      <div className="felt"><span className="etikett">Type</span>
        <div className="chips" role="group" aria-label="Type">{TYPER.map((t) => <button key={t} type="button" aria-pressed={t === type} onClick={() => setType(t)}>{PERIODE_NAVN[t]}</button>)}</div>
      </div>
      <div className="to-del" style={{ gap: "var(--r2)" }}>
        <label className="felt">Første dag<input type="date" value={fra} onChange={(e) => setFra(e.target.value)} /></label>
        <label className="felt">Siste dag<input type="date" value={til} onChange={(e) => setTil(e.target.value)} /></label>
      </div>
      <label className="felt">Fokus<input type="text" value={fokus} maxLength={200} onChange={(e) => setFokus(e.target.value)} placeholder="Lengdekontroll 100–150 m" /></label>
      <div className="felt"><span className="etikett">Timer per vanlig uke</span>{steppere(vanlig, setVanlig, "vanlig uke")}<p className="kilde">Sum {formaterVarighet(sum(vanlig))} per uke. Ukene fra og med denne uka får timene herfra.</p></div>
      <details className="detaljer">
        <summary>Lett uke</summary>
        <div className="felt" style={{ paddingTop: 8 }}><span className="etikett">Timer per lett uke</span>{steppere(lett, setLett, "lett uke")}</div>
      </details>
      <label className="felt">Notat<textarea rows={2} value={notat} maxLength={1000} onChange={(e) => setNotat(e.target.value)} /></label>
      <p className="kilde">{hvem === "gruppe"
        ? "Lagres i gruppas årsplan. Medlemmene får perioden når du ruller ut. Uker som er gått, endres aldri."
        : periode?.fraGruppe ? "Perioden kom fra gruppa. Endrer du den her, gjelder det bare denne spilleren." : "Lagres i spillerens årsplan. Uker som er gått, endres aldri."}</p>
      <button type="button" className="knapp pri stor" disabled={lagrer || !fra || !til} onClick={lagre}>{lagrer ? "Lagrer …" : periode ? "Lagre endringene" : "Legg inn perioden"}</button>
      {periode && <div className="rust-sone">
        {!bekreftSlett
          ? <button type="button" className="knapp sek" onClick={() => setBekreftSlett(true)}>Slett periode</button>
          : <button type="button" className="knapp rust" disabled={lagrer} onClick={slett}>Bekreft sletting</button>}
        <span className="kilde">Øktene i perioden blir liggende i ukene.</span>
      </div>}
    </div>
  </div>;
}
