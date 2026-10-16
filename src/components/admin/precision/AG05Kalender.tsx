"use client";

/**
 * AG-05 Kalender i nytt design (designbrevet 13.10.2026). Fasit:
 * docs/design-system/utkast-agencyos/kalender.html, skjermene AG-05 Dag, Uke og Måned.
 * Uke og Dag deler datakilden (KalenderLagUkeData); Måned har eget rutenett.
 *
 * Avvik:
 *   - Utkastet farger øktene etter akse og har én kolonne per coach. Kalenderlaget
 *   (Økter · Skole · Turnering · Tester · Booking) har verken akse eller coach i
 *   datamodellen, så blokkene er nøytrale og laget står som tekst. Farge betyr akse,
 *   og ingenting annet.
 *   - Ingen dra-og-slipp: «Åpne» fører til flaten der hendelsen endres
 *   (Workbench, /admin/kalender/hendelse/[id] eller Booking).
 *   - Google-synk, år-visning og forslag til ny gruppeøkt finnes ikke i koden.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { KnappLenke, Nokkelverdier, Tom } from "@/components/admin/agencyos-ny/ny";
import { ALLE_LAG, LAG_LABEL, LAG_MENY_LABEL, synlige, type KalenderHendelse, type KalenderLag } from "@/lib/domain/kalender-lag";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import "@/styles/agencyos-ny-kalender.css";

const H0 = 7;
const H1 = 21;

function ukedagKort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dato = new Date(Date.UTC(y, m - 1, d));
  const t = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" }).format(dato).slice(0, 3);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function dagMnd(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}.${m}`;
}
function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
const tid = (e: KalenderHendelse) => (e.heldag ? "Hele dagen" : e.startMin != null ? `${hhmm(e.startMin)}${e.sluttMin != null ? `–${hhmm(e.sluttMin)}` : ""}` : "—");

/** Lagfilter: hvilke kalenderlag som vises. */
function useLagFilter(startLag?: KalenderLag) {
  const [valgt, setValgt] = useState<Set<KalenderLag>>(() => new Set(startLag ? [startLag] : ALLE_LAG));
  const veksle = (l: KalenderLag) => {
    const neste = new Set(valgt);
    if (neste.has(l)) neste.delete(l);
    else neste.add(l);
    setValgt(neste);
  };
  return { valgt, veksle };
}

function LagFilter({ valgt, veksle }: { valgt: ReadonlySet<KalenderLag>; veksle: (l: KalenderLag) => void }) {
  return <div className="chips" role="group" aria-label="Lag">
    {ALLE_LAG.map((l) => <button key={l} type="button" aria-pressed={valgt.has(l)} onClick={() => veksle(l)}>{LAG_MENY_LABEL[l]}</button>)}
  </div>;
}

/** Forrige · I dag · Neste — periode-navigasjonen fra lag/data.ts (`nav`). */
export function AG05Periode({ forrige, idag, neste, tekst }: { forrige: string; idag: string; neste: string; tekst?: string }) {
  return <div className="kal-nav" role="group" aria-label="Periode">
    <Link href={forrige} aria-label="Forrige"><ChevronLeft className="ikon" aria-hidden /></Link>
    <Link href={idag} className="idag">I dag</Link>
    <Link href={neste} aria-label="Neste"><ChevronRight className="ikon" aria-hidden /></Link>
    {tekst && <b>{tekst}</b>}
  </div>;
}

function HendelseArk({ ev, onClose }: { ev: KalenderHendelse; onClose: () => void }) {
  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={ev.tittel} className="ark">
      <div className="ark-topp"><div><div className="dato">{LAG_LABEL[ev.lag]}</div><h2>{ev.tittel}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button></div>
      <Nokkelverdier rader={[
        ["Dato", `${ukedagKort(ev.dato)} ${dagMnd(ev.dato)}`],
        ["Tid", tid(ev)],
        ["Hvem", ev.undertekst || "—"],
        ["Kolliderer med", ev.kollidererMed && ev.kollidererMed.length > 0 ? (ev.kollidererMed.length === 1 ? "1 annen hendelse" : `${ev.kollidererMed.length} andre hendelser`) : "—"],
      ]} />
      {ev.href && <div className="knapper"><KnappLenke variant="pri" stor href={ev.href}>Åpne</KnappLenke></div>}
    </div>
  </div>;
}

/** Uke- og dag-visning deler datakilden (KalenderLagUkeData). */
export function AG05Uke({ data: raa, dagIso, startLag }: { data: KalenderLagUkeData; dagIso?: string; startLag?: KalenderLag }) {
  const [valgt, setValgt] = useState<KalenderHendelse | null>(null);
  const lag = useLagFilter(startLag);
  const data = { ...raa, hendelser: synlige(raa.hendelser, lag.valgt) };
  const enDag = data.visning === "dag";
  const dagValgt = dagIso && data.dager.includes(dagIso) ? dagIso : data.dager.includes(data.idagIso) ? data.idagIso : data.dager[0];
  const dager = enDag ? data.dager.filter((d) => d === dagValgt) : data.dager;
  const perDag = (d: string) => data.hendelser.filter((e) => e.dato === d).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));

  if (!dager.some((d) => perDag(d).length)) return <>
    <LagFilter {...lag} />
    <Tom tittel={enDag ? "Ingen hendelser denne dagen" : "Ingen hendelser denne uka"} tekst="Sett tilgjengelighet først, så kan spillere booke og lagøkter legges oppå." handling={<KnappLenke href="/admin/kalender?fane=tilg">Sett tilgjengelighet</KnappLenke>} />
  </>;

  const blokk = (e: KalenderHendelse) => {
    const kollisjon = e.kollidererMed && e.kollidererMed.length > 0;
    return <><b>{e.tittel}</b><span>{tid(e)}{e.undertekst ? ` · ${e.undertekst}` : ""}</span><span className="lag">{LAG_LABEL[e.lag]}{kollisjon ? " · kolliderer" : ""}</span></>;
  };

  return <>
    <LagFilter {...lag} />
    {/* Mobil (og dag): kort per dag */}
    <div className={`ukevis${enDag ? "" : " bare-mobil"}`}>
      {dager.map((d) => <div key={d} className={`ukedag${d === data.idagIso ? " idag" : ""}`}>
        <h3>{ukedagKort(d)} <span>{dagMnd(d)}</span></h3>
        {perDag(d).length ? perDag(d).map((e) => <button key={e.id} type="button" className={`u-okt${e.kollidererMed?.length ? " kolliderer" : ""}`} onClick={() => setValgt(e)}>
          <b>{e.heldag ? "Dag" : e.startMin != null ? hhmm(e.startMin) : "—"}</b><span>{e.tittel}{e.undertekst ? ` · ${e.undertekst}` : ""} · {LAG_LABEL[e.lag]}</span>
        </button>) : <span className="kilde">—</span>}
      </div>)}
    </div>
    {/* PC: tidsrutenett for uka */}
    {!enDag && <div className="uke-rutenett bare-pc" style={{ ["--kol" as string]: dager.length }}>
      <span className="hd tom" />
      {dager.map((d) => <span key={d} className={`hd${d === data.idagIso ? " idag" : ""}`}>{ukedagKort(d)} {dagMnd(d)}</span>)}
      <div className="timer">{Array.from({ length: H1 - H0 }, (_, i) => <span key={i}>{String(H0 + i).padStart(2, "0")}</span>)}</div>
      {dager.map((d) => {
        const es = perDag(d);
        const heldag = es.filter((e) => e.heldag);
        return <div key={d} className="kol">
          {heldag.length > 0 && <div className="heldag">{heldag.map((e) => <button key={e.id} type="button" className="k-okt heldag-okt" onClick={() => setValgt(e)}><b>{e.tittel}</b></button>)}</div>}
          {es.filter((e) => !e.heldag && e.startMin != null).map((e) => {
            const start = Math.max(H0 * 60, e.startMin!);
            const slutt = Math.min(H1 * 60, e.sluttMin ?? start + 30);
            return <button key={e.id} type="button" className={`k-okt${e.kollidererMed?.length ? " kolliderer" : ""}`}
              style={{ top: `calc(var(--time) * ${(start - H0 * 60) / 60})`, height: `max(32px, calc(var(--time) * ${(slutt - start) / 60} - 3px))` }} onClick={() => setValgt(e)}>{blokk(e)}</button>;
          })}
        </div>;
      })}
    </div>}
    {valgt && <HendelseArk ev={valgt} onClose={() => setValgt(null)} />}
  </>;
}

export function AG05Maned({ data, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const lag = useLagFilter(startLag);
  const hendelser = synlige(data.hendelser, lag.valgt);
  return <>
    <LagFilter {...lag} />
    <div className="mnd">
      {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => <span key={d} className="ukedn">{d}</span>)}
      {data.rutenett.map((c) => {
        const es = c.iManed ? hendelser.filter((e) => e.dato === c.dato) : [];
        const num = Number(c.dato.slice(8, 10));
        if (!c.iManed) return <span key={c.dato} className="d ut" aria-hidden><b>{num}</b></span>;
        return <Link key={c.dato} href={`/admin/kalender?fane=dag&dato=${c.dato}`} className={`d${c.dato === data.idagIso ? " idag" : ""}`} aria-label={`${c.dato}${es.length ? ` · ${es.length} hendelser` : ""}`}>
          <b>{num}</b>
          {es.length > 0 && <span className="ant">{es.length} {es.length === 1 ? "hendelse" : "hendelser"}</span>}
        </Link>;
      })}
    </div>
  </>;
}

export function AG05Verktoylinje({ nyHendelseHref, nyBookingHref }: { nyHendelseHref: string; nyBookingHref: string }) {
  return <>
    <KnappLenke variant="pri" href={nyHendelseHref}>Ny hendelse</KnappLenke>
    <KnappLenke href={nyBookingHref}>Ny booking</KnappLenke>
  </>;
}
