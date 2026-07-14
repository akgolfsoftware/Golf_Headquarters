/**
 * AgencyOS — Audit-log (`/admin/audit-log`), v2.
 * Port av `(legacy)/audit-log/page.tsx` (2026-07-14, AgencyOS Bølge 3.1) —
 * samme datamodell (`prisma.auditLog`, siste 50), ny v2-presentasjon i
 * `AdminAuditLogV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminAuditLogV2, type AdminAuditLogV2Event, type AuditKind, type AuditStatus } from "@/components/admin/v2/AdminAuditLogV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit-log · AgencyOS (v2)" };

function kindFromAction(action: string): AuditKind {
  const prefix = action.split(".")[0]?.toLowerCase() ?? "";
  if (["auth", "login", "user", "session"].includes(prefix)) return "auth";
  if (["api", "google-calendar", "stripe", "webhook", "notion"].includes(prefix)) return "api";
  if (["security", "key"].includes(prefix)) return "security";
  return "data";
}

function statusFromAction(action: string): AuditStatus {
  const a = action.toLowerCase();
  if (/fail|error|denied|unauthorized|mislyk/.test(a)) return "danger";
  if (/cancel|delet|avlys|slett/.test(a)) return "warn";
  return "ok";
}

const NB = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AuditLogPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const rows = await prisma.auditLog
    .findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { actor: { select: { name: true, email: true } } } })
    .catch(() => []);

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
  const mistenkelige = rows.filter((r) => statusFromAction(r.action) !== "ok" && r.createdAt >= sevenDaysAgo).length;

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminAuditLogV2 events={events} mistenkelige={mistenkelige} />
    </V2Shell>
  );
}
