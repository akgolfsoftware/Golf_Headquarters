"use client";

import { useState, useTransition } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";
import { TL } from "@/lib/v2/train-lock";

type Props = {
  playerId: string;
  data: WorkbenchFysTurneringData;
  actions?: {
    opprettFysiskBlokk?: (input: {
      playerId: string;
      title: string;
      startDate: string;
      endDate: string;
      focus?: string | null;
    }) => Promise<{ ok: boolean; blockId?: string; error?: string }>;
    opprettFysiskOkt?: (input: {
      blockId: string;
      weekId: string;
      date: string;
      title: string;
      type?: "STYRKE" | "KONDISJON" | "MOBILITET" | "TEST";
      durationMinutes?: number | null;
      exerciseTitle?: string | null;
    }) => Promise<{ ok: boolean; sessionId?: string; error?: string }>;
    flyttFysiskOkt?: (input: { sessionId: string; date: string }) => Promise<{ ok: boolean; error?: string }>;
    publiserFysiskBlokk?: (input: { id: string }) => Promise<{ ok: boolean; error?: string }>;
    opprettTurneringsplan?: (input: {
      playerId: string;
      title: string;
      startDate: string;
      endDate: string;
      travelStartDate?: string | null;
      travelEndDate?: string | null;
      focus?: "TRENING" | "UTVIKLING" | "PRESTASJON";
    }) => Promise<{ ok: boolean; planId?: string; error?: string }>;
    publiserTurneringsplan?: (input: { id: string }) => Promise<{ ok: boolean; error?: string }>;
  };
};

const CARD: CSSProperties = {
  border: `1px solid ${TL.hair}`,
  borderRadius: 8,
  background: TL.elev,
  padding: 14,
  minWidth: 0,
};

function datoSpenn(fra: string, til: string) {
  return fra === til ? fra : `${fra} - ${til}`;
}

function statusTone(status: string) {
  if (status === "PUBLISHED") return TL.text;
  if (status === "CHANGED_AFTER_PUBLISH") return TL.text;
  if (status === "WITHDRAWN") return TL.text;
  return TL.mute;
}

export function WorkbenchFysTurnering({ playerId, data, actions }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [melding, setMelding] = useState<string | null>(null);
  const [dragSessionId, setDragSessionId] = useState<string | null>(null);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const sixWeeks = new Date(`${today}T00:00:00Z`);
  sixWeeks.setUTCDate(sixWeeks.getUTCDate() + 41);
  const sixWeeksIso = sixWeeks.toISOString().slice(0, 10);
  const [fysForm, setFysForm] = useState({ title: "Fysisk blokk", startDate: today, endDate: sixWeeksIso, focus: "" });
  const [oktForm, setOktForm] = useState({ title: "Styrke helkropp", weekId: "", date: today, durationMinutes: 45, exerciseTitle: "Knebøy" });
  const [turnForm, setTurnForm] = useState({ title: "Turneringsplan", startDate: today, endDate: today, travelStartDate: "", travelEndDate: "", focus: "UTVIKLING" as const });
  const fysisk = data.physicalBlocks[0] ?? null;
  const turneringer = data.tournamentPlans;
  const konflikter = data.openConflicts;
  const analysed = analyseFysTurnering(data);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setMelding(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setMelding(res.error ?? "Kunne ikke lagre.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, padding: "0 16px 12px" }}>
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, fontWeight: 700 }}>Fysisk plan</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 16, lineHeight: 1.2, color: TL.text }}>{fysisk?.title ?? "Ingen fysisk blokk"}</h2>
          </div>
          {fysisk && <span style={{ color: statusTone(fysisk.status), fontSize: 11, fontWeight: 700 }}>{fysisk.status}</span>}
        </div>
        {fysisk ? (
          <>
            <p style={{ margin: "8px 0 0", color: TL.mute, fontSize: 13 }}>{datoSpenn(fysisk.startDate, fysisk.endDate)}{fysisk.focus ? ` · ${fysisk.focus}` : ""}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
              <Metric label="Uker" value={String(fysisk.weeks.length)} />
              <Metric label="Økter" value={String(fysisk.weeks.reduce((sum, w) => sum + w.sessions.length, 0))} />
              <Metric label="Konflikt" value={String(fysisk.conflicts.length)} />
            </div>
            <form
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 110px 120px", gap: 8, marginTop: 12 }}
              onSubmit={(event) => {
                event.preventDefault();
                const weekId = oktForm.weekId || fysisk.weeks[0]?.id;
                if (!weekId || !actions?.opprettFysiskOkt) return;
                run(() => actions.opprettFysiskOkt!({
                  blockId: fysisk.id,
                  weekId,
                  date: oktForm.date,
                  title: oktForm.title,
                  durationMinutes: oktForm.durationMinutes,
                  exerciseTitle: oktForm.exerciseTitle || null,
                }));
              }}
            >
              <input value={oktForm.title} onChange={(e) => setOktForm((f) => ({ ...f, title: e.target.value }))} placeholder="Økt" style={inputStyle} />
              <input type="date" value={oktForm.date} onChange={(e) => setOktForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
              <button type="submit" disabled={pending || !actions?.opprettFysiskOkt} style={buttonStyle}>Legg økt</button>
              <input value={oktForm.exerciseTitle} onChange={(e) => setOktForm((f) => ({ ...f, exerciseTitle: e.target.value }))} placeholder="Første øvelse" style={{ ...inputStyle, gridColumn: "1 / 3" }} />
              <select value={oktForm.weekId || (fysisk.weeks[0]?.id ?? "")} onChange={(e) => setOktForm((f) => ({ ...f, weekId: e.target.value }))} style={inputStyle}>
                {fysisk.weeks.map((week) => <option key={week.id} value={week.id}>{week.label}</option>)}
              </select>
            </form>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 8, marginTop: 12 }}>
              {fysisk.weeks.map((week) => (
                <div
                  key={week.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!dragSessionId || !actions?.flyttFysiskOkt) return;
                    run(() => actions.flyttFysiskOkt!({ sessionId: dragSessionId, date: week.weekStart }));
                    setDragSessionId(null);
                  }}
                  style={{ border: `1px solid ${TL.hair}`, borderRadius: 8, background: TL.dock, padding: 8, minHeight: 72 }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: TL.text }}>{week.label}</div>
                  <div style={{ marginTop: 2, fontSize: 10, color: TL.mute }}>{week.weekStart}</div>
                  <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
                    {week.sessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        draggable={!!actions?.flyttFysiskOkt}
                        onDragStart={() => setDragSessionId(session.id)}
                        onDragEnd={() => setDragSessionId(null)}
                        title="Dra til annen uke for å flytte"
                        style={{ appearance: "none", textAlign: "left", border: `1px solid ${TL.hair}`, borderRadius: 7, background: TL.elev, color: TL.text, padding: "6px 7px", cursor: actions?.flyttFysiskOkt ? "grab" : "default", fontSize: 11.5 }}
                      >
                        {session.title}
                      </button>
                    ))}
                    {week.sessions.length === 0 && <span style={{ fontSize: 11, color: TL.mute }}>Slipp økt her</span>}
                  </div>
                </div>
              ))}
            </div>
            {fysisk.status !== "PUBLISHED" && actions?.publiserFysiskBlokk && (
              <button type="button" disabled={pending} onClick={() => run(() => actions.publiserFysiskBlokk!({ id: fysisk.id }))} style={buttonStyle}>
                Publiser fysisk blokk
              </button>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: "8px 0 0", color: TL.mute, fontSize: 13 }}>Opprett en fysisk blokk herfra, så kan økter legges inn og publiseres til PlayerHQ.</p>
            <form
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 120px 120px", gap: 8, marginTop: 12 }}
              onSubmit={(event) => {
                event.preventDefault();
                if (!actions?.opprettFysiskBlokk) return;
                run(() => actions.opprettFysiskBlokk!({ playerId, ...fysForm, focus: fysForm.focus || null }));
              }}
            >
              <input value={fysForm.title} onChange={(e) => setFysForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
              <input type="date" value={fysForm.startDate} onChange={(e) => setFysForm((f) => ({ ...f, startDate: e.target.value }))} style={inputStyle} />
              <input type="date" value={fysForm.endDate} onChange={(e) => setFysForm((f) => ({ ...f, endDate: e.target.value }))} style={inputStyle} />
              <input value={fysForm.focus} onChange={(e) => setFysForm((f) => ({ ...f, focus: e.target.value }))} placeholder="Fokus" style={{ ...inputStyle, gridColumn: "1 / 3" }} />
              <button type="submit" disabled={pending || !actions?.opprettFysiskBlokk} style={buttonStyle}>Opprett</button>
            </form>
          </>
        )}
      </div>

      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, fontWeight: 700 }}>Turnering</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 16, lineHeight: 1.2, color: TL.text }}>{turneringer[0]?.title ?? "Ingen turneringsplan"}</h2>
          </div>
          {konflikter.length > 0 && <span style={{ color: TL.text, fontSize: 11, fontWeight: 700 }}>{konflikter.length} åpne</span>}
        </div>
        {turneringer.length > 0 ? (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {turneringer.slice(0, 3).map((plan) => (
              <div key={plan.id} style={{ borderTop: `1px solid ${TL.hair}`, paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: 13, color: TL.text }}>{plan.title}</strong>
                  <span style={{ color: statusTone(plan.status), fontSize: 11, fontWeight: 700 }}>{plan.status}</span>
                </div>
                <p style={{ margin: "4px 0 0", color: TL.mute, fontSize: 12.5 }}>
                  {datoSpenn(plan.startDate, plan.endDate)} · {plan.rounds.length} runder
                  {plan.travelStartDate ? ` · reise ${datoSpenn(plan.travelStartDate, plan.travelEndDate ?? plan.travelStartDate)}` : ""}
                </p>
                {plan.status !== "PUBLISHED" && actions?.publiserTurneringsplan && (
                  <button type="button" disabled={pending} onClick={() => run(() => actions.publiserTurneringsplan!({ id: plan.id }))} style={buttonStyle}>
                    Publiser turneringsplan
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <p style={{ margin: "8px 0 0", color: TL.mute, fontSize: 13 }}>Opprett turneringsplan med reise, runder, brutto score, SG, mål og evaluering.</p>
            <form
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 120px 120px", gap: 8, marginTop: 12 }}
              onSubmit={(event) => {
                event.preventDefault();
                if (!actions?.opprettTurneringsplan) return;
                run(() => actions.opprettTurneringsplan!({
                  playerId,
                  title: turnForm.title,
                  startDate: turnForm.startDate,
                  endDate: turnForm.endDate,
                  travelStartDate: turnForm.travelStartDate || null,
                  travelEndDate: turnForm.travelEndDate || null,
                  focus: turnForm.focus,
                }));
              }}
            >
              <input value={turnForm.title} onChange={(e) => setTurnForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
              <input type="date" value={turnForm.startDate} onChange={(e) => setTurnForm((f) => ({ ...f, startDate: e.target.value, endDate: f.endDate || e.target.value }))} style={inputStyle} />
              <input type="date" value={turnForm.endDate} onChange={(e) => setTurnForm((f) => ({ ...f, endDate: e.target.value }))} style={inputStyle} />
              <input type="date" value={turnForm.travelStartDate} onChange={(e) => setTurnForm((f) => ({ ...f, travelStartDate: e.target.value }))} style={inputStyle} />
              <input type="date" value={turnForm.travelEndDate} onChange={(e) => setTurnForm((f) => ({ ...f, travelEndDate: e.target.value }))} style={inputStyle} />
              <button type="submit" disabled={pending || !actions?.opprettTurneringsplan} style={buttonStyle}>Opprett</button>
            </form>
          </>
        )}
        {melding && <p style={{ margin: "10px 0 0", color: TL.text, fontSize: 12 }}>{melding}</p>}
      </div>
      <div style={{ ...CARD, gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, fontWeight: 700 }}>Analyse</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 8, marginTop: 10 }}>
          <Metric label="Planlagt fys" value={`${analysed.plannedPhysicalMinutes} min`} />
          <Metric label="Fys tonnasje" value={analysed.physicalTonnageKg ? `${analysed.physicalTonnageKg} kg` : "—"} />
          <Metric label="Brutto" value={analysed.grossScoreTotal ? String(analysed.grossScoreTotal) : "—"} />
          <Metric label="SG" value={analysed.sgTotal == null ? "—" : String(analysed.sgTotal)} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 8, padding: "8px 9px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 3, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 17, color: TL.text }}>{value}</div>
    </div>
  );
}

const buttonStyle: CSSProperties = {
  marginTop: 10,
  minHeight: 34,
  borderRadius: 7,
  border: `1px solid ${TL.hair}`,
  background: TL.text,
  color: TL.scene,
  padding: "0 12px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const inputStyle: CSSProperties = {
  minHeight: 34,
  minWidth: 0,
  borderRadius: 7,
  border: `1px solid ${TL.hair}`,
  background: TL.dock,
  color: TL.text,
  padding: "0 9px",
  fontSize: 12,
};

function analyseFysTurnering(data: WorkbenchFysTurneringData) {
  const sessions = data.physicalBlocks.flatMap((block) => block.weeks.flatMap((week) => week.sessions));
  const rounds = data.tournamentPlans.flatMap((plan) => plan.rounds);
  const grossScores = rounds.map((round) => round.grossScore).filter((value): value is number => typeof value === "number");
  const sgValues = rounds.map((round) => round.strokesGained).filter((value): value is number => typeof value === "number");
  return {
    plannedPhysicalMinutes: sessions.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
    physicalTonnageKg: Math.round(sessions.reduce((sum, session) => sum + session.actualTonnageKg, 0)),
    grossScoreTotal: grossScores.length > 0 ? grossScores.reduce((sum, score) => sum + score, 0) : null,
    sgTotal: sgValues.length > 0 ? Math.round(sgValues.reduce((sum, sg) => sum + sg, 0) * 10) / 10 : null,
  };
}
