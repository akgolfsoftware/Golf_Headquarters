/**
 * Foreldreportal · forside «I dag» — Precision Athletics standard.
 *
 * Foresattvisning med ukens økter, dagens oppmøte, ACWR-belastningsmonitor,
 * samtykkestyring for spillere under 16 år, klippekort/faktura og treparts dialog.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentBarnForForelder } from "@/lib/forelder";
import { tilDatoKolonne, fraDatoKolonne } from "@/lib/workbench/wb-map";
import { klokkeslett } from "@/lib/domain/kalender-lag";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import { ForelderPrecisionView } from "@/components/forelder/ForelderPrecisionView";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · Forelder" };

const OSLO_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});

const OSLO_DAGNOKKEL = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dagKort(d: Date): string {
  const s = OSLO_UKEDAG_KORT.format(d).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function ForelderPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length > 0) {
    const fokus = barn[0];
    const childId = fokus.child.id;

    const now = new Date();
    const iDagIso = OSLO_DAGNOKKEL.format(now)
      .split(".")
      .reverse()
      .join("-");
    const iDagUtc = tilDatoKolonne(iDagIso);
    const ukedagIdx = (iDagUtc.getUTCDay() + 6) % 7; // man=0 … søn=6
    const mandagUtc = new Date(iDagUtc.getTime() - ukedagIdx * 24 * 3600 * 1000);
    const sondagUtc = new Date(mandagUtc.getTime() + 6 * 24 * 3600 * 1000);

    const [ukeOkter, nesteBooking] = await Promise.all([
      prisma.workbenchSession.findMany({
        where: {
          playerId: childId,
          status: { in: ["PUBLISHED", "IN_PROGRESS", "COMPLETED"] },
          isTemplate: false,
          date: { gte: mandagUtc, lte: sondagUtc },
        },
        orderBy: [{ date: "asc" }, { startMinute: "asc" }],
        select: {
          id: true,
          title: true,
          date: true,
          startMinute: true,
          durationMinutes: true,
          status: true,
          location: true,
        },
      }),
      prisma.booking.findFirst({
        where: {
          userId: childId,
          startAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { startAt: "asc" },
        select: {
          startAt: true,
          serviceType: { select: { name: true } },
          coach: { select: { name: true } },
        },
      }),
    ]);

    const dagens = ukeOkter.find((o) => fraDatoKolonne(o.date) === iDagIso);

    const dagensOktPrecision = dagens
      ? {
          tittel: dagens.title,
          tidspunkt: `${klokkeslett(dagens.startMinute)} – ${klokkeslett(
            dagens.startMinute + dagens.durationMinutes
          )}`,
          sted: dagens.location || "AK Golf Academy / GFGK",
          trener: nesteBooking?.coach?.name || "Coach Anders",
        }
      : null;

    const ukensOkterPrecision = ukeOkter.map((o) => ({
      dag: dagKort(o.date),
      tittel: o.title,
      tid: `${klokkeslett(o.startMinute)} – ${klokkeslett(
        o.startMinute + o.durationMinutes
      )}`,
      fullfort: o.status === "COMPLETED",
    }));

    return (
      <V2Shell
        bredde="kolonne"
        aktiv="oversikt"
        nav={FORELDER_NAV}
        mer={FORELDER_MER}
        navn={user.name}
        avatarUrl={user.avatarUrl}
      >
        <ForelderPrecisionView
          spillerNavn={fokus.child.name}
          dagensOkt={dagensOktPrecision}
          ukensOkter={ukensOkterPrecision}
        />
      </V2Shell>
    );
  }

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="oversikt"
      nav={FORELDER_NAV}
      mer={FORELDER_MER}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderPrecisionView
        spillerNavn="Spiller"
        dagensOkt={null}
        ukensOkter={[]}
      />
    </V2Shell>
  );
}
