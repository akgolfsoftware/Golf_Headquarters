/**
 * Foreldreportal · forside «I dag» — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-01 Forelder les.dc.html (+ FO-01L lys).
 *
 * Ren lesevisning (erstatter Paper PP-3-fanene): dagens økt, ukas oppmøte
 * fra WORKBENCH-domenet (WorkbenchSession — kun PUBLISHED | IN_PROGRESS |
 * COMPLETED, forelder ser ALDRI DRAFT, jf. invariant 3 og
 * lib/domain/forelder-neste-okt), neste booking og fotnoten om hva
 * foresatte ser. Auth uendret: kun PARENT (requirePortalUser i
 * forelder/layout + her).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentBarnForForelder } from "@/lib/forelder";
import { ukenummer } from "@/lib/uke-helpers";
import { tilDatoKolonne, fraDatoKolonne } from "@/lib/workbench/wb-map";
import { klokkeslett } from "@/lib/domain/kalender-lag";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import {
  ForelderV2,
  type ForelderIdagData,
  type ForelderIdagOktRad,
} from "@/components/portal/v2/ForelderV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · Forelder" };

const OSLO_UKEDAG_LANG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "long",
});
const OSLO_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});
const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
});
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});
const OSLO_DATO_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
});
const OSLO_DAGNOKKEL = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function tid(d: Date): string {
  return OSLO_TID.format(d).replace(":", ".");
}

/** «Man» — kort ukedag med stor forbokstav (fasitens radprefix). */
function dagKort(d: Date): string {
  const s = OSLO_UKEDAG_KORT.format(d).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** «Lørdag 22.» — fasitens caps i dagens økt-kort. */
function dagLang(d: Date): string {
  const s = OSLO_UKEDAG_LANG.format(d);
  return `${s.charAt(0).toUpperCase() + s.slice(1)} ${OSLO_DAG.format(d)}.`;
}

export default async function ForelderPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  let data: ForelderIdagData = {
    childFirstName: null,
    dagensOkt: null,
    ukenummer: ukenummer(new Date()),
    okter: [],
    neste: null,
    coachNavn: null,
  };

  if (barn.length > 0) {
    const fokus = barn[0];
    const childId = fokus.child.id;
    const childFirstName = fokus.child.name.split(" ")[0] ?? fokus.child.name;

    const now = new Date();
    const iDagIso = OSLO_DAGNOKKEL.format(now)
      .split(".")
      .reverse()
      .join("-");
    // Oslo-mandag som ISO-dato («YYYY-MM-DD») → uke-vinduet i date-kolonnen.
    const iDagUtc = tilDatoKolonne(iDagIso);
    const ukedagIdx = (iDagUtc.getUTCDay() + 6) % 7; // man=0 … søn=6
    const mandagUtc = new Date(iDagUtc.getTime() - ukedagIdx * 24 * 3600 * 1000);
    const sondagUtc = new Date(mandagUtc.getTime() + 6 * 24 * 3600 * 1000);

    const [ukeOkter, nesteBooking] = await Promise.all([
      // Ukas økter fra workbench-domenet. Forelder ser ALDRI DRAFT
      // (invariant 3) — kun publiserte/pågående/fullførte økter.
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
      // Neste reelle booking (aldri avlyst) frem i tid — «Neste»-kortet.
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

    const okter: ForelderIdagOktRad[] = ukeOkter.map((o) => {
      const erIDag = fraDatoKolonne(o.date) === iDagIso;
      const fullfort = o.status === "COMPLETED";
      let sub: string;
      if (fullfort) sub = "fullført";
      else if (erIDag) sub = `i dag ${klokkeslett(o.startMinute)}`;
      else sub = klokkeslett(o.startMinute);
      return {
        id: o.id,
        tittel: `${dagKort(o.date)} · ${o.title}`,
        sub,
        status: fullfort ? "FULLFORT" : erIDag ? "I_DAG" : "ANNET",
      };
    });

    data = {
      childFirstName,
      dagensOkt: dagens
        ? {
            dagLabel: dagLang(dagens.date),
            tittel: dagens.title,
            detalj: [
              `${klokkeslett(dagens.startMinute)}–${klokkeslett(
                dagens.startMinute + dagens.durationMinutes
              )}`,
              dagens.location,
            ]
              .filter(Boolean)
              .join(" · "),
          }
        : null,
      ukenummer: ukenummer(now),
      okter,
      neste: nesteBooking
        ? `${nesteBooking.serviceType.name} · ${OSLO_DATO_KORT.format(nesteBooking.startAt).replace(/\.$/, "")} · oppmøte ${tid(nesteBooking.startAt)}`
        : null,
      coachNavn: nesteBooking?.coach?.name ?? null,
    };
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
      <ForelderV2 data={data} />
    </V2Shell>
  );
}
