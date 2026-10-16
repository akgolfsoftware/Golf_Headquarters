"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { TreningsvolumVisning } from "@/components/admin/precision/TreningsvolumVisning";
import { dagOgDato } from "@/components/admin/precision/AG11Ark";
import { createSessionSeries, deleteSessionSeries } from "@/lib/workbench/wb-actions";
import { samletWorkbenchUrl } from "@/lib/workbench/samlet-url";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { desimal } from "@/lib/admin-spiller/spiller360-visning";
import { gyldigPlanDato, osloPlanDato } from "@/lib/workbench/plan-kontekst";

const maaltDato = (instant: string) => osloPlanDato(new Date(instant));

export function WorkbenchAnalyse({ data }: { data: WorkbenchSamletData }) {
  const a = data.analyse; const router = useRouter(); const [pending, start] = useTransition();
  const [rundeId, setRundeId] = useState(a?.runder[0]?.id ?? "");
  const [alternativer, setAlternativer] = useState({ A: "", B: "" }); const [valgt, setValgt] = useState<"A" | "B">("A");
  const [dato, setDato] = useState(data.uke.weekStart); const [tid, setTid] = useState("16:00"); const [repeat, setRepeat] = useState(1); const [minutter, setMinutter] = useState(30);
  const [vurdering, setVurdering] = useState(""); const [feil, setFeil] = useState<string | null>(null); const [opprettet, setOpprettet] = useState<{ id: string; antall: number } | null>(null);
  if (!a) return <div className="ws-empty"><h2>Stats kunne ikke hentes</h2><p>Datagrunnlaget er ikke tilgjengelig.</p></div>;
  const runde = a.runder.find(r => r.id === rundeId); const ovelser = data.kilder.filter(k => k.drill);
  const kilde = ovelser.find(k => k.id === alternativer[valgt]); const drill = kilde?.drill;
  const sg = [["Total", runde?.sgTotal], ["Utslag", runde?.sgOtt], ["Innspill", runde?.sgApp], ["Nærspill", runde?.sgArg], ["Putting", runde?.sgPutt]] as const;
  const skala = Math.max(1, ...sg.map(([, v]) => v == null ? 0 : Math.abs(v)));
  const datoGyldig = Boolean(gyldigPlanDato(dato));
  const minutterGyldig = Number.isFinite(minutter) && Number.isInteger(minutter) && minutter >= 15 && minutter <= 720;
  const dates = datoGyldig ? Array.from({ length: repeat }, (_, i) => new Date(Date.parse(`${dato}T12:00:00Z`) + i * 7 * 86400000).toISOString().slice(0, 10)) : [];
  const ukeTillegg = drill ? dates.filter(d => d >= data.uke.weekStart && d <= (data.uke.days.at(-1)?.date ?? data.uke.weekStart)).length * minutter : 0;
  const lagre = () => { if (!drill || !datoGyldig || !minutterGyldig || !/^([01]\d|2[0-3]):[0-5]\d$/.test(tid)) return; start(async () => { setFeil(null); try {
    const [h, m] = tid.split(":").map(Number);
    const r = await createSessionSeries({ playerId: data.player.id, date: dato, startMinute: h * 60 + m, durationMinutes: minutter, repeatWeeks: repeat,
      title: drill.title, pyramid: drill.akFormel.pyramid, notes: vurdering.trim() || undefined,
      drills: [{ title: drill.title, description: drill.description, durationMinutes: drill.durationMinutes, akFormel: drill.akFormel, techniqueFocus: drill.techniqueFocus, sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId }] });
    if (!r.ok) { setFeil(r.error); return; } if (r.data[0]) setOpprettet({ id: r.data[0].id, antall: r.data.length }); router.refresh();
  } catch { setFeil("Tiltaket kunne ikke legges i planen. Utkastet er beholdt."); } }); };
  const angre = () => { if (!opprettet) return; start(async () => { setFeil(null); try { const r = await deleteSessionSeries({ sessionId: opprettet.id, policy: "HELE_SERIEN" }); if (!r.ok) { setFeil(r.error); return; } setOpprettet(null); router.refresh(); } catch { setFeil("Tiltaket kunne ikke angres. Prøv igjen."); } }); };
  return <>
    <div className="ws-toolbar"><h2>Stats</h2><span className="ws-muted">{dagOgDato(a.vindu.fraDato.slice(0, 10))}–{dagOgDato(new Date(Date.parse(a.vindu.tilDato) - 86400000).toISOString().slice(0, 10))}</span><span className="ws-muted">{a.kilde}</span></div>
    <div className="ws-analysis"><main className="ws-panel">
      <section className="ws-section"><h2>Datagrunnlag</h2><div className="ws-metrics"><div className="ws-metric"><span>Registrerte runder</span><strong>{a.runder.length}</strong><small className="ws-muted">Brutto score · hull vises per runde</small></div><div className="ws-metric"><span>Testresultater</span><strong>{a.tester.length}</strong><small className="ws-muted">Innen valgt datovindu</small></div><div className="ws-metric"><span>TrackMan-økter</span><strong>{a.trackman.length}</strong><small className="ws-muted">Registrerte økter, ingen beregnet utvikling</small></div></div></section>
      <section className="ws-section"><h3>Strokes gained · valgt runde</h3><p className="ws-muted">{a.sg.referanse}</p>{a.runder.length ? <><label className="ws-field">Runde<select value={rundeId} onChange={e => setRundeId(e.target.value)}>{a.runder.map(r => <option key={r.id} value={r.id}>{dagOgDato(maaltDato(r.dato))} · {r.brutto} brutto · {r.hull} hull</option>)}</select></label><p className="ws-muted">Kilde: {runde?.sgKilde ?? "Ikke oppgitt"}. Ingen omregning mellom 9 og 18 hull.</p>{sg.map(([navn, v]) => <div className="ws-sg-row" key={navn}><span>{navn}</span><div className="ws-sg-track" aria-hidden>{v != null && <i style={{ left: `${v < 0 ? 50 + v / skala * 50 : 50}%`, width: `${Math.abs(v) / skala * 50}%` }} />}</div><span className="ws-num">{v == null ? "—" : desimal(v)}</span></div>)}<p className="ws-muted">Samme skala begge sider av null: −{desimal(skala)} til +{desimal(skala)}.</p></> : <p className="ws-muted">Ingen registrerte runder i dette tidsrommet.</p>}</section>
      <section className="ws-section"><h3>Runder</h3>{a.runder.length ? <div className="ws-data-scroll"><table className="ws-table"><thead><tr><th>Dato</th><th>Brutto</th><th>Hull</th><th>SG</th></tr></thead><tbody>{a.runder.map(r => <tr key={r.id}><td>{dagOgDato(maaltDato(r.dato))}</td><td className="ws-num">{r.brutto}</td><td className="ws-num">{r.hull}</td><td className="ws-num">{r.sgTotal == null ? "—" : desimal(r.sgTotal)}</td></tr>)}</tbody></table></div> : <p className="ws-muted">Ingen runder.</p>}</section>
      <section className="ws-section"><h3>Testhistorikk</h3>{a.tester.length ? <table className="ws-table"><thead><tr><th>Test og dato</th><th>Verdi</th></tr></thead><tbody>{a.tester.map(t => <tr key={t.id}><td>{t.navn}<small className="ws-muted"> · {dagOgDato(maaltDato(t.dato))}</small></td><td className="ws-num">{desimal(t.verdi)} {t.enhet ?? ""}</td></tr>)}</tbody></table> : <p className="ws-muted">Ingen testresultater i dette tidsrommet.</p>}<p className="ws-muted">Ulike tester eller enheter sammenlignes ikke som én utviklingskurve.</p></section>
      <section className="ws-section"><h3>TrackMan</h3>{a.trackman.map(t => <p key={t.id} className="ws-muted">{dagOgDato(maaltDato(t.dato))} · {t.slag} registrerte slag</p>)}{!a.trackman.length && <p className="ws-muted">Ingen TrackMan-økter i dette tidsrommet.</p>}</section>
      <section className="ws-section"><h3>Treningsvolum</h3><p className="ws-muted">{data.volumKilde}</p><TreningsvolumVisning volum={a.volum} enhet="t" /></section>
    </main><aside className="ws-panel"><section className="ws-section"><h2>Fra måling til tiltak</h2><p className="ws-muted">Velg øvelse fra biblioteket og skriv din vurdering. Datagrunnlaget alene fastslår ingen årsak eller forventet effekt.</p>
      <label className="ws-field">Vurdering<textarea value={vurdering} maxLength={1000} onChange={e => setVurdering(e.target.value)} placeholder="Hva vil du undersøke eller trene på?" /></label>
      {(["A", "B"] as const).map(x => <div key={x} className="ws-stack"><button type="button" className="ws-alternative" aria-pressed={valgt === x} onClick={() => setValgt(x)}><strong>Alternativ {x}</strong><p className="ws-muted">{ovelser.find(k => k.id === alternativer[x])?.title ?? "Ingen øvelse valgt"}</p></button><label className="ws-field">Øvelse {x}<select value={alternativer[x]} onChange={e => setAlternativer(old => ({ ...old, [x]: e.target.value }))}><option value="">Velg fra biblioteket</option>{ovelser.map(k => <option key={k.id} value={k.id}>{k.title}</option>)}</select></label></div>)}
      {!ovelser.length && <p className="ws-muted">Biblioteket har ingen tilgjengelige øvelser. Legg til en egen øvelse i Ukeverksted.</p>}
      <div className="ws-row"><label className="ws-field">Første dato<input type="date" value={dato} onChange={e => setDato(e.target.value)} /></label><label className="ws-field">Klokkeslett<input type="time" value={tid} onChange={e => setTid(e.target.value)} /></label></div><div className="ws-row"><label className="ws-field">Øktvarighet · min<input type="number" min={15} max={720} step={5} value={minutter} onChange={e => setMinutter(Number(e.target.value))} /></label><label className="ws-field">Gjentakelse<select value={repeat} onChange={e => setRepeat(Number(e.target.value))}>{[1, 4, 6, 8].map(n => <option key={n} value={n}>{n === 1 ? "Én økt" : `${n} uker`}</option>)}</select></label></div>
      {drill && <p className="ws-muted">Kopiert øvelsesinnhold: {drill.title} · {drill.durationMinutes} min. Øktens planlagte ramme: {minutter} min. Kildekoblingen følger kopien. Kontroller mengden før publisering; bankens standarddose kopieres ikke automatisk.</p>}
      <h3>Plan før og etter · valgt uke</h3><p className="ws-muted">{dagOgDato(data.uke.weekStart)}–{dagOgDato(data.uke.days.at(-1)?.date ?? data.uke.weekStart)}</p><div className="ws-before-after"><div className="ws-metric"><span>Nå</span><strong>{data.volum.total.planlagtMinutter} min</strong></div><div className="ws-metric"><span>Med valgt tiltak</span><strong>{data.volum.total.planlagtMinutter + ukeTillegg} min</strong></div></div>
      {drill && datoGyldig && <p className="ws-muted">{repeat} {repeat === 1 ? "utkast" : "utkast, ett per uke"} fra {dagOgDato(dato)} til {dagOgDato(dates.at(-1)!)}. Tillegg i valgt uke: {ukeTillegg} min. Tidligere økter endres ikke.</p>}
      {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}{opprettet && <InlineVarsel tone="info">{opprettet.antall} {opprettet.antall === 1 ? "økt er" : "økter er"} lagret som utkast. Publiser fra Ukeverksted.<Knapp variant="ghost" disabled={pending} onClick={angre}>Angre tiltak</Knapp></InlineVarsel>}
      <Knapp loading={pending} disabled={!drill || !datoGyldig || !minutterGyldig || !tid || Boolean(opprettet)} onClick={lagre}>Legg alternativ {valgt} i planen</Knapp><Link href={samletWorkbenchUrl(data.player.id, "uke", { ...data.planKontekst.referanse, uke: dato }, data.routeSurface)}>Åpne plasseringen i Ukeverksted</Link>
    </section><section className="ws-section"><h3>Målsetninger</h3>{data.goals.map(g => <div key={g.id}><strong>{g.title}</strong><p className="ws-muted">{g.fremdrift.hasData ? `${g.fremdrift.pct} %` : g.fremdrift.detail}</p><p className="ws-muted">{g.nesteTiltak}</p></div>)}{!data.goals.length && <p className="ws-muted">Ingen aktive målsetninger.</p>}</section></aside></div>
  </>;
}
