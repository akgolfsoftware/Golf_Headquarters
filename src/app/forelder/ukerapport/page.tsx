/**
 * Foreldreportal · Ukerapport — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-09 Ukerapport.dc.html (+ FO-09L lys).
 *
 * Auth: kun PARENT (requirePortalUser). Tallene kommer fra
 * hentForelderUkerapport (datamatten urørt); «Gjennomført»-radene hentes
 * her (samme kilde og ukevindu som loaderen — TrainingSessionV2, gte/lt).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder, hentForelderUkerapport } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import {
  ForelderUkerapportV2,
  type UkerapportOktRad,
} from "@/components/portal/v2/ForelderUkerapportV2";

export const dynamic = "force-dynamic";

const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});
const OSLO_DATO_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
});
const OSLO_DATO_FULL = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** «Man» — fasitens korte dagform med stor forbokstav. */
function dagKort(d: Date): string {
  const s = OSLO_DAG.format(d).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** «16.00» — fasitens tidsformat med punktum. */
function tid(d: Date): string {
  return OSLO_TID.format(d).replace(":", ".");
}

const STATUS_TEKST: Record<string, string> = {
  COMPLETED: "fullført",
  IN_PROGRESS: "pågår",
  PLANNED: "planlagt",
  PUBLISHED: "planlagt",
  CANCELLED: "avlyst",
  SKIPPED: "hoppet over",
};

export default async function ForelderUkerapportPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const data = await hentForelderUkerapport(user.id);
  const barn = await hentBarnForForelder(user.id);

  const now = new Date();
  const ukeStart = startOfWeek(now);
  const ukeSlutt = endOfWeek(now);
  const sisteDag = new Date(ukeSlutt.getTime() - 24 * 3600 * 1000);
  const ukeSpenn = `${OSLO_DATO_KORT.format(ukeStart)}.–${OSLO_DATO_FULL.format(sisteDag)}`;

  let okter: UkerapportOktRad[] = [];
  if (barn.length > 0) {
    const childId = barn[0].child.id;
    const rader = await prisma.trainingSessionV2.findMany({
      // Samme ukevindu som hentForelderUkerapport (gte/lt — endOfWeek er
      // neste mandag 00:00, eksklusiv).
      where: { studentId: childId, startTime: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, startTime: true, endTime: true, status: true },
    });
    okter = rader.map((r) => ({
      id: r.id,
      tittel: `${dagKort(r.startTime)} · ${r.title}`,
      sub: `${tid(r.startTime)}${r.endTime ? `–${tid(r.endTime)}` : ""} · ${
        STATUS_TEKST[r.status] ?? r.status.toLowerCase()
      }`,
    }));
  }

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="oversikt"
      nav={FORELDER_NAV} mer={FORELDER_MER}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderUkerapportV2
        data={data}
        okter={okter}
        ukeSpenn={ukeSpenn}
        parentName={user.name}
      />
    </V2Shell>
  );
}
