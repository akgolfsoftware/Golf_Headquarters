/**
 * /portal/(fullscreen)/live/[sessionId]/logger — Live-økt logger
 *
 * Variant A "Stor +1 touchtarget" fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w
 * (s8-live-logger.jsx).
 *
 * En-hånds bruk på range/putting-green. Stort +1-touchtarget (96px) +
 * mindre BOM-knapp. 80–110px tabular-nums rep-counter sentralt. Offline-
 * fungerende (localStorage-buffer). Vibrasjon ved hver rep.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { LoggerClient } from "./logger-client";

export const dynamic = "force-dynamic";

export default async function LiveLoggerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser();
  const { sessionId } = await params;

  // Dummy-data — kobles mot Prisma TrainingSession + drill når den
  // tilstanden finnes i schemaet.
  const drill = {
    category: "PUTT",
    title: "Gate-putt med",
    titleItalic: "start-linje",
    target: 8,
    targetTotal: 10,
    targetText: "8 av 10 inn",
    repsPlanned: 10,
    drillIndex: 2,
    drillTotal: 5,
  };

  return <LoggerClient sessionId={sessionId} drill={drill} />;
}
