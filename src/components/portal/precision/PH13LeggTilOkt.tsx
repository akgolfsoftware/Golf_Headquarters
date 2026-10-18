"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Ark } from "@/components/precision/pa-a4";
import { Knapp, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { hentBankOktutkast, leggBankOvelseIOkt, type BankSessionOption } from "@/lib/portal-drills/session-actions";

/** Samme bekreftede flyt fra bank, øvelsesark og direkte lenke til en øvelse. */
export function PH13LeggTilOkt({ exerciseId, title, sessions: initialSessions, onClose, onSaved }: {
  exerciseId: string; title: string; sessions?: readonly BankSessionOption[];
  onClose: () => void; onSaved?: (alreadyAdded: boolean, sessionTitle: string) => void;
}) {
  const [sessions, setSessions] = useState<readonly BankSessionOption[] | null>(initialSessions ?? null);
  const [sessionId, setSessionId] = useState(initialSessions?.[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const lock = useRef(false);
  useEffect(() => {
    if (initialSessions) return;
    let active = true;
    hentBankOktutkast().then((options) => {
      if (!active) return;
      setSessions(options); setSessionId(options[0]?.id ?? "");
    }).catch(() => { if (active) setError("Øktutkastene kunne ikke hentes. Lukk og prøv igjen."); });
    return () => { active = false; };
  }, [initialSessions]);
  const add = () => {
    if (!sessionId || lock.current) return;
    lock.current = true; setError(null);
    start(async () => {
      try {
        const result = await leggBankOvelseIOkt({ sessionId, exerciseId });
        if (!result.ok) { setError(result.error); return; }
        setSaved(true);
        onSaved?.(result.alreadyAdded, sessions?.find((s) => s.id === sessionId)?.title ?? "");
      } catch { setError("Lagringen ble ikke bekreftet. Prøv igjen. Øvelsen blir ikke lagt til to ganger."); }
      finally { lock.current = false; }
    });
  };
  return <Ark open onClose={() => { if (!pending) onClose(); }} kicker="Øvelsesbank" title="Legg til i økt"
    footer={saved ? <Knapp onClick={onClose}>Ferdig</Knapp> : <><Knapp onClick={add} disabled={!sessionId || pending} loading={pending} loadingText="Legger til …">Legg til øvelse</Knapp><Knapp variant="ghost" disabled={pending} onClick={onClose}>Avbryt</Knapp></>}>
    <h3 className="ph13-valgtovelse">{title}</h3>
    {saved ? <div role="status"><p>Øvelsen er lagret i øktutkastet.</p><KnappLenke href={`/portal/planlegge/workbench?niva=okt&okt=${encodeURIComponent(sessionId)}`} variant="secondary">Åpne øktutkastet</KnappLenke></div>
      : sessions == null ? !error && <LasterTilstand text="Henter dine øktutkast …" />
      : sessions.length ? <label className="ph13-oktvalg">Velg ditt øktutkast
        <select value={sessionId} disabled={pending} onChange={(e) => { setSessionId(e.target.value); setError(null); }}>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.date.slice(8, 10)}.{s.date.slice(5, 7)}.{s.date.slice(0, 4)} · {s.time} · {s.title}</option>)}
        </select>
      </label> : <div><p>Du har ingen kommende økter som du selv eier og som fortsatt er utkast.</p><KnappLenke href="/portal/planlegge/workbench" variant="secondary">Opprett økt i Workbench</KnappLenke></div>}
    {!saved && <p className="ph13-hjelp">Øvelsen legges i ditt eget utkast. Coachens plan og gruppeøkter endres ikke.</p>}
    {error && <p role="alert">{error}</p>}
  </Ark>;
}
