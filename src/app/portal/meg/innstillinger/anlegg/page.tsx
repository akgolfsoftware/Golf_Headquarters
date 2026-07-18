/**
 * v2 — PlayerHQ Innstillinger · Mitt treningsanlegg (retning C).
 * /portal/meg/innstillinger/anlegg
 *
 * Spiller registrerer tilgjengelige fasiliteter og utstyr. Brukes for å
 * filtrere drill-biblioteket slik at spilleren kun ser øvelser som kan gjøres
 * med det utstyret/anlegget de faktisk har tilgang til.
 * Eksempel: Spiller med 12×12m puttinggree får aldri foreslått lag-putts på 25m.
 *
 * v2-port 17. juli 2026: auth-guard (samme allow-liste) og Prisma-oppslaget er
 * uendret — kun presentasjonslaget er byttet (InnstillingerAnleggV2 erstatter
 * FasilitetProfilForm; lagring går fortsatt via lagreFasilitetProfil).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { InnstillingerAnleggV2 } from "@/components/portal/v2/InnstillingerAnleggV2";

export const dynamic = "force-dynamic";

export default async function AnleggPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT", "COACH", "ADMIN"] });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tilgjengeligeFasiliteter: true },
  });

  const tilgjengelig: DrillFasilitet[] = dbUser?.tilgjengeligeFasiliteter ?? [];

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerAnleggV2 data={{ tilgjengelig }} />
    </V2Shell>
  );
}
