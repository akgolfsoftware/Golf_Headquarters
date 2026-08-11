/**
 * /portal/tren/[sessionId]/planlagt — REN REDIRECT (Paper-port W1, fase2).
 *
 * Vedtak Anders 11.08.2026: økt-detalj er slått sammen til ÉN side —
 * /portal/gjennomfore/[id] (fasit: playerhq-okt-detalj.html) — med
 * planlagt/gjennomført som to tilstander av samme skjerm. URL-en beholdes
 * (gamle lenker og bokmerker virker), men innholdet bor på den sammenslåtte
 * siden. Inviter-kompis-funksjonen lever videre der.
 */

import { redirect } from "next/navigation";

export default async function OktPlanlagtRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/portal/gjennomfore/${sessionId}`);
}
