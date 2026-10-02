"use client";

/**
 * PH-05 Live-økt: aktiv — Precision Athletics, natt-flate (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-live.jsx, runde 24, etag 1790582694341367; «Focus»-skallet
 * fra parts.jsx, etag 1790587884753587). PH-05.jsx er eldre og overstyres av PH-live.jsx.
 *
 * Én kolonne (maks 600 px), ingen fanelinje, én fullbredde primærhandling nederst:
 * klokke for hele økta øverst, drill-rad, drill med egen klokke, tellere, «Ferdig med drillen».
 *
 * Rene visningsdata inn, ingen tilkobling til økt-lagring: LiveActive eier hooken.
 *
 * Bevisste avvik fra tegningen:
 *   - Fjerde teller heter «Treff», ikke «Slag»: appens rep-modell har Uten ball, Lav hastighet,
 *     Automatikk og Treff. Planlagt antall per teller finnes ikke (bare totalt), så «av —».
 *   - Teknisk oppgave fra teknisk plan vises ikke: en drill har ingen kobling til en oppgave i
 *     teknisk plan ennå (forslag i PR-en).
 *   - Formel-/køllelinje under «Drill n av m» vises ikke: LiveV2Drill har verken AK-formel eller kølle.
 *   - Arket «Rekkefølge» har hopp over og fjern, men ikke flytt: live-state har ingen flytting.
 *   - Fysiske drills viser den eksisterende fys-loggeren i stedet for tellerne (PH-06).
 */
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, CircleAlert, CircleDashed, ListOrdered, Pause, Play, RotateCw, SkipForward, Trash2 } from "lucide-react";
import { AkseMerke, FeilTilstand, Ikon, Knapp, LasterTilstand, Meta, StatusPille, TomTilstand, type Akse } from "@/components/precision/pa";
import { Ark, Dialogboks } from "@/components/precision/pa-a4";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export type PH05Drill = {
  id: string;
  akse: Akse;
  navn: string;
  beskrivelse: string | null;
  /** Kort statuslinje i arket, f.eks. «PÅGÅR» eller «40 REPS · 20 MIN». */
  arkMeta: string;
  ferdig: boolean;
  hoppet: boolean;
  fys: boolean;
};

export type PH05Teller = { id: string; label: string; verdi: number; onEndre: (n: number) => void };

export type PH05Kvittering = { navn: string; tid: string; planTid: string; fikk: number; plan: number | null };

export type PH05Props = {
  tilstand: "data" | "tom" | "laster" | "feil";
  klokke: string;
  pauset: boolean;
  planlagtMin: number | null;
  drills: PH05Drill[];
  valgt: number;
  drillKlokke: string;
  drillPlan: string;
  totalt: number;
  planlagtTotalt: number | null;
  tellere: PH05Teller[];
  kvittering: PH05Kvittering | null;
  /** Lagringsstatus (uten nett, ikke sendt …). Null når alt er lagret. */
  status: string | null;
  statusHandling?: { label: string; onClick: () => void };
  feilKode: string;
  onProv?: () => void;
  kanRegistrere: boolean;
  slagtellerHref: string;
  onPause: () => void;
  onAvslutt: () => void;
  onVelg: (i: number) => void;
  onFerdig: () => void;
  onHopp: (id: string) => void;
  onFjern: (id: string) => void;
  fullforer: boolean;
  dialog: {
    open: boolean;
    ferdige: number;
    totalt: number;
    lagrer: boolean;
    feil: boolean;
    notatVarsel: boolean;
    onFortsett: () => void;
    onBekreft: () => void;
  };
  /** Innhold i arket «Rekkefølge» under drill-listen (legg til drill). */
  arkEkstra?: ReactNode;
  /** Erstatter tellerne for fysiske drills. */
  fysInnhold?: ReactNode;
  /** Verktøy under tellerne (notater, tale). */
  ekstra?: ReactNode;
};

const knapp = { height: 56, minWidth: 0, padding: 0, font: "600 18px/1 var(--font-mono)" } as const;

const CSS = `
.ph05-side{min-height:100dvh;display:flex;flex-direction:column;background:var(--surface-page);color:var(--text-body)}
.ph05-kolonne{flex:1;width:100%;max-width:600px;margin:0 auto;box-sizing:border-box;padding:max(12px,env(safe-area-inset-top)) 16px 16px;display:flex;flex-direction:column;gap:16px;min-width:0}
.ph05-topp{display:flex;align-items:center;gap:8px;min-height:56px;flex-wrap:wrap}
.ph05-handling{position:sticky;bottom:0;background:var(--surface-page);border-top:1px solid var(--border-hairline);z-index:5}
.ph05-handling>div{max-width:600px;margin:0 auto;padding:12px 16px calc(16px + env(safe-area-inset-bottom) + var(--ak-cookie-h,0px));box-sizing:border-box;display:flex;flex-direction:column;gap:8px}
.ph05-rad{height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;min-width:0;padding:0;color:var(--text-primary);font:600 13px/1 var(--font-mono)}
.ph05-rad:focus-visible,.ph05-lenke:focus-visible,.ph05-tekst:focus-visible{outline:2px solid var(--border-ink);outline-offset:2px}
.ph05-lenke{display:flex;align-items:center;gap:8px;min-height:56px;font:var(--type-label);color:var(--text-secondary);text-decoration:none}
.ph05-tekst{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:8px;align-items:center;min-height:44px;font:500 14px/1.3 var(--font-sans);color:var(--text-secondary)}
.ph05-teller{display:grid;grid-template-columns:minmax(0,1fr) 56px 64px 64px;gap:8px;align-items:center;min-height:64px;border-top:1px solid var(--border-hairline);padding-top:8px}
@media (min-width:600px){.ph05-kolonne{padding:max(24px,env(safe-area-inset-top)) 24px 24px}.ph05-handling>div{padding:16px 24px calc(24px + env(safe-area-inset-bottom) + var(--ak-cookie-h,0px))}}
`;

export function PH05LiveAktiv(p: PH05Props) {
  const d = p.drills[p.valgt] ?? p.drills[0];
  const [beskr, setBeskr] = useState(true);
  const [ark, setArk] = useState(false);
  const tom = p.tilstand === "tom";
  const visData = p.tilstand === "data" || p.tilstand === "tom";
  const { dialog } = p;

  const { open: dialogApen, lagrer: dialogLagrer, onFortsett } = dialog;
  useEffect(() => {
    if (!dialogApen || dialogLagrer) return;
    const h = (ev: KeyboardEvent) => { if (ev.key === "Escape") onFortsett(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [dialogApen, dialogLagrer, onFortsett]);

  const handling = visData && d
    ? <Knapp size="xl" fullWidth icon={Check} style={{ height: 64 }} disabled={!p.kanRegistrere || p.fullforer} onClick={p.onFerdig}>Ferdig med drillen</Knapp>
    : null;

  return <div className="pa-root ph05-side" data-theme="night" data-design="precision-athletics" data-od-id="playerhq-live-active">
    <style>{CSS}</style>
    <main className="ph05-kolonne" id="pa-innhold">
      <h1 className="pa-sr">Live-økt</h1>
      <div className="ph05-topp">
        <StatusPille tone="live">Live</StatusPille>
        <span style={{ font: "600 20px/1 var(--font-mono)", color: p.pauset ? "var(--text-muted)" : "var(--text-primary)", fontVariantNumeric: "tabular-nums" }} aria-label={`Økt ${p.klokke}`} data-testid="live-clock">{p.klokke}</span>
        <Meta>{p.planlagtMin ? `AV ${p.planlagtMin} MIN` : p.pauset ? "PAUSE" : "MEDGÅTT"}</Meta>
        <span style={{ flex: 1 }} />
        <Knapp variant="secondary" icon={p.pauset ? Play : Pause} disabled={!p.kanRegistrere} onClick={p.onPause} aria-pressed={p.pauset} style={{ width: 56, height: 56, padding: 0 }}><span className="pa-sr">{p.pauset ? "Fortsett" : "Pause"}</span></Knapp>
        <Knapp variant="ghost" style={{ height: 56 }} disabled={!p.kanRegistrere} onClick={p.onAvslutt}>Avslutt</Knapp>
      </div>

      {p.tilstand === "laster" && <LasterTilstand text="Kobler til økta …" />}
      {p.tilstand === "feil" && <FeilTilstand icon={CircleAlert} title="Mistet kontakten med økta"
        text="Repetisjonene er lagret på telefonen og sendes når nettet er tilbake." code={p.feilKode}
        retry={p.onProv && <Knapp variant="secondary" icon={RotateCw} onClick={p.onProv}>Prøv igjen</Knapp>} />}

      {visData && d && <>
        {p.status && <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
          <Meta style={{ color: "var(--text-primary)" }}>{p.status.toUpperCase()}</Meta>
          {p.statusHandling && <Knapp variant="ghost" onClick={p.statusHandling.onClick}>{p.statusHandling.label}</Knapp>}
        </div>}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div role="list" aria-label="Driller" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(44px,1fr))", gap: 4, minWidth: 0 }}>
            {p.drills.map((x, i) => {
              const on = i === p.valgt;
              return <button key={x.id} role="listitem" type="button" className="ph05-rad" onClick={() => p.onVelg(i)} aria-current={on ? "step" : undefined}
                aria-label={`Drill ${i + 1}${x.ferdig ? " ferdig" : x.hoppet ? " hoppet over" : ""}`}
                style={{ border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"), background: on ? "var(--surface-card)" : "transparent", color: x.hoppet ? "var(--text-muted)" : "var(--text-primary)" }}>
                {x.ferdig ? <Ikon icon={Check} size={16} name="check" /> : String(i + 1).padStart(2, "0")}
              </button>;
            })}
          </div>
          <Knapp variant="secondary" icon={ListOrdered} onClick={() => setArk(true)} style={{ width: 48, height: 48, padding: 0 }}><span className="pa-sr">Rekkefølge og hopp over</span></Knapp>
        </div>

        {p.kvittering && <div role="status" style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-hairline)" }}>
          <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>Ferdig: {p.kvittering.navn}</span>
          <Meta>{p.kvittering.tid} AV {p.kvittering.planTid} · {p.kvittering.fikk}{p.kvittering.plan != null ? ` AV ${p.kvittering.plan}` : ""} REPS</Meta>
        </div>}

        {tom && <TomTilstand icon={CircleDashed} title="Ingen repetisjoner ennå" text="Første drill er åpnet. Trykk +1 for hver repetisjon." />}

        <section aria-label={`Drill ${p.valgt + 1}`} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <AkseMerke axis={d.akse} />
            <Meta>DRILL {p.valgt + 1} AV {p.drills.length}</Meta>
            <span style={{ flex: 1 }} />
            <span style={{ font: "600 20px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }} aria-label={`Drill ${p.drillKlokke}`}>{p.drillKlokke}</span>
            <Meta>{p.drillPlan}</Meta>
          </div>
          <h2 style={{ margin: 0, font: "var(--type-title-m)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{d.navn}</h2>
          {d.beskrivelse && <>
            <button type="button" className="ph05-tekst" aria-expanded={beskr} onClick={() => setBeskr(!beskr)}><Ikon icon={beskr ? ChevronUp : ChevronDown} size={16} />Beskrivelse</button>
            {beskr && <p style={{ margin: 0, font: "400 16px/1.5 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{d.beskrivelse}</p>}
          </>}

          {d.fys ? p.fysInnhold : <>
            <div role="group" aria-label="Tellere" style={{ display: "flex", flexDirection: "column" }}>
              {p.tellere.map((t) => <div key={t.id} className="ph05-teller" role="group" aria-label={`${t.label} ${t.verdi}`}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ font: "500 14px/1.2 var(--font-sans)", color: "var(--text-secondary)" }}>{t.label}</span>
                  <span style={{ font: "600 22px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }} data-testid={`teller-${t.id}`}>{t.verdi} <span style={{ font: "500 14px/1 var(--font-mono)", color: "var(--text-muted)" }}>av —</span></span>
                </span>
                <Knapp variant="ghost" aria-label={`Trekk fra én ${t.label}`} disabled={!p.kanRegistrere || t.verdi === 0} onClick={() => t.onEndre(-1)} style={{ ...knapp, width: 56 }}>−1</Knapp>
                <Knapp variant="secondary" aria-label={`Legg til fem ${t.label}`} disabled={!p.kanRegistrere} onClick={() => t.onEndre(5)} style={knapp}>+5</Knapp>
                <Knapp variant="secondary" data-od-id={`live-teller-${t.id}-pluss`} aria-label={`Legg til én ${t.label}`} disabled={!p.kanRegistrere} onClick={() => t.onEndre(1)} style={knapp}>+1</Knapp>
              </div>)}
            </div>
            <Meta>TOTALT {p.totalt}{p.planlagtTotalt ? ` AV ${p.planlagtTotalt}` : ""} REPS · «FERDIG» STOPPER KLOKKA · NESTE DRILL ÅPNES AUTOMATISK</Meta>
          </>}
        </section>

        <Link href={p.slagtellerHref} className="ph05-lenke">Åpne slagtelleren med kølle og TrackMan</Link>

        {p.ekstra}
      </>}
    </main>
    {handling && <div className="ph05-handling"><div>{handling}</div></div>}

    <Ark open={ark} onClose={() => setArk(false)} kicker="Aktiv økt" title="Rekkefølge" footer={<Knapp variant="secondary" fullWidth onClick={() => setArk(false)}>Lukk</Knapp>}>
      <div role="list">
        {p.drills.map((x, i) => <div key={x.id} role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 64, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0", minWidth: 0 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ font: "500 14px/1.3 var(--font-sans)", color: x.hoppet ? "var(--text-muted)" : "var(--text-primary)", textDecoration: x.hoppet ? "line-through" : "none", overflowWrap: "anywhere" }}>{String(i + 1).padStart(2, "0")} · {x.navn}</span>
            <Meta>{x.ferdig ? "FERDIG" : x.hoppet ? "HOPPET OVER" : x.arkMeta}</Meta>
          </span>
          <span style={{ display: "flex", gap: 4 }}>
            <Knapp variant="ghost" icon={SkipForward} disabled={x.ferdig || x.hoppet || !p.kanRegistrere} onClick={() => p.onHopp(x.id)} style={{ width: 48, height: 48, padding: 0 }}><span className="pa-sr">Hopp over {x.navn}</span></Knapp>
            <Knapp variant="ghost" icon={Trash2} disabled={x.ferdig || p.drills.length < 2 || !p.kanRegistrere} onClick={() => p.onFjern(x.id)} style={{ width: 48, height: 48, padding: 0 }}><span className="pa-sr">Fjern {x.navn} fra økta</span></Knapp>
          </span>
        </div>)}
      </div>
      {p.arkEkstra}
    </Ark>

    <Dialogboks open={dialog.open} title="Avslutte økta?" onClose={dialog.onFortsett} footer={<>
      <Knapp size="xl" variant="secondary" disabled={dialog.lagrer} onClick={dialog.onFortsett}>Fortsett</Knapp>
      <Knapp size="xl" loading={dialog.lagrer} loadingText="Lagrer og fullfører …" onClick={dialog.onBekreft}>{dialog.feil ? "Prøv fullføring igjen" : "Avslutt og lagre"}</Knapp>
    </>}>
      {dialog.ferdige} av {dialog.totalt} driller er ferdige. Resten lagres som ikke gjennomført.
      {dialog.notatVarsel && <p style={{ margin: "8px 0 0" }}>Du har et notat som ikke er lagt til. Fortsett økta for å ta det med.</p>}
      {dialog.feil && <p role="alert" style={{ margin: "8px 0 0", color: "var(--text-primary)" }}>Fullføringen ble ikke bekreftet. Hold siden åpen. Prøv igjen når du har nett, eller fortsett økta.</p>}
    </Dialogboks>
  </div>;
}
