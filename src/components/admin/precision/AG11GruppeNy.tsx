"use client";

/**
 * AG-11-GRUPPE og AG-11-GRUPPE-AR: Workbench for gruppe med gruppas årsplan,
 * i nytt design (designbrevet 13.10.2026, pakke 4).
 * Fasit: docs/design-system/utkast-agencyos/workbench.html, skjerm «AG-11-GRUPPE-AR».
 * Rute: /admin/grupper/[id]/workbench. Stil: src/styles/agencyos-ny-workbench.css.
 *
 * Det som virker som før: gruppas perioder lagres i group_period_blocks
 * (coachLagreGruppePeriode, coachSlettGruppePeriode), «Rull ut til medlemmene»
 * (coachRullUtGruppeAarsplan, med hoppet-rapport), de faste gruppetidene og
 * velgeren mellom grupper. Nytt: periodene legges inn, endres og slettes i
 * samme skjema som spillerens (PeriodeArk).
 *
 * Bølge 2 (20.10.2026, canvas «Gruppeplan i Workbench»): timer per akse som stripe i aksefarger på hver periode.
 *
 * Avvik:
 *   - Kurven «timer per uke per akse» er utelatt: gruppa har ingen ukeplan,
 *     bare perioder med timer per akse, så kurven ville bare gjentatt periodene.
 *   - «Gjennomført så langt» for gruppa finnes ikke som tall; vises ikke.
 *   - «Etter siste utrulling 18. sep»: appen lagrer ikke når gruppa sist ble
 *     rullet ut. «Egen» på et medlem betyr at medlemmet har perioder som ikke
 *     kommer fra denne gruppa i samme tidsrom.
 *   - Uke, Økt og Målsetninger for gruppa finnes ikke; nivåene lenker til
 *     medlemmer, timeplan og skoledata.
 */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Avatar, Pille } from "@/components/admin/agencyos-ny/ny";
import { VelgerArk } from "./AG11Ark";
import { PERIODE_KLASSE, PERIODE_NAVN, PeriodeArk, type PeriodeArkPeriode } from "./AG11PeriodeArk";
import type { PeriodeInput } from "@/lib/workbench/perioder";
import type { RullUtHoppet } from "@/lib/workbench/gruppe-periode-actions";
import { formaterVarighet } from "@/lib/format-tall";
import "@/styles/agencyos-ny-workbench.css";

export type GruppeMedlem = { id: string; navn: string; /** Perioder medlemmet har utenom gruppas, f.eks. «Egen Spesialperiode fra uke 2». */ egen: string | null };

export type AG11GruppeNyProps = {
  gruppe: { id: string; navn: string; medlemmer: number };
  grupper: readonly { id: string; navn: string }[];
  perioder: PeriodeArkPeriode[];
  medlemmer: GruppeMedlem[];
  faste: readonly { id: string; dag: string; tid: string; sted: string | null }[];
  kanRulleUt: boolean;
  onLagre: (input: PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; periodeId?: string; error?: string }>;
  onSlett: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
  onRullUt?: () => Promise<{ ok: boolean; spillere?: number; perioderLagt?: number; hoppet?: RullUtHoppet[]; error?: string }>;
};

const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const HENDELSER = new Set(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);
const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const dager = (a: string, b: string) => Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000) + 1);
const kort = (iso: string) => `${Number(iso.slice(8, 10))}. ${MND[Number(iso.slice(5, 7)) - 1]}`;
const mndAar = (iso: string, stor = false) => { const m = MND[Number(iso.slice(5, 7)) - 1]; return `${stor ? m[0].toUpperCase() + m.slice(1) : m} ${iso.slice(0, 4)}`; };

export function AG11GruppeNy({ gruppe, grupper, perioder, medlemmer, faste, kanRulleUt, onLagre, onSlett, onRullUt }: AG11GruppeNyProps) {
  const router = useRouter();
  const [velger, setVelger] = useState(false);
  const [ark, setArk] = useState<{ periode: PeriodeArkPeriode | null } | null>(null);
  const [rullBekreft, setRullBekreft] = useState(false);
  const [rullResultat, setRullResultat] = useState<string | null>(null);
  const [ruller, start] = useTransition();
  const idx = grupper.findIndex((g) => g.id === gruppe.id);
  const til = (d: number) => router.push(`/admin/grupper/${grupper[(idx + d + grupper.length) % grupper.length].id}/workbench`);
  const id = gruppe.id;

  const sortert = useMemo(() => [...perioder].sort((a, b) => a.startDate.localeCompare(b.startDate)), [perioder]);
  const trening = sortert.filter((p) => !HENDELSER.has(p.type));
  const forste = sortert[0]?.startDate ?? null, siste = sortert[sortert.length - 1]?.endDate ?? null;
  const aar = Number((forste ?? new Date().toISOString()).slice(0, 4));
  const timerIAaret = trening.reduce((s, p) => s + (AKSER.reduce((x, a) => x + (p.axisMinutes?.[a] ?? 0), 0) * dager(p.startDate, p.endDate)) / 7, 0);
  const totDager = forste && siste ? dager(forste, siste) : 0;
  const egne = medlemmer.filter((m) => m.egen).length;

  const rullUt = () => onRullUt && start(async () => {
    const res = await onRullUt();
    setRullBekreft(false);
    const hoppet = res.hoppet && res.hoppet.length > 0
      ? ` Hoppet over: ${res.hoppet.map((h) => (h.grunn === "KRYSSKILDE" ? `${h.navn} (kolliderer med annen plan${h.periode ? `: ${h.periode}` : ""})` : `${h.navn} (feil)`)).join(" · ")}.`
      : "";
    setRullResultat(res.ok ? `Rullet ut til ${res.spillere ?? 0} medlemmer (${res.perioderLagt ?? 0} perioder).${hoppet}` : res.error ?? "Utrullingen feilet.");
    router.refresh();
  });

  return <div className="agn-s">
    <div className="topp">
      <div className="velgerlinje">
        <div className="rad">
          <div className="valg" role="group" aria-label="Plan for">
            <Link href="/admin/planlegge" aria-current={undefined}>Spiller</Link>
            <button type="button" aria-pressed="true">Gruppe</button>
          </div>
          <div className="hvem"><Avatar navn={gruppe.navn} liten /><b>{gruppe.navn}</b><button type="button" className="sok" onClick={() => setVelger(true)} aria-label="Velg gruppe">Velg gruppe</button></div>
          <span className="pil"><button type="button" aria-label="Forrige gruppe" disabled={grupper.length < 2} onClick={() => til(-1)}><ChevronLeft className="ikon" aria-hidden /></button><button type="button" aria-label="Neste gruppe" disabled={grupper.length < 2} onClick={() => til(1)}><ChevronRight className="ikon" aria-hidden /></button></span>
        </div>
      </div>
      <div className="topp-rad">
        <div><div className="dato">Gruppas årsplan · {gruppe.medlemmer} {gruppe.medlemmer === 1 ? "medlem" : "medlemmer"}</div><h1 className="tittel">{forste && siste ? `${mndAar(forste, true)} – ${mndAar(siste)}` : "Årsplan"}</h1></div>
        {onRullUt && <button type="button" className="knapp pri" disabled={!kanRulleUt || trening.length === 0 || ruller} title={!kanRulleUt ? "Bare gruppens eier kan rulle ut" : undefined} onClick={() => setRullBekreft(true)}>Rull ut til medlemmene</button>}
      </div>
      <div className="nivaer" role="group" aria-label="Nivå">
        <button type="button" aria-pressed="true">År</button>
        <Link href={`/admin/grupper/${id}`}>Medlemmer</Link>
        <Link href={`/admin/grupper/${id}/timeplan`}>Timeplan</Link>
        <Link href={`/admin/grupper/${id}/arsplan/skoledata`}>Skoledata</Link>
      </div>
    </div>

    {rullResultat && <div className="varsel ok" role="status"><b className="undertittel">Utrulling</b><p className="forklar">{rullResultat}</p></div>}

    <section className="kort" aria-label="Året">
      <div className="hoved"><strong>{timerIAaret > 0 ? formaterVarighet(Math.round(timerIAaret)) : "—"}</strong><span className="forklar">planlagt per medlem i året, fra timene per uke i periodene</span></div>
      {sortert.length > 0 && totDager > 0 && <div className="periodebaand" role="img" aria-label={`Periodene i årsplanen: ${sortert.map((p) => `${PERIODE_NAVN[p.type]} ${kort(p.startDate)}–${kort(p.endDate)}`).join(", ")}`}>
        {sortert.map((p) => <span key={p.id} className={PERIODE_KLASSE[p.type]} style={{ flex: `${dager(p.startDate, p.endDate)} 1 0` }}>{dager(p.startDate, p.endDate) / totDager > 0.08 ? PERIODE_NAVN[p.type] : ""}</span>)}
      </div>}
      {sortert.length === 0 && <p className="forklar">Ingen perioder lagt inn ennå. Periodene i grafitt og grått viser gruppas år; aksefargene brukes bare på økter.</p>}
    </section>

    <div className="to-del">
      <div>
        <section className="seksjon" aria-label="Perioder">
          <div className="sek-topp"><h2>Perioder</h2><button type="button" className="knapp sek" onClick={() => setArk({ periode: null })}>Ny periode</button></div>
          {sortert.length === 0
            ? <div className="kort dempet"><b className="undertittel">Ingen perioder</b><p className="forklar">Legg inn Grunnperiode, Spesialperiode og Turneringsperiode med timer per akse. Medlemmene arver dem når du ruller ut.</p></div>
            : <div className="periodeliste">{sortert.map((p) => <button key={p.id} type="button" className="periode" onClick={() => setArk({ periode: p })}>
              <i className={PERIODE_KLASSE[p.type]} aria-hidden /><span><b>{PERIODE_NAVN[p.type]}{p.focus ? ` · ${p.focus}` : ""}</b><span className="kilde">{kort(p.startDate)}–{kort(p.endDate)} · {p.axisMinutes ? `${formaterVarighet(AKSER.reduce((s, a) => s + (p.axisMinutes?.[a] ?? 0), 0))} per uke` : "ingen timer fordelt"}</span></span><ChevronRight className="ikon" aria-hidden />
              {p.axisMinutes && AKSER.some((a) => (p.axisMinutes?.[a] ?? 0) > 0) && <span className="periode-akser" role="img" aria-label={`Timer per akse per uke: ${AKSER.filter((a) => (p.axisMinutes?.[a] ?? 0) > 0).map((a) => `${a} ${formaterVarighet(p.axisMinutes?.[a] ?? 0)}`).join(", ")}`}>
                {AKSER.filter((a) => (p.axisMinutes?.[a] ?? 0) > 0).map((a) => <u key={a} className={a.toLowerCase()} style={{ flex: p.axisMinutes?.[a] ?? 0 }} />)}
              </span>}
            </button>)}</div>}
        </section>
        <section className="seksjon" aria-label="Faste gruppetider">
          <div className="sek-topp"><h2>Faste gruppetider</h2><Link className="lenke" href={`/admin/grupper/${id}/timeplan`}>Rediger timeplan</Link></div>
          {faste.length === 0 ? <p className="kilde">Ingen faste tider registrert.</p> : <div className="liste">{faste.map((f) => <div key={f.id}><span className="ikonboks"><Layers className="ikon" aria-hidden /></span><span><b>{f.dag} {f.tid}</b>{f.sted && <span className="kilde">{f.sted}</span>}</span><span /></div>)}</div>}
        </section>
      </div>
      <div>
        <section className="seksjon" aria-label="Medlemmene">
          <div className="sek-topp"><h2>Medlemmene</h2><span className="kilde">{egne > 0 ? `${egne} med egne perioder` : "Alle følger gruppa"}</span></div>
          {medlemmer.length === 0 ? <div className="kort dempet"><b className="undertittel">Ingen medlemmer</b><p className="forklar">Legg til spillere i gruppa, så kan årsplanen rulles ut til dem.</p></div>
            : <div className="kort" style={{ gap: 0, paddingTop: 4, paddingBottom: 4 }}>
              {medlemmer.map((m) => <div key={m.id} className="medlem"><Avatar navn={m.navn} liten /><span>{m.navn}{m.egen && <span className="kilde" style={{ display: "block" }}>{m.egen}</span>}</span>{m.egen ? <Pille tone="vent">Egen</Pille> : <Pille tone="ok">Følger gruppa</Pille>}</div>)}
            </div>}
        </section>
        <div className="kort dempet"><b className="undertittel">Slik virker utrullingen</b><p className="forklar">Medlemmene får periodene og timene per akse fra og med denne uka. Perioder et medlem alt har i samme tidsrom fra en annen plan, blir stående og rapporteres. Uker som er gått, endres aldri.</p></div>
      </div>
    </div>

    {ark && <PeriodeArk periode={ark.periode} year={aar} hvem="gruppe" onLukk={() => setArk(null)} onLagret={() => { setArk(null); router.refresh(); }} onLagre={onLagre} onSlett={onSlett} />}
    {velger && <VelgerArk modus="gruppe" liste={grupper} valgtId={gruppe.id} hrefFor={(g) => `/admin/grupper/${g}/workbench`} onLukk={() => setVelger(false)} />}
    {rullBekreft && <div className="dialog-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !ruller) setRullBekreft(false); }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="rull-tittel">
        <h2 id="rull-tittel">Rulle ut årsplanen til {gruppe.medlemmer} {gruppe.medlemmer === 1 ? "medlem" : "medlemmer"}?</h2>
        <p className="forklar">{trening.length} perioder legges i medlemmenes egne årsplaner. Perioder de alt har i samme tidsrom, røres ikke. Ingenting slettes.</p>
        <div className="knapper"><button type="button" className="knapp pri stor" disabled={ruller} onClick={rullUt}>{ruller ? "Ruller ut …" : "Rull ut"}</button><button type="button" className="knapp sek stor" disabled={ruller} onClick={() => setRullBekreft(false)}>Avbryt</button></div>
      </div>
    </div>}
  </div>;
}
