"use client";

import { useActionState, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { Play } from "lucide-react";
import { Knapp } from "@/components/precision/pa";
import styles from "./session-brief.module.css";

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
    {error && <p className={styles.error} role="alert">{error}</p>}
    <Knapp size="xl" fullWidth icon={Play} type="submit" data-od-id="brief-start" loading={pending} loadingText="Åpner økt …" style={{ height: 64 }}>Start økt</Knapp>
  </form>;
}
