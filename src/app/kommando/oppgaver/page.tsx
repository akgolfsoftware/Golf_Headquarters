import { permanentRedirect } from "next/navigation";

/**
 * /kommando/oppgaver → /admin/handlingssenter (2026-07-15).
 * KommandoTask (personlig duplikat-tracker) er retired — Notion-synkede
 * oppgaver (OppgaveCache) via handlingssenteret er kanon, samme flytting som
 * /admin/workspace/oppgaver fikk 12. juli.
 */
export default function KommandoOppgaverRedirect(): never {
  permanentRedirect("/admin/handlingssenter");
}
