/**
 * AgencyOS — Innstillinger · API-nøkler (`/admin/settings/api`), v2. Port
 * av `(legacy)/settings/api/page.tsx` (2026-07-14, AgencyOS Bølge 3.35) —
 * samme `ApiKey`-modell og samme `createApiKey`/`revokeApiKey`-kontrakt
 * (bor i `(legacy)/settings/api/actions.ts`, uendret).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInnstillingerApiV2, type ApiNokkelRadV2 } from "@/components/admin/v2/AdminInnstillingerApiV2";

function formatDate(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function relative(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "nå nettopp";
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t}t siden`;
  const dg = Math.floor(t / 24);
  return `${dg} dag${dg === 1 ? "" : "er"} siden`;
}

export default async function AdminApiKeysPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const keys = await prisma.apiKey.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: { user: { select: { name: true } } },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
  });

  const aktiveAntall = keys.filter((k) => !k.revokedAt).length;

  const rader: ApiNokkelRadV2[] = keys.map((k) => ({
    id: k.id,
    navn: k.name,
    prefix: k.prefix,
    scopes: Array.isArray(k.scopes) ? (k.scopes as string[]) : [],
    erRevokert: k.revokedAt != null,
    eierNavn: user.role === "ADMIN" ? k.user.name : null,
    brukTekst: k.lastUsedAt ? relative(k.lastUsedAt) : "aldri",
    opprettetTekst: formatDate(k.createdAt),
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminInnstillingerApiV2 keys={rader} aktiveAntall={aktiveAntall} />
    </V2Shell>
  );
}
