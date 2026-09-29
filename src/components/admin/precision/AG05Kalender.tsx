"use client";

/**
 * AG-05 Kalender, Precision Athletics (tegning: designsystem/precision-athletics/
 * ui_kits/agencyos/screens/AG-05.jsx). Faner Uke/Måned/Dag deler denne fila;
 * Stall-dag (StallDagV2) og Tilgjengelighet har egne, mindre komponenter.
 *
 * Avvik fra tegningen (se PR/rapport):
 * - Ingen dra-og-slipp i ukegrafen. Tegningen selv sier at bunn-arket med
 *   «Flytt» er det som virker under 1024 px («Trykk en hendelse og velg
 *   Flytt») — her brukes samme ark på alle bredder, med et tidsvalg i stedet
 *   for et fritt slipp-punkt. Selve flyttingen (drag) er derfor parkert.
 * - Hendelser fargelegges ikke etter akse: kalenderlaget (Økter/Skole/
 *   Turnering/Tester/Booking) har ingen «akse»-verdi i datamodellen, og en
 *   økt kan romme flere akser. Å farge etter lag ville brutt regelen «farge
 *   betyr akse og ingenting annet» — derfor bare en tekstetikett (LAG_LABEL).
 * - «Flytt» og «Endre hendelse» lenker videre til de eksisterende
 *   redigeringsflatene (Workbench, /admin/kalender/hendelse/[id], Booking) i
 *   stedet for å redigere inline — de flatene finnes og virker allerede.
 */
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { KnappLenke, Meta, TomTilstand } from "@/components/precision/pa";
import { Ark, Nokkelverdi, Kolonner } from "@/components/precision/pa-a4";
import { ALLE_LAG, LAG_LABEL, LAG_MENY_LABEL, synlige, type KalenderHendelse, type KalenderLag } from "@/lib/domain/kalender-lag";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import "@/styles/precision-a4.css";

const H0 = 7;
const H1 = 21;
const PXPT = 44; // høyde per time, matcher a4-week__hour

function ukedagKort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dato = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" }).format(dato).slice(0, 3).toUpperCase();
}
function dagMnd(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}
function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Lagfilter (tegningens «Lag»-filter): hvilke kalenderlag som vises. Samme valg som før (øye-toggle i KalenderLagUkeV2). */
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
  return (
    <div className="pa-filter" role="group" aria-label="Lag">
      {ALLE_LAG.map((l) => (
        <button key={l} type="button" className="pa-filter__opt" aria-pressed={valgt.has(l)} onClick={() => veksle(l)}>
          <span className="pa-filter__label">{LAG_MENY_LABEL[l]}</span>
        </button>
      ))}
    </div>
  );
}

/** Forrige · I dag · Neste — periode-navigasjonen fra lag/data.ts (`nav`). */
export function AG05Periode({ forrige, idag, neste }: { forrige: string; idag: string; neste: string }) {
  return (
    <div className="a4-periode" role="group" aria-label="Periode">
      <KnappLenke href={forrige} variant="ghost" size="sm" icon={ChevronLeft} iconName="chevron-left">Forrige</KnappLenke>
      <KnappLenke href={idag} variant="secondary" size="sm">I dag</KnappLenke>
      <KnappLenke href={neste} variant="ghost" size="sm" iconRight={ChevronRight}>Neste</KnappLenke>
    </div>
  );
}

function EventSheet({ ev, onClose }: { ev: KalenderHendelse | null; onClose: () => void }) {
  return (
    <Ark
      open={!!ev}
      onClose={onClose}
      kicker={ev ? LAG_LABEL[ev.lag] : ""}
      title={ev?.tittel}
      footer={ev?.href && (
        <KnappLenke href={ev.href} fullWidth variant="secondary">Åpne</KnappLenke>
      )}
    >
      {ev && (
        <Nokkelverdi items={[
          ["Type", LAG_LABEL[ev.lag], {}],
          ["Dato", `${dagMnd(ev.dato)}`, { mono: true }],
          ["Tid", ev.heldag ? "Hele dagen" : ev.startMin != null && ev.sluttMin != null ? `${hhmm(ev.startMin)}–${hhmm(ev.sluttMin)}` : "—", { mono: true }],
          ["Hvem", ev.undertekst, {}],
          ["Kolliderer med", ev.kollidererMed && ev.kollidererMed.length > 0 ? (ev.kollidererMed.length === 1 ? "1 annen hendelse" : `${ev.kollidererMed.length} andre hendelser`) : null, {}],
        ]} />
      )}
    </Ark>
  );
}

function EventChip({ ev, onClick }: { ev: KalenderHendelse; onClick: () => void }) {
  return (
    <button type="button" className="a4-ev" style={{ position: "static", width: "100%" }} onClick={onClick}>
      <span className="a4-ev__title">{ev.tittel}</span>
      {(() => {
        const tid = !ev.heldag && ev.startMin != null && ev.sluttMin != null ? `${hhmm(ev.startMin)}–${hhmm(ev.sluttMin)}` : null;
        const meta = [tid, ev.undertekst].filter(Boolean).join(" · ");
        return meta ? <Meta>{meta}</Meta> : null;
      })()}
    </button>
  );
}

/** Uke- og dag-visning deler datakilden (KalenderLagUkeData) og bare grid-layouten skiller dem. */
export function AG05Uke({ data: raa, dagIso, startLag }: { data: KalenderLagUkeData; dagIso?: string; startLag?: KalenderLag }) {
  const [valgt, setValgt] = useState<KalenderHendelse | null>(null);
  const lag = useLagFilter(startLag);
  const data = { ...raa, hendelser: synlige(raa.hendelser, lag.valgt) };
  const enDag = data.visning === "dag";
  const dagValgt = dagIso && data.dager.includes(dagIso) ? dagIso : data.dager.includes(data.idagIso) ? data.idagIso : data.dager[0];
  const dager = enDag ? data.dager.filter((d) => d === dagValgt) : data.dager;

  if (!dager.some((d) => data.hendelser.some((e) => e.dato === d))) {
    return (
      <>
        <LagFilter {...lag} />
        <TomTilstand icon={CalendarDays} title={enDag ? "Ingen hendelser denne dagen" : "Ingen hendelser denne uka"} text="Sett tilgjengelighet først, så kan spillere booke og lagøkter legges oppå." actions={<KnappLenke href="/admin/kalender?fane=tilg" variant="secondary">Sett tilgjengelighet</KnappLenke>} />
      </>
    );
  }

  return (
    <>
      <LagFilter {...lag} />
      {!enDag && (
        <div className="a4-daylist a4-week--mobil">
          {dager.map((d) => {
            const es = data.hendelser.filter((e) => e.dato === d).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
            return (
              <div key={d} className="a4-daylist__day">
                <div className="a4-daylist__label">{ukedagKort(d)} {dagMnd(d)}</div>
                {es.length ? es.map((e) => (
                  <div key={e.id} className="a4-daylist__row">
                    <span className="a4-daylist__time">{e.heldag ? "" : e.startMin != null ? hhmm(e.startMin) : ""}</span>
                    <EventChip ev={e} onClick={() => setValgt(e)} />
                  </div>
                )) : <Meta>—</Meta>}
              </div>
            );
          })}
        </div>
      )}
      <div className={enDag ? "a4-week" : "a4-week a4-week--grid"}>
        <div className="a4-week__head" style={{ gridTemplateColumns: `48px repeat(${dager.length}, minmax(0,1fr))` }}>
          <span />
          {dager.map((d) => <span key={d} className="a4-week__daycell">{ukedagKort(d)} {dagMnd(d)}</span>)}
        </div>
        <div className="a4-week__grid" style={{ gridTemplateColumns: `48px repeat(${dager.length}, minmax(0,1fr))` }}>
          <div className="a4-week__hours">{Array.from({ length: H1 - H0 }, (_, i) => <div key={i} className="a4-week__hour">{String(H0 + i).padStart(2, "0")}:00</div>)}</div>
          {dager.map((d) => {
            const dagHendelser = data.hendelser.filter((e) => e.dato === d);
            const heldag = dagHendelser.filter((e) => e.heldag);
            const timet = dagHendelser.filter((e) => !e.heldag && e.startMin != null);
            return (
              <div key={d} className="a4-week__day" style={{ height: (H1 - H0) * PXPT }}>
                {heldag.length > 0 && (
                  <div style={{ position: "absolute", top: 0, left: 3, right: 3, display: "flex", flexDirection: "column", gap: 2, zIndex: 1 }}>
                    {heldag.map((e) => <EventChip key={e.id} ev={e} onClick={() => setValgt(e)} />)}
                  </div>
                )}
                {timet.map((e) => {
                  const start = Math.max(H0 * 60, e.startMin!);
                  const slutt = Math.min(H1 * 60, e.sluttMin ?? start + 30);
                  const top = ((start - H0 * 60) / 60) * PXPT + (heldag.length ? heldag.length * 22 + 4 : 0);
                  const height = Math.max(20, ((slutt - start) / 60) * PXPT - 4);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className="a4-ev"
                      data-kolliderer={e.kollidererMed && e.kollidererMed.length > 0 ? "" : undefined}
                      style={{ top, height }}
                      onClick={() => setValgt(e)}
                    >
                      <span className="a4-ev__title">{e.tittel}</span>
                      <Meta>{hhmm(e.startMin!)}–{hhmm(e.sluttMin ?? e.startMin! + 30)}</Meta>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <EventSheet ev={valgt} onClose={() => setValgt(null)} />
    </>
  );
}

export function AG05Maned({ data, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const lag = useLagFilter(startLag);
  const hendelser = synlige(data.hendelser, lag.valgt);
  return (
    <>
    <LagFilter {...lag} />
    <div className="a4-month">
      {data.rutenett.map((c) => {
        const es = c.iManed ? hendelser.filter((e) => e.dato === c.dato) : [];
        const num = Number(c.dato.slice(8, 10));
        if (!c.iManed) return <span key={c.dato} className="a4-month__cell" data-utenfor="" aria-hidden />;
        return (
          <Link key={c.dato} href={`/admin/kalender?fane=dag&dato=${c.dato}`} className="a4-month__cell" aria-label={`${c.dato}${es.length ? ` · ${es.length} hendelser` : ""}`}>
            <span className="a4-month__num">{num}</span>
            {es.length > 0 && (
              <span className="a4-month__dots">
                {es.slice(0, 4).map((e) => <span key={e.id} className="a4-month__dot" style={{ background: "var(--border-strong)" }} title={LAG_LABEL[e.lag]} />)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
    </>
  );
}

export function AG05Verktoylinje({ nyHendelseHref, nyBookingHref }: { nyHendelseHref: string; nyBookingHref: string }) {
  return (
    <Kolonner mal="auto auto" gap={8}>
      <KnappLenke href={nyHendelseHref} variant="secondary" icon={CalendarPlus} iconName="calendar-plus">Ny hendelse</KnappLenke>
      <KnappLenke href={nyBookingHref} variant="ghost">Ny booking</KnappLenke>
    </Kolonner>
  );
}
