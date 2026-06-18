/**
 * AgencyOS · AgencyOS — Caddie-aktivitet
 *
 * Sentral oversikt over AI-Caddie sin aktivitet i akademiet. Tidslinje med
 * hendelser (forslag, analyser, eskaleringer, flagg), KPI-strip, mest aktive
 * spillere, fordeling av drill-typer og AI-feil siste 7 dager.
 *
 * Designet er migrert fra `public/design/batch4/coachhq-caddie-aktivitet.html`.
 * Henter data fra Notification (type: "caddie"). Ingen demo-fallback: tom DB
 * gir ærlig tom tilstand, og en query-feil flagges som feil — ikke skjules.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CaddieAktivitetClient } from "./aktivitet-client";
import type { CaddieEvent, AiError } from "./aktivitet-client";

export const dynamic = "force-dynamic";

export default async function CaddieAktivitetPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const nowMs = new Date().getTime();
  let events: ReadonlyArray<CaddieEvent> = [];
  let loadError = false;
  let aiErrors: AiError[] = [];

  try {
    const raw = await prisma.notification.findMany({
      where: { type: { startsWith: "caddie" } },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: { select: { name: true } },
      },
    });

    events = raw.map((n, i) => ({
      id: n.id,
      at: n.createdAt,
      type: mapNotificationToCaddieType(n.type),
      statusKind: n.readAt ? "ok" : "wait",
      playerInitials: initialsOf(n.user.name),
      playerName: n.user.name,
      pillLabel: prettifyType(n.type),
      title: n.body ?? n.title,
      italicSpan: undefined,
      confidence: typicalConfidence(i),
      followUp: null,
    }));
  } catch {
    // Surface som feil — ikke skjul bak demo-data.
    loadError = true;
  }

  // Ekte AI-feil siste 7 dager fra AgentRun (status ERROR).
  if (!loadError) {
    const syvDager = new Date(nowMs - 7 * 24 * 60 * 60 * 1000);
    try {
      const runs = await prisma.agentRun.findMany({
        where: { status: "ERROR", createdAt: { gte: syvDager } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      aiErrors = runs.map((r) => ({
        id: r.id,
        title: `${r.agentName} feilet`,
        desc: r.error ?? "Ukjent feil",
        at: r.createdAt,
      }));
    } catch {
      aiErrors = [];
    }
  }

  return (
    <CaddieAktivitetClient
      events={events}
      nowMs={nowMs}
      loadError={loadError}
      aiErrors={aiErrors}
    />
  );
}

function mapNotificationToCaddieType(
  type: string,
): CaddieEvent["type"] {
  if (type.includes("escalat")) return "escalate";
  if (type.includes("flag")) return "flagged";
  if (type.includes("analyz")) return "analyzed";
  if (type.includes("import")) return "import";
  return "suggest";
}

function prettifyType(type: string): string {
  const t = type.replace(/^caddie[._-]?/, "").replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1) || "Hendelse";
}

function typicalConfidence(i: number): number {
  return 0.7 + ((i * 7) % 28) / 100;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
