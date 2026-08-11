/**
 * PlayerHQ · Varsler (/portal/varsler) — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-hjem-varsler.html
 * (rute per manifest-w2-filter-varsler-putting.md).
 *
 * Én varselflate med kategori-filter: fangst av alt som venter på spilleren.
 * Samme Notification-spørring som før; her grupperes radene per dag
 * (I dag / Denne uka / Tidligere) og mappes til fasitens kategorier.
 * Marker-som-lest går via eksisterende markNotificationsRead-action.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { VarslerV2, type VarslerV2Data, type VarslerV2Item, type VarselKategori } from "@/components/portal/v2/VarslerV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

// ── Ikon-oppslag per varsel-type (v2 ikon-navn, "@/components/v2/icon") ──
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
  "session-invite": "users",
  system: "bell",
};

function ikon(type: string): string {
  return IKON[type] ?? "info";
}

/** Fasitens filterkategorier, avledet av Notification.type. */
function kategori(type: string): VarselKategori {
  if (type === "melding" || type === "ai" || type === "session-invite") return "coach";
  if (type === "booking") return "timer";
  if (type === "runde" || type === "trackman") return "foring";
  if (type.includes("test")) return "tester";
  if (type === "betaling" || type === "faktura" || type === "credit") return "betaling";
  return "annet";
}

// ── Relativ tid (uendret fra forrige versjon av skjermen) ─────────────
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

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const startIdag = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startUke = new Date(startIdag.getTime() - 6 * 86_400_000);

  let uleste = 0;
  const items: VarslerV2Item[] = rows.map((r) => {
    if (r.readAt == null) uleste++;
    return {
      id: r.id,
      icon: ikon(r.type),
      kategori: kategori(r.type),
      tittel: r.title,
      body: r.body,
      tid: relTid(r.createdAt, now),
      ulest: r.readAt == null,
      link: r.link,
      gruppe: r.createdAt >= startIdag ? "I dag" : r.createdAt >= startUke ? "Denne uka" : "Tidligere",
    };
  });

  const data: VarslerV2Data = { items, uleste, navn: user.name ?? "" };

  return (
    <V2Shell bredde="kolonne" aktiv="hjem" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <TilbakeLenke href="/portal">I dag</TilbakeLenke>
      <VarslerV2 data={data} />
    </V2Shell>
  );
}
