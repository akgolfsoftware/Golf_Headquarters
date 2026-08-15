/**
 * v2-forhåndsvisning — Foreldreportal · Barn (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderBarnV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/forelder/barn/page.tsx):
 * kun PARENT slippes inn, og hvert koblet barn aggregeres med pyramide-snapshot
 * (siste 30 d), øktantall (30 d), neste kommende økt og utestående betaling.
 * ALT er ekte Prisma-data — ingen tall fabrikeres.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder, alderFraFodselsdato } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderBarnV2,
  type ForelderBarnData,
  type ForelderBarnRad,
} from "@/components/portal/v2/ForelderBarnV2";
import type { PyramidArea } from "@/generated/prisma/client";
import { hentSkoletid } from "@/lib/forelder-skoletid";
import { semesterFor } from "@/lib/domain/skoletid";

/** «20.12» — semesterets siste dag, vist etter bekreftelse. */
const SEMESTER_SLUTT_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "numeric",
  timeZone: "Europe/Oslo",
});

export const dynamic = "force-dynamic";

// Apex→base: TURN øverst, FYS fundament (pyramide-kanon).
const AKSE_APEX: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

export default async function V2ForelderBarnPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  let data: ForelderBarnData = { barn: [] };

  if (barn.length > 0) {
    const childIds = barn.map((b) => b.child.id);
    const now = new Date();
    const tretti = new Date(now);
    tretti.setDate(tretti.getDate() - 30);

    const [nesteOkter, sisteLogger, betalingerRad] = await Promise.all([
      // Neste planlagte/aktive økt per barn.
      prisma.trainingPlanSession.findMany({
        where: {
          plan: { userId: { in: childIds } },
          status: { in: ["PLANNED", "ACTIVE"] },
          scheduledAt: { gte: now },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          scheduledAt: true,
          title: true,
          plan: { select: { userId: true } },
        },
      }),
      // Gjennomførte økter siste 30 dager — antall + pyramide-fordeling.
      prisma.trainingPlanSessionLog.findMany({
        where: {
          completedAt: { gte: tretti, not: null },
          session: { plan: { userId: { in: childIds } } },
        },
        select: {
          session: {
            select: {
              pyramidArea: true,
              plan: { select: { userId: true } },
            },
          },
        },
      }),
      // Utestående betalinger (PENDING/FAILED) per barn.
      prisma.payment.findMany({
        where: { userId: { in: childIds }, status: { in: ["PENDING", "FAILED"] } },
        select: { userId: true, amountOre: true },
      }),
    ]);

    // Neste økt per barn (første kommende).
    const nesteOktPerBarn = new Map<
      string,
      { scheduledAt: Date; title: string } | null
    >();
    for (const id of childIds) nesteOktPerBarn.set(id, null);
    for (const s of nesteOkter) {
      if (!nesteOktPerBarn.get(s.plan.userId)) {
        nesteOktPerBarn.set(s.plan.userId, {
          scheduledAt: s.scheduledAt,
          title: s.title,
        });
      }
    }

    // Øktantall + pyramide-fordeling per barn (siste 30 d).
    const okterPerBarn = new Map<string, number>();
    const aksePerBarn = new Map<string, Record<PyramidArea, number>>();
    for (const id of childIds) {
      okterPerBarn.set(id, 0);
      aksePerBarn.set(id, { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
    }
    for (const l of sisteLogger) {
      const uid = l.session.plan.userId;
      okterPerBarn.set(uid, (okterPerBarn.get(uid) ?? 0) + 1);
      const fordeling = aksePerBarn.get(uid);
      if (fordeling) fordeling[l.session.pyramidArea] += 1;
    }

    // Utestående betaling per barn.
    const utestaaendePerBarn = new Map<string, { antall: number; ore: number }>();
    for (const id of childIds) utestaaendePerBarn.set(id, { antall: 0, ore: 0 });
    for (const p of betalingerRad) {
      if (!p.userId) continue;
      const agg = utestaaendePerBarn.get(p.userId);
      if (agg) {
        agg.antall += 1;
        agg.ore += p.amountOre;
      }
    }

    /* D6: skoletid per barn. Hentes parallelt — ett oppslag per barn, og
       foreldre har typisk 1–3. Fravær av bekreftelse er et ærlig «mangler»,
       ikke en feil. */
    const skoletidPerBarn = new Map(
      await Promise.all(
        barn.map(async (b) => {
          const s = await hentSkoletid(b.child.id);
          return [
            b.child.id,
            {
              semesterVisning: s.semesterVisning,
              semesterSlutt: SEMESTER_SLUTT_FMT.format(semesterFor(new Date()).slutt),
              status: { bekreftet: s.status.bekreftet, tekst: s.status.tekst },
              blokker: s.blokker,
            },
          ] as const;
        }),
      ),
    );

    const rader: ForelderBarnRad[] = barn.map((b) => {
      const id = b.child.id;
      const fordeling =
        aksePerBarn.get(id) ??
        ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } as Record<
          PyramidArea,
          number
        >);
      return {
        id,
        navn: b.child.name,
        avatarUrl: b.child.avatarUrl,
        relationship: b.relationship,
        hcp: b.child.hcp,
        alder: alderFraFodselsdato(b.child.dateOfBirth),
        // Reelt samtykke — ParentRelation-koblingen krever bekreftet
        // foreldresamtykke (guardian-consent-token), men feltet settes på
        // barnet selv. Aldri fabrikkert.
        samtykkeGitt: b.child.guardianConsentGivenAt != null,
        okter30d: okterPerBarn.get(id) ?? 0,
        pyramide: AKSE_APEX.map((akse) => ({ akse, value: fordeling[akse] })),
        nesteOkt: nesteOktPerBarn.get(id) ?? null,
        utestaaende: utestaaendePerBarn.get(id) ?? { antall: 0, ore: 0 },
        skoletid: skoletidPerBarn.get(id) ?? null,
      };
    });

    data = { barn: rader };
  }

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="barn"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderBarnV2 data={data} />
    </V2Shell>
  );
}
