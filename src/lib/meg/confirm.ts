// src/lib/meg/confirm.ts
// Tar imot innkommende melding FØR agenten. Hvis det finnes en ventende
// skrive-handling og brukeren bekrefter/avbryter, utføres/forkastes den her.
// Returnerer svartekst, eller null hvis meldingen ikke gjelder bekreftelse
// (da skal agenten håndtere den som vanlig).
import "server-only";
import {
  getLatestPending,
  markDone,
  markCancelled,
  isConfirmation,
  isCancellation,
} from "@/lib/meg/pending";
import { notionOpprettOppgave, notionFullforOppgave } from "@/lib/meg/connectors/notion";

// Registret over faktiske skrive-handlinger. Kalles KUN etter bekreftelse.
const WRITE_DISPATCH: Record<string, (args: never) => Promise<string>> = {
  notion_opprett_oppgave: (args) => notionOpprettOppgave(args),
  notion_fullfor_oppgave: (args) => notionFullforOppgave(args),
};

export async function handleConfirmation(text: string): Promise<string | null> {
  const pending = await getLatestPending();
  if (!pending) return null;

  if (isCancellation(text)) {
    await markCancelled(pending.id);
    return `Avbrutt: ${pending.summary}`;
  }

  if (isConfirmation(text)) {
    const exec = WRITE_DISPATCH[pending.tool_name];
    if (!exec) {
      await markCancelled(pending.id);
      return `Ukjent handling (${pending.tool_name}) — forkastet.`;
    }
    const result = await exec(pending.args as never);
    await markDone(pending.id);
    return result;
  }

  // Ventende handling finnes, men meldingen er verken bekreft eller avbryt —
  // la agenten svare. Handlingen står til den utløper eller besvares.
  return null;
}
