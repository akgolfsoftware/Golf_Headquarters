/**
 * v2-forhåndsvisning — PlayerHQ Varsler (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), VarslerV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/portal/varsler/page.tsx):
 * samme Notification-spørring, relative-tid-beregning og i dag/tidligere-gruppering.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { VarslerV2, type VarslerV2Data, type VarslerV2Item } from "@/components/portal/v2/VarslerV2";

export const dynamic = "force-dynamic";

// ── Ikon-oppslag per varsel-type (samme semantikk som ekte skjerm,
//    kartlagt til v2 ikon-navn i "@/components/v2/icon") ─────────────
const IKON: Record<string, string> = {
  plan: "activity",
  drill: "target",
  melding: "message-circle",
  turnering: "trophy",
  achievement: "star",
  runde: "bar-chart",
  trackman: "activity",
  booking: "calendar",
  credit: "credit-card",
  betaling: "credit-card",
  faktura: "file-text",
  ai: "sparkles",
  system: "bell",
};

function ikon(type: string): string {
  return IKON[type] ?? "info";
}

// ── Relativ tid (portert 1:1 fra ekte skjerm) ─────────────────────
function relTid(d: Date, now: Date): string {
  const startIdag = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d >= startIdag) {
    return d.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Oslo",
    });
  }
  const dager = Math.floor((startIdag.getTime() - d.getTime()) / 86_400_000) + 1;
  if (dager === 1) return "I går";
  if (dager < 7) return `${dager} dager`;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  });
}

export default async function V2VarslerPreviewPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const startIdag = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const idag: VarslerV2Item[] = [];
  const tidligere: VarslerV2Item[] = [];
  let uleste = 0;

  for (const r of rows) {
    const item: VarslerV2Item = {
      id: r.id,
      icon: ikon(r.type),
      tittel: r.title,
      tid: relTid(r.createdAt, now),
      ulest: r.readAt == null,
      link: r.link,
    };
    if (item.ulest) uleste++;
    if (r.createdAt >= startIdag) idag.push(item);
    else tidligere.push(item);
  }

  const data: VarslerV2Data = { idag, tidligere, uleste };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <VarslerV2 data={data} />
    </V2Shell>
  );
}
