"use client";

import { useActionState, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { Play } from "lucide-react";
import { Ikon } from "@/components/precision/pa";

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
  return <form action={submit} aria-busy={pending} style={{ display: "flex", flexDirection: "column", gap: 8 }} onSubmit={(event) => {
    if (submitting.current) event.preventDefault();
    else submitting.current = true;
  }}>
    {error && <p role="alert" style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)" }}>{error}</p>}
    <button className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full pa-btn--icon-l" style={{ height: 64 }} data-od-id="brief-start" type="submit" disabled={pending}>
      {pending ? "Åpner økta …" : <><Ikon icon={Play} size={22} name="play" />Start økt</>}
    </button>
  </form>;
}
