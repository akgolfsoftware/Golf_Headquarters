"use server";

/**
 * Fangst fra PlayerHQ "I dag" (Hjem) — rå stemme-/tekstobservasjon fra
 * spilleren selv, uendret og utolket (fasit playerhq-chat-desktop.html:
 * "Din observasjon, dine ord. Jeg tolker den ikke for deg."). IKKE samme
 * pipeline som SessionRecording (coachens lyd-opptak av økter, chunk-
 * opplastet til Supabase) eller opprettFangstSjekkpunktPlanAction (krever
 * en AI-analysert AnalyseResultat — fangst her er nettopp UANALYSERT).
 *
 * Reach: samme varslings-dispatcher som agent-funn (in-app Notification +
 * web push, uten Telegram — dette er en rutineobservasjon, ikke en eskalering).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { varsleAgentFunn } from "@/lib/agents/agent-notify";

export async function sendFangstFraHjem(
  tekst: string,
): Promise<{ ok: true; klokkeslett: string } | { ok: false; feil: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const trimmet = tekst.trim();
  if (!trimmet) return { ok: false, feil: "Ingen tekst å lagre." };

  const coachId = await resolveCoachIdForPlayer(user.id);
  const fornavn = user.name?.split(/\s+/)[0] ?? "Spilleren";

  await varsleAgentFunn({
    coachId,
    tittel: `Fangst fra ${fornavn}`,
    tekst: trimmet,
    lenke: "/admin/innboks",
    telegram: false,
  });

  const klokkeslett = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return { ok: true, klokkeslett };
}
