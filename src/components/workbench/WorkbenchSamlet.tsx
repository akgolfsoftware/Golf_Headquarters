"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Ark } from "@/components/precision/pa-a4";
import { Knapp } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { klassiskWorkbenchUrl, samletSpillerUrl, samletWorkbenchUrl } from "@/lib/workbench/samlet-url";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { WorkbenchSesongkart } from "./WorkbenchSesongkart";
import { WorkbenchUkeverksted } from "./WorkbenchUkeverksted";
import { WorkbenchTrenerbord } from "./WorkbenchTrenerbord";
import { WorkbenchAnalyse } from "./WorkbenchAnalyse";
import "./workbench-samlet.css";

type MerId = "X01" | "X02" | "X03" | "X04" | "X05" | "X06" | "X07" | "X08" | "X09" | "X10" | "X11" | "X12" | "X13" | "X14" | "X15" | "X16" | "X17" | "X18";
type MerInngang = { id: MerId; navn: string; href: string; detalj: string };
export function samletMerRegister(data: WorkbenchSamletData): MerInngang[] {
  const legacy = (niva: Parameters<typeof klassiskWorkbenchUrl>[1]) => klassiskWorkbenchUrl(data.player.id, niva, data.planKontekst.referanse, data.routeSurface);
  const spiller = (fane: string, portal: string) => data.role === "coach" ? `/admin/spillere/${encodeURIComponent(data.player.id)}?vis=360&fane=${fane}` : portal;
  return [
    { id: "X01", navn: "Oppstart", href: spiller("iup", "/portal/utviklingsplan"), detalj: "Se spillerens utviklingsplan og IUP-grunnlag" },
    { id: "X02", navn: "Støtteapparat", href: spiller("iup", "/portal/utviklingsplan"), detalj: "Se registrerte foresatte og samarbeid rundt spilleren" },
    { id: "X03", navn: "Profil, skole og GolfBox", href: spiller("iup", "/portal/meg/profil"), detalj: data.role === "coach" ? "Les spillerens profil i IUP; profilredigering eies av spilleren" : "Se og rediger registrerte profilopplysninger" },
    { id: "X04", navn: "Sesongevaluering", href: spiller("iup", "/portal/mal/evaluering?ny=SESONGEVALUERING"), detalj: data.role === "coach" ? "Følg opp utviklingen i spillerens IUP" : "Fyll ut sesongevaluering; historikk finnes på evalueringssiden" },
    { id: "X05", navn: "Resultatmål", href: legacy("mal"), detalj: "Registrerte resultatmål og fremdrift" },
    { id: "X06", navn: "Prosessmål", href: legacy("mal"), detalj: "Registrerte prosessmål og fremdrift" },
    { id: "X07", navn: "Årsplan", href: samletWorkbenchUrl(data.player.id, "sesong", data.planKontekst.referanse, data.routeSurface), detalj: "Sesongkart, årsplan og perioder" },
    { id: "X08", navn: "Turnering", href: `${legacy("uke")}&pille=turn`, detalj: "Turneringsplan og reise" },
    { id: "X09", navn: "Ukeplan", href: samletWorkbenchUrl(data.player.id, "uke", data.planKontekst.referanse, data.routeSurface), detalj: "Ukeverkstedets Ukeplan-ark" },
    { id: "X10", navn: "Økt og øvelse", href: samletWorkbenchUrl(data.player.id, "uke", data.planKontekst.referanse, data.routeSurface), detalj: "Ukeverksted: velg eller opprett økt" },
    { id: "X11", navn: "Utviklingssjekk", href: spiller("iup", "/portal/mal/evaluering?ny=UTVIKLINGSSJEKK"), detalj: data.role === "coach" ? "Følg opp spillerens IUP og utviklingsmål" : "Fyll ut utviklingssjekk; historikk finnes på evalueringssiden" },
    { id: "X12", navn: "Testkatalog", href: spiller("test", "/portal/tren/tester"), detalj: "Tilgjengelige tester og resultater" },
    { id: "X13", navn: "Teknikk og TrackMan", href: spiller("stats", "/portal/analysere/trackman"), detalj: "Spillerens registrerte målegrunnlag" },
    { id: "X14", navn: "Teknisk plan", href: `${legacy("uke")}&side=tp`, detalj: "Tekniske oppgaver" },
    { id: "X15", navn: "Fysisk", href: `${legacy("uke")}&pille=fys`, detalj: "Fysisk program og registrering" },
    { id: "X16", navn: "Dagbok", href: spiller("stats", "/portal/trening/logg"), detalj: "Se registrert trening og egne notater" },
    { id: "X17", navn: "Statistikkreferanser", href: spiller("stats", "/portal/stats"), detalj: "Se resultat, kilde og sammenligningsgrunnlag i Stats" },
    { id: "X18", navn: "Forventet putt", href: spiller("stats", "/portal/trening/putte-laboratoriet"), detalj: "Arbeid med putting og registrerte resultater" },
  ];
}

export function WorkbenchSamlet({ data, initialDayView = false, initialLibraryOpen = false, initialDate }: { data: WorkbenchSamletData; initialDayView?: boolean; initialLibraryOpen?: boolean; initialDate?: string }) {
  return <SamletInnhold key={`${data.player.id}:${data.flate}:${data.uke.weekStart}:${data.planKontekst.monthStart}:${data.planKontekst.referanse.periode ?? ""}:${initialDayView}:${initialLibraryOpen}:${initialDate ?? ""}`} data={data} dayView={initialDayView} libraryOpen={initialLibraryOpen} initialDate={initialDate} />;
}

function SamletInnhold({ data, dayView, libraryOpen, initialDate }: { data: WorkbenchSamletData; dayView: boolean; libraryOpen: boolean; initialDate?: string }) {
  const router = useRouter(); const container = useRef<HTMLDivElement>(null); const [mer, setMer] = useState(false);
  const [velgDato, setVelgDato] = useState(false);
  const [dato, setDato] = useState(initialDate ?? data.uke.weekStart);
  // Arkene ligger i samme DOM. Fang Tab i det øverste arket og gjenopprett fokus ved lukking.
  useEffect(() => {
    const root = container.current; if (!root) return;
    let active: HTMLElement | null = null; let tilbake: HTMLElement | null = null;
    const sync = () => { const dialogs = root.querySelectorAll<HTMLElement>("[aria-modal=true]"); const next = dialogs.item(dialogs.length - 1);
      if (next === active) return;
      if (active && !next) { tilbake?.focus(); tilbake = null; }
      if (next && !active) tilbake = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      active = next;
      if (next) { const first = next.querySelector<HTMLElement>("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)"); (first ?? next).focus(); }
    };
    const observer = new MutationObserver(sync); observer.observe(root, { childList: true, subtree: true }); sync();
    const key = (event: KeyboardEvent) => { if (event.key !== "Tab" || !active) return;
      const els = [...active.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex='0']")].filter(el => el.getClientRects().length > 0);
      if (!els.length) { event.preventDefault(); return; }
      const first = els[0], last = els.at(-1)!;
      if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    root.addEventListener("keydown", key); return () => { observer.disconnect(); root.removeEventListener("keydown", key); };
  }, []);
  useEffect(() => {
    const observers = new Map<HTMLElement, MutationObserver>();
    const sync = () => { document.querySelectorAll<HTMLElement>("[data-fab],[role=menu][aria-label=Hurtighandlinger]").forEach(el => {
      const update = () => { const name = el.hasAttribute("data-fab") ? "--ws-fab-top" : "--ws-menu-top";
        if (el.style.getPropertyValue(name) !== el.style.top) el.style.setProperty(name, el.style.top);
        if (!el.hasAttribute("data-fab")) { const height = `${el.getBoundingClientRect().height}px`; if (el.style.getPropertyValue("--ws-menu-height") !== height) el.style.setProperty("--ws-menu-height", height); }
      };
      if (!observers.has(el)) { const observer = new MutationObserver(update); observer.observe(el, { attributes: true, attributeFilter: ["style"] }); observers.set(el, observer); } update();
    }); };
    const bodyObserver = new MutationObserver(sync); bodyObserver.observe(document.body, { childList: true, subtree: true }); sync();
    return () => { bodyObserver.disconnect(); observers.forEach((o, el) => { o.disconnect(); el.style.removeProperty("--ws-fab-top"); el.style.removeProperty("--ws-menu-top"); el.style.removeProperty("--ws-menu-height"); }); };
  }, []);
  const ref = data.planKontekst.referanse;
  const navRef = { ...ref, uke: initialDate ?? ref.uke };
  const navigasjon = <nav className="ws-nav ws-horisontnav" aria-label="Planhorisont">
    {(["aar", "periode", "maned", "uke", "dag"] as const).map((niva) => {
      const navn = { aar: "År", periode: "Periode", maned: "Måned", uke: "Uke", dag: "Dag" }[niva];
      const season = ["aar", "periode", "maned"].includes(niva);
      const href = season ? samletWorkbenchUrl(data.player.id, "sesong", navRef, data.routeSurface, {}, { niva: niva === "aar" ? "aar" : niva === "periode" ? "periode" : "maned" })
        : samletWorkbenchUrl(data.player.id, "uke", navRef, data.routeSurface) + (niva === "dag" ? "&dag=1" : "");
      const active = season ? data.flate === "sesong" && data.planKontekst.visning === niva : data.flate === "uke" && (niva === "dag" ? dayView : !dayView);
      return <Link key={niva} aria-current={active ? "page" : undefined} href={href}>{navn}</Link>;
    })}
    {data.role === "coach" && <Link aria-current={data.flate === "bord" ? "page" : undefined} href={samletWorkbenchUrl(data.player.id, "bord", ref, data.routeSurface)}>Trenerbord</Link>}
    <Link aria-current={data.flate === "analyse" ? "page" : undefined} href={samletWorkbenchUrl(data.player.id, "analyse", ref, data.routeSurface)}>Analyse</Link>
    <Knapp variant="ghost" aria-expanded={mer} onClick={() => setMer(true)}>Mer</Knapp>
  </nav>;
  const visDato = () => { if (!dato) return; setVelgDato(false); router.push(samletWorkbenchUrl(data.player.id, data.flate, { ...ref, uke: dato, maned: dato.slice(0, 7), aar: dato.slice(0, 4) }, data.routeSurface, {}, { niva: data.planKontekst.visning }) + (dayView ? "&dag=1" : "")); };
  const byttSpiller = (id: string) => {
    const [path, raw] = samletSpillerUrl(id, data.flate, ref, data.routeSurface).split("?");
    const query = new URLSearchParams(raw);
    query.set("niva", data.planKontekst.visning);
    if (dayView) { query.set("dag", "1"); if (initialDate) query.set("uke", initialDate); }
    router.push(`${path}?${query.toString()}`);
  };
  return <div ref={container} className="wb-samlet">
    <header className="ws-top"><h1>Workbench</h1>{navigasjon}</header>
    <div className="ws-context">
      {data.role === "coach" ? <label className="ws-player-context"><span>Spiller</span><select aria-label="Spiller" value={data.player.id} onChange={e => byttSpiller(e.target.value)}>{data.roster.map(s => <option key={s.id} value={s.id}>{s.navn}</option>)}</select></label> : <span className="ws-player-name">Din plan · {data.player.navn}</span>}
      <form className="ws-date-form ws-row" onSubmit={e => { e.preventDefault(); visDato(); }}><label>Dato<input type="date" value={dato} onChange={e => setDato(e.target.value)} /></label><Knapp variant="secondary" type="submit">Vis</Knapp></form>
      <Knapp variant="secondary" className="pa-btn pa-btn--secondary ws-mobile-date" aria-label="Velg dato" onClick={() => setVelgDato(true)}>{new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.uke.weekStart}T12:00:00Z`))}</Knapp>
    </div>
    {data.varsler.length > 0 && <div className="ws-pad">{data.varsler.map((v, i) => <InlineVarsel key={i} tone="warn">{v}</InlineVarsel>)}</div>}
    {data.flate === "sesong" ? <WorkbenchSesongkart data={data} /> : data.flate === "uke" ? <WorkbenchUkeverksted data={data} dayView={dayView} initialDay={initialDate} initialLibraryOpen={libraryOpen} /> : data.flate === "bord" ? <WorkbenchTrenerbord data={data} /> : <WorkbenchAnalyse data={data} />}
    {velgDato && <Ark open title="Velg dato" onClose={() => setVelgDato(false)} footer={<><Knapp disabled={!dato} onClick={visDato}>Vis dato</Knapp><Knapp variant="ghost" onClick={() => setVelgDato(false)}>Avbryt</Knapp></>}><label className="ws-field">Dato<input type="date" value={dato} onChange={e => setDato(e.target.value)} /></label></Ark>}
    {mer && <Ark open title="Mer" onClose={() => setMer(false)} footer={<Knapp variant="ghost" onClick={() => setMer(false)}>Lukk</Knapp>}><p className="ws-muted">Velg målsetninger, plan, øvelser eller registrerte resultater.</p><ul className="ws-library-list">{samletMerRegister(data).map(x => <li key={x.id}><Link className="ws-mer-link" href={x.href}><strong>{x.navn}</strong><small>{x.detalj}</small></Link></li>)}</ul><h3>Andre verktøy</h3><div className="ws-stack">{[["live", "Gjennomfør økt"], ["min", "Min kalender og deling"], ["uke", "Kilder og øktmaler"]].map(([niva, navn]) => <Link key={niva} href={`${klassiskWorkbenchUrl(data.player.id, niva === "live" ? "live" : niva === "min" ? "min" : "uke", ref, data.routeSurface)}${niva === "uke" ? "&side=maler" : ""}`}>{navn}</Link>)}</div></Ark>}
  </div>;
}
