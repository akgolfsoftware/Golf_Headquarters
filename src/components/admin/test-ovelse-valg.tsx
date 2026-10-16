"use client";

import { useActionState } from "react";
import { leggTilOvelseFraTestForm } from "@/lib/portal-tester/test-followup-actions";

export function TestOvelseValg({
  playerId,
  resultId,
  ovelseId,
  sessions,
}: {
  playerId: string;
  resultId: string;
  ovelseId: string;
  sessions: Array<{ id: string; label: string }>;
}) {
  const [state, action, pending] = useActionState(leggTilOvelseFraTestForm, null);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="resultId" value={resultId} />
      <input type="hidden" name="ovelseId" value={ovelseId} />
      <label className="flex flex-col gap-1 text-sm">
        Fremtidig økt
        <select name="sessionId" required defaultValue="" className="min-h-10 border px-2 py-1">
          <option value="" disabled>Velg økt</option>
          {sessions.map((session) => <option key={session.id} value={session.id}>{session.label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Minutter
        <input name="durationMinutes" type="number" min={1} max={120} required className="min-h-10 w-24 border px-2 py-1" />
      </label>
      <button type="submit" disabled={pending} className="min-h-10 border px-3 py-1 text-sm font-semibold disabled:opacity-50">
        {pending ? "Legger til …" : "Legg til i utkast"}
      </button>
      {state ? <p role="status" className="w-full text-sm">{state.ok ? "Øvelsen er lagt i øktutkastet. Publiser økten separat." : state.error}</p> : null}
    </form>
  );
}
