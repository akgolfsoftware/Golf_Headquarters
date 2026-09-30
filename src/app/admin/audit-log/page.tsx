/**
 * AgencyOS Logger (AG-24, Precision Athletics). Visningen ligger i
 * AG24Drift; siden eier bare tilgang og data.
 *
 * Auth + data følger den ekte (legacy) /admin/audit-log-flaten 1:1: samme
 * requirePortalUser-guard (kun ADMIN) og samme Prisma-spørring (AuditLog,
 * nyeste 50 + totaltelling) og samme kind/status-utledning fra action-
 * prefiks. Mapper til AdminAuditLogV2Data (ærlige tomrom, ingen fabrikerte
 * hendelser).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import {
  AG24Logger,
  type AuditData as AdminAuditLogV2Data,
  type AuditHendelse as AdminAuditLogV2Event,
  type AuditKind as AdminAuditLogV2Kind,
  type AuditStatus as AdminAuditLogV2Status,
} from "@/components/admin/precision/AG24Drift";

export const dynamic = "force-dynamic";
export const metadata = { title: "Logger · AgencyOS" };

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function kindFromAction(action: string): AdminAuditLogV2Kind {
  const prefix = action.split(".")[0]?.toLowerCase() ?? "";
  if (["auth", "login", "user", "session"].includes(prefix)) return "auth";
  if (["api", "google-calendar", "stripe", "webhook", "notion"].includes(prefix)) return "api";
  if (["security", "key"].includes(prefix)) return "security";
  return "data";
}

function statusFromAction(action: string): AdminAuditLogV2Status {
  const a = action.toLowerCase();
  if (/fail|error|denied|unauthorized|mislyk/.test(a)) return "danger";
  if (/cancel|delet|avlys|slett/.test(a)) return "warn";
  return "ok";
}

export default async function V2AdminAuditLogPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [rows, total] = await Promise.all([
    prisma.auditLog
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { actor: { select: { name: true, email: true } } },
      })
      .catch(() => []),
    prisma.auditLog.count().catch(() => 0),
  ]);

  const events: AdminAuditLogV2Event[] = rows.map((r) => ({
    id: r.id,
    time: NB.format(r.createdAt),
    kind: kindFromAction(r.action),
    actor: r.actor?.name ?? r.actor?.email ?? r.actorId ?? "system",
    action: r.action,
    status: statusFromAction(r.action),
  }));

  const data: AdminAuditLogV2Data = { events, total };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG24Logger data={data} />
    </AgencyOSSkall>
  );
}
