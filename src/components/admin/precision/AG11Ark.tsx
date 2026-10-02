"use client";

/**
 * AG-11 Workbench (coach) — arkene: økt, ny økt, publiser, ukeplan og mål,
 * coachnotat, ny øvelse og velgeren for spiller/gruppe. Tegning: Claude Design
 * 7d7c2994, ui_kits/_shared/WB3.jsx (Sheet-ene nederst). Skrivesiden er
 * useUkeMotor (samme server-handlinger som før) — arkene er bare visning.
 *
 * Avvik fra tegningen, bevisst:
 * - «Gjenta» tilbyr de valgene motoren kan lagre: ukentlig i 2–12 uker.
 *   «Valgte dager», «Til dato» og «Ut perioden» har ingen lagring (Parkert).
 * - «Endre bare denne / alle framover» gjelder sletting (seriepolicy), som før.
 * - Ukenotatet er ukeplanens notat (WeekPlan.customNotes), knyttet til uka.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, List, Pencil, Plus, Send, Star, Trash2, Undo2, X } from "lucide-react";
import { Ark, Dialogboks, Nokkelverdi } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Sokefelt } from "@/components/precision/pa-a2";
import { Ikon, Knapp, AKSE_NAVN, type Akse } from "@/components/precision/pa";
import { AKSER, Caps, Valgpille, akseFra, akseStil } from "@/components/precision/pa-workbench";
import { OvelseSkjema } from "@/components/workbench/OvelseSkjema";
import type { UkeMotor } from "@/components/workbench/useUkeMotor";
import { AREA_LABEL, formatMinutes, formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import { RPE_SKALA } from "@/lib/domain/workbench/load";
import type { Drill, PyramidArea, RecurrencePolicy, WeekNote, WeekPlanData, WeekType, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { OvelseInput } from "@/lib/domain/workbench/ovelse-utkast";
import type { SaveWeekPlanInput } from "@/lib/workbench/wb-actions";
import { tommeUkeplandetaljer, UKEPLAN_OMRADER, UKEPLAN_PRIORITETER, UKEPLAN_TYPER, WeekPlanFieldsSchema, type WeekPlanningDetails } from "@/lib/workbench/ukeplan-schema";
import type { NyOktVerdier } from "@/components/workbench/CreateSessionModal";
import "@/styles/precision-a4.css";
import "@/styles/precision-a9.css";

const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

/** «Tir 29.09» fra en ren ISO-dato (UTC-trygt). */
export function dagOgDato(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAG_KORT[(d.getUTCDay() + 6) % 7]} ${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

export function klokke(min: number): string {
  return formatTime(min);
}

/** Hvor økta kommer fra, som merke på kortet (Egen = spillerens tilpassede gruppeøkt). */
export function kildeMerke(s: WorkbenchSession): "egen" | "gruppe" | "spiller" | null {
  if (s.sourceGroupSessionId && s.localOverride) return "egen";
  if (s.sourceGroupSessionId || s.origin === "GROUP") return "gruppe";
  if (s.origin === "PLAYER") return "spiller";
  return null;
}

const MOTORIKK: Record<string, string> = { UTEN_BALL: "Uten ball", LAV_HAST: "Lav hastighet", AUTO: "Automatikk" };
const BELASTNING: Record<string, string> = { INNENDORS: "Innendørs", TRENINGSOMRADE: "Treningsområde", BANE: "Bane", KONKURRANSE: "Konkurranse" };
const PRESS: Record<string, string> = { ALENE: "Alene", OBSERVERT: "Observert", KONKURRANSE: "Konkurranse", TURNERING: "Turnering" };
const VARIGHETER = [30, 45, 60, 90, 120, 180];
const GJENTA_UKER = [1, 2, 4, 6, 8, 12];
const SERIE_POLICIER: RecurrencePolicy[] = ["DENNE", "DENNE_OG_FREMOVER", "HELE_SERIEN"];
const SERIE_POLICY_LABEL: Record<RecurrencePolicy, string> = { DENNE: UI.seriesPolicyThis, DENNE_OG_FREMOVER: UI.seriesPolicyThisAndFollowing, HELE_SERIEN: UI.seriesPolicyAll };
const OSLO_DT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Felt({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return <label className={`a9-felt${mono ? " a9-felt--mono" : ""}`}>{label}{children}</label>;
}

/* ---------------- Økt (redigering) ---------------- */

export function OktArk({ session, spillerNavn, motor, onLukk, onApneOkt, onNyOvelse, onRedigerOvelse }: {
  session: WorkbenchSession | null; spillerNavn: string; motor: UkeMotor;
  onLukk: () => void; onApneOkt: (id: string) => void; onNyOvelse: (s: WorkbenchSession) => void;
  onRedigerOvelse?: (s: WorkbenchSession, drill: Drill) => void;
}) {
  const [dag, setDag] = useState(session?.date ?? "");
  const [start, setStart] = useState(session ? formatTime(session.startMinute) : "");
  const [varighet, setVarighet] = useState(session?.durationMinutes ?? 60);
  const [policy, setPolicy] = useState<RecurrencePolicy>("DENNE");
  const [rpe, setRpe] = useState<string>(session?.perceivedEffort != null ? String(session.perceivedEffort) : "");
  const [faktisk, setFaktisk] = useState<string>(session?.actualMinutes != null ? String(session.actualMinutes) : "");
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [formaal, setFormaal] = useState(session?.rationale ?? "");
  const [sted, setSted] = useState(session?.location ?? "");
  const [malsetning, setMalsetning] = useState(session?.maalsetning ?? "");
  if (!session) return null;
  const innholdPatch: Parameters<UkeMotor["lagreOktinnhold"]>[1] = {};
  if (formaal !== (session.rationale ?? "")) innholdPatch.rationale = formaal.trim() || null;
  if (sted !== (session.location ?? "")) innholdPatch.location = sted.trim() || null;
  if (malsetning !== (session.maalsetning ?? "")) innholdPatch.maalsetning = malsetning.trim() || null;
  const travel = motor.travel;
  const utkast = session.status === "DRAFT";
  const [t, m] = start.split(":");
  const nyStart = Number(t) * 60 + Number(m);
  const endret = dag !== session.date || nyStart !== session.startMinute || varighet !== session.durationMinutes;
  const faktiskeMinutter = faktisk.trim() === "" ? null : Number(faktisk);
  const faktiskGyldig = faktiskeMinutter === null || (Number.isInteger(faktiskeMinutter) && faktiskeMinutter >= 0 && faktiskeMinutter <= 1440);
  const f = session.drills[0]?.akFormel;
  const akse = akseFra(session.pyramid);
  const merke = kildeMerke(session);
  const fornavn = spillerNavn.split(" ")[0] ?? spillerNavn;
  const meta = [
    merke === "egen" ? "EGEN" : merke === "gruppe" ? "GRUPPEPLAN" : merke === "spiller" ? "FRA SPILLER" : null,
    session.seriesId ? "GJENTAS · SERIE" : "ENKELTØKT",
    `${session.durationMinutes} MIN`,
    UI_STATUS[session.status],
  ].filter(Boolean).join(" · ");

  return <>
    <Ark open onClose={onLukk} kicker={`${dagOgDato(session.date)} · ${klokke(session.startMinute)} · ${akse ? AKSE_NAVN[akse] : session.pyramid}`} title={session.title}
      footer={utkast ? <>
        <Knapp fullWidth icon={Send} disabled={travel} onClick={() => motor.publiser([session.id])}>{UI.publish}</Knapp>
        <Knapp variant="ghost" fullWidth icon={Trash2} disabled={travel} onClick={() => setBekreftSlett(true)}>{UI.delete}</Knapp>
      </> : <>
        <Knapp variant="secondary" fullWidth icon={Undo2} disabled={travel} onClick={() => motor.trekkTilbake(session.id)}>{UI.unpublish}</Knapp>
        <Knapp variant="ghost" fullWidth onClick={onLukk}>Lukk</Knapp>
      </>}>
      <Caps>{meta}</Caps>
      {utkast && <InlineVarsel tone="info">{UI.draftBadge}</InlineVarsel>}
      {merke === "gruppe" && <p className="a9-tekst">Økta kommer fra gruppeplanen og ligger i {fornavn} sin plan.</p>}
      {merke === "egen" && <p className="a9-tekst">{fornavn} har en egen versjon av gruppeøkta.</p>}
      <Knapp variant="ghost" size="sm" icon={List} onClick={() => onApneOkt(session.id)}>Åpne økta</Knapp>

      <div className="a9-skjema">
        <span className="kicker">{UI.timeLabel}</span>
        <div className="a9-feltrad">
          <Felt label={UI.dateLabel}><input type="date" value={dag} onChange={(e) => setDag(e.target.value)} /></Felt>
          <Felt label={UI.start} mono><input type="time" step={1800} value={start} onChange={(e) => setStart(e.target.value)} /></Felt>
          <Felt label={UI.duration}>
            <select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))}>
              {[...new Set([...VARIGHETER, session.durationMinutes])].sort((a, b) => a - b).map((v) => <option key={v} value={v}>{v} min</option>)}
            </select>
          </Felt>
        </div>
        <Knapp variant="secondary" disabled={!endret || travel || !Number.isFinite(nyStart)}
          onClick={() => motor.flytt(session.id, { newDate: dag, newStartMinute: nyStart, newDurationMinutes: varighet }, { newDate: session.date, newStartMinute: session.startMinute, newDurationMinutes: session.durationMinutes })}>
          {travel ? UI.saving : UI.moveSession}
        </Knapp>
      </div>

      <div className="a9-skjema">
        <span className="kicker">Øktens innhold</span>
        <Felt label="Formål"><textarea maxLength={1000} value={formaal} onChange={e => setFormaal(e.target.value)} /></Felt>
        <Felt label="Sted"><input maxLength={160} value={sted} onChange={e => setSted(e.target.value)} /></Felt>
        <Felt label="Øktens målsetning"><textarea maxLength={500} value={malsetning} onChange={e => setMalsetning(e.target.value)} /></Felt>
        {session.seriesId && <Felt label="Endre innhold for"><select value={policy} onChange={e => setPolicy(e.target.value as RecurrencePolicy)}>{SERIE_POLICIER.map(p => <option key={p} value={p}>{SERIE_POLICY_LABEL[p]}</option>)}</select></Felt>}
        <Knapp variant="secondary" disabled={travel || Object.keys(innholdPatch).length === 0}
          onClick={() => motor.lagreOktinnhold(session, innholdPatch, policy)}>Lagre øktinnhold</Knapp>
        <p className="a9-tekst">Deles med spilleren når økten er publisert.</p>
      </div>

      <div className="a9-skjema">
        <span className="kicker">{UI.sessionAboutLabel}</span>
        <Nokkelverdi items={[
          [UI.pyramid, PYRAMID_LABEL[session.pyramid] ?? "—"],
          [UI.drillArea, f?.area ? AREA_LABEL[f.area] : "—"],
          [UI.formelMotorikk, f?.motorikk ? MOTORIKK[f.motorikk] ?? "—" : "—"],
          [UI.formelBelastning, f?.belastning ? BELASTNING[f.belastning] ?? "—" : "—"],
          [UI.formelPress, f?.press ? PRESS[f.press] ?? "—" : "—"],
          [UI.durationValueLabel, formatMinutes(session.durationMinutes), { mono: true }],
          [UI.publishedAt, session.publishedAt ? OSLO_DT.format(new Date(session.publishedAt)) : "—", { mono: true }],
          [UI.approvalStatusLabel, session.needsPlayerApproval ? UI.approvalStatusPending : session.approvalStatus === "ACCEPTED" ? UI.approvalStatusAccepted : session.approvalStatus === "REJECTED" ? UI.approvalStatusRejectedValue : "—"],
          ...(session.hiddenByPlayer ? [[UI.hiddenByPlayerLabel, UI.hiddenByPlayerValue] as const] : []),
        ]} />
        <Knapp variant="ghost" size="sm" icon={Star} disabled={travel || (session.status === "IN_PROGRESS" && !session.isTemplate)} onClick={() => motor.lagreSomMal(session.id, !session.isTemplate)}>
          {session.isTemplate ? UI.removeAsTemplate : UI.saveAsTemplate}
        </Knapp>
        {session.status === "IN_PROGRESS" && !session.isTemplate && <p className="a9-tekst">En pågående økt kan ikke lagres som mal. Fullfør økten først.</p>}
      </div>

      <div className="a9-skjema">
        <span className="kicker">{UI.drillsCaps}</span>
        {session.drills.length === 0 ? <Caps>{UI.emptyDrills.toUpperCase()}</Caps> : <div className="a9-ovelser" role="list">
          {session.drills.map((d, i) => <div key={d.id} role="listitem" className="a9-ovelsesrad" style={akseStil(akseFra(d.akFormel.pyramid))}>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span className="a9-listerad__tittel">{d.title}</span>
              {d.akFormel.detaljer?.mal?.malsetning && <span>Målsetning: {d.akFormel.detaljer.mal.malsetning}</span>}
              {d.techniqueFocus && <span>Historisk fokus / kildeposisjon: {d.techniqueFocus}</span>}
              <Caps>{[d.akFormel.pyramid, AREA_LABEL[d.akFormel.area], `${d.durationMinutes} MIN`].filter(Boolean).join(" · ").toUpperCase()}</Caps>
            </span>
            <span className="a9-ovelsesrad__knapper">
              {onRedigerOvelse && <button type="button" className="pa-iconbtn" aria-label={`Rediger ${d.title}`} disabled={travel} onClick={() => onRedigerOvelse(session, d)}><Ikon icon={Pencil} size={18} /></button>}
              <button type="button" className="pa-iconbtn" aria-label={`Flytt ${d.title} opp`} disabled={travel || i === 0} onClick={() => motor.flyttDrill(session, d.id, -1)}><Ikon icon={ArrowUp} size={18} /></button>
              <button type="button" className="pa-iconbtn" aria-label={`Flytt ${d.title} ned`} disabled={travel || i === session.drills.length - 1} onClick={() => motor.flyttDrill(session, d.id, 1)}><Ikon icon={ArrowDown} size={18} /></button>
              <button type="button" className="pa-iconbtn" aria-label={`Fjern ${d.title}`} disabled={travel} onClick={() => motor.fjernDrill(session.id, d.id)}><Ikon icon={X} size={18} /></button>
            </span>
          </div>)}
        </div>}
        <Knapp variant="secondary" size="sm" icon={Plus} disabled={travel} onClick={() => onNyOvelse(session)}>{UI.addDrill}</Knapp>
      </div>

      <div className="a9-skjema">
        <span className="kicker">Belastning (sRPE)</span>
        <Nokkelverdi items={[
          ["Opplevd anstrengelse", session.perceivedEffort ? `${session.perceivedEffort}/10 · ${RPE_SKALA[session.perceivedEffort]?.kort ?? ""}` : "Ikke vurdert"],
          ["Planlagt tid", `${session.durationMinutes} min`, { mono: true }],
          ["Faktisk tid", session.actualMinutes != null ? `${session.actualMinutes} min` : "Ikke registrert", { mono: true }],
          ["Beregnet belastning", session.load != null ? `${session.load} sRPE-poeng` : "—", { mono: true }],
        ]} />
        <div className="a9-feltrad">
          <Felt label="RPE (1–10)">
            <select value={rpe} onChange={(e) => setRpe(e.target.value)}>
              <option value="">Ingen (uavklart)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n} – {RPE_SKALA[n]?.kort}</option>)}
            </select>
          </Felt>
          <Felt label="Faktisk min" mono><input type="number" min={0} max={1440} step={1} inputMode="numeric" placeholder="Ikke registrert" value={faktisk} onChange={(e) => setFaktisk(e.target.value)} /></Felt>
        </div>
        <Knapp variant="secondary" size="sm" disabled={travel || !faktiskGyldig}
          onClick={() => { if (faktiskGyldig) motor.oppdaterAnstrengelse(session.id, rpe ? Number(rpe) : null, faktiskeMinutter); }}>Lagre belastning</Knapp>
      </div>

      {session.seriesId && utkast && <div className="a9-skjema">
        <Felt label={UI.seriesPolicyLabel}>
          <select value={policy} onChange={(e) => setPolicy(e.target.value as RecurrencePolicy)}>
            {SERIE_POLICIER.map((p) => <option key={p} value={p}>{SERIE_POLICY_LABEL[p]}</option>)}
          </select>
        </Felt>
        <Caps>{UI.seriesEditHint(UI.delete).toUpperCase()}</Caps>
      </div>}

      {session.notes && <div className="a9-skjema"><span className="kicker">{UI.coachNoteLabel}</span><p className="a9-tekst">{session.notes}</p></div>}
    </Ark>
    <Dialogboks open={bekreftSlett} onClose={() => setBekreftSlett(false)} title={session.seriesId ? `Slette ${SERIE_POLICY_LABEL[policy].toLowerCase()}?` : "Slette økta?"}
      footer={<>
        <Knapp variant="ghost" onClick={() => setBekreftSlett(false)}>Avbryt</Knapp>
        <Knapp variant="signal" icon={Trash2} disabled={travel} onClick={() => { setBekreftSlett(false); motor.slett(session, policy, onLukk); }}>{UI.delete}</Knapp>
      </>}>
      <p className="a9-tekst">{session.title} · {dagOgDato(session.date)} {klokke(session.startMinute)}. Utkastet fjernes fra planen.</p>
    </Dialogboks>
  </>;
}

const UI_STATUS: Record<WorkbenchSession["status"], string> = {
  DRAFT: "UTKAST", SCHEDULED: "PLANLAGT", PUBLISHED: "PUBLISERT", IN_PROGRESS: "PÅGÅR", COMPLETED: "FULLFØRT", CANCELLED: "AVLYST", SKIPPED: "HOPPET OVER",
};

/* ---------------- Ny økt ---------------- */

export type NyOktUtkast = { dato: string; startMinutt: number; pyramide: PyramidArea | null };

export function NyOktArk({ utkast, travel, onLukk, onOpprett }: {
  utkast: NyOktUtkast; travel: boolean; onLukk: () => void; onOpprett: (v: NyOktVerdier) => void;
}) {
  const [pyramide, setPyramide] = useState<PyramidArea>(utkast.pyramide ?? "TEK");
  const [tittel, setTittel] = useState(utkast.pyramide ? `${utkast.pyramide}-økt` : "");
  const [dag, setDag] = useState(utkast.dato);
  const [start, setStart] = useState(formatTime(utkast.startMinutt));
  const [varighet, setVarighet] = useState(60);
  const [uker, setUker] = useState(1);
  const [formaal, setFormaal] = useState("");
  const [sted, setSted] = useState("");
  const [malsetning, setMalsetning] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const send = () => {
    const navn = tittel.trim();
    if (!navn) { setFeil(UI.titleRequired); return; }
    const [t, m] = start.split(":");
    const s = Number(t) * 60 + Number(m);
    if (!Number.isFinite(s)) { setFeil(UI.invalidStartTime); return; }
    setFeil(null);
    onOpprett({ title: navn, date: dag, startMinute: s, durationMinutes: varighet, pyramid: pyramide, repeatWeeks: uker, rationale: formaal.trim() || undefined, location: sted.trim() || undefined, maalsetning: malsetning.trim() || undefined });
  };
  return <Ark open onClose={onLukk} kicker={`${AKSE_NAVN[pyramide.toLowerCase() as Akse] ?? pyramide} · ${dagOgDato(dag)} kl. ${start}`} title={UI.createSession}
    footer={<>
      <Knapp fullWidth icon={Check} loading={travel} loadingText={UI.creating} onClick={send}>Legg inn</Knapp>
      <Knapp variant="ghost" fullWidth onClick={onLukk}>{UI.cancel}</Knapp>
    </>}>
    <div className="a9-skjema">
      <span className="kicker">Pyramide</span>
      <div role="radiogroup" aria-label="Pyramide" className="a9-akser">
        {AKSER.map((a) => <Valgpille key={a} rolle="radio" akse={a} valgt={pyramide === AKSE_NAVN[a]} onClick={() => setPyramide(AKSE_NAVN[a] as PyramidArea)}>{AKSE_NAVN[a]}</Valgpille>)}
      </div>
      <Felt label={UI.titleField}><input value={tittel} onChange={(e) => setTittel(e.target.value)} placeholder={UI.titlePlaceholder} /></Felt>
      <Felt label="Formål"><textarea maxLength={1000} value={formaal} onChange={e => setFormaal(e.target.value)} /></Felt>
      <Felt label="Sted"><input maxLength={160} value={sted} onChange={e => setSted(e.target.value)} /></Felt>
      <Felt label="Øktens målsetning"><textarea maxLength={500} value={malsetning} onChange={e => setMalsetning(e.target.value)} /></Felt>
      <div className="a9-feltrad">
        <Felt label={UI.dateField}><input type="date" value={dag} onChange={(e) => setDag(e.target.value)} /></Felt>
        <Felt label={UI.start} mono><input type="time" step={1800} value={start} onChange={(e) => setStart(e.target.value)} /></Felt>
        <Felt label={UI.duration}><select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))}>{VARIGHETER.map((v) => <option key={v} value={v}>{v} min</option>)}</select></Felt>
      </div>
      <span className="kicker">Gjenta?</span>
      <div role="radiogroup" aria-label="Gjenta" className="a9-rad">
        {GJENTA_UKER.map((n) => <Valgpille key={n} rolle="radio" valgt={uker === n} onClick={() => setUker(n)}>{n === 1 ? "Ikke gjenta" : UI.repeatWeeks(n)}</Valgpille>)}
      </div>
      <Caps>{UI.createSessionFormelHint.toUpperCase()}</Caps>
      {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    </div>
  </Ark>;
}

/* ---------------- Publiser uka ---------------- */

export function PubliserArk({ motor, spillerNavn, idag, onLukk }: { motor: UkeMotor; spillerNavn: string; idag: string; onLukk: () => void }) {
  const { utkast, opptattIder, valideringsnotater, travel } = motor;
  const [valgte, setValgte] = useState<Set<string>>(() => new Set(utkast.filter((s) => !opptattIder.has(s.id)).map((s) => s.id)));
  const iDag = utkast.filter((s) => s.date === idag).length;
  const antall = utkast.filter((s) => valgte.has(s.id)).length;
  const alle = utkast.length > 0 && antall === utkast.length;
  const ukeNr = utkast[0] ? isoWeekNumber(utkast[0].date) : isoWeekNumber(idag);
  const veksle = (id: string) => setValgte((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return <Ark open onClose={onLukk} kicker={UI.publishConfirmKicker(ukeNr, spillerNavn)} title={UI.publishConfirmHeading(utkast.length)}
    footer={<>
      <Knapp fullWidth icon={Send} disabled={travel || antall === 0} onClick={() => motor.publiser(utkast.filter((s) => valgte.has(s.id)).map((s) => s.id), onLukk)}>{travel ? UI.publishing : UI.publishValgte(antall)}</Knapp>
      <Knapp variant="secondary" fullWidth disabled={travel || utkast.length === 0} onClick={() => motor.publiser(utkast.map((s) => s.id), onLukk)}>{UI.publishAlle(utkast.length)}</Knapp>
      <Knapp variant="ghost" fullWidth onClick={onLukk}>{UI.cancel}</Knapp>
    </>}>
    <p className="a9-tekst">{UI.publishConfirmBody}</p>
    {iDag > 0 && <InlineVarsel tone="warn">{iDag === 1 ? UI.publishTodayWarnOne : UI.publishTodayWarnMany(iDag)}</InlineVarsel>}
    {valideringsnotater.length > 0 && <InlineVarsel tone="info" tittel={UI.publishOverlapWarnTitle}>{valideringsnotater.map((n) => n.message).join(" ")}</InlineVarsel>}
    <div className="a9-sjekkliste">
      <label className="pa-check">
        <input type="checkbox" checked={alle} onChange={() => setValgte(alle ? new Set() : new Set(utkast.map((s) => s.id)))} />
        <span className="pa-check__box" aria-hidden>{alle && <Ikon icon={Check} size={14} />}</span>
        <span>{UI.publishVelgAlle} · {UI.publishValgtAvTotalt(antall, utkast.length)}</span>
      </label>
      {utkast.map((s) => <div key={s.id} className="a9-sjekkrad" style={akseStil(akseFra(s.pyramid))}>
        <label className="pa-check">
          <input type="checkbox" checked={valgte.has(s.id)} onChange={() => veksle(s.id)} />
          <span className="pa-check__box" aria-hidden>{valgte.has(s.id) && <Ikon icon={Check} size={14} />}</span>
          <span>{dagOgDato(s.date)} {klokke(s.startMinute)} · {s.title}</span>
        </label>
        <Caps>{opptattIder.has(s.id) ? UI.publishRadOpptatt.toUpperCase() : UI.publishRadUtkast.toUpperCase()}</Caps>
      </div>)}
    </div>
  </Ark>;
}

/* ---------------- Ukeplan og mål ---------------- */

const UKETYPER: { id: WeekType; tittel: string }[] = [
  { id: "UTVIKLING", tittel: "Utvikling" }, { id: "VEDLIKEHOLD", tittel: "Vedlikehold" }, { id: "TURNERING", tittel: "Turnering" },
];
const UKENOTATER: { id: WeekNote; tittel: string }[] = [
  { id: "TEKNIKK_UKE", tittel: "Teknikkuke" }, { id: "PRE_TURNERING", tittel: "Pre-turnering" }, { id: "SAMLING", tittel: "Samling" },
  { id: "TEST", tittel: "Test" }, { id: "EVALUERING", tittel: "Evaluering" }, { id: "FERIE", tittel: "Ferie" },
];
export const UKETYPE_NAVN: Record<WeekType, string> = { UTVIKLING: "Utvikling", VEDLIKEHOLD: "Vedlikehold", TURNERING: "Turnering" };
export const UKENOTAT_NAVN: Record<WeekNote, string> = Object.fromEntries(UKENOTATER.map((n) => [n.id, n.tittel])) as Record<WeekNote, string>;

const tall = (v: number | null | undefined) => (v != null ? String(v) : "");
const tilTall = (v: string) => (v.trim() === "" ? null : Number(v));

export function UkeplanArk({ weekPlan, ukeNr, travel, onLagre, onLukk }: {
  weekPlan?: WeekPlanData | null; ukeNr: number; travel: boolean; onLagre: (d: Partial<SaveWeekPlanInput>) => void; onLukk: () => void;
}) {
  const [type, setType] = useState<WeekType>(weekPlan?.weekType ?? "UTVIKLING");
  const [notater, setNotater] = useState<WeekNote[]>(weekPlan?.notes ?? []);
  const [timer, setTimer] = useState({ FYS: tall(weekPlan?.plannedHoursFys), TEK: tall(weekPlan?.plannedHoursTek), SLAG: tall(weekPlan?.plannedHoursSlag), SPILL: tall(weekPlan?.plannedHoursSpill), TURN: tall(weekPlan?.plannedHoursTurn) });
  const [rep, setRep] = useState({ full: tall(weekPlan?.repTargetFullSpeed), putt: tall(weekPlan?.repTargetPutting), kort: tall(weekPlan?.repTargetShortGame), torr: tall(weekPlan?.repTargetDry), lav: tall(weekPlan?.repTargetLowSpeed) });
  const [tak, setTak] = useState(tall(weekPlan?.loadCeiling));
  const [notat, setNotat] = useState(weekPlan?.customNotes ?? "");
  const [detaljer, setDetaljer] = useState<WeekPlanningDetails>(weekPlan?.planningDetails ?? tommeUkeplandetaljer());
  const [okter, setOkter] = useState({ FYS: tall(detaljer.areas.FYS.sessionBudget), TEK: tall(detaljer.areas.TEK.sessionBudget), SLAG: tall(detaljer.areas.SLAG.sessionBudget), SPILL: tall(detaljer.areas.SPILL.sessionBudget), TURN: tall(detaljer.areas.TURN.sessionBudget) });
  const [feil, setFeil] = useState<string | null>(null);
  const lagre = () => {
    const input = {
    weekType: type, notes: notater,
    plannedHoursFys: tilTall(timer.FYS), plannedHoursTek: tilTall(timer.TEK), plannedHoursSlag: tilTall(timer.SLAG), plannedHoursSpill: tilTall(timer.SPILL), plannedHoursTurn: tilTall(timer.TURN),
    repTargetFullSpeed: tilTall(rep.full), repTargetPutting: tilTall(rep.putt), repTargetShortGame: tilTall(rep.kort), repTargetDry: tilTall(rep.torr), repTargetLowSpeed: tilTall(rep.lav),
    loadCeiling: tilTall(tak), customNotes: notat.trim() === "" ? null : notat.trim(),
    planningDetails: {
      ...detaljer,
      location: detaljer.location?.trim() || null,
      areas: {
        FYS: { ...detaljer.areas.FYS, sessionBudget: tilTall(okter.FYS) },
        TEK: { ...detaljer.areas.TEK, sessionBudget: tilTall(okter.TEK) },
        SLAG: { ...detaljer.areas.SLAG, sessionBudget: tilTall(okter.SLAG) },
        SPILL: { ...detaljer.areas.SPILL, sessionBudget: tilTall(okter.SPILL) },
        TURN: { ...detaljer.areas.TURN, sessionBudget: tilTall(okter.TURN) },
      },
    },
    };
    const parsed = WeekPlanFieldsSchema.safeParse(input);
    if (!parsed.success) {
      setFeil("Timer må være gyldige og ikke negative. Økter, repetisjoner og belastningstak må være hele tall på 0 eller mer.");
      return;
    }
    setFeil(null);
    onLagre(parsed.data);
  };
  return <Ark open onClose={onLukk} kicker={`Uke ${ukeNr}`} title="Ukeplan og mål"
    footer={<><Knapp fullWidth icon={Check} loading={travel} onClick={lagre}>Lagre ukeplan</Knapp><Knapp variant="ghost" fullWidth onClick={onLukk}>{UI.cancel}</Knapp></>}>
    <div className="a9-skjema">
      <span className="kicker">Uketype</span>
      <div role="radiogroup" aria-label="Uketype" className="a9-rad">
        {UKEPLAN_TYPER.map((u) => <Valgpille key={u.id} rolle="radio" valgt={detaljer.weekType === u.id} onClick={() => setDetaljer((p) => ({ ...p, weekType: u.id }))}>{u.navn}</Valgpille>)}
      </div>
      <Knapp variant="ghost" size="sm" disabled={travel || detaljer.weekType === null} onClick={() => setDetaljer((p) => ({ ...p, weekType: null }))}>Tøm uketype</Knapp>
      <details><summary>Tidligere uketype: {UKETYPE_NAVN[type]}</summary>
        <div role="radiogroup" aria-label="Tidligere uketype" className="a9-rad">
          {UKETYPER.map((u) => <Valgpille key={u.id} rolle="radio" valgt={type === u.id} onClick={() => setType(u.id)}>{u.tittel}</Valgpille>)}
        </div>
      </details>
      <Felt label="Oppholdssted"><input maxLength={300} value={detaljer.location ?? ""} onChange={(e) => setDetaljer((p) => ({ ...p, location: e.target.value || null }))} placeholder="Sted for denne uka" /></Felt>
      <span className="kicker">Prioritet, fokus og budsjett per område</span>
      {UKEPLAN_OMRADER.map((k) => <fieldset key={k} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <legend className="kicker">{k}</legend>
        <Felt label={`${k} prioritet`}><select aria-label={`${k} prioritet`} value={detaljer.areas[k].priority ?? ""} onChange={(e) => {
          const priority = UKEPLAN_PRIORITETER.find((v) => v === e.target.value) ?? null;
          setDetaljer((p) => ({ ...p, areas: { ...p.areas, [k]: { ...p.areas[k], priority } } }));
        }}>
          <option value="">Ikke valgt</option>
          <option value="UTVIKLE">Utvikle</option><option value="VEDLIKEHOLDE">Vedlikeholde</option><option value="REDUSERE">Redusere</option>
        </select></Felt>
        <Felt label={`${k} fokus`}><textarea aria-label={`${k} fokus`} rows={2} maxLength={2000} value={detaljer.areas[k].focus ?? ""} onChange={(e) => {
          const focus = e.target.value.trim() === "" ? null : e.target.value;
          setDetaljer((p) => ({ ...p, areas: { ...p.areas, [k]: { ...p.areas[k], focus } } }));
        }} /></Felt>
        <div className="a9-feltrad">
          <Felt label={`${k} timer`} mono><input type="number" step="any" min={0} inputMode="decimal" placeholder="—" value={timer[k]} onChange={(e) => setTimer((p) => ({ ...p, [k]: e.target.value }))} /></Felt>
          <Felt label={`${k} økter`} mono><input type="number" step={1} min={0} inputMode="numeric" placeholder="—" value={okter[k]} onChange={(e) => setOkter((p) => ({ ...p, [k]: e.target.value }))} /></Felt>
        </div>
      </fieldset>)}
      <Caps>TOMT BUDSJETT ER IKKE FASTSATT · 0 ER INGEN TIMER ELLER ØKTER</Caps>
      <span className="kicker">Ukenotater og merker</span>
      <div className="a9-rad">
        {UKENOTATER.map((n) => <Valgpille key={n.id} valgt={notater.includes(n.id)} onClick={() => setNotater((p) => p.includes(n.id) ? p.filter((x) => x !== n.id) : [...p, n.id])}>{n.tittel}</Valgpille>)}
      </div>
      <span className="kicker">Repetisjonsmål</span>
      <div className="a9-feltrad">
        <Felt label="Full fart (sving)" mono><input type="number" step={10} min={0} inputMode="numeric" placeholder="—" value={rep.full} onChange={(e) => setRep((p) => ({ ...p, full: e.target.value }))} /></Felt>
        <Felt label="Putting" mono><input type="number" step={10} min={0} inputMode="numeric" placeholder="—" value={rep.putt} onChange={(e) => setRep((p) => ({ ...p, putt: e.target.value }))} /></Felt>
        <Felt label="Nærspill (chip/pitch)" mono><input type="number" step={10} min={0} inputMode="numeric" placeholder="—" value={rep.kort} onChange={(e) => setRep((p) => ({ ...p, kort: e.target.value }))} /></Felt>
        <Felt label="Uten ball (tørrsving)" mono><input type="number" step={10} min={0} inputMode="numeric" placeholder="—" value={rep.torr} onChange={(e) => setRep((p) => ({ ...p, torr: e.target.value }))} /></Felt>
        <Felt label="Lav fart (teknikk)" mono><input type="number" step={10} min={0} inputMode="numeric" placeholder="—" value={rep.lav} onChange={(e) => setRep((p) => ({ ...p, lav: e.target.value }))} /></Felt>
      </div>
      <Felt label="Belastningstak (sRPE-poeng)" mono><input type="number" step={100} min={0} inputMode="numeric" placeholder="—" value={tak} onChange={(e) => setTak(e.target.value)} /></Felt>
      <Felt label="Ukenotat"><textarea rows={4} value={notat} onChange={(e) => setNotat(e.target.value)} /></Felt>
      <Caps>DELES MED SPILLEREN · KNYTTES TIL UKE {ukeNr}</Caps>
      {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    </div>
  </Ark>;
}

/* ---------------- Coachnotat ---------------- */

export function CoachnotatArk({ notat, ukeNr, spillerNavn, travel, onLagre, onLukk }: {
  notat: string; ukeNr: number; spillerNavn: string; travel: boolean; onLagre: (tekst: string | null) => void; onLukk: () => void;
}) {
  const [tekst, setTekst] = useState(notat);
  return <Ark open onClose={onLukk} kicker={`Ukenotat · ${spillerNavn}`} title="Ukenotat"
    footer={<><Knapp fullWidth icon={Check} loading={travel} onClick={() => onLagre(tekst.trim() === "" ? null : tekst.trim())}>Lagre</Knapp><Knapp variant="ghost" fullWidth onClick={onLukk}>{UI.cancel}</Knapp></>}>
    <Felt label="Notat"><textarea rows={4} value={tekst} onChange={(e) => setTekst(e.target.value)} /></Felt>
    <Caps>DELES MED SPILLEREN · KNYTTES TIL UKE {ukeNr}</Caps>
  </Ark>;
}

/* ---------------- Ny øvelse (åtte trinn) ---------------- */

export function OvelseArk({ session, pyramide, drill, travel, onLukk, onSubmit }: {
  session: WorkbenchSession; pyramide: PyramidArea; drill?: Drill; travel: boolean; onLukk: () => void; onSubmit: (o: OvelseInput, ferdig: () => void) => void;
}) {
  return <Ark open onClose={onLukk} kicker={`${drill ? "Rediger øvelse" : "Ny øvelse"} · ${session.title}`} title={drill ? "Rediger øvelse" : UI.addDrill}>
    <Caps>PYRAMIDEN VELGES FØRST OG STYRER FELTENE VIDERE</Caps>
    <OvelseSkjema key={drill?.id ?? "ny"} drill={drill} utseende="precision" standardPyramide={pyramide} disabled={travel} onSubmit={(o, ferdig) => onSubmit(o, () => { ferdig(); if (drill) onLukk(); })} />
  </Ark>;
}

/* ---------------- Velg spiller eller gruppe ---------------- */

export function VelgerArk({ modus, liste, valgtId, hrefFor, onLukk }: {
  modus: "spiller" | "gruppe"; liste: readonly { id: string; navn: string }[]; valgtId: string | null; hrefFor: (id: string) => string; onLukk: () => void;
}) {
  const [q, setQ] = useState("");
  const treff = useMemo(() => liste.filter((x) => x.navn.toLowerCase().includes(q.trim().toLowerCase())), [liste, q]);
  return <Ark open onClose={onLukk} kicker={modus === "gruppe" ? "Velg gruppe" : "Velg spiller"} title={modus === "gruppe" ? "Gruppe" : "Spiller"}
    footer={<Knapp variant="ghost" fullWidth onClick={onLukk}>Lukk</Knapp>}>
    <Sokefelt value={q} onChange={setQ} label="Søk" placeholder="Søk" />
    {treff.length === 0 ? <Caps>INGEN TREFF</Caps> : <div role="list" className="a9-liste">
      {treff.map((x, i) => <Link key={x.id} role="listitem" href={hrefFor(x.id)} onClick={onLukk} className={`a9-listerad${i ? " a9-listerad--skille" : ""}`} aria-current={x.id === valgtId ? "page" : undefined} style={{ textDecoration: "none" }}>
        <span className="a9-listerad__tittel" style={{ fontWeight: x.id === valgtId ? 600 : 400 }}>{x.navn}</span>
      </Link>)}
    </div>}
  </Ark>;
}
