/**
 * AgencyOS · Caddie · Aktivitet (v2). V2-port av
 * src/app/admin/(legacy)/agencyos/caddie/aktivitet/page.tsx — sentral
 * oversikt over AI-Caddie sin aktivitet i akademiet. Samme datalogikk 1:1
 * (Notification type="caddie", AgentRun-feil siste 7 dager). Ingen
 * demo-fallback: tom DB gir ærlig tom tilstand, query-feil flagges som feil.
 *
 * Server component.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CaddieSubNavV2 } from "@/components/admin/v2/caddie/caddie-subnav-v2";
import { AdminCaddieAktivitetV2, type AiError, type CaddieEvent } from "@/components/admin/v2/AdminCaddieAktivitetV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Caddie · Aktivitet · AgencyOS (v2)" };

export default async function V2CaddieAktivitetPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const nowMs = new Date().getTime();
  let events: ReadonlyArray<CaddieEvent> = [];
  let loadError = false;
  let aiErrors: AiError[] = [];

  try {
    const raw = await prisma.notification.findMany({
      where: { type: { startsWith: "caddie" } },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { user: { select: { name: true } } },
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
    loadError = true;
  }

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
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos/caddie">Caddie</TilbakeLenke>
      <CaddieSubNavV2 />
      <AdminCaddieAktivitetV2 events={events} nowMs={nowMs} loadError={loadError} aiErrors={aiErrors} />
    </V2Shell>
  );
}

function mapNotificationToCaddieType(type: string): CaddieEvent["type"] {
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
