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
import { hentBarnOkonomiSummer } from "@/lib/forelder-okonomi";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import {
  ForelderOkonomiV2,
  type ForelderOkonomiData,
} from "@/components/portal/v2/ForelderOkonomiV2";

export const dynamic = "force-dynamic";

export default async function V2ForelderOkonomiPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  // Tomtilstand — ingen barn koblet (samme kontrakt, barnAntall 0).
  if (childIds.length === 0) {
    const tomt: ForelderOkonomiData = {
      barnAntall: 0,
      parentName: user.name,
      abonnement: [],
    };
    return (
      <V2Shell bredde="kolonne" aktiv="okonomi" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
        <ForelderOkonomiV2 data={tomt} />
      </V2Shell>
    );
  }

  /* FO-07: tallene grupperes PER BARN — neste trekk, betalt i år, utestående.
   * Betalt-i-år/utestående kommer fra `hentBarnOkonomiSummer` (STEG 19.3-fiks,
   * se den fila for begrunnelse). */
  const [abonnementer, okonomiPerBarn] = await Promise.all([
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
    hentBarnOkonomiSummer(childIds),
  ]);

  const abonnementPerBarn = new Map(abonnementer.map((a) => [a.userId, a]));

  const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const data: ForelderOkonomiData = {
    barnAntall: barn.length,
    parentName: user.name,
    abonnement: barn.map((b) => {
      const fornavn = b.child.name.split(" ")[0] ?? b.child.name;
      const ab = abonnementPerBarn.get(b.child.id);
      const okonomi = okonomiPerBarn.get(b.child.id);
      const betaltIAarOre = okonomi?.betaltIAarOre ?? 0;
      const utestaaendeOre = okonomi?.utestaaendeOre ?? 0;
      return {
        childId: b.child.id,
        fornavn,
        tier: ab?.tier ?? "GRATIS",
        status: ab?.status ?? null,
        nesteTrekk: ab?.currentPeriodEnd ? NB_DATO.format(ab.currentPeriodEnd) : null,
        monthlyCredits: ab?.monthlyCredits ?? 0,
        creditsRemaining: ab?.creditsRemaining ?? 0,
        betaltIAarOre,
        utestaaendeOre,
      };
    }),
  };

  return (
    <V2Shell bredde="kolonne" aktiv="okonomi" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <ForelderOkonomiV2 data={data} />
    </V2Shell>
  );
}
