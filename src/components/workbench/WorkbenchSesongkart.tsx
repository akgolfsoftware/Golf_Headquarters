"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import { Knapp } from "@/components/precision/pa";
import { Ark, Dialogboks } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { TreningsvolumVisning } from "@/components/admin/precision/TreningsvolumVisning";
import type { PeriodType, PyramidArea } from "@/lib/domain/workbench/types";
import type { SamletPeriode, WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { saveSeasonBounds } from "@/lib/workbench/workbench-samlet-sesong-actions";
import { createSeasonPlan, deleteSeasonPeriod, saveSeasonPeriod } from "@/lib/workbench/wb-actions";
import { klassiskWorkbenchUrl, samletWorkbenchUrl } from "@/lib/workbench/samlet-url";
import { dagOgDato } from "@/components/admin/precision/AG11Ark";
import { desimal } from "@/lib/admin-spiller/spiller360-visning";

const PERIODE: Record<PeriodType, string> = { GRUNN: "Grunnperiode", SPESIAL: "Spesialperiode", TURNERING: "Turneringsperiode", EVALUERING: "Evaluering", TESTUKE: "Testuke", FERIE: "Ferie", TRENINGSSAMLING: "Treningssamling", HELDAGSSAMLING: "Heldagssamling", RESTITUSJON: "Restitusjon" };
const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const dagtid = (d: string) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`);
const nesteDato = (d: string) => new Date(dagtid(d) + 86400000).toISOString().slice(0, 10);

export function WorkbenchSesongkart({ data }: { data: WorkbenchSamletData }) {
  const router = useRouter();
  const s = data.sesong;
  const [valgtId, setValgtId] = useState<string | null>(data.planKontekst.referanse.periode ?? s?.perioder.find(p => p.startDate <= data.uke.weekStart && p.endDate >= data.uke.weekStart)?.id ?? null);
  const [rediger, setRediger] = useState<"periode" | "ny" | "sesong" | null>(null);
  const velgPeriode = (id: string) => { setValgtId(id); router.replace(samletWorkbenchUrl(data.player.id, "sesong", { ...data.planKontekst.referanse, periode: id }, data.routeSurface, {}, { niva: data.planKontekst.visning }), { scroll: false }); };
  if (!s) return <div className="ws-empty"><h2>Sesongkartet kunne ikke hentes</h2><p>Prøv å åpne sesongen på nytt.</p></div>;
  const valgt = s.perioder.find(p => p.id === valgtId) ?? null;
  const zoom = data.planKontekst.visning === "maned" ? "maned" : data.planKontekst.visning === "periode" ? "periode" : "aar";
  const month = data.planKontekst.monthStart;
  const monthEnd = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1)).toISOString().slice(0, 10);
  const fra = zoom === "maned" ? month : zoom === "periode" && valgt ? valgt.startDate : s.vindu.fraDato;
  const til = zoom === "maned" ? monthEnd : zoom === "periode" && valgt ? nesteDato(valgt.endDate) : s.vindu.tilDato;
  const lengde = Math.max(86400000, dagtid(til) - dagtid(fra));
  const pos = (start: string, end: string): CSSProperties => {
    const a = Math.max(dagtid(fra), dagtid(start));
    const b = Math.min(dagtid(til), dagtid(end));
    return { left: `${(a - dagtid(fra)) / lengde * 100}%`, width: `${Math.max(0, b - a) / lengde * 100}%` };
  };
  const inni = (start: string, end: string) => dagtid(start) < dagtid(til) && dagtid(end) > dagtid(fra);
  const referanse = { ...data.planKontekst.referanse, periode: valgt?.id ?? data.planKontekst.referanse.periode };
  const perioder = s.perioder.filter(p => inni(p.startDate, nesteDato(p.endDate)));
  const maneder = s.maneder.filter(m => inni(m.monthStart, new Date(Date.UTC(Number(m.monthStart.slice(0, 4)), Number(m.monthStart.slice(5, 7)), 1)).toISOString().slice(0, 10)));
  const maks = Math.max(1, ...maneder.map(m => m.volum.total.planlagtMinutter));
  const monthDays = Array.from({ length: Math.round((dagtid(monthEnd) - dagtid(month)) / 86400000) }, (_, i) => new Date(dagtid(month) + i * 86400000).toISOString().slice(0, 10));
  const offset = (new Date(`${month}T12:00:00Z`).getUTCDay() + 6) % 7;
  return <>
    <div className="ws-toolbar"><h2>{s.plan?.navn ?? "Sesongkart"}</h2><span className="ws-muted">{dagOgDato(s.vindu.fraDato.slice(0, 10))}–{dagOgDato(new Date(dagtid(s.vindu.tilDato) - 86400000).toISOString().slice(0, 10))}</span>
      <div className="ws-row">{[["aar", "År"], ["periode", "Periode"], ["maned", "Måned"]].map(([niva, label]) => <Link key={niva} className="pa-btn pa-btn--secondary" aria-current={zoom === niva ? "page" : undefined} href={samletWorkbenchUrl(data.player.id, "sesong", referanse, data.routeSurface, {}, { niva: niva === "aar" ? "aar" : niva === "periode" ? "periode" : "maned" })}>{label}</Link>)}</div>
      <Knapp variant="secondary" onClick={() => setRediger("sesong")}>{s.plan ? "Sesonggrenser" : "Opprett årsplan"}</Knapp><Knapp icon={Plus} disabled={!s.plan} onClick={() => setRediger("ny")}>Ny periode</Knapp>
    </div>
    <div className="ws-season"><main aria-label="Sesongtidslinje" className="ws-panel">
      {zoom === "maned" ? <section className="ws-section"><h2>{new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}T12:00:00Z`))}</h2><div className="ws-month-grid" aria-label="Månedskalender">
        {Array.from({ length: offset }, (_, i) => <span key={`tom-${i}`} />)}{monthDays.map(d => { const okter = s.sessions.filter(o => o.date === d && o.status !== "CANCELLED"); return <Link key={d} className="ws-month-cell" data-selected={d === data.uke.weekStart} href={samletWorkbenchUrl(data.player.id, "uke", { ...referanse, uke: d }, data.routeSurface)}><strong className="ws-num">{Number(d.slice(8))}</strong>{okter.slice(0, 3).map(o => <small key={o.id}>{o.pyramid} · {o.title}</small>)}{okter.length > 3 && <small>+{okter.length - 3} økter</small>}{s.hendelser.filter(h => h.fraDato.slice(0, 10) === d).map(h => <small key={h.id}>{h.navn}</small>)}</Link>; })}
      </div></section> : <div className="ws-timeline-scroll"><div className="ws-timeline">
        <div className="ws-months">{maneder.map(m => { const end = new Date(Date.UTC(Number(m.monthStart.slice(0, 4)), Number(m.monthStart.slice(5, 7)), 1)).toISOString().slice(0, 10); const dager = Math.min(dagtid(til), dagtid(end)) - Math.max(dagtid(fra), dagtid(m.monthStart)); return <span key={m.monthStart} style={{ flex: Math.max(0, dager) }}>{new Intl.DateTimeFormat("nb-NO", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${m.monthStart}T12:00:00Z`))}</span>; })}</div>
        <div className="ws-lane"><strong>Perioder</strong><div className="ws-track">{perioder.map(p => <button type="button" key={p.id} className="ws-period" style={pos(p.startDate, nesteDato(p.endDate))} aria-pressed={valgt?.id === p.id} onClick={() => velgPeriode(p.id)}><strong>{PERIODE[p.type]}</strong><small>{p.focus ?? "Fokus ikke satt"}</small></button>)}</div></div>
        <div className="ws-lane"><strong>Turneringer</strong><div className="ws-track">{s.hendelser.filter(h => h.kind === "turnering" && inni(h.fraDato, h.tilDato)).map(h => <Link className="ws-period" key={h.id} style={{ ...pos(h.fraDato, h.tilDato), minWidth: 44 }} href={`${klassiskWorkbenchUrl(data.player.id, "uke", referanse, data.routeSurface)}&pille=turn`} title={h.navn}>{h.navn}</Link>)}</div></div>
        <div className="ws-lane"><strong>Reise</strong><div className="ws-track">{data.fys.tournamentPlans.filter(t => t.travelStartDate && t.travelEndDate && inni(t.travelStartDate, nesteDato(t.travelEndDate))).map(t => <Link className="ws-period" key={t.id} style={pos(t.travelStartDate!, nesteDato(t.travelEndDate!))} href={`${klassiskWorkbenchUrl(data.player.id, "uke", referanse, data.routeSurface)}&pille=turn`}>{t.title} · reise</Link>)}</div></div>
        <div className="ws-lane"><strong>Tester</strong><div className="ws-track">{s.hendelser.filter(h => h.kind === "test" && inni(h.fraDato, h.tilDato)).map(h => <Link className="ws-period" key={h.id} style={{ ...pos(h.fraDato, h.tilDato), minWidth: 44 }} href={data.role === "coach" ? `/admin/spillere/${data.player.id}?vis=360&fane=test` : "/portal/tren/tester"}>{h.navn}</Link>)}</div></div>
        {!perioder.length && <p className="ws-muted ws-pad">Ingen perioder i dette tidsrommet.</p>}
        <section className="ws-section"><h3>Planlagt mengde per måned</h3><div className="ws-bars">{maneder.map(m => <button type="button" key={m.monthStart} onClick={() => { const p = s.perioder.find(p => p.startDate <= m.monthStart && p.endDate >= m.monthStart); if (p) velgPeriode(p.id); }} aria-label={`${m.monthStart}: planlagt ${m.volum.total.planlagtMinutter} min, registrert ${m.volum.total.faktiskMinutter ?? "ikke registrert"}`}><span className="ws-num">{desimal(m.volum.total.planlagtMinutter / 60)} t</span><i aria-hidden style={{ height: `${m.volum.total.planlagtMinutter / maks * 65}px` }} /><span>{m.monthStart.slice(5, 7)}</span></button>)}</div><p className="ws-muted">Planlagt tid i hele måneden. Faktisk registrert tid vises separat i detaljene.</p></section>
      </div></div>}
      <section className="ws-section"><h3>Sesongens treningsvolum</h3><TreningsvolumVisning volum={s.volum} enhet="t" /></section>
    </main><aside className="ws-detail" aria-label="Valgt periode">
      {!valgt ? <div className="ws-empty"><h2>Velg en periode</h2><p>Trykk på et periodebånd for fokus, ukevolum og øktbudsjett.</p>{!s.plan && <Knapp onClick={() => setRediger("sesong")}>Opprett årsplan</Knapp>}</div> : <>
        <section className="ws-section"><span className="ws-muted">Valgt periode</span><h2>{PERIODE[valgt.type]}</h2><p className="ws-num ws-muted">{dagOgDato(valgt.startDate)}–{dagOgDato(valgt.endDate)}</p><p>{valgt.focus ?? "Fokus ikke satt"}</p><div className="ws-row"><Knapp variant="secondary" onClick={() => setRediger("periode")}>Rediger periode</Knapp><Link href={samletWorkbenchUrl(data.player.id, "uke", { ...referanse, periode: valgt.id, uke: valgt.startDate }, data.routeSurface)}>Åpne uke</Link></div></section>
        <section className="ws-section"><h3>Ukevolum og øktbudsjett</h3><dl className="ws-kv"><div><dt>Ukevolum</dt><dd className="ws-num">{valgt.weeklyVolMin ?? "—"}–{valgt.weeklyVolMax ?? "—"} min</dd></div>{AKSER.map(a => <div key={a}><dt>{a}</dt><dd className="ws-num">{valgt.sessionBudget?.[a] ?? "—"} økter/uke</dd></div>)}</dl></section>
        <section className="ws-section"><h3>Periodens treningsvolum</h3><TreningsvolumVisning volum={valgt.volum} enhet="t" /></section>
        <section className="ws-section"><h3>Målsetninger</h3>{data.goals.filter(g => g.planNivaa === "PERIODE").map(g => <div key={g.id}><strong>{g.title}</strong><p className="ws-muted">{g.typeLabel} · {g.fremdrift.hasData ? `${g.fremdrift.pct} %` : g.fremdrift.detail}</p></div>)}{!data.goals.some(g => g.planNivaa === "PERIODE") && <p className="ws-muted">Ingen målsetninger på periodenivå.</p>}</section>
      </>}
    </aside></div>
    {rediger === "sesong" && <SesongArk data={data} onLukk={() => setRediger(null)} />}
    {(rediger === "periode" || rediger === "ny") && <PeriodeArk data={data} periode={rediger === "ny" ? null : valgt} onLukk={() => setRediger(null)} />}
  </>;
}

function SesongArk({ data, onLukk }: { data: WorkbenchSamletData; onLukk: () => void }) {
  const router = useRouter(); const [pending, start] = useTransition();
  const s = data.sesong!;
  const [navn, setNavn] = useState(s.plan?.navn ?? `Sesong ${data.planKontekst.year}`);
  const [fra, setFra] = useState(s.plan?.startDate ?? s.vindu.fraDato.slice(0, 10));
  const [til, setTil] = useState(s.plan?.endDate ?? new Date(dagtid(s.vindu.tilDato) - 86400000).toISOString().slice(0, 10));
  const [feil, setFeil] = useState<string | null>(null);
  return <Ark open title={s.plan ? "Sesonggrenser" : "Opprett årsplan"} onClose={onLukk} footer={<><Knapp loading={pending} disabled={!navn.trim() || !fra || til < fra} onClick={() => start(async () => { try { const r = s.plan ? await saveSeasonBounds({ playerId: data.player.id, seasonPlanId: s.plan.id, startDato: fra, sluttDato: til, expectedUpdatedAt: s.plan.updatedAt }) : await createSeasonPlan({ playerId: data.player.id, name: navn, startDate: fra, endDate: til, source: "EMPTY" }); if (!r.ok) { setFeil(r.error); return; } onLukk(); router.refresh(); } catch { setFeil("Sesongen kunne ikke lagres. Prøv igjen."); } })}>Lagre årsplan</Knapp><Knapp variant="ghost" onClick={onLukk}>Avbryt</Knapp></>}>
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}{!s.plan && <label className="ws-field">Navn<input value={navn} onChange={e => setNavn(e.target.value)} /></label>}<label className="ws-field">Fra dato<input type="date" value={fra} onChange={e => setFra(e.target.value)} /></label><label className="ws-field">Til dato<input type="date" value={til} onChange={e => setTil(e.target.value)} /></label><p className="ws-muted">Årsplanen bruker datoene du velger. Eksisterende perioder og økter skal fortsatt vurderes mot grensene.</p>
  </Ark>;
}

function PeriodeArk({ data, periode, onLukk }: { data: WorkbenchSamletData; periode: SamletPeriode | null; onLukk: () => void }) {
  const router = useRouter(); const [pending, start] = useTransition();
  const [type, setType] = useState<PeriodType>(periode?.type ?? "GRUNN");
  const [fra, setFra] = useState(periode?.startDate ?? data.uke.weekStart);
  const [til, setTil] = useState(periode?.endDate ?? data.uke.days.at(-1)?.date ?? data.uke.weekStart);
  const [fokus, setFokus] = useState(periode?.focus ?? "");
  const [min, setMin] = useState(periode?.weeklyVolMin?.toString() ?? ""); const [max, setMax] = useState(periode?.weeklyVolMax?.toString() ?? "");
  const [budsjett, setBudsjett] = useState<Record<PyramidArea, string>>({ FYS: periode?.sessionBudget?.FYS?.toString() ?? "", TEK: periode?.sessionBudget?.TEK?.toString() ?? "", SLAG: periode?.sessionBudget?.SLAG?.toString() ?? "", SPILL: periode?.sessionBudget?.SPILL?.toString() ?? "", TURN: periode?.sessionBudget?.TURN?.toString() ?? "" });
  const [feil, setFeil] = useState<string | null>(null); const [fjern, setFjern] = useState(false);
  const lagre = () => start(async () => { try { const r = await saveSeasonPeriod({ playerId: data.player.id, periodId: periode?.id, seasonPlanId: data.sesong?.plan?.id, data: { lPhase: type, startDato: fra, sluttDato: til, fokus, ukevolumMin: min === "" ? null : Number(min), ukevolumMax: max === "" ? null : Number(max), budsjett: Object.fromEntries(AKSER.filter(a => budsjett[a] !== "").map(a => [a, Number(budsjett[a])])) } }); if (!r.ok) { setFeil(r.error); return; } onLukk(); router.refresh(); } catch { setFeil("Perioden kunne ikke lagres. Prøv igjen."); } });
  return <><Ark open title={periode ? "Rediger periode" : "Ny periode"} onClose={onLukk} footer={<><Knapp loading={pending} disabled={!fra || til < fra} onClick={lagre}>Lagre periode</Knapp><Knapp variant="ghost" onClick={onLukk}>Avbryt</Knapp>{periode && <Knapp variant="ghost" onClick={() => setFjern(true)}>Fjern periode</Knapp>}</>}>
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}<label className="ws-field">Periodetype<select value={type} onChange={e => setType(e.target.value as PeriodType)}>{Object.entries(PERIODE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="ws-field">Fra dato<input type="date" value={fra} onChange={e => setFra(e.target.value)} /></label><label className="ws-field">Til dato<input type="date" value={til} onChange={e => setTil(e.target.value)} /></label><label className="ws-field">Fokus<input value={fokus} maxLength={200} onChange={e => setFokus(e.target.value)} /></label>
    <div className="ws-row"><label className="ws-field">Ukevolum fra · min<input type="number" min={0} max={3000} value={min} onChange={e => setMin(e.target.value)} /></label><label className="ws-field">Ukevolum til · min<input type="number" min={0} max={3000} value={max} onChange={e => setMax(e.target.value)} /></label></div><h3>Øktbudsjett per uke</h3>{AKSER.map(a => <label key={a} className="ws-field">{a} · antall økter<input type="number" min={0} max={21} step={1} value={budsjett[a]} onChange={e => setBudsjett(v => ({ ...v, [a]: e.target.value }))} /></label>)}
  </Ark><Dialogboks open={fjern} title="Fjerne perioden?" onClose={() => setFjern(false)} footer={<><Knapp variant="ghost" onClick={() => setFjern(false)}>Avbryt</Knapp><Knapp variant="signal" disabled={pending} onClick={() => start(async () => { if (!periode) return; try { const r = await deleteSeasonPeriod({ playerId: data.player.id, periodId: periode.id }); if (!r.ok) { setFeil(r.error); setFjern(false); return; } onLukk(); router.refresh(); } catch { setFeil("Perioden kunne ikke fjernes. Prøv igjen."); setFjern(false); } })}>Fjern periode</Knapp></>}><p>Økter og målsetninger beholdes. Perioden fjernes fra årsplanen.</p></Dialogboks></>;
}
