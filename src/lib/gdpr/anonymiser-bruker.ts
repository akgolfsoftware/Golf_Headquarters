/**
 * Anonymisering av en spillerkonto (Anders' beslutning 2026-07-28).
 *
 * REGELEN: når en konto slettes, BEHOLDES treningsdataene — aggregert til
 * spillernivå. Kontoen avidentifiseres i stedet for å fjernes, slik at
 * historikken (volum, områder, miljø, snittscore) overlever uten å peke på en
 * person.
 *
 * For at «behold alltid» skal være ekte anonymisering og ikke bare et bytte av
 * navn, vaskes ALL fritekst spilleren selv har skrevet: øktnotater, drill-
 * notater og egenvurderinger. De feltene er der navn på andre, skader og
 * helseopplysninger havner. Tall og struktur beholdes urørt.
 *
 * Denne modulen er ENE kilden for anonymisering — både coach-godkjent
 * GDPR-sletting og den automatiske oppryddingsjobben bruker den, så de to
 * veiene aldri kan komme i utakt.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
// Prisma brukes både som type (UserUpdateInput) og verdi (DbNull) — derfor
// vanlig import, ikke `import type`.
import { Prisma } from "@/generated/prisma/client";
import { anonymiserUkeplandetaljer } from "@/lib/workbench/ukeplan-personvern";
import {
  slettEksterneBrukerdata,
  type EksternSlettingResultat,
} from "./slett-eksterne-data";

export type AnonymiseringsResultat = {
  brukerFantes: boolean;
  publicPlayerAnonymisert: boolean;
  /** Snittscore stemplet på spilleren, om det fantes runder å regne fra. */
  snittScore: number | null;
  antallRunder: number;
  /** Antall rader der fritekst ble tømt, per type. */
  vasket: {
    okter: number;
    driller: number;
    drillLogger: number;
    fysOvelser: number;
    runder: number;
    ukeplaner: number;
  };
  /**
   * Resultat av ekstern sletting (Supabase Auth/Storage, Stripe, gjeste-felt).
   * null når kontoen ikke fantes (ingenting å slette eksternt).
   */
  eksterntSlettet: EksternSlettingResultat | null;
};

/** Feltene som tømmes på brukeren. Eksportert for audit-loggen. */
export const ANONYMISERTE_BRUKERFELTER = [
  "name",
  "email",
  "phone",
  "avatarUrl",
  "dateOfBirth",
] as const;

export const ANONYMISERTE_PUBLICPLAYER_FELTER = [
  "name",
  "slug",
  "bio",
  "photoUrl",
  "instagramHandle",
  "isActive",
] as const;

/**
 * Avidentifiser en konto og behold treningshistorikken.
 *
 * Idempotent: kjøres den to ganger, er andre gang et no-op på allerede vaskede
 * felter. Trygg å kalle på en konto som alt er anonymisert.
 */
export async function anonymiserBruker(
  userId: string,
  naa: Date = new Date(),
  opts: { dryRun?: boolean } = {},
): Promise<AnonymiseringsResultat & { dryRun?: boolean; plan?: string[] }> {
  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, publicPlayerId: true, deletedAt: true },
  });

  // Kontoen kan alt være hard-slettet av en tidligere kjøring. Da er det
  // ingenting å avidentifisere — og det er ikke en feil.
  if (!bruker) {
    return {
      brukerFantes: false,
      publicPlayerAnonymisert: false,
      snittScore: null,
      antallRunder: 0,
      vasket: { okter: 0, driller: 0, drillLogger: 0, fysOvelser: 0, runder: 0, ukeplaner: 0 },
      eksterntSlettet: null,
    };
  }

  if (opts.dryRun) {
    const planEkstern = await slettEksterneBrukerdata(userId, { dryRun: true });
    return {
      brukerFantes: true,
      publicPlayerAnonymisert: Boolean(bruker.publicPlayerId),
      snittScore: null,
      antallRunder: 0,
      vasket: { okter: 0, driller: 0, drillLogger: 0, fysOvelser: 0, runder: 0, ukeplaner: 0 },
      dryRun: true,
      plan: [
        "ville anonymisere Prisma-bruker + fritekst",
        "ville vaske ukeplanenes notat, oppholdssted og frie fokusfelt",
        ...(planEkstern.plan ?? []),
      ],
      eksterntSlettet: planEkstern,
    };
  }

  // ── Snittscore stemples før noe vaskes ──
  const runder = await prisma.round.findMany({
    where: { userId },
    select: { score: true },
  });
  const scorer = runder
    .map((r) => r.score)
    .filter((s): s is number => typeof s === "number" && Number.isFinite(s));
  const snittScore =
    scorer.length > 0
      ? Number((scorer.reduce((a, b) => a + b, 0) / scorer.length).toFixed(2))
      : null;

  const anonymisering: Prisma.UserUpdateInput = {
    name: "Slettet bruker",
    // Deterministisk og unik (email er @unique) — .invalid kan aldri rutes.
    email: `slettet-${userId}@gdpr.akgolf.invalid`,
    phone: null,
    avatarUrl: null,
    dateOfBirth: null,
    // deletedAt gjør at kontoen faller ut av alle «aktiv bruker»-filtre;
    // anonymisertAt markerer at raden skal BEHOLDES, ikke hard-slettes.
    deletedAt: bruker.deletedAt ?? naa,
    anonymisertAt: null,
    snittScoreVedSletting: snittScore,
    antallRunderVedSletting: scorer.length,
  };

  // ── Fritekst: alt spilleren har skrevet selv ──
  // Gjøres i egne updateMany-kall (ikke i transaksjonen under) fordi antallet
  // rader kan være stort og vaskingen er idempotent — en delvis kjøring kan
  // trygt gjentas.
  const oktIder = (
    await prisma.trainingSessionV2.findMany({
      where: { studentId: userId },
      select: { id: true },
    })
  ).map((s) => s.id);

  const [okter, driller, drillLogger, fysOvelser, rundeNotater] = await Promise.all([
    prisma.trainingSessionV2.updateMany({
      where: { studentId: userId },
      // completedSummary rommer spillerens egenvurdering (følelse, fokus) —
      // fjernes i sin helhet; de strukturerte tallene ligger på drillene.
      data: { notes: null, completedSummary: Prisma.DbNull, maalsetning: null },
    }),
    oktIder.length
      ? prisma.trainingDrillV2.updateMany({
          where: { sessionId: { in: oktIder } },
          data: { notes: null, description: null },
        })
      : Promise.resolve({ count: 0 }),
    prisma.drillLogV2.updateMany({
      where: { loggedBy: userId },
      data: { notes: null },
    }),
    prisma.fysOvelseRad.updateMany({
      where: { okt: { uke: { plan: { userId } } } },
      data: { notat: null },
    }),
    prisma.round.updateMany({
      where: { userId },
      data: { notes: null },
    }),
  ]);

  // WeekPlan har ingen User-FK og vaskes derfor eksplisitt, også for eldre
  // årsnøkler. Per-rad-transformasjon bevarer bare validerte strukturerte v1-felt.
  const ukeplaner = await prisma.weekPlan.findMany({
    where: { playerId: userId }, select: { id: true, planningDetails: true },
  });
  let vaskedeUkeplaner = 0;
  for (const ukeplan of ukeplaner) {
    const resultat = await prisma.weekPlan.updateMany({
      where: { id: ukeplan.id, playerId: userId },
      data: {
        customNotes: null,
        planningDetails: anonymiserUkeplandetaljer(ukeplan.planningDetails) ?? Prisma.DbNull,
      },
    });
    vaskedeUkeplaner += resultat.count;
  }

  const publicPlayerAnonymisert = Boolean(bruker.publicPlayerId);

  await prisma.$transaction([
    // Bookingens innboksutkast er en separat kopi av kontakt og fritekst.
    // Vask før den eksterne ryddekjeden eventuelt kobler bookingen fra brukeren.
    prisma.innboksEpost.updateMany({
      where: { booking: { userId } },
      data: {
        fraEpost: `slettet-${userId}@gdpr.akgolf.invalid`, fraNavn: null,
        emne: "Booking for slettet bruker", brodtekst: "Personopplysninger fjernet.", utkastSvar: null,
      },
    }),
    // IUP-refleksjoner beholdes ikke koblet til anonymisert bruker; revisjoner kaskadeslettes.
    prisma.iupBesvarelse.deleteMany({ where: { userId } }),
    // Invitasjoner inneholder mottakerens e-post. Fjernes også når trener/foresatt slettes.
    prisma.trenerDelingsInvitasjon.deleteMany({ where: { OR: [
      { userId }, { gittAvUserId: userId }, { acceptedByUserId: userId },
      { mottakerEpost: bruker.email.trim().toLowerCase() },
    ] } }),
    prisma.user.update({ where: { id: userId }, data: anonymisering }),
    ...(publicPlayerAnonymisert
      ? [
          prisma.publicPlayer.update({
            where: { id: bruker.publicPlayerId! },
            data: {
              name: "Anonymisert spiller",
              // slug er ofte navn-derivert og ville lekket navnet i URL-en.
              slug: `slettet-${bruker.publicPlayerId}`,
              bio: null,
              photoUrl: null,
              instagramHandle: null,
              isActive: false,
            },
          }),
        ]
      : []),
  ]);

  // ── Ekstern sletting (Supabase Auth/Storage, Stripe, gjeste-felt) ──
  // Kjøres ETTER at Prisma-anonymiseringen er committet, så den juridisk
  // viktigste vasken alltid fullføres selv om en ekstern tjeneste feiler.
  // Ferdigmarkering skjer først etter at alle eksterne kilder er bekreftet.

  const eksterntSlettet = await slettEksterneBrukerdata(userId);
  if (eksterntSlettet.feil.length > 0) {
    throw new Error("Ekstern sletting er ikke fullført. Kontoen beholdes i oppryddingskøen.");
  }
  await prisma.user.update({ where: { id: userId }, data: { anonymisertAt: naa } });

  return {
    brukerFantes: true,
    publicPlayerAnonymisert,
    snittScore,
    antallRunder: scorer.length,
    vasket: {
      okter: okter.count,
      driller: driller.count,
      drillLogger: drillLogger.count,
      fysOvelser: fysOvelser.count,
      runder: rundeNotater.count,
      ukeplaner: vaskedeUkeplaner,
    },
    eksterntSlettet,
  };
}
