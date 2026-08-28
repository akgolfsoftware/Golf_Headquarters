/**
 * v2-forhåndsvisning — Foreldreportal · Fakturaer/Økonomi (retning C).
 * Egen top-level route-group (v2preview) som IKKE arver forelder-layouten —
 * kun root-layout. V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV),
 * ForelderFakturaerV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/fakturaer/page.tsx): kun PARENT slippes inn, og betalingene
 * hentes for ALLE koblede barn (siste 50, nyest først).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import {
  ForelderFakturaerV2,
  type ForelderFakturaRad,
} from "@/components/portal/v2/ForelderFakturaerV2";

export const dynamic = "force-dynamic";

/* FO-05-fasitens datoformat («04.08.2026») + månedsgruppe («August 2026»). */
const NB_DAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const NB_MANED = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  month: "long",
  year: "numeric",
});

function manedLabel(d: Date): string {
  const s = NB_MANED.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function V2ForelderFakturaerPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const payments = childIds.length
    ? await prisma.payment.findMany({
        where: { userId: { in: childIds } },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          booking: {
            select: {
              id: true,
              serviceType: { select: { name: true } },
            },
          },
        },
        take: 50,
      })
    : [];

  const naa = new Date();
  const fakturaer: ForelderFakturaRad[] = payments.map((p) => ({
    id: p.id,
    beskrivelse: p.description ?? p.booking?.serviceType?.name ?? p.type,
    spillerNavn: p.user?.name ?? null,
    belopOre: p.amountOre,
    status: p.status,
    dato: NB_DAG.format(p.createdAt),
    maaned: manedLabel(p.createdAt),
    iAar: p.createdAt.getFullYear() === naa.getFullYear(),
  }));

  return (
    <V2Shell bredde="kolonne" aktiv="okonomi" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <ForelderFakturaerV2 data={{ fakturaer, parentName: user.name }} />
    </V2Shell>
  );
}
