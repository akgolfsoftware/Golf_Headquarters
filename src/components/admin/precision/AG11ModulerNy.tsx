"use client";

/**
 * AG-WB-FYS (fysisk plan) og AG-WB-TURN (turneringer) i coachens Workbench,
 * nytt design (designbrevet 13.10.2026, pakke 4).
 * Fasit: docs/design-system/utkast-agencyos/workbench.html, skjermene «AG-WB-FYS» og «AG-WB-TURN».
 * Ruter: /admin/workbench/[playerId]?pille=fys og ?pille=turn.
 *
 * Samme data (loadFysTurneringWorkbenchData) og samme seks handlinger som før:
 * opprett og publiser fysisk blokk, opprett og flytt fysisk økt (dra eller
 * velg dag), opprett og publiser turneringsplan. Turneringsplanen redigeres i
 * WorkbenchTurneringsplanArk som før.
 *
 * Avvik:
 *   - «Trekk tilbake» fysisk plan og «Publiser til Øyvind» per turnering finnes
 *     ikke som handling; bare publiser. Trekk tilbake-dialogen er derfor utelatt.
 *   - Deload- og testuke er ikke merket på ukene i basen; ukevolumet vises likt.
 *   - «Gjør lettere» på en konflikt: appen kan ikke endre økta fra konflikten.
 *     Konflikten vises med lenke til uka.
 *   - Spillerens respons («Tungt siste serie …») finnes som playerNote og vises;
 *     «hvor tungt» er RPE 1–10 fra økta. Historikk per øvelse finnes ikke.
 *   - Resultater etter turneringen kommer fra turneringsplanens runder (brutto),
 *     ikke fra GolfBox-synkroniseringen direkte.
 */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Move, TriangleAlert, X } from "lucide-react";
import { Avatar, Pille } from "@/components/admin/agencyos-ny/ny";
import { WorkbenchTurneringsplanArk } from "@/components/workbench/WorkbenchTurneringsplanArk";
import type { WorkbenchFysTurneringData, WorkbenchPhysicalSessionDto, WorkbenchTournamentPlanDto } from "@/lib/workbench/fys-turnering-data";
import { formaterVarighet } from "@/lib/format-tall";
import "@/styles/agencyos-ny-workbench.css";

type Svar = Promise<{ ok: boolean; error?: string }>;
export type FysTurnHandlinger = {
  opprettFysiskBlokk?: (input: { playerId: string; title: string; startDate: string; endDate: string; focus?: string | null }) => Promise<{ ok: boolean; blockId?: string; error?: string }>;
  opprettFysiskOkt?: (input: { blockId: string; weekId: string; date: string; title: string; type?: "STYRKE" | "KONDISJON" | "MOBILITET" | "TEST"; durationMinutes?: number | null; exerciseTitle?: string | null }) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
  flyttFysiskOkt?: (input: { sessionId: string; date: string }) => Svar;
  publiserFysiskBlokk?: (input: { id: string }) => Svar;
  opprettTurneringsplan?: (input: { playerId: string; title: string; startDate: string; endDate: string; travelStartDate?: string | null; travelEndDate?: string | null; focus?: "TRENING" | "UTVIKLING" | "PRESTASJON" }) => Promise<{ ok: boolean; planId?: string; error?: string }>;
  publiserTurneringsplan?: (input: { id: string }) => Svar;
};

const STATUS: Record<string, { tekst: string; tone: "ok" | "vent" | "noy" | "feil" }> = {
  DRAFT: { tekst: "Utkast", tone: "noy" }, PUBLISHED: { tekst: "Publisert", tone: "ok" }, CHANGED_AFTER_PUBLISH: { tekst: "Endret etter publisering", tone: "vent" },
  WITHDRAWN: { tekst: "Trukket tilbake", tone: "noy" }, COMPLETED: { tekst: "Fullført", tone: "ok" }, ARCHIVED: { tekst: "Arkivert", tone: "noy" },
};
const TYPE: Record<string, string> = { STYRKE: "Styrke", KONDISJON: "Kondisjon", MOBILITET: "Mobilitet", TEST: "Test" };
const FOKUS: Record<string, string> = { TRENING: "Trening", UTVIKLING: "Utvikling", PRESTASJON: "Prestasjon" };
const DAGNAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const kort = (iso: string) => `${Number(iso.slice(8, 10))}. ${MND[Number(iso.slice(5, 7)) - 1]}`;
const spenn = (a: string, b: string) => (a === b ? kort(a) : `${kort(a)}–${kort(b)}`);
const kg = (v: number | null | undefined) => (v == null || v === 0 ? "—" : `${Math.round(v).toLocaleString("nb-NO")} kg`);
const pluss = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
const osloIdag = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
const klokke = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const dagKort = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`).getUTCDay(); return `${DAGNAVN[(d + 6) % 7]} ${Number(iso.slice(8, 10))}`; };

function Status({ status }: { status: string }) {
  const s = STATUS[status] ?? { tekst: status, tone: "noy" as const };
  return <Pille tone={s.tone}>{s.tekst}</Pille>;
}

function useKjor() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [melding, setMelding] = useState<string | null>(null);
  const kjor = (fn: () => Promise<{ ok: boolean; error?: string }>, ferdig?: () => void) => {
    setMelding(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) { setMelding(res.error ?? "Kunne ikke lagre."); return; }
      ferdig?.();
      router.refresh();
    });
  };
  return { pending, melding, kjor };
}

function Ark({ tittel, dato, onLukk, children }: { tittel: string; dato?: string; onLukk: () => void; children: React.ReactNode }) {
  return <div className="ark-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onLukk(); }}>
    <div className="ark" role="dialog" aria-modal="true" aria-label={tittel}>
      <div className="ark-topp"><div>{dato && <span className="dato">{dato}</span>}<h2>{tittel}</h2></div><button type="button" className="lukk" aria-label="Lukk" onClick={onLukk}><X className="ikon" aria-hidden /></button></div>
      {children}
    </div>
  </div>;
}

function Tilbake({ playerId, spillerNavn }: { playerId: string; spillerNavn: string }) {
  return <Link href={`/admin/workbench/${playerId}`} className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />Workbench · {spillerNavn}</Link>;
}

/* =============== AG-WB-FYS · Fysisk plan =============== */

export function AG11FysiskNy({ playerId, spillerNavn, data, actions }: { playerId: string; spillerNavn: string; data: WorkbenchFysTurneringData; actions: FysTurnHandlinger }) {
  const { pending, melding, kjor } = useKjor();
  const idag = osloIdag();
  const blokker = data.physicalBlocks;
  const [blokkId, setBlokkId] = useState(blokker[0]?.id ?? "");
  const blokk = blokker.find((b) => b.id === blokkId) ?? blokker[0] ?? null;
  const naaUke = blokk?.weeks.find((w) => idag >= w.weekStart && idag < pluss(w.weekStart, 7)) ?? blokk?.weeks[0] ?? null;
  const [ukeId, setUkeId] = useState(naaUke?.id ?? "");
  const uke = blokk?.weeks.find((w) => w.id === ukeId) ?? naaUke;
  const [valgtId, setValgtId] = useState<string | null>(uke?.sessions[0]?.id ?? null);
  const valgt = uke?.sessions.find((s) => s.id === valgtId) ?? uke?.sessions[0] ?? null;
  const [nyBlokk, setNyBlokk] = useState(false);
  const [nyOkt, setNyOkt] = useState(false);
  const [flytt, setFlytt] = useState<WorkbenchPhysicalSessionDto | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [dra, setDra] = useState<string | null>(null);
  const [bf, setBf] = useState({ title: "Fysisk blokk", startDate: idag, endDate: pluss(idag, 41), focus: "" });
  const [of, setOf] = useState({ title: "", type: "STYRKE" as "STYRKE" | "KONDISJON" | "MOBILITET" | "TEST", date: uke?.weekStart ?? idag, durationMinutes: 45, exerciseTitle: "" });
  const alleOkter = useMemo(() => (blokk ? blokk.weeks.flatMap((w) => w.sessions) : []), [blokk]);
  const ukeMin = uke ? uke.sessions.reduce((s, o) => s + (o.durationMinutes ?? 0), 0) : 0;
  const maksVolum = blokk ? Math.max(1, ...blokk.weeks.map((w) => w.plannedMinutes ?? 0)) : 1;
  const flyttTil = (sessionId: string, dato: string) => { if (actions.flyttFysiskOkt) kjor(() => actions.flyttFysiskOkt!({ sessionId, date: dato })); };
  const status = blokk ? (blokk.changedAfterPublish ? "CHANGED_AFTER_PUBLISH" : blokk.status) : null;

  return <div className="agn-s">
    <div className="topp">
      <Tilbake playerId={playerId} spillerNavn={spillerNavn} />
      <div className="topp-rad">
        <div><div className="dato">{spillerNavn} · fysisk plan</div><h1 className="tittel">{blokk ? blokk.title : "Fysisk plan"}</h1></div>
        <div className="status-linje">{status && <Status status={status} />}
          <button type="button" className="knapp sek" disabled={!actions.opprettFysiskBlokk} onClick={() => setNyBlokk(true)}>Ny blokk</button>
          {blokk && blokk.status !== "PUBLISHED" && actions.publiserFysiskBlokk && <button type="button" className="knapp pri" disabled={pending} onClick={() => kjor(() => actions.publiserFysiskBlokk!({ id: blokk.id }))}>Publiser {blokk.changedAfterPublish ? "endringene" : "til spilleren"}</button>}
        </div>
      </div>
      {blokker.length > 1 && <div className="valg" role="group" aria-label="Blokk">{blokker.map((b) => <button key={b.id} type="button" aria-pressed={b.id === blokk?.id} onClick={() => { setBlokkId(b.id); setUkeId(b.weeks[0]?.id ?? ""); }}>{b.title}</button>)}</div>}
    </div>
    {data.available === false && <div className="varsel"><b className="undertittel">Fysisk plan er ikke aktivert</b><p className="forklar">Datagrunnlaget for denne modulen må etableres før blokker og økter kan lagres.</p></div>}
    {melding && <div className="varsel advarsel" role="alert"><p className="forklar">{melding}</p></div>}
    {blokk?.changedAfterPublish && <div className="varsel"><b className="undertittel">Endret etter publisering</b><p className="forklar">{spillerNavn.split(" ")[0]} ser fortsatt versjonen fra {blokk.publishedAt ? kort(blokk.publishedAt.slice(0, 10)) : "sist publisering"} til du publiserer.</p></div>}
    {blokk?.conflicts.map((c) => <div key={c.id} className="konflikt"><TriangleAlert className="ikon" aria-hidden /><span><b>{c.title}</b><span className="kilde">{[c.date ? kort(c.date) : null, c.details].filter(Boolean).join(" · ") || "Workbench foreslår lettere økt. Ingenting er sperret."}</span></span></div>)}

    {!blokk ? <div className="kort dempet"><b className="undertittel">Ingen fysisk plan ennå</b><p className="forklar">Lag en blokk med uker og økter. Øktene publiseres til spillerens Plan og I dag.</p><div className="knapper"><button type="button" className="knapp pri" disabled={!actions.opprettFysiskBlokk} onClick={() => setNyBlokk(true)}>Ny blokk</button></div></div>
      : <div className="to-del bred-v">
        <div>
          <section className="kort" aria-label="Blokken">
            <div className="hoved"><strong>{ukeMin ? formaterVarighet(ukeMin) : "—"}</strong><span className="forklar">fysisk {uke ? uke.label.toLowerCase() : "denne uka"} · {uke?.sessions.length ?? 0} {uke?.sessions.length === 1 ? "økt" : "økter"}</span></div>
            <div className="blokk-fakta">
              <div><b>{blokk.weeks.length} uker</b><span>{spenn(blokk.startDate, blokk.endDate)}</span></div>
              <div><b>{alleOkter.length}</b><span>økter i blokken</span></div>
              <div><b>{kg(Math.round(alleOkter.reduce((s, o) => s + o.actualTonnageKg, 0)))}</b><span>tonnasje gjennomført</span></div>
              <div><b style={{ fontSize: 15 }}>{blokk.focus ?? "—"}</b><span>fokus</span></div>
            </div>
            <div className="ukevolum" role="group" aria-label="Ukevolum i minutter">
              {blokk.weeks.map((w) => <button key={w.id} type="button" aria-pressed={uke?.id === w.id} aria-label={`${w.label}: ${w.plannedMinutes != null ? `${w.plannedMinutes} min planlagt` : "ingen plan"}`} onClick={() => { setUkeId(w.id); setValgtId(w.sessions[0]?.id ?? null); }}>
                <i style={{ height: `${Math.max(2, ((w.plannedMinutes ?? 0) / maksVolum) * 80)}px` }} /><span>{w.label.replace("Uke ", "")}</span>
              </button>)}
            </div>
            <p className="kilde">Ukevolum i minutter, planlagt. Trykk en uke for å se øktene.</p>
          </section>

          {uke && <section className="seksjon" aria-label={`${uke.label} · fysiske økter`}>
            <div className="sek-topp"><h2>{uke.label}</h2><span className="kilde">Dra en økt til en annen dag, eller flytt</span></div>
            <div className="dagrad">{DAGNAVN.map((d, i) => {
              const dato = pluss(uke.weekStart, i);
              const her = uke.sessions.filter((s) => s.date === dato);
              return <div key={d} data-over={over === dato ? "" : undefined} onDragOver={(e) => { if (dra) { e.preventDefault(); setOver(dato); } }} onDragLeave={() => setOver((o) => (o === dato ? null : o))} onDrop={(e) => { e.preventDefault(); setOver(null); if (dra) flyttTil(dra, dato); setDra(null); }}>
                <b className="d">{d} {dato.slice(8, 10)}</b>
                <div className="okter">{her.length === 0 ? <span className="kilde" style={{ paddingTop: 12 }}>—</span> : her.map((s) => <button key={s.id} type="button" className={`fys-okt${s.status === "DRAFT" ? " utkast" : ""}`} aria-pressed={valgt?.id === s.id} draggable={!!actions.flyttFysiskOkt} onDragStart={() => setDra(s.id)} onDragEnd={() => { setDra(null); setOver(null); }} onClick={() => setValgtId(s.id)}>
                  <b>{s.title}</b><span>{s.startMinute != null ? `${klokke(s.startMinute)} · ` : ""}{s.durationMinutes != null ? `${s.durationMinutes} min` : "—"}</span>
                </button>)}</div>
              </div>;
            })}</div>
            <div className="knapper"><button type="button" className="knapp sek" disabled={!actions.opprettFysiskOkt} onClick={() => { setOf((f) => ({ ...f, date: uke.weekStart })); setNyOkt(true); }}>Legg til økt</button></div>
          </section>}
        </div>
        <div>
          {valgt ? <div className="inspektor">
            <div className="sek-topp"><b className="undertittel">{valgt.title}</b><Status status={valgt.status} /></div>
            <span className="kilde">{dagKort(valgt.date)}{valgt.startMinute != null ? ` · ${klokke(valgt.startMinute)}` : ""} · {TYPE[valgt.type] ?? valgt.type}{valgt.durationMinutes != null ? ` · ${valgt.durationMinutes} min` : ""}</span>
            {valgt.exercises.length === 0 ? <p className="kilde">Ingen øvelser lagt inn.</p> : <div className="ovelser">{valgt.exercises.map((e) => <div key={e.id} className="ovelse-rad">
              <b>{e.title}</b><span className="dose">{e.setsTarget ?? "—"} × {e.repsMin == null ? "—" : e.repsMax && e.repsMax !== e.repsMin ? `${e.repsMin}–${e.repsMax}` : e.repsMin}{e.weightKg != null ? ` @ ${e.weightKg} kg` : ""}{e.rirTarget != null ? ` · RIR ${e.rirTarget}` : ""}</span>
              <span className="faktisk"><span>Tonnasje {kg(e.actualTonnageKg)}</span>{e.logs.length > 0 && <span className="ok">{e.logs.length} {e.logs.length === 1 ? "serie" : "serier"} logget</span>}</span>
            </div>)}</div>}
            <div className="blokk-fakta">
              <div><b>{valgt.perceivedEffort != null ? valgt.perceivedEffort : "—"}</b><span>hvor tungt (1–10)</span></div>
              <div><b>{valgt.readiness != null ? `${valgt.readiness}/5` : "—"}</b><span>dagsform</span></div>
              <div><b>{valgt.actualLoad ?? valgt.calculatedLoad ?? "—"}</b><span>belastning{valgt.plannedLoad != null ? ` · planlagt ${valgt.plannedLoad}` : ""}</span></div>
              <div><b>{kg(valgt.actualTonnageKg)}</b><span>tonnasje</span></div>
            </div>
            {valgt.playerNote && <p className="forklar">Respons fra {spillerNavn.split(" ")[0]}: «{valgt.playerNote}»</p>}
            {actions.flyttFysiskOkt && <div className="knapper"><button type="button" className="knapp sek" onClick={() => setFlytt(valgt)}><Move className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Flytt økt</button></div>}
          </div> : <div className="inspektor"><p className="kilde">Velg en økt i uka.</p></div>}
          <p className="kilde">{blokk.publishedAt ? `Publisert ${kort(blokk.publishedAt.slice(0, 10))}.` : "Ikke publisert ennå."} Øktene ligger i spillerens plan etter publisering.</p>
        </div>
      </div>}

    {nyBlokk && <Ark tittel="Ny fysisk blokk" dato={`Fysisk plan · ${spillerNavn}`} onLukk={() => setNyBlokk(false)}>
      <label className="felt">Navn<input value={bf.title} onChange={(e) => setBf((f) => ({ ...f, title: e.target.value }))} /></label>
      <label className="felt">Fokus<input value={bf.focus} onChange={(e) => setBf((f) => ({ ...f, focus: e.target.value }))} placeholder="Maksstyrke underkropp" /></label>
      <div className="to-del" style={{ gap: "var(--r2)" }}>
        <label className="felt">Fra<input type="date" value={bf.startDate} onChange={(e) => setBf((f) => ({ ...f, startDate: e.target.value }))} /></label>
        <label className="felt">Til<input type="date" value={bf.endDate} onChange={(e) => setBf((f) => ({ ...f, endDate: e.target.value }))} /></label>
      </div>
      <p className="kilde">Blokken lagres som utkast. Spilleren ser den etter publisering.</p>
      <button type="button" className="knapp pri stor" disabled={pending || !bf.title.trim()} onClick={() => actions.opprettFysiskBlokk && kjor(() => actions.opprettFysiskBlokk!({ playerId, ...bf, focus: bf.focus || null }), () => setNyBlokk(false))}>Legg til som utkast</button>
    </Ark>}
    {nyOkt && blokk && uke && <Ark tittel="Ny fysisk økt" dato={`${uke.label} · ${blokk.title}`} onLukk={() => setNyOkt(false)}>
      <label className="felt">Navn<input value={of.title} onChange={(e) => setOf((f) => ({ ...f, title: e.target.value }))} placeholder="Underkropp A" /></label>
      <div className="felt"><span className="etikett">Type</span><div className="chips" role="group" aria-label="Type">{(Object.keys(TYPE) as (keyof typeof TYPE)[]).map((t) => <button key={t} type="button" aria-pressed={of.type === t} onClick={() => setOf((f) => ({ ...f, type: t as typeof f.type }))}>{TYPE[t]}</button>)}</div></div>
      <div className="to-del" style={{ gap: "var(--r2)" }}>
        <label className="felt">Dato<input type="date" value={of.date} min={uke.weekStart} max={pluss(uke.weekStart, 6)} onChange={(e) => setOf((f) => ({ ...f, date: e.target.value }))} /></label>
        <label className="felt">Varighet (min)<input type="number" min={5} max={300} inputMode="numeric" value={of.durationMinutes} onChange={(e) => setOf((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} /></label>
      </div>
      <label className="felt">Første øvelse<input value={of.exerciseTitle} onChange={(e) => setOf((f) => ({ ...f, exerciseTitle: e.target.value }))} placeholder="Markløft trapbar" /></label>
      <button type="button" className="knapp pri stor" disabled={pending || !of.title.trim()} onClick={() => actions.opprettFysiskOkt && kjor(() => actions.opprettFysiskOkt!({ blockId: blokk.id, weekId: uke.id, date: of.date, title: of.title.trim(), type: of.type, durationMinutes: of.durationMinutes, exerciseTitle: of.exerciseTitle.trim() || null }), () => setNyOkt(false))}>Legg til økt</button>
    </Ark>}
    {flytt && uke && <Ark tittel="Flytt fysisk økt" dato={flytt.title} onLukk={() => setFlytt(null)}>
      <div className="liste">{DAGNAVN.map((d, i) => {
        const dato = pluss(uke.weekStart, i);
        return <button key={d} type="button" disabled={flytt.date === dato || pending} onClick={() => { const id = flytt.id; setFlytt(null); flyttTil(id, dato); }}>
          <span className="ikonboks mono">{dato.slice(8, 10)}</span><span><b>{d} {kort(dato)}</b><span className="kilde">{uke.sessions.filter((s) => s.date === dato).length} fysiske økter</span></span><ChevronRight className="ikon" aria-hidden />
        </button>;
      })}</div>
      <p className="kilde">Spilleren ser endringen når planen publiseres.</p>
    </Ark>}
  </div>;
}

/* =============== AG-WB-TURN · Turneringer =============== */

export function AG11TurneringNy({ playerId, spillerNavn, data, actions }: { playerId: string; spillerNavn: string; data: WorkbenchFysTurneringData; actions: FysTurnHandlinger }) {
  const { pending, melding, kjor } = useKjor();
  const idag = osloIdag();
  const planer = useMemo(() => [...data.tournamentPlans].sort((a, b) => a.startDate.localeCompare(b.startDate)), [data.tournamentPlans]);
  const neste = planer.find((p) => p.endDate >= idag) ?? planer[0] ?? null;
  const [valgtId, setValgtId] = useState(neste?.id ?? "");
  const plan: WorkbenchTournamentPlanDto | null = planer.find((p) => p.id === valgtId) ?? neste;
  const [ny, setNy] = useState(false);
  const [rediger, setRediger] = useState(false);
  const fornavn = spillerNavn.split(" ")[0] ?? spillerNavn;
  const konflikter = [...data.openConflicts, ...(plan?.conflicts ?? [])];
  const medScore = planer.filter((p) => p.rounds.some((r) => r.grossScore != null)).slice(-4).reverse();
  const forberedelser = plan ? [...plan.preparations].sort((a, b) => a.date.localeCompare(b.date)) : [];

  return <div className="agn-s">
    <div className="topp">
      <Tilbake playerId={playerId} spillerNavn={spillerNavn} />
      <div className="topp-rad">
        <div><div className="dato">{spillerNavn} · turneringer</div><h1 className="tittel">Turneringer</h1></div>
        <div className="knapper">
          <button type="button" className="knapp sek" disabled={data.available === false} onClick={() => setNy(true)}>Ny turneringsplan</button>
          {plan && plan.status !== "PUBLISHED" && actions.publiserTurneringsplan && <button type="button" className="knapp pri" disabled={pending} onClick={() => kjor(() => actions.publiserTurneringsplan!({ id: plan.id }))}>Publiser til {fornavn}</button>}
        </div>
      </div>
    </div>
    {data.available === false && <div className="varsel"><b className="undertittel">Turneringsplan er ikke aktivert</b><p className="forklar">Datagrunnlaget for denne modulen må etableres før turneringsplaner kan lagres.</p></div>}
    {melding && <div className="varsel advarsel" role="alert"><p className="forklar">{melding}</p></div>}
    {konflikter.map((c) => <div key={c.id} className="konflikt"><TriangleAlert className="ikon" aria-hidden /><span><b>{c.title}</b><span className="kilde">{[c.date ? kort(c.date) : null, c.details].filter(Boolean).join(" · ") || "Workbench foreslår lettere økt."} Ingenting er sperret.</span>{c.date && <Link className="lenke" href={`/admin/workbench/${playerId}?uke=${c.date}`}>Åpne uka</Link>}</span></div>)}

    {!plan ? <div className="kort dempet"><b className="undertittel">Ingen turneringsplan ennå</b><p className="forklar">Lag en plan med reise, runder, mål og strategi. Resultatet føres etterpå, brutto.</p><div className="knapper"><button type="button" className="knapp pri" disabled={data.available === false} onClick={() => setNy(true)}>Ny turneringsplan</button></div></div>
      : <div className="to-del">
        <div>
          <div className="turn-helt"><div className="tt">
            <span className="merke">{[plan.tour, plan.format].filter(Boolean).join(" · ") || "Turnering"}</span>
            <b className="n">{plan.title}</b>
            <span>{spenn(plan.startDate, plan.endDate)}{plan.location ? ` · ${plan.location}` : ""}</span>
            <span>{plan.travelStartDate ? `Reise ${spenn(plan.travelStartDate, plan.travelEndDate ?? plan.travelStartDate)}` : "Ingen reise registrert"}{plan.tournamentEntryId ? " · påmeldt fra turneringsdataene" : ""}</span>
            <div className="status-linje"><Status status={plan.status} /><span style={{ fontSize: 13 }}>{FOKUS[plan.focus] ?? plan.focus}</span></div>
          </div></div>
          {planer.length > 1 && <section className="seksjon" aria-label="Turneringer i perioden">
            <div className="sek-topp"><h2>Alle turneringer</h2><span className="kilde">{planer.length}</span></div>
            <div className="turn-liste">{planer.map((p) => <button key={p.id} type="button" className="turn-rad" aria-pressed={p.id === plan.id} onClick={() => setValgtId(p.id)}><i className="akse-prikk a-turn" aria-hidden /><span><b>{p.title}</b><span className="kilde">{spenn(p.startDate, p.endDate)} · {p.rounds.length} runder</span></span><Status status={p.status} /></button>)}</div>
          </section>}
          <section className="seksjon" aria-label="Forberedelse">
            <div className="sek-topp"><h2>Forberedelse</h2>{plan.editable !== false && <button type="button" className="knapp sek" onClick={() => setRediger(true)}>Rediger planen</button>}</div>
            {forberedelser.length === 0 && plan.rounds.length === 0 ? <p className="kilde">Ingen forberedelser eller runder lagt inn.</p> : <div className="forbered">
              {forberedelser.map((f) => <div key={f.id} className="forb-dag"><b>{dagKort(f.date)}</b><div className="okt mini spill" style={{ cursor: "default" }}><div className="okt-tekst"><span className="navn">{f.title}</span><span className="okt-info"><span>{f.category}{f.completedAt ? " · gjort" : ""}</span></span></div></div></div>)}
              {plan.rounds.map((r) => <div key={r.id} className="forb-dag"><b>{dagKort(r.date)}</b><div className="okt mini turn" style={{ cursor: "default" }}><div className="okt-tekst"><span className="navn">Runde {r.roundNumber}{r.teeTimeMinutes != null ? ` · start ${klokke(r.teeTimeMinutes)}` : ""}</span><span className="okt-info"><span>{r.startHole ? `Hull ${r.startHole}` : "—"}{r.grossScore != null ? ` · ${r.grossScore} brutto` : ""}</span></span></div></div></div>)}
            </div>}
          </section>
        </div>
        <div>
          <section className="seksjon" aria-label="Mål og strategi">
            <div className="sek-topp"><h2>Mål og strategi</h2></div>
            <div className="kort dempet">
              {plan.goals.length === 0 && !plan.rounds.some((r) => r.gamePlan || r.routine) && !plan.notes ? <p className="forklar">Ingen mål eller strategi lagt inn.</p> : <>
                {plan.goals.map((g) => <p key={g.id} className="forklar"><b>{g.kind === "PROSESS" ? "Prosessmål" : g.kind === "RESULTAT" ? "Resultatmål" : g.kind}:</b> {g.title}{g.targetValue != null ? ` · ${g.targetValue}${g.unit ? ` ${g.unit}` : ""}` : ""}</p>)}
                {plan.rounds.filter((r) => r.gamePlan || r.routine).map((r) => <p key={r.id} className="forklar"><b>Runde {r.roundNumber}:</b> {[r.routine, r.gamePlan].filter(Boolean).join(" · ")}</p>)}
                {plan.notes && <p className="forklar">{plan.notes}</p>}
              </>}
            </div>
          </section>
          <section className="seksjon" aria-label="Etter turneringen">
            <div className="sek-topp"><h2>Etter turneringen</h2><span className="kilde">Fra turneringsplanene</span></div>
            {medScore.length === 0 ? <p className="kilde">Ingen runder med score ennå.</p> : <div>{medScore.map((p) => {
              const brutto = p.rounds.map((r) => r.grossScore).filter((v): v is number => v != null);
              return <div key={p.id} className="resultat"><Avatar navn={String(p.rounds.length)} liten lys /><span><b>{p.title}</b><span className="kilde">{kort(p.startDate)} · {brutto.join(", ")}{p.latestEvaluation?.summary ? ` · ${p.latestEvaluation.summary}` : ""}</span></span><b className="s">{brutto.reduce((a, b) => a + b, 0)}</b></div>;
            })}</div>}
            <p className="kilde">Brutto score. {plan.latestEvaluation?.source ? `Kilde: ${plan.latestEvaluation.source}.` : "Fra rundene i turneringsplanen."}</p>
          </section>
        </div>
      </div>}

    {ny && <WorkbenchTurneringsplanArk playerId={playerId} dato={idag} onLukk={() => setNy(false)} />}
    {rediger && plan && <WorkbenchTurneringsplanArk key={plan.id} playerId={playerId} dato={idag} plan={plan} onLukk={() => setRediger(false)} />}
  </div>;
}
