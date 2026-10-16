"use client";
import { useState, useTransition } from "react";
import { Ark } from "@/components/precision/pa-a4";
import { Knapp } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { gjentakelsesDatoer } from "@/lib/workbench/plan-handlinger-kontrakt";
import { flyttWorkbenchPlanOkt, kopierWorkbenchPlanOkt, angreWorkbenchPlanHandling } from "@/lib/workbench/plan-handlinger-actions";

export function WorkbenchPlanHandlinger({ session, playerOwnsPlan = true, onLagret }: { session: WorkbenchSession; playerOwnsPlan?: boolean; onLagret: () => void }) {
  const [open, setOpen] = useState(false), [mode, setMode] = useState("kopi"), [date, setDate] = useState(session.date), [time, setTime] = useState(`${String(Math.floor(session.startMinute / 60)).padStart(2, "0")}:${String(session.startMinute % 60).padStart(2, "0")}`), [count, setCount] = useState(2), [interval, setInterval] = useState(1);
  const [undo, setUndo] = useState<string | null>(null), [message, setMessage] = useState<string | null>(null), [error, setError] = useState<string | null>(null), [pending, start] = useTransition();
  const save = () => start(async () => {
    try {
      const [h, m] = time.split(":").map(Number), base = { playerId: session.playerId, sessionId: session.id, expectedUpdatedAt: session.updatedAt };
      const r = mode === "flytt" ? await flyttWorkbenchPlanOkt({ ...base, date, startMinute: h * 60 + m, durationMinutes: session.durationMinutes })
        : await kopierWorkbenchPlanOkt({ ...base, dates: mode === "gjenta" ? gjentakelsesDatoer(date, count, interval) : [date], startMinute: h * 60 + m });
      if (!r.ok) { setError(r.error); return; }
      setUndo(r.undo); setMessage(`${mode === "flytt" ? "Økt flyttet" : playerOwnsPlan ? "Utkastkopi lagret" : "Forslag sendt til spilleren for godkjenning"}${r.conflicts ? ` · ${r.conflicts} overlapp; beholdt som utkast` : ""}.`); setError(null); setOpen(false); onLagret();
    } catch { setError("Handlingen kunne ikke lagres. Inndataene er bevart."); }
  });
  return <><Knapp variant="ghost" onClick={() => setOpen(true)}>Flytt, kopier eller gjenta</Knapp>{message && <p className="ws-muted">{message}</p>}{error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
    {undo && <Knapp variant="ghost" disabled={pending} onClick={() => start(async () => { try { const r = await angreWorkbenchPlanHandling(undo); if (!r.ok) setError(r.error); else { setUndo(null); setMessage("Handlingen er angret."); setError(null); onLagret(); } } catch { setError("Angre feilet. Dataene er bevart."); } })}>Angre siste handling</Knapp>}
    {open && <Ark open title="Flytt, kopier eller gjenta" kicker={session.title} onClose={() => setOpen(false)} footer={<><Knapp fullWidth disabled={pending || !date || !time} onClick={save}>{pending ? "Lagrer …" : "Lagre handling"}</Knapp><Knapp fullWidth variant="ghost" onClick={() => setOpen(false)}>Avbryt</Knapp></>}>
      {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}<div className="a9-skjema"><label className="ws-field">Handling<select value={mode} onChange={e => setMode(e.target.value)}><option value="kopi">{playerOwnsPlan ? "Kopier som utkast" : "Foreslå ny økt / tid"}</option><option value="gjenta">{playerOwnsPlan ? "Gjenta som utkastserie" : "Foreslå gjentatte økter"}</option>{playerOwnsPlan && <option value="flytt">Flytt denne økten</option>}</select></label>
        <label className="ws-field">Dato<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label className="ws-field">Start<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
        {mode === "gjenta" && <><label className="ws-field">Antall økter<input type="number" min={1} max={52} value={count} onChange={e => setCount(Number(e.target.value))} /></label><label className="ws-field">Uker mellom øktene<input type="number" min={1} max={12} value={interval} onChange={e => setInterval(Number(e.target.value))} /></label></>}
        <p className="a9-tekst">{playerOwnsPlan ? "Kopier får nye ID-er og er utkast. Gjennomføring og logger blir på originalen." : "Originalen endres ikke. Spillerens kalender påvirkes først etter at spilleren har godkjent forslaget og treneren publiserer utkastet."} Angre gjelder i 15 minutter og stopper hvis økten er endret eller startet.</p>
      </div></Ark>}
  </>;
}
