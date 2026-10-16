"use client";

/**
 * AG-WB-FYS (fysisk plan) og AG-WB-TURN (turneringer) i coachens Workbench,
 * Precision Athletics. Tegning: Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-WB-FYS.jsx og AG-WB-TURN.jsx.
 *
 * Samme data (loadFysTurneringWorkbenchData) og samme seks server-handlinger som
 * WorkbenchFysTurnering hadde: opprett/publiser fysisk blokk, opprett/flytt
 * fysisk økt, opprett/publiser turneringsplan. Visningen er ny.
 *
 * Det tegningen har uten grunnlag i koden vises ikke (Parkert i PR-en):
 * trekk tilbake, progresjon, kopier uke, legg til øvelse, ACWR og dagsform,
 * historikk, gruppemodus, «lagre delvis», og redigering av forberedelser,
 * mål og strategi i turneringsplanen.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Dumbbell, Move, Plus, Send, Trophy } from "lucide-react";
import { Ikon, Knapp, KnappLenke, TomTilstand } from "@/components/precision/pa";
import { Ark, Nokkelverdi, Side, SideHode, Tabell } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Caps, Listerad, Valgpille, akseStil } from "@/components/precision/pa-workbench";
import { WorkbenchTurneringsplanArk } from "@/components/workbench/WorkbenchTurneringsplanArk";
import type { WorkbenchFysTurneringData, WorkbenchPhysicalSessionDto, WorkbenchTournamentPlanDto } from "@/lib/workbench/fys-turnering-data";
import { workbenchUrl, type WorkbenchSurface } from "@/lib/workbench/visning-url";
import { dagOgDato, klokke } from "./AG11Ark";
import "@/styles/precision-a4.css";
import "@/styles/precision-a9.css";

type Svar = Promise<{ ok: boolean; error?: string }>;
export type FysTurnHandlinger = {
  opprettFysiskBlokk?: (input: { playerId: string; title: string; startDate: string; endDate: string; focus?: string | null }) => Promise<{ ok: boolean; blockId?: string; error?: string }>;
  opprettFysiskOkt?: (input: { blockId: string; weekId: string; date: string; title: string; type?: "STYRKE" | "KONDISJON" | "MOBILITET" | "TEST"; durationMinutes?: number | null; exerciseTitle?: string | null }) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
  flyttFysiskOkt?: (input: { sessionId: string; date: string }) => Svar;
  publiserFysiskBlokk?: (input: { id: string }) => Svar;
  opprettTurneringsplan?: (input: { playerId: string; title: string; startDate: string; endDate: string; travelStartDate?: string | null; travelEndDate?: string | null; focus?: "TRENING" | "UTVIKLING" | "PRESTASJON" }) => Promise<{ ok: boolean; planId?: string; error?: string }>;
  publiserTurneringsplan?: (input: { id: string }) => Svar;
};

const STATUS: Record<string, string> = {
  DRAFT: "Utkast", PUBLISHED: "Publisert", CHANGED_AFTER_PUBLISH: "Endret etter publisering", WITHDRAWN: "Trukket tilbake", COMPLETED: "Fullført", ARCHIVED: "Arkivert",
};
const TYPE: Record<string, string> = { STYRKE: "Styrke", KONDISJON: "Kondisjon", MOBILITET: "Mobilitet", TEST: "Test" };
const FOKUS: Record<string, string> = { TRENING: "Trening", UTVIKLING: "Utvikling", PRESTASJON: "Prestasjon" };
const DAGNAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const ddmm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
const spenn = (a: string, b: string) => (a === b ? ddmm(a) : `${ddmm(a)}–${ddmm(b)}`);
const kg = (v: number | null | undefined) => (v == null || v === 0 ? "—" : `${Math.round(v).toLocaleString("nb-NO")} kg`);
const pluss = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
const osloIdag = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());

function Status({ status }: { status: string }) {
  const tone = status === "PUBLISHED" ? "pa-status--ok" : status === "CHANGED_AFTER_PUBLISH" ? "pa-status--warn" : "";
  return <span className={`pa-status ${tone}`}><span className="pa-status__dot" />{STATUS[status] ?? status}</span>;
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="a9-felt">{label}{children}</label>;
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

function Tilbake({ playerId, routeSurface }: { playerId: string; routeSurface: WorkbenchSurface }) {
  return <KnappLenke variant="ghost" size="sm" icon={ArrowLeft} href={workbenchUrl(playerId, "uke", {}, routeSurface)}>Workbench</KnappLenke>;
}

/* =============== AG-WB-FYS · Fysisk plan =============== */

export function AG11Fysisk({ playerId, spillerNavn, data, actions, routeSurface = "agency" }: { playerId: string; spillerNavn: string; data: WorkbenchFysTurneringData; actions: FysTurnHandlinger; routeSurface?: WorkbenchSurface }) {
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
  const [over, setOver] = useState<number | null>(null);
  const [dra, setDra] = useState<string | null>(null);
  const seksUker = pluss(idag, 41);
  const [bf, setBf] = useState({ title: "Fysisk blokk", startDate: idag, endDate: seksUker, focus: "" });
  const [of, setOf] = useState({ title: "", type: "STYRKE" as "STYRKE" | "KONDISJON" | "MOBILITET" | "TEST", date: uke?.weekStart ?? idag, durationMinutes: 45, exerciseTitle: "" });
  const alleOkter = useMemo(() => (blokk ? blokk.weeks.flatMap((w) => w.sessions) : []), [blokk]);
  const planMin = alleOkter.reduce((s, o) => s + (o.durationMinutes ?? 0), 0);
  const tonnasje = Math.round(alleOkter.reduce((s, o) => s + o.actualTonnageKg, 0));

  const flyttTil = (sessionId: string, dato: string) => { if (actions.flyttFysiskOkt) kjor(() => actions.flyttFysiskOkt!({ sessionId, date: dato })); };

  const hode = <SideHode kicker={`Workbench · Fysisk plan · ${spillerNavn}`} title="Fysisk plan"
    sub={blokk ? <span className="a9-rad"><Status status={blokk.changedAfterPublish ? "CHANGED_AFTER_PUBLISH" : blokk.status} /><span>{spenn(blokk.startDate, blokk.endDate)}</span></span> : undefined}
    actions={<>
      <Tilbake playerId={playerId} routeSurface={routeSurface} />
      <Knapp variant="secondary" icon={Plus} disabled={!actions.opprettFysiskBlokk} onClick={() => setNyBlokk(true)}>Legg til fysisk blokk</Knapp>
      {blokk && blokk.status !== "PUBLISHED" && actions.publiserFysiskBlokk && <Knapp icon={Send} disabled={pending} onClick={() => kjor(() => actions.publiserFysiskBlokk!({ id: blokk.id }))}>Publiser til spiller</Knapp>}
    </>} />;

  return <Side max={1440}><div className="a9">
    {hode}
    {data.available === false && <InlineVarsel tone="info" tittel="Fysisk plan er ikke aktivert">Datagrunnlaget for denne modulen må etableres før blokker og økter kan lagres.</InlineVarsel>}
    {melding && <InlineVarsel tone="warn">{melding}</InlineVarsel>}
    {!blokk ? <TomTilstand icon={Dumbbell} title="Ingen fysisk plan ennå" text="Lag en blokk med uker og økter. Øktene publiseres til spillerens Plan og I dag."
      actions={<Knapp icon={Plus} disabled={!actions.opprettFysiskBlokk} onClick={() => setNyBlokk(true)}>Legg til fysisk blokk</Knapp>} /> : <>
      {blokker.length > 1 && <div role="tablist" aria-label="Blokker" className="a9-faner">{blokker.map((b) => <Valgpille key={b.id} rolle="tab" valgt={b.id === blokk.id} onClick={() => { setBlokkId(b.id); setUkeId(b.weeks[0]?.id ?? ""); }}>{`${b.title} · ${spenn(b.startDate, b.endDate)}`}</Valgpille>)}</div>}
      {blokk.changedAfterPublish && <InlineVarsel tone="warn" tittel="Endret etter publisering">Spilleren ser forrige publiserte versjon. Publiser på nytt for å sende endringene.</InlineVarsel>}
      {blokk.conflicts.map((c) => <InlineVarsel key={c.id} tone="warn" tittel={c.title}>{[c.date ? ddmm(c.date) : null, c.details].filter(Boolean).join(" · ") || "—"}</InlineVarsel>)}
      <div className="a9-to">
        <section className="pa-card a9-kort" aria-label="Blokk">
          <span className="kicker">Blokk</span>
          <Nokkelverdi items={[
            ["Navn", blokk.title],
            ["Periode", `${spenn(blokk.startDate, blokk.endDate)} · ${blokk.weeks.length} uker`, { mono: true }],
            ["Fokus", blokk.focus ?? "—"],
            ["Økter", String(alleOkter.length), { mono: true }],
            ["Planlagt", planMin ? `${planMin} min` : "—", { mono: true }],
            ["Tonnasje gjennomført", kg(tonnasje), { mono: true }],
            ["Notat", blokk.notes ?? "—"],
          ]} />
        </section>
        <section className="pa-card a9-kort" aria-label="Ukevolum">
          <span className="kicker">Ukevolum · plan og gjennomført</span>
          <Tabell caption="Ukevolum" selectedId={uke?.id ?? null} onSelect={(id) => setUkeId(id)} tomTekst="Ingen uker i blokken."
            columns={[
              { key: "u", label: "Uke", mono: true, render: (w) => w.label },
              { key: "p", label: "Plan", mono: true, align: "right", render: (w) => (w.plannedMinutes != null ? `${w.plannedMinutes} min` : "—") },
              { key: "t", label: "Tonnasje", mono: true, align: "right", render: (w) => kg(w.targetTonnageKg) },
              { key: "f", label: "Faktisk tonnasje", mono: true, align: "right", render: (w) => kg(w.actualTonnageKg) },
            ]}
            rows={blokk.weeks} />
        </section>
      </div>
      {uke && <div className="a9-hoved a9-hoved--sidefelt">
        <section className="pa-card a9-kort" aria-label={`${uke.label} · fysiske økter`}>
          <div className="a9-kort__hode"><span className="a9-kort__tittel">{uke.label} · {uke.sessions.length} fysiske økter</span><Caps>DRA ØKT TIL NY DAG · ELLER FLYTT</Caps></div>
          <div className="a9-ukekort">
            {DAGNAVN.map((d, i) => {
              const dato = pluss(uke.weekStart, i);
              const her = uke.sessions.filter((s) => s.date === dato);
              return <div key={d} className="a9-ukeboks" data-over={over === i || undefined}
                onDragOver={(e) => { if (dra) { e.preventDefault(); setOver(i); } }} onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); setOver(null); if (dra) flyttTil(dra, dato); setDra(null); }}>
                <span className="a9-caps">{d.toUpperCase()} {ddmm(dato)}</span>
                {her.length === 0 ? <span className="a9-caps">—</span> : her.map((s) => <div key={s.id} className="a9-okt-rad" draggable={!!actions.flyttFysiskOkt} onDragStart={() => setDra(s.id)} onDragEnd={() => setDra(null)}>
                  <button type="button" className="a9-okt" style={akseStil("fys")} aria-pressed={valgt?.id === s.id} onClick={() => setValgtId(s.id)}>
                    <span className="a9-okt__tid">{s.startMinute != null ? `${klokke(s.startMinute)} · ` : ""}{s.durationMinutes != null ? `${s.durationMinutes} MIN` : "—"}</span>
                    <span className="a9-okt__tittel">{s.title}</span>
                  </button>
                  {actions.flyttFysiskOkt && <button type="button" className="a9-greip" aria-label={`Flytt ${s.title}`} onClick={() => setFlytt(s)}><Ikon icon={Move} size={18} /></button>}
                </div>)}
              </div>;
            })}
          </div>
          <div className="a9-rad"><Knapp variant="secondary" size="sm" icon={Plus} disabled={!actions.opprettFysiskOkt} onClick={() => { setOf((f) => ({ ...f, date: uke.weekStart })); setNyOkt(true); }}>Legg til økt</Knapp></div>
          <Caps>ØKTENE LIGGER I SPILLERENS PLAN ETTER PUBLISERING</Caps>
        </section>
        {valgt ? <section className="pa-card a9-kort a9-sidefelt" aria-label="Valgt økt">
          <div className="a9-kort__hode"><span className="kicker">Økt · {dagOgDato(valgt.date)}{valgt.startMinute != null ? ` · ${klokke(valgt.startMinute)}` : ""}</span><span className="pa-status"><span className="pa-status__dot" />{TYPE[valgt.type] ?? valgt.type}</span></div>
          <span className="a9-kort__tittel">{valgt.title}</span>
          <Caps>{`FRA BLOKK «${blokk.title}» · ${uke.label}`.toUpperCase()}</Caps>
          {valgt.exercises.length === 0 ? <Caps>INGEN ØVELSER</Caps> : <Tabell caption="Øvelser" columns={[
            { key: "n", label: "Øvelse", render: (e) => e.title },
            { key: "s", label: "Serier", mono: true, align: "right", render: (e) => (e.setsTarget ?? "—") },
            { key: "r", label: "Reps", mono: true, align: "right", render: (e) => (e.repsMin == null ? "—" : e.repsMax && e.repsMax !== e.repsMin ? `${e.repsMin}–${e.repsMax}` : e.repsMin) },
            { key: "k", label: "Kg", mono: true, align: "right", render: (e) => (e.weightKg ?? "—") },
            { key: "rir", label: "RIR", mono: true, align: "right", render: (e) => (e.rirTarget ?? "—") },
            { key: "t", label: "Tonnasje", mono: true, align: "right", render: (e) => kg(e.actualTonnageKg) },
          ]} rows={valgt.exercises} />}
          <span className="kicker">Belastning og respons</span>
          <Nokkelverdi items={[
            ["Planlagt belastning", valgt.plannedLoad != null ? String(valgt.plannedLoad) : "—", { mono: true }],
            ["Faktisk belastning", valgt.actualLoad != null ? String(valgt.actualLoad) : valgt.calculatedLoad != null ? String(valgt.calculatedLoad) : "—", { mono: true }],
            ["RPE", valgt.perceivedEffort != null ? `${valgt.perceivedEffort}/10` : "—", { mono: true }],
            ["Dagsform", valgt.readiness != null ? `${valgt.readiness}/5` : "—", { mono: true }],
            ["Tonnasje", kg(valgt.actualTonnageKg), { mono: true }],
          ]} />
          {valgt.playerNote && <p className="a9-tekst">«{valgt.playerNote}»</p>}
          {actions.flyttFysiskOkt && <Knapp variant="ghost" size="sm" icon={Move} onClick={() => setFlytt(valgt)}>Flytt økt</Knapp>}
        </section> : <section className="pa-card a9-kort a9-sidefelt"><Caps>VELG EN ØKT I UKA</Caps></section>}
      </div>}
    </>}

    {nyBlokk && <Ark open onClose={() => setNyBlokk(false)} kicker="Workbench · Fysisk plan" title="Ny fysisk blokk"
      footer={<><Knapp fullWidth icon={Check} loading={pending} onClick={() => actions.opprettFysiskBlokk && kjor(() => actions.opprettFysiskBlokk!({ playerId, ...bf, focus: bf.focus || null }), () => setNyBlokk(false))}>Legg til som utkast</Knapp><Knapp variant="ghost" fullWidth onClick={() => setNyBlokk(false)}>Avbryt</Knapp></>}>
      <div className="a9-skjema">
        <Felt label="Navn"><input value={bf.title} onChange={(e) => setBf((f) => ({ ...f, title: e.target.value }))} /></Felt>
        <Felt label="Fokus"><input value={bf.focus} onChange={(e) => setBf((f) => ({ ...f, focus: e.target.value }))} placeholder="—" /></Felt>
        <div className="a9-feltrad">
          <Felt label="Fra"><input type="date" value={bf.startDate} onChange={(e) => setBf((f) => ({ ...f, startDate: e.target.value }))} /></Felt>
          <Felt label="Til"><input type="date" value={bf.endDate} onChange={(e) => setBf((f) => ({ ...f, endDate: e.target.value }))} /></Felt>
        </div>
        <Caps>BLOKKEN LAGRES SOM UTKAST · SPILLEREN SER DEN ETTER PUBLISERING</Caps>
      </div>
    </Ark>}
    {nyOkt && blokk && uke && <Ark open onClose={() => setNyOkt(false)} kicker={`${uke.label} · ${blokk.title}`} title="Ny fysisk økt"
      footer={<><Knapp fullWidth icon={Plus} loading={pending} disabled={!of.title.trim()} onClick={() => actions.opprettFysiskOkt && kjor(() => actions.opprettFysiskOkt!({ blockId: blokk.id, weekId: uke.id, date: of.date, title: of.title.trim(), type: of.type, durationMinutes: of.durationMinutes, exerciseTitle: of.exerciseTitle.trim() || null }), () => setNyOkt(false))}>Legg til økt</Knapp><Knapp variant="ghost" fullWidth onClick={() => setNyOkt(false)}>Avbryt</Knapp></>}>
      <div className="a9-skjema">
        <Felt label="Navn"><input value={of.title} onChange={(e) => setOf((f) => ({ ...f, title: e.target.value }))} /></Felt>
        <div role="radiogroup" aria-label="Type" className="a9-rad">{(Object.keys(TYPE) as (keyof typeof TYPE)[]).map((t) => <Valgpille key={t} rolle="radio" valgt={of.type === t} onClick={() => setOf((f) => ({ ...f, type: t as typeof f.type }))}>{TYPE[t]}</Valgpille>)}</div>
        <div className="a9-feltrad">
          <Felt label="Dato"><input type="date" value={of.date} min={uke.weekStart} max={pluss(uke.weekStart, 6)} onChange={(e) => setOf((f) => ({ ...f, date: e.target.value }))} /></Felt>
          <Felt label="Varighet (min)"><input type="number" min={5} max={300} inputMode="numeric" value={of.durationMinutes} onChange={(e) => setOf((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} /></Felt>
        </div>
        <Felt label="Første øvelse"><input value={of.exerciseTitle} onChange={(e) => setOf((f) => ({ ...f, exerciseTitle: e.target.value }))} placeholder="—" /></Felt>
      </div>
    </Ark>}
    {flytt && uke && <Ark open onClose={() => setFlytt(null)} kicker={flytt.title} title="Flytt fysisk økt" footer={<Knapp variant="ghost" fullWidth onClick={() => setFlytt(null)}>Avbryt</Knapp>}>
      <div role="list" className="a9-liste">{DAGNAVN.map((d, i) => {
        const dato = pluss(uke.weekStart, i);
        return <button key={d} type="button" role="listitem" className={`a9-listerad${i ? " a9-listerad--skille" : ""}`} disabled={flytt.date === dato || pending}
          style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", width: "100%", minHeight: 48, alignItems: "center", borderTop: i ? "1px solid var(--border-hairline)" : "none", opacity: flytt.date === dato ? 0.5 : 1 }}
          onClick={() => { const id = flytt.id; setFlytt(null); flyttTil(id, dato); }}>
          <span className="a9-listerad__tittel">{d} {ddmm(dato)}</span><span className="a9-caps">{uke.sessions.filter((s) => s.date === dato).length} FYS-ØKTER</span>
        </button>;
      })}</div>
      <Caps>SPILLEREN SER ENDRINGEN NÅR PLANEN PUBLISERES</Caps>
    </Ark>}
  </div></Side>;
}

/* =============== AG-WB-TURN · Turneringer =============== */

const FANER = ["Forberedelse", "Turneringsdager", "Mål og strategi", "Etter turnering"] as const;

export function AG11Turnering({ playerId, spillerNavn, data, actions, routeSurface = "agency" }: { playerId: string; spillerNavn: string; data: WorkbenchFysTurneringData; actions: FysTurnHandlinger; routeSurface?: WorkbenchSurface }) {
  const { pending, melding, kjor } = useKjor();
  const idag = osloIdag();
  const planer = data.tournamentPlans;
  const [valgtId, setValgtId] = useState(planer[0]?.id ?? "");
  const plan: WorkbenchTournamentPlanDto | null = planer.find((p) => p.id === valgtId) ?? planer[0] ?? null;
  const [fane, setFane] = useState<(typeof FANER)[number]>("Forberedelse");
  const [ny, setNy] = useState(false);
  const [redigerPlan, setRedigerPlan] = useState(false);
  const brutto = plan?.rounds.map((r) => r.grossScore).filter((v): v is number => v != null) ?? [];
  const sg = plan?.rounds.map((r) => r.strokesGained).filter((v): v is number => v != null) ?? [];

  return <Side max={1440}><div className="a9">
    <SideHode kicker={`Workbench · Turneringer · ${spillerNavn}`} title="Turneringsplan"
      sub={plan ? <span className="a9-rad"><Status status={plan.status} /><span>{plan.title} · {spenn(plan.startDate, plan.endDate)}</span></span> : undefined}
      actions={<>
        <Tilbake playerId={playerId} routeSurface={routeSurface} />
        <Knapp variant="secondary" icon={Plus} disabled={data.available === false} onClick={() => setNy(true)}>Ny turneringsplan</Knapp>
        {plan && plan.editable !== false && <Knapp variant="secondary" onClick={() => setRedigerPlan(true)}>Rediger turneringsplan</Knapp>}
        {plan && plan.status !== "PUBLISHED" && actions.publiserTurneringsplan && <Knapp icon={Send} disabled={pending} onClick={() => kjor(() => actions.publiserTurneringsplan!({ id: plan.id }))}>Publiser til spiller</Knapp>}
      </>} />
    {data.available === false && <InlineVarsel tone="info" tittel="Turneringsplan er ikke aktivert">Datagrunnlaget for denne modulen må etableres før turneringsplaner kan lagres.</InlineVarsel>}
    {melding && <InlineVarsel tone="warn">{melding}</InlineVarsel>}
    {data.openConflicts.length > 0 && <InlineVarsel tone="warn" tittel={`${data.openConflicts.length} åpne konflikter`}>{data.openConflicts.map((c) => c.title).join(" · ")}</InlineVarsel>}
    {!plan ? <TomTilstand icon={Trophy} title="Ingen turneringsplan ennå" text="Lag en plan med reise, runder, brutto score, SG, mål og evaluering."
      actions={<Knapp icon={Plus} disabled={data.available === false} onClick={() => setNy(true)}>Ny turneringsplan</Knapp>} /> : <div className="a9-to">
      <section className="pa-card a9-kort" aria-label="Turneringer i perioden">
        <span className="kicker">Turneringer i perioden</span>
        <div role="list" className="a9-liste">{planer.map((p, i) => <button key={p.id} type="button" role="listitem" onClick={() => setValgtId(p.id)} aria-current={p.id === plan.id || undefined}
          className={`a9-listerad a9-listerad--akse${i ? " a9-listerad--skille" : ""}`} style={{ ...akseStil("turn"), cursor: "pointer", background: p.id === plan.id ? "var(--surface-flat)" : "transparent", border: 0, borderTop: i ? "1px solid var(--border-hairline)" : 0, width: "100%", textAlign: "left", font: "inherit", color: "inherit" }}>
          <span className="a9-listerad__tekst"><span className="a9-listerad__tittel">{p.title}</span><span className="a9-caps">{`${spenn(p.startDate, p.endDate)} · ${FOKUS[p.focus] ?? p.focus} · ${p.rounds.length} RUNDER`.toUpperCase()}</span></span>
          <span className="a9-listerad__verdi"><Status status={p.status} /></span>
        </button>)}</div>
      </section>
      <section className="pa-card a9-kort" aria-label={plan.title}>
        <div role="tablist" aria-label="Turneringsplan" className="a9-faner">{FANER.map((f) => <Valgpille key={f} rolle="tab" valgt={fane === f} onClick={() => setFane(f)}>{f}</Valgpille>)}</div>
        {fane === "Forberedelse" && (plan.preparations.length === 0 ? <Caps>INGEN FORBEREDELSER REGISTRERT</Caps> : <div role="list" className="a9-liste">{plan.preparations.map((p, i) => <Listerad key={p.id} forste={i === 0} tittel={p.title} under={`${dagOgDato(p.date)} · ${p.category}`.toUpperCase()} verdi={p.completedAt ? "Gjort" : "—"} />)}</div>)}
        {fane === "Turneringsdager" && <>
          <Nokkelverdi items={[
            ["Turnering", spenn(plan.startDate, plan.endDate), { mono: true }],
            ["Reise", plan.travelStartDate ? spenn(plan.travelStartDate, plan.travelEndDate ?? plan.travelStartDate) : "—", { mono: true }],
            ["Format", plan.format ?? "—"],
            ["Fokus", FOKUS[plan.focus] ?? plan.focus],
            ["Tour", plan.tour ?? "—"], ["Land", plan.country ?? "—"], ["Sted", plan.location ?? "—"],
            ["Hull per runde", plan.holes ?? "—"], ["Prioritet", plan.priority ?? "—"],
            ["Historisk WAGR Power", plan.wagrPower ?? "—"], ["WAGR kildeår", plan.wagrSourceYear ?? "—"], ["WAGR kilde", plan.wagrSource ?? "—"],
          ]} />
          {plan.rounds.length === 0 ? <Caps>INGEN RUNDER LAGT INN</Caps> : <Tabell caption="Runder og dager" columns={[
            { key: "n", label: "Runde", mono: true, render: (r) => r.roundNumber },
            { key: "d", label: "Dato", mono: true, render: (r) => dagOgDato(r.date) },
            { key: "t", label: "Start", mono: true, render: (r) => (r.teeTimeMinutes != null ? klokke(r.teeTimeMinutes) : "—") },
            { key: "h", label: "Hull", mono: true, render: (r) => r.startHole ?? "—" },
          ]} rows={plan.rounds} />}
        </>}
        {fane === "Mål og strategi" && <>
          {plan.goals.length === 0 ? <Caps>INGEN MÅL LAGT INN</Caps> : <div role="list" className="a9-liste">{plan.goals.map((g, i) => <Listerad key={g.id} forste={i === 0} tittel={g.title} under={g.kind.toUpperCase()} verdi={g.targetValue != null ? `${g.targetValue}${g.unit ? ` ${g.unit}` : ""}` : "—"} />)}</div>}
          {plan.rounds.some((r) => r.gamePlan || r.routine) && <div role="list" className="a9-liste">{plan.rounds.filter((r) => r.gamePlan || r.routine).map((r, i) => <Listerad key={r.id} forste={i === 0} tittel={`Runde ${r.roundNumber}`} under={[r.routine, r.gamePlan].filter(Boolean).join(" · ")} />)}</div>}
          {plan.notes && <p className="a9-tekst">{plan.notes}</p>}
        </>}
        {fane === "Etter turnering" && <>
          <div className="a9-tall">
            <div className="a9-tall__boks"><span className="a9-caps">BRUTTO</span><span className="a9-tall__verdi">{plan.latestEvaluation?.grossTotal ?? (brutto.length ? brutto.reduce((a, b) => a + b, 0) : "—")}</span></div>
            <div className="a9-tall__boks"><span className="a9-caps">SG</span><span className="a9-tall__verdi">{plan.latestEvaluation?.sgTotal ?? (sg.length ? Math.round(sg.reduce((a, b) => a + b, 0) * 10) / 10 : "—")}</span></div>
            <div className="a9-tall__boks"><span className="a9-caps">RUNDER MED SCORE</span><span className="a9-tall__verdi">{brutto.length} av {plan.rounds.length}</span></div>
          </div>
          {plan.latestEvaluation ? <Nokkelverdi items={[
            ["Oppsummering", plan.latestEvaluation.summary ?? "—"],
            ["Lærdom", plan.latestEvaluation.learnings ?? "—"],
            ["Neste tiltak", plan.latestEvaluation.nextAction ?? "—"],
            ["Kilde", [plan.latestEvaluation.source, plan.latestEvaluation.sourceDate ? ddmm(plan.latestEvaluation.sourceDate) : null].filter(Boolean).join(" · ") || "—"],
          ]} /> : <Caps>INGEN EVALUERING ENNÅ</Caps>}
        </>}
        {plan.conflicts.map((c) => <InlineVarsel key={c.id} tone="warn" tittel={c.title}>{c.details ?? "—"}</InlineVarsel>)}
      </section>
    </div>}

    {ny && <WorkbenchTurneringsplanArk playerId={playerId} dato={idag} onLukk={() => setNy(false)} />}
    {redigerPlan && plan && <WorkbenchTurneringsplanArk key={plan.id} playerId={playerId} dato={idag} plan={plan} onLukk={() => setRedigerPlan(false)} />}

  </div></Side>;
}
