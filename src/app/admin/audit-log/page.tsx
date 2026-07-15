/**
 * v2: AgencyOS Audit-log (retning C). Egen top-level route-group (v2preview)
 * som IKKE arver AdminShell — kun root-layout — så V2Shell leverer all chrome
 * (IkonRail/BunnNav) i mørk v2-scope.
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
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminAuditLogV2,
  type AdminAuditLogV2Data,
  type AdminAuditLogV2Event,
  type AdminAuditLogV2Kind,
  type AdminAuditLogV2Status,
} from "@/components/admin/v2/AdminAuditLogV2";

export const dynamic = "force-dynamic";

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

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const mistenkelige = rows.filter(
    (r) => statusFromAction(r.action) !== "ok" && r.createdAt >= sevenDaysAgo,
  ).length;

  const data: AdminAuditLogV2Data = { events, total, mistenkelige };

  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/analyse">Innsikt</TilbakeLenke>
      <AdminAuditLogV2 data={data} />
    </V2Shell>
  );
}
