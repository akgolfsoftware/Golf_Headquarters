"use client";

import { useActionState, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { Play } from "lucide-react";
import { Knapp } from "@/components/precision/pa";

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
    {error && <p className="pa-okt-dempet" role="alert" style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "var(--signal-tint)", color: "var(--text-primary)" }}>{error}</p>}
    <Knapp type="submit" size="xl" fullWidth icon={Play} iconName="play" loading={pending} loadingText="Åpner økta …">Start økta</Knapp>
  </form>;
}
