/**
 * Ukesdigest — spillerens uke (D3, fasit: designsystem/paper/fase2/playerhq/playerhq-ukesdigest.html).
 *
 * Samme tall som coachens ukesrapport og foreldrenes ukerapport, med samme
 * nevner. Regnestykket bor i src/lib/domain/etterlevelse.ts — denne filen
 * henter data og former dem, den regner ikke etterlevelse selv.
 *
 * Rapportagenten LESER — ingenting her skriver. Digesten vises først når
 * coachen har delt den (`deltAt`); før det er `null` det ærlige svaret, og
 * flaten viser tom tilstand.
 */

import { hentEtterlevelse } from "@/lib/portal/etterlevelse-data";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { prisma } from "@/lib/prisma";
import { getActiveAkSgVersionId } from "@/lib/ak-sg/active-model";
import { harVisbarSg } from "@/lib/ak-sg/visibility";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { hentSisteDeling } from "@/lib/admin/ukesrapport-deling";
import {
  etterlevelseTekst,
  NEVNER_TEKST,
  type Etterlevelse,
} from "@/lib/domain/etterlevelse";

export type DigestDag = {
  /** «Ma», «Ti» … i Oslo-uka, mandag først. */
  kort: string;
  tilstand: "gjennomfort" | "hoppet" | "ingen";
};

export type DigestSg = {
  navn: string;
  verdi: number;
  /** Fritekst under navnet, f.eks. «SG per runde». */
  note: string;
};

export type UkesdigestData = {
  ukenummer: number;
  periode: string;
  /** Når coachen delte den. Null = ikke delt ennå → tom tilstand. */
  deltAt: Date | null;
  deltAv: string | null;

  etterlevelse: Etterlevelse;
  etterlevelseTekst: string | null;
  nevnerTekst: string;
  loggetMinutter: number;
  planlagtMinutter: number;
  uke: DigestDag[];

  sg: DigestSg[];
  sgRunder: number;

  nesteUkeOkter: number;
  nesteUkeMinutter: number;

  testforfall: { navn: string; forfaller: Date }[];
  turneringer: { navn: string; fra: Date; til: Date | null }[];
};

const DAG_KORT = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

function ukenummer(d: Date): number {
  const dato = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = dato.getUTCDay() || 7;
  dato.setUTCDate(dato.getUTCDate() + 4 - dag);
  const arsstart = new Date(Date.UTC(dato.getUTCFullYear(), 0, 1));
  return Math.ceil(((dato.getTime() - arsstart.getTime()) / 86_400_000 + 1) / 7);
}

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Oslo",
});

/** Mandag-indeks (0–6) for en dato i Oslo-tid. */
function dagIndex(d: Date, ukeStart: Date): number {
  return Math.floor((d.getTime() - ukeStart.getTime()) / 86_400_000);
}

export async function hentUkesdigest(
  userId: string,
  now = new Date(),
): Promise<UkesdigestData> {
  /* Hvilken uke digesten gjelder avgjøres av DELINGEN, ikke av dagens dato.
     Coachen deler søndag kveld for uka som avsluttes; åpner spilleren appen
     mandag står han i neste uke. Et blindt `startOfWeek(now)` spurte da etter
     en uke ingen hadde delt, og digesten var usynlig resten av uka.
     Uten deling faller vi tilbake på inneværende uke — det er rammen den
     tomme tilstanden skal vise. */
  const deling = await hentSisteDeling(userId, now);
  const activeModelVersionId = await getActiveAkSgVersionId();
  const ukeStart = deling?.ukeStart ?? startOfWeek(now);
  /* endOfWeek gir MANDAG NESTE UKE kl. 00:00 — en eksklusiv øvre grense.
     Spørringene bruker den derfor med `lt`, aldri `lte`, ellers drar de med
     seg økter som ligger på mandagen etter. Til visning trekkes ett døgn fra
     så perioden leses som mandag–søndag. */
  const nesteStart = endOfWeek(ukeStart);
  const nesteSlutt = new Date(nesteStart.getTime() + 7 * 86_400_000);
  const sisteDag = new Date(nesteStart.getTime() - 86_400_000);
  const femRunderSiden = new Date(now.getTime() - 90 * 86_400_000);

  const [ukeOkter, nesteOkter, runder, forfall, turneringer, e] = await Promise.all([
    loadVisibleSessionRange(userId, ukeStart.toISOString(), nesteStart.toISOString()),
    loadVisibleSessionRange(userId, nesteStart.toISOString(), nesteSlutt.toISOString()),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: femRunderSiden } },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sgSource: true, sgModelVersionId: true },
      orderBy: { playedAt: "desc" },
      take: 5,
    }),
    prisma.testAssignment.findMany({
      where: { playerId: userId, status: "OPEN", dueDate: { not: null } },
      select: { dueDate: true, test: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] },
      },
      select: {
        tournament: { select: { name: true, startDate: true, endDate: true } },
      },
      take: 3,
    }),
    hentEtterlevelse(userId, now),
  ]);

  const visbareRunder = runder.filter((runde) => harVisbarSg(runde, activeModelVersionId));

  /* Coachnavnet slås opp separat fordi delingstabellen er bevisst uten
     @relation (additiv, jf. gotchas §Schema-endringer). */
  const deltAv = deling
    ? (
        await prisma.user.findUnique({
          where: { id: deling.coachId },
          select: { name: true },
        })
      )?.name ?? null
    : null;

  const loggetMinutter = e.gjennomfortMinutter;
  const planlagtMinutter = e.planlagtMinutter;

  const uke: DigestDag[] = DAG_KORT.map((kort) => ({ kort, tilstand: "ingen" }));
  for (const o of ukeOkter) {
    const i = dagIndex(o.startTime, ukeStart);
    if (i < 0 || i > 6) continue;
    if (o.status === "COMPLETED") uke[i].tilstand = "gjennomfort";
    // TrainingSessionV2 har ingen ABANDONED — de to avvik-statusene her er alt
    // SessionStatusV2 kjenner. Etterlevelse-modulen dekker begge enumene.
    else if (
      uke[i].tilstand === "ingen" &&
      (o.status === "SKIPPED" || o.status === "CANCELLED")
    ) {
      uke[i].tilstand = "hoppet";
    }
  }

  // SG per område: snitt over rundene som faktisk har tallet. Runder uten
  // verdi hoppes over i stedet for å telles som 0 — et manglende tall er ikke
  // et nøytralt resultat.
  const snitt = (verdier: (number | null)[]): number | null => {
    const tall = verdier.filter((v): v is number => v != null);
    if (tall.length === 0) return null;
    return tall.reduce((a, b) => a + b, 0) / tall.length;
  };

  const sgKilder: { navn: string; verdier: (number | null)[] }[] = [
    { navn: "Putt", verdier: visbareRunder.map((r) => r.sgPutt) },
    { navn: "Tee", verdier: visbareRunder.map((r) => r.sgOtt) },
    { navn: "Nærspill", verdier: visbareRunder.map((r) => r.sgArg) },
    { navn: "Innspill", verdier: visbareRunder.map((r) => r.sgApp) },
  ];

  const sg: DigestSg[] = sgKilder.flatMap(({ navn, verdier }) => {
    const v = snitt(verdier);
    return v == null ? [] : [{ navn, verdi: v, note: "SG per runde" }];
  });

  const nesteUkeMinutter = nesteOkter.reduce(
    (sum, o) =>
      sum + Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000)),
    0,
  );

  return {
    ukenummer: ukenummer(ukeStart),
    periode: `${DATO_FMT.format(ukeStart)} – ${DATO_FMT.format(sisteDag)}`,
    deltAt: deling?.deltAt ?? null,
    deltAv,

    etterlevelse: e,
    etterlevelseTekst: etterlevelseTekst(e),
    nevnerTekst: NEVNER_TEKST,
    loggetMinutter,
    planlagtMinutter,
    uke,

    sg,
    sgRunder: runder.length,

    nesteUkeOkter: nesteOkter.length,
    nesteUkeMinutter,

    testforfall: forfall.flatMap((f) =>
      f.dueDate ? [{ navn: f.test.name, forfaller: f.dueDate }] : [],
    ),
    turneringer: turneringer.flatMap((t) =>
      t.tournament?.startDate
        ? [
            {
              navn: t.tournament.name,
              fra: t.tournament.startDate,
              til: t.tournament.endDate,
            },
          ]
        : [],
    ),
  };
}
