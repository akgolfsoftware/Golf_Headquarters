/**
 * Skoletid for foreldreportalen (D6).
 * Fasit: designsystem/paper/fase2/forelder/forelder-barn.html
 *
 * Timeplanens klokkeslett lagres som `PlayerBusyBlock` med kind = "SKOLE" og
 * recurring = "WEEKLY" — den modellen finnes allerede og eier «når er barnet
 * opptatt». Denne filen legger bare til svaret på «har noen stått inne for
 * tidene i inneværende semester».
 *
 * Ubekreftet semester = «skoletid mangler» hos coachen. Forrige semesters
 * tider brukes ALDRI som erstatning.
 */

import { prisma } from "@/lib/prisma";
import { semesterFor, skoletidStatus, type SkoletidStatus } from "@/lib/domain/skoletid";

export type SkoletidBlokk = {
  /** «Man–tor» / «Fredag» — slått sammen fra ukedagene som har samme tid. */
  dager: string;
  fra: string;
  til: string;
};

export type SkoletidData = {
  semesterKode: string;
  semesterVisning: string;
  status: SkoletidStatus;
  blokker: SkoletidBlokk[];
};

const DAGNAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const KL_FMT = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

/**
 * Slår sammen sammenhengende ukedager med identisk tid, slik fasiten viser
 * dem («Man–tor 08:15–14:00» + «Fredag 08:15–12:30»). Uten sammenslåing ville
 * kortet vist fem nesten like linjer.
 */
function slaaSammen(
  perDag: Map<number, { fra: string; til: string }>,
): SkoletidBlokk[] {
  const blokker: SkoletidBlokk[] = [];
  let start: number | null = null;
  let forrige: { fra: string; til: string } | null = null;

  const lukk = (slutt: number) => {
    if (start === null || !forrige) return;
    const dager =
      start === slutt
        ? DAGNAVN[start]
        : `${DAGNAVN[start]}–${DAGNAVN[slutt].toLowerCase()}`;
    blokker.push({ dager, fra: forrige.fra, til: forrige.til });
  };

  for (let d = 0; d < 7; d++) {
    const tid = perDag.get(d);
    const lik = tid && forrige && tid.fra === forrige.fra && tid.til === forrige.til;

    if (tid && lik) continue;
    if (start !== null) lukk(d - 1);

    if (tid) {
      start = d;
      forrige = tid;
    } else {
      start = null;
      forrige = null;
    }
  }
  if (start !== null) lukk(6);

  return blokker;
}

export async function hentSkoletid(
  playerId: string,
  now = new Date(),
): Promise<SkoletidData> {
  const semester = semesterFor(now);

  const [bekreftelse, blokkRader] = await Promise.all([
    prisma.skoletidBekreftelse.findUnique({
      where: { playerId_semester: { playerId, semester: semester.kode } },
      select: { bekreftetAt: true },
    }),
    prisma.playerBusyBlock.findMany({
      where: { userId: playerId, kind: "SKOLE", recurring: "WEEKLY" },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const perDag = new Map<number, { fra: string; til: string }>();
  for (const b of blokkRader) {
    // getDay(): 0 = søndag. Uka starter mandag her, som ellers i appen.
    const idx = (b.startAt.getDay() + 6) % 7;
    if (!perDag.has(idx)) {
      perDag.set(idx, { fra: KL_FMT.format(b.startAt), til: KL_FMT.format(b.endAt) });
    }
  }

  return {
    semesterKode: semester.kode,
    semesterVisning: semester.visning,
    status: skoletidStatus(semester, bekreftelse?.bekreftetAt ?? null, now),
    blokker: slaaSammen(perDag),
  };
}
