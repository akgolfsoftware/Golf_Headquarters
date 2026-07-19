/**
 * AgencyOS Marketing (M1) — innholdskalender + post-kø. Grunnmur uten
 * AI-generering og uten eksterne API-er (M2/M3 bygger videre).
 *
 * Auth: samme requirePortalUser-guard (ADMIN/COACH) som resten av /admin.
 * Chrome: V2Shell (flaten ligger i Mer-panelet under Drift — railens aktive
 * seksjon utledes automatisk av shellens prefiks-matching, som for de andre
 * Mer-flatene; det finnes ingen egen «mer»-nav-id).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminMarketingV2, type MarketingPostV2Row } from "@/components/admin/v2/AdminMarketingV2";
import { MARKETING_KANALER, MARKETING_STATUSER, type MarketingKanal, type MarketingStatus } from "@/lib/admin-marketing/konstanter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing · AgencyOS" };

const DAGER_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]; // getDay()-indeks
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function datoLabel(d: Date): string {
  return `${DAGER_KORT[d.getDay()]} ${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

/** Ukjent DB-verdi (aldri via UI-et) → trygg fallback, ingen krasj. */
function somKanal(v: string): MarketingKanal {
  return (MARKETING_KANALER as readonly string[]).includes(v) ? (v as MarketingKanal) : "IG";
}
function somStatus(v: string): MarketingStatus {
  return (MARKETING_STATUSER as readonly string[]).includes(v) ? (v as MarketingStatus) : "UTKAST";
}

export default async function AdminMarketingPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const poster = await prisma.marketingPost.findMany({ orderBy: { scheduledAt: "asc" } });

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const rader: MarketingPostV2Row[] = poster.map((p) => ({
    id: p.id,
    tittel: p.title,
    kanal: somKanal(p.channel),
    datoLabel: datoLabel(p.scheduledAt),
    passert: p.scheduledAt < idag,
    brief: p.brief,
    status: somStatus(p.status),
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminMarketingV2 poster={rader} />
    </V2Shell>
  );
}
