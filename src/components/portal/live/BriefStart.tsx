"use client";

import { useActionState, useRef } from "react";
import { unstable_rethrow } from "next/navigation";

/** Serveren avgjør om økten kan startes. Ved nettfeil beholdes hele arket. */
export function BriefStart({ action }: { action: () => Promise<void> }) {
  const submitting = useRef(false);
  const [error, submit, pending] = useActionState(async () => {
    try {
      await action();
      return null;
    } catch (cause) {
      unstable_rethrow(cause);
      return "Økta kunne ikke åpnes. Prøv igjen. Hvis den allerede er startet, fortsetter du der du slapp.";
    } finally {
      submitting.current = false;
    }
  }, null as string | null);
  return <form action={submit} aria-busy={pending} onSubmit={(event) => {
    if (submitting.current) event.preventDefault();
    else submitting.current = true;
  }}>
    {error && <p className="ph04-feil" role="alert">{error}</p>}
    <button className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full" data-od-id="brief-start" type="submit" disabled={pending}>{pending ? "Åpner økta…" : "Start økta"}</button>
  </form>;
}
