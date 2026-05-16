/**
 * Notifikasjon når Voice Memo V3 har analysert ferdig en coaching-økt.
 *
 * V3 kaller `notifiserAnalyseKlar` etter at AI-analyse er lagret på
 * SessionRecording.aiAnalysis. Dette legger en in-app-notification i
 * Bell-dropdown for spilleren, og forsøker push hvis VAPID er konfigurert.
 *
 * Best-effort: feiler stille, blokkerer aldri analyse-pipelinen.
 */

import { notify } from "@/lib/notifications";

export type NotifiserAnalyseKlarInput = {
  playerId: string;
  okteDato: Date;
  /** Første setning eller oppsummering fra V3 (bruk `oppsummering`). */
  sammendrag: string;
  /** Hvilken trening-økt skal det lenkes til. Hvis null lenkes til /portal/tren. */
  sessionId?: string | null;
};

export async function notifiserAnalyseKlar(
  input: NotifiserAnalyseKlarInput,
): Promise<void> {
  const datoStr = input.okteDato.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
  });

  const tittel = `Ny coach-analyse fra økten ${datoStr}`;
  const body = input.sammendrag.slice(0, 140);
  const link = input.sessionId
    ? `/portal/tren/${input.sessionId}`
    : "/portal/tren";

  // 1) In-app notification (Bell-dropdown). Best-effort.
  try {
    await notify({
      userId: input.playerId,
      type: "melding",
      title: tittel,
      body,
      link,
    });
  } catch (err) {
    console.error("[notify-analysis-ready] in-app feilet", err);
  }

  // 2) Web Push — krever VAPID-keys (parkert i V2.1). Stub for nå.
  // TODO: hent PushSubscription for playerId og kall sendPushNotification()
  // når VAPID er satt opp.
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[notify-analysis-ready] (push-stub) ${input.playerId}: ${tittel}`,
    );
  }
}
