/**
 * v2-forhåndsvisning — Foreldreportal · Økonomi (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderOkonomiV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/okonomi/page.tsx): kun PARENT slippes inn, og subscription +
 * payment hentes per koblet barn. Alt avledes her og sendes typet til klienten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderOkonomiV2,
  type ForelderOkonomiData,
} from "@/components/portal/v2/ForelderOkonomiV2";
import type { PaymentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const UBETALT: PaymentStatus[] = ["PENDING", "FAILED"];

export default async function V2ForelderOkonomiPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  // Tomtilstand — ingen barn koblet (samme kontrakt, barnAntall 0).
  if (childIds.length === 0) {
    const tomt: ForelderOkonomiData = {
      barnAntall: 0,
      utestaaendeOre: 0,
      betaltOre: 0,
      aktivePakker: 0,
      ubetalteAntall: 0,
      abonnement: [],
      sistePayments: [],
    };
    return (
      <V2Shell aktiv="okonomi" nav={FORELDER_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <ForelderOkonomiV2 data={tomt} />
      </V2Shell>
    );
  }

  const [abonnementer, betalinger] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: { in: childIds } },
      select: {
        userId: true,
        tier: true,
        status: true,
        currentPeriodEnd: true,
        monthlyCredits: true,
        creditsRemaining: true,
      },
    }),
    prisma.payment.findMany({
      where: { userId: { in: childIds } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        userId: true,
        amountOre: true,
        status: true,
        type: true,
        description: true,
        createdAt: true,
      },
    }),
  ]);

  const abonnementPerBarn = new Map(abonnementer.map((a) => [a.userId, a]));

  // Utestående totalt (PENDING/FAILED) på tvers av barn.
  const ubetalte = betalinger.filter((p) => UBETALT.includes(p.status));
  const utestaaendeOre = ubetalte.reduce((s, p) => s + p.amountOre, 0);

  // Betalt totalt (SUCCEEDED).
  const betaltOre = betalinger
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((s, p) => s + p.amountOre, 0);

  // Aktive coaching-pakker (credits > 0).
  const aktivePakker = abonnementer.filter((a) => a.monthlyCredits > 0).length;

  const data: ForelderOkonomiData = {
    barnAntall: barn.length,
    utestaaendeOre,
    betaltOre,
    aktivePakker,
    ubetalteAntall: ubetalte.length,
    abonnement: barn.map((b) => {
      const fornavn = b.child.name.split(" ")[0] ?? b.child.name;
      const ab = abonnementPerBarn.get(b.child.id);
      return {
        childId: b.child.id,
        fornavn,
        tier: ab?.tier ?? "GRATIS",
        status: ab?.status ?? null,
        currentPeriodEndISO: ab?.currentPeriodEnd?.toISOString() ?? null,
        monthlyCredits: ab?.monthlyCredits ?? 0,
        creditsRemaining: ab?.creditsRemaining ?? 0,
      };
    }),
    // Siste 4 betalinger (preview — full historikk på /forelder/fakturaer).
    sistePayments: betalinger.slice(0, 4).map((p) => ({
      id: p.id,
      tittel: p.description ?? p.type,
      datoISO: p.createdAt.toISOString(),
      amountOre: p.amountOre,
      status: p.status,
    })),
  };

  return (
    <V2Shell aktiv="okonomi" nav={FORELDER_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <ForelderOkonomiV2 data={data} />
    </V2Shell>
  );
}
