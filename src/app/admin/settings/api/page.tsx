/**
 * v2: AgencyOS Innstillinger → API-nøkler. Rekomponerer den ekte
 * /admin/(legacy)/settings/api-flaten i v2-språket (V2Shell +
 * v2-komponentbiblioteket). Mutasjonene (opprett/revoker) er UENDRET —
 * gjenbruker server actions direkte fra legacy-mappen (samme mønster som
 * AdminBookingerV2/AdminNySpillerV2): ingen duplisert forretningslogikk.
 *
 * ADMIN-only (samme som legacy — API-nøkler gir tilgang til hele
 * organisasjonens data). Siden er derfor ikke rolle-scopet på server: alle
 * nøkler i organisasjonen hentes og vises med eier-navn.
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminApiKeysV2,
  type AdminApiKeysV2Data,
  type AdminApiKeysV2Nokkel,
} from "@/components/admin/v2/AdminApiKeysV2";

export const dynamic = "force-dynamic";

const scopesSchema = z.array(z.string());

function formatDate(d: Date) {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function relativ(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "nå nettopp";
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t}t siden`;
  const dg = Math.floor(t / 24);
  return `${dg} dag${dg === 1 ? "" : "er"} siden`;
}

export default async function V2AdminApiKeysPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const keys = await prisma.apiKey.findMany({
    include: { user: { select: { name: true } } },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
  });

  const nokler: AdminApiKeysV2Nokkel[] = keys.map((k) => {
    const scopesParsed = scopesSchema.safeParse(k.scopes);
    return {
      id: k.id,
      navn: k.name,
      prefix: k.prefix,
      scopes: scopesParsed.success ? scopesParsed.data : [],
      eier: k.user.name ?? "Uten navn",
      opprettet: formatDate(k.createdAt),
      sistBrukt: k.lastUsedAt ? `Brukt ${relativ(k.lastUsedAt)}` : "Aldri brukt",
      utloper: k.expiresAt ? formatDate(k.expiresAt) : null,
      revokert: k.revokedAt != null,
    };
  });

  const data: AdminApiKeysV2Data = {
    nokler,
    aktiveCount: nokler.filter((n) => !n.revokert).length,
    totalCount: nokler.length,
  };

  return (
    <V2Shell nav={AGENCYOS_NAV}>
      <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
      <AdminApiKeysV2 data={data} />
    </V2Shell>
  );
}
