"use client";

/**
 * AG-05 Kalender, Precision Athletics (tegninger: designsystem/precision-athletics/
 * ui_kits/agencyos/screens/AG-05.jsx og AG-kalender.jsx). Faner Uke/Måned/År/Dag
 * deler denne fila; Stall-dag og Tilgjengelighet har egne komponenter.
 *
 * - Farge betyr akse: økter får aksestripe fra `WorkbenchSession.pyramid`.
 *   Booking, turnering, test og skole er nøytrale.
 * - Turneringslaget over uka (WorkbenchTournamentPlan) med reisevarsel.
 * - Flytt: dra og slipp i ukegrafen (fra 1025 px) eller «Flytt» i arket (alle
 *   bredder). Økter flyttes direkte, spilleren varsles, og du kan angre i
 *   10 sekunder. Bookinger får et forslag om ny tid; tiden står til spilleren
 *   godtar i PlayerHQ.
 */
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Move, Plane } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, TomTilstand } from "@/components/precision/pa";
import { Ark, Nokkelverdi, Kolonner, Skjemafelt, Nedtrekk } from "@/components/precision/pa-a4";
import { AngreToast, Datofelt, Valgpille, Varsel, tidsvalg } from "@/components/precision/pa-booking";
import { ALLE_LAG, LAG_LABEL, LAG_MENY_LABEL, synlige, type KalenderAkse, type KalenderHendelse, type KalenderLag } from "@/lib/domain/kalender-lag";
import type { KalenderAarData, KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import { angreOktFlytting, flyttOktIKalender, foreslaaNyBookingtid, trekkTilbakeForslag } from "@/app/admin/kalender/flytt-actions";
import "@/styles/precision-a4.css";

const H0 = 7;
const H1 = 21;
const PXPT = 44; // høyde per time, matcher a4-week__hour
const HELDAG_H = 22;
const AKSER: KalenderAkse[] = ["fys", "tek", "slag", "spill", "turn"];

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
function tilMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
const akseStil = (a?: KalenderAkse) => (a ? ({ "--a4-akse": `var(--axis-${a})` } as React.CSSProperties) : undefined);

/** Lagfilter: hvilke kalenderlag som vises. Samme valg som før (øye-toggle i KalenderLagUkeV2). */
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

/** Filter på coach (tegningen: «Alle coacher»). Vises når vinduet har mer enn én coach. */
function CoachFilter({ coacher, valgt, sett }: { coacher: KalenderLagUkeData["coacher"]; valgt: string | null; sett: (id: string | null) => void }) {
  if (coacher.length < 2) return null;
  return (
    <div className="a4-pilrad" role="group" aria-label="Filter på coach">
      <Valgpille valgt={valgt === null} onClick={() => sett(null)}>Alle coacher</Valgpille>
      {coacher.map((c) => (
        <Valgpille key={c.id} valgt={valgt === c.id} onClick={() => sett(valgt === c.id ? null : c.id)}>{c.navn}</Valgpille>
      ))}
    </div>
  );
}

function AkseLegende() {
  return (
    <div className="a4-legend" aria-label="Forklaring">
      {AKSER.map((a) => <AkseMerke key={a} axis={a} size="sm" />)}
      <Meta>FARGE PÅ KANTEN = AKSE · BOOKING, TURNERING, TEST OG SKOLE ER NØYTRALE</Meta>
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

/* ---------- Turneringslaget og reisevarsler ---------- */

function Turneringslag({ data }: { data: KalenderLagUkeData }) {
  const lag = data.turneringslag;
  const harNoe = lag.dager.some((d) => d.length > 0);
  if (!harNoe && lag.varsler.length === 0) return null;
  const mandag = data.dager[0];
  return (
    <section aria-label="Turneringslag" style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      {harNoe && (
        <div className="a4-turn">
          <span className="a4-turn__etikett a4-meta" aria-hidden>TURN</span>
          {data.dager.map((d, i) => {
            const celler = lag.dager[i] ?? [];
            const forste = celler[0];
            return (
              <div key={d} className="a4-turn__celle" data-type={forste?.type}>
                <Meta>{ukedagKort(d)} {dagMnd(d)}</Meta>
                <span className="a4-turn__tekst">
                  {forste ? `${forste.type === "REISE" ? "Reise: " : ""}${forste.tittel} · ${forste.spiller}` : "—"}
                  {celler.length > 1 ? ` · +${celler.length - 1}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {lag.varsler.map((v) => (
        <Varsel
          key={`${v.planId}-${v.dato}`}
          tone="warn"
          tittel={`Reisedag ${ukedagKort(v.dato).toLowerCase()} ${dagMnd(v.dato)} for ${v.spiller}`}
          handling={<KnappLenke href={`/admin/workbench/${v.spillerId}${mandag ? `?uke=${mandag}` : ""}`} variant="secondary" size="sm" icon={Plane} iconName="plane">Åpne Workbench</KnappLenke>}
        >
          {v.okter.length ? `${v.okter.join(", ")} ligger på reisedagen (${v.turnering}).` : `Reise til ${v.turnering}. Ingen økter lagt på dagen.`}
        </Varsel>
      ))}
      {harNoe && (
        <div className="a4-legend">
          <span className="a4-legend__swatch"><span className="a4-legend__box" style={{ background: "var(--axis-turn-soft)", boxShadow: "inset 3px 0 0 var(--axis-turn)" }} /><Meta>TURNERING</Meta></span>
          <span className="a4-legend__swatch"><span className="a4-legend__box" style={{ border: "1px dashed var(--border-strong)" }} /><Meta>REISE</Meta></span>
        </div>
      )}
    </section>
  );
}

/* ---------- Ark: hendelse og flytt ---------- */

type Flyttvalg = { ev: KalenderHendelse; dato: string; tid: string };

function EventSheet({ ev, onClose, onFlytt, onTrekkTilbake, pending }: {
  ev: KalenderHendelse | null; onClose: () => void; onFlytt: (ev: KalenderHendelse) => void; onTrekkTilbake: (ev: KalenderHendelse) => void; pending: boolean;
}) {
  const f = ev?.flytt;
  const kanFlytte = !!f && (f.type === "okt" || (f.type === "booking" && f.harSpiller && !f.foreslaatt));
  return (
    <Ark
      open={!!ev}
      onClose={onClose}
      kicker={ev ? `${LAG_LABEL[ev.lag]} · ${ukedagKort(ev.dato)} ${dagMnd(ev.dato)}` : ""}
      title={ev?.tittel}
      footer={ev && (
        <>
          {kanFlytte && <Knapp fullWidth icon={Move} iconName="move" onClick={() => onFlytt(ev)}>{f?.type === "booking" ? "Foreslå ny tid" : "Flytt økt"}</Knapp>}
          {f?.type === "booking" && f.foreslaatt && (
            <Knapp fullWidth variant="secondary" disabled={pending} onClick={() => onTrekkTilbake(ev)}>Trekk tilbake forslaget</Knapp>
          )}
          {ev.href && <KnappLenke href={ev.href} fullWidth variant="secondary">Åpne</KnappLenke>}
          <Knapp fullWidth variant="ghost" onClick={onClose}>Lukk</Knapp>
        </>
      )}
    >
      {ev && (
        <>
          {ev.akse && <div><AkseMerke axis={ev.akse} /></div>}
          <Nokkelverdi items={[
            ["Type", LAG_LABEL[ev.lag], {}],
            ["Dato", dagMnd(ev.dato), { mono: true }],
            ["Tid", ev.heldag ? "Hele dagen" : ev.startMin != null && ev.sluttMin != null ? `${hhmm(ev.startMin)}–${hhmm(ev.sluttMin)}` : "—", { mono: true }],
            ["Hvem", ev.undertekst, {}],
            ["Kolliderer med", ev.kollidererMed && ev.kollidererMed.length > 0 ? (ev.kollidererMed.length === 1 ? "1 annen hendelse" : `${ev.kollidererMed.length} andre hendelser`) : null, {}],
            ...(f?.type === "booking" && f.foreslaatt ? [["Foreslått ny tid", `${f.foreslaatt} · venter på spilleren`, { mono: true }] as const] : []),
          ]} />
          {f?.type === "booking" && !f.harSpiller && <Meta>GJESTEBOOKING · FLYTTING KREVER AT KUNDEN GODTAR, OG KUNDEN HAR IKKE PLAYERHQ · AVTAL NY TID DIREKTE</Meta>}
          {f?.type === "okt" && <Meta>{f.spillerSer ? "SPILLEREN FÅR VARSEL NÅR ØKTA FLYTTES · DU KAN ANGRE I 10 SEKUNDER" : "UTKAST · SPILLEREN SER IKKE ØKTA ENNÅ"}</Meta>}
        </>
      )}
    </Ark>
  );
}

function FlyttArk({ valg, dager, onClose, onBekreft, pending, feil }: {
  valg: Flyttvalg | null; dager: string[]; onClose: () => void; onBekreft: (v: Flyttvalg) => void; pending: boolean; feil: string | null;
}) {
  const [dato, setDato] = useState(valg?.dato ?? "");
  const [tid, setTid] = useState(valg?.tid ?? "");
  if (!valg) return null;
  const erBooking = valg.ev.flytt?.type === "booking";
  return (
    <Ark
      open
      onClose={onClose}
      kicker={`${erBooking ? "Foreslå ny tid" : "Flytt"} · ${valg.ev.tittel}`}
      title="Velg nytt tidspunkt"
      footer={<>
        <Knapp fullWidth icon={Move} iconName="move" loading={pending} disabled={!dato || !tid} onClick={() => onBekreft({ ev: valg.ev, dato, tid })}>{erBooking ? "Send forslag" : "Flytt økt"}</Knapp>
        <Knapp fullWidth variant="ghost" onClick={onClose}>Avbryt</Knapp>
      </>}
    >
      <div className="a4-pilrad" role="group" aria-label="Dag i uka">
        {dager.map((d) => <Valgpille key={d} valgt={dato === d} onClick={() => setDato(d)}>{ukedagKort(d)} {dagMnd(d)}</Valgpille>)}
      </div>
      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 160px), 1fr))" gap={12}>
        <Skjemafelt label="Dato"><Datofelt value={dato} onChange={setDato} /></Skjemafelt>
        <Skjemafelt label="Klokkeslett"><Nedtrekk value={tid} onChange={setTid} options={[{ value: "", label: "Velg" }, ...tidsvalg()]} /></Skjemafelt>
      </Kolonner>
      {feil && <p role="alert" className="a4-feil">{feil}</p>}
      <Meta>{erBooking
        ? "TIDEN ENDRES IKKE FØR SPILLEREN GODTAR · SPILLEREN FÅR E-POST OG SER FORSLAGET I PLAYERHQ"
        : "SPILLEREN FÅR VARSEL I PLAYERHQ · DU KAN ANGRE I 10 SEKUNDER"}</Meta>
    </Ark>
  );
}

/** Flytt-logikken (økt direkte med angre, booking som forslag), delt av uke og dag. */
function useFlytt() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [flytt, setFlytt] = useState<Flyttvalg | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [angre, setAngre] = useState<{ sessionId: string; dato: string; startMin: number; melding: string; meta: string } | null>(null);
  const [kvittering, setKvittering] = useState<{ melding: string; meta: string } | null>(null);

  const apne = (ev: KalenderHendelse, dato?: string, tid?: string) => {
    setFeil(null);
    setFlytt({ ev, dato: dato ?? ev.dato, tid: tid ?? (ev.startMin != null ? hhmm(ev.startMin) : "") });
  };

  const utfor = (v: Flyttvalg) => {
    const f = v.ev.flytt;
    if (!f) return;
    start(async () => {
      if (f.type === "okt") {
        const res = await flyttOktIKalender({ sessionId: f.id, dato: v.dato, startMin: tilMin(v.tid) });
        if (!res.ok) { setFeil(res.feil); return; }
        setFlytt(null);
        setAngre({
          sessionId: f.id,
          dato: v.ev.dato,
          startMin: v.ev.startMin ?? 0,
          melding: `Flyttet til ${ukedagKort(v.dato).toLowerCase()} ${dagMnd(v.dato)} ${v.tid}`,
          meta: res.varslet ? "SPILLEREN ER VARSLET · ANGRE I 10 SEKUNDER" : "UTKAST · INGEN VARSEL · ANGRE I 10 SEKUNDER",
        });
      } else {
        const res = await foreslaaNyBookingtid({ bookingId: f.id, dato: v.dato, tid: v.tid });
        if (!res.ok) { setFeil(res.feil); return; }
        setFlytt(null);
        setKvittering({ melding: "Forslaget er sendt", meta: "TIDEN STÅR TIL SPILLEREN GODTAR I PLAYERHQ" });
      }
      router.refresh();
    });
  };

  const angreNa = () => {
    const a = angre;
    if (!a) return;
    setAngre(null);
    start(async () => {
      const res = await angreOktFlytting({ sessionId: a.sessionId, dato: a.dato, startMin: a.startMin });
      setKvittering(res.ok ? { melding: "Flyttingen er angret", meta: "ØKTA ER TILBAKE PÅ OPPRINNELIG TID" } : { melding: "Kunne ikke angre", meta: res.feil.toUpperCase() });
      router.refresh();
    });
  };

  const trekkTilbake = (ev: KalenderHendelse) => {
    if (ev.flytt?.type !== "booking") return;
    const id = ev.flytt.id;
    start(async () => {
      const res = await trekkTilbakeForslag(id);
      setKvittering(res.ok ? { melding: "Forslaget er trukket tilbake", meta: "BOOKINGEN STÅR PÅ OPPRINNELIG TID" } : { melding: "Kunne ikke trekke tilbake", meta: res.feil.toUpperCase() });
      router.refresh();
    });
  };

  const lukkAngre = useCallback(() => setAngre(null), []);
  const lukkKvittering = useCallback(() => setKvittering(null), []);

  const lag = (dager: string[]) => (
    <>
      <FlyttArk key={flytt ? `${flytt.ev.id}-${flytt.dato}-${flytt.tid}` : "ingen"} valg={flytt} dager={dager} onClose={() => setFlytt(null)} onBekreft={utfor} pending={pending} feil={feil} />
      {angre && <AngreToast melding={angre.melding} meta={angre.meta} onAngre={angreNa} onFerdig={lukkAngre} />}
      {!angre && kvittering && <AngreToast melding={kvittering.melding} meta={kvittering.meta} onFerdig={lukkKvittering} ms={5000} />}
    </>
  );

  return { apne, trekkTilbake, pending, lag };
}

function EventChip({ ev, onClick }: { ev: KalenderHendelse; onClick: () => void }) {
  const tid = !ev.heldag && ev.startMin != null && ev.sluttMin != null ? `${hhmm(ev.startMin)}–${hhmm(ev.sluttMin)}` : null;
  const meta = [tid, ev.undertekst].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      className="a4-ev"
      data-akse={ev.akse}
      data-forslag={ev.flytt?.type === "booking" && ev.flytt.foreslaatt ? "" : undefined}
      style={{ position: "static", width: "100%", ...akseStil(ev.akse) }}
      onClick={onClick}
    >
      <span className="a4-ev__title">{ev.tittel}</span>
      {meta && <Meta>{meta}</Meta>}
    </button>
  );
}

/** Uke- og dag-visning deler datakilden (KalenderLagUkeData) og bare grid-layouten skiller dem. */
export function AG05Uke({ data: raa, dagIso, startLag }: { data: KalenderLagUkeData; dagIso?: string; startLag?: KalenderLag }) {
  const [valgt, setValgt] = useState<KalenderHendelse | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const [drar, setDrar] = useState<string | null>(null);
  const [slipp, setSlipp] = useState<string | null>(null);
  const lag = useLagFilter(startLag);
  const flytt = useFlytt();
  const hendelser = useMemo(
    () => synlige(raa.hendelser, lag.valgt).filter((e) => coach === null || e.coachId === coach),
    [raa.hendelser, lag.valgt, coach],
  );
  const enDag = raa.visning === "dag";
  const dagValgt = dagIso && raa.dager.includes(dagIso) ? dagIso : raa.dager.includes(raa.idagIso) ? raa.idagIso : raa.dager[0];
  const dager = enDag ? raa.dager.filter((d) => d === dagValgt) : raa.dager;

  const filtre = (
    <>
      <LagFilter {...lag} />
      <CoachFilter coacher={raa.coacher} valgt={coach} sett={setCoach} />
      <AkseLegende />
      {!enDag && <Turneringslag data={raa} />}
    </>
  );

  if (!dager.some((d) => hendelser.some((e) => e.dato === d))) {
    return (
      <>
        {filtre}
        <TomTilstand icon={CalendarDays} title={enDag ? "Ingen hendelser denne dagen" : "Ingen hendelser denne uka"} text="Sett tilgjengelighet først, så kan spillere booke og lagøkter legges oppå." actions={<KnappLenke href="/admin/kalender?fane=tilg" variant="secondary">Sett tilgjengelighet</KnappLenke>} />
      </>
    );
  }

  const slippPaa = (e: React.DragEvent<HTMLDivElement>, dato: string, heldagAntall: number) => {
    e.preventDefault();
    setSlipp(null);
    const ev = hendelser.find((h) => h.id === e.dataTransfer.getData("application/x-ak-hendelse"));
    setDrar(null);
    if (!ev || ev.startMin == null || !ev.flytt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top - (heldagAntall ? heldagAntall * HELDAG_H + 4 : 0);
    const varighet = (ev.sluttMin ?? ev.startMin + 30) - ev.startMin;
    const raaMin = H0 * 60 + (y / PXPT) * 60;
    const min = Math.max(H0 * 60, Math.min(H1 * 60 - varighet, Math.round(raaMin / 15) * 15));
    if (dato === ev.dato && min === ev.startMin) return;
    flytt.apne(ev, dato, hhmm(min));
  };

  return (
    <>
      {filtre}
      {!enDag && (
        <div className="a4-daylist a4-week--mobil">
          {dager.map((d) => {
            const es = hendelser.filter((e) => e.dato === d).sort((a, b) => (a.startMin ?? -1) - (b.startMin ?? -1));
            return (
              <div key={d} className="a4-daylist__day">
                <div className="a4-daylist__label">{ukedagKort(d)} {dagMnd(d)}{d === raa.idagIso ? " · I DAG" : ""}</div>
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
            const dagHendelser = hendelser.filter((e) => e.dato === d);
            const heldag = dagHendelser.filter((e) => e.heldag);
            const timet = dagHendelser.filter((e) => !e.heldag && e.startMin != null);
            return (
              <div
                key={d}
                className="a4-week__day"
                data-slipp={drar && slipp === d ? "" : undefined}
                style={{ height: (H1 - H0) * PXPT }}
                onDragOver={(e) => { if (drar) { e.preventDefault(); if (slipp !== d) setSlipp(d); } }}
                onDragLeave={() => setSlipp((s) => (s === d ? null : s))}
                onDrop={(e) => slippPaa(e, d, heldag.length)}
              >
                {heldag.length > 0 && (
                  <div style={{ position: "absolute", top: 0, left: 3, right: 3, display: "flex", flexDirection: "column", gap: 2, zIndex: 1 }}>
                    {heldag.map((e) => <EventChip key={e.id} ev={e} onClick={() => setValgt(e)} />)}
                  </div>
                )}
                {timet.map((e) => {
                  const start = Math.max(H0 * 60, e.startMin!);
                  const slutt = Math.min(H1 * 60, e.sluttMin ?? start + 30);
                  const top = ((start - H0 * 60) / 60) * PXPT + (heldag.length ? heldag.length * HELDAG_H + 4 : 0);
                  const height = Math.max(20, ((slutt - start) / 60) * PXPT - 4);
                  const dra = !!e.flytt && (e.flytt.type === "okt" || (e.flytt.harSpiller && !e.flytt.foreslaatt));
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className="a4-ev"
                      draggable={dra}
                      data-dra={dra ? "" : undefined}
                      data-drar={drar === e.id ? "" : undefined}
                      data-akse={e.akse}
                      data-forslag={e.flytt?.type === "booking" && e.flytt.foreslaatt ? "" : undefined}
                      data-kolliderer={e.kollidererMed && e.kollidererMed.length > 0 ? "" : undefined}
                      aria-label={`${e.tittel}, ${hhmm(e.startMin!)}–${hhmm(e.sluttMin ?? e.startMin! + 30)}${dra ? ". Dra for å flytte" : ""}`}
                      style={{ top, height, ...akseStil(e.akse) }}
                      onDragStart={(x) => { x.dataTransfer.setData("application/x-ak-hendelse", e.id); x.dataTransfer.effectAllowed = "move"; setDrar(e.id); }}
                      onDragEnd={() => { setDrar(null); setSlipp(null); }}
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
      <Meta>DRA EN ØKT ELLER BOOKING TIL NY DAG OG TID, ELLER ÅPNE DEN OG VELG FLYTT · STIPLET = FORSLAG SOM VENTER PÅ SPILLEREN</Meta>
      <EventSheet
        ev={valgt}
        onClose={() => setValgt(null)}
        onFlytt={(ev) => { setValgt(null); flytt.apne(ev); }}
        onTrekkTilbake={(ev) => { setValgt(null); flytt.trekkTilbake(ev); }}
        pending={flytt.pending}
      />
      {flytt.lag(raa.dager)}
    </>
  );
}

export function AG05Maned({ data, startLag }: { data: KalenderLagUkeData; startLag?: KalenderLag }) {
  const lag = useLagFilter(startLag);
  const [coach, setCoach] = useState<string | null>(null);
  const hendelser = synlige(data.hendelser, lag.valgt).filter((e) => coach === null || e.coachId === coach);
  return (
    <>
      <LagFilter {...lag} />
      <CoachFilter coacher={data.coacher} valgt={coach} sett={setCoach} />
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
                  {es.slice(0, 4).map((e) => <span key={e.id} className="a4-month__dot" style={{ background: e.akse ? `var(--axis-${e.akse})` : "var(--border-strong)" }} title={LAG_LABEL[e.lag]} />)}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <Meta>PRIKK I AKSEFARGE = ØKT · GRÅ PRIKK = BOOKING, TURNERING, TEST ELLER SKOLE</Meta>
    </>
  );
}

/** AG-05-AR: bookinger og økter per måned i året. */
export function AG05Aar({ data }: { data: KalenderAarData }) {
  const maks = Math.max(1, ...data.maaneder.map((m) => m.bookinger));
  const tom = data.maaneder.every((m) => m.bookinger === 0 && m.okter === 0);
  if (tom) {
    return <TomTilstand icon={CalendarDays} title={`Ingen bookinger eller økter i ${data.aar}`} text="Bookinger og planlagte økter telles her per måned." />;
  }
  return (
    <section className="pa-card" aria-label={`År ${data.aar}`} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div className="a4-aar__rad" style={{ borderTop: "none", minHeight: 24 }}>
        <span />
        <span />
        <Meta style={{ textAlign: "right" }}>BOOKING</Meta>
        <Meta style={{ textAlign: "right" }}>ØKTER</Meta>
      </div>
      <div role="list" aria-label={String(data.aar)}>
        {data.maaneder.map((m) => (
          <div role="listitem" key={m.nokkel} className="a4-aar__rad">
            <Link href={`/admin/kalender?fane=maned&maaned=${m.nokkel}`} className="a4-tall" style={{ textAlign: "left", textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}>{m.navn}</Link>
            <span className="a4-aar__spor" aria-hidden><span className="a4-aar__fyll" style={{ width: `${(m.bookinger / maks) * 100}%` }} /></span>
            <span className="a4-tall">{m.bookinger || "—"}</span>
            <span className="a4-tall">{m.okter || "—"}</span>
          </div>
        ))}
      </div>
      <Meta>BOOKINGER OG ØKTER PER MÅNED · ALLE COACHER · TRYKK EN MÅNED FOR Å ÅPNE DEN</Meta>
    </section>
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
