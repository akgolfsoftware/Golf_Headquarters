// src/lib/agents/sync-vaktbikkje.ts
// T7 — vaktbikkje for data-syncene: sjekker at de eksterne synk-jobbene
// (GolfBox/DataGolf-turneringer, SG-baseline, PGA-sesongstatistikk) faktisk
// har levert ferske data, og varsler Anders i klarspråk når en synk har
// stoppet stille. Bakgrunn: turneringsdata-syncen sto én gang i seks uker
// uten at noen merket det (se .claude/rules/fillagring.md §Turneringsdata).
//
// Ferskhetsgrenser:
// - Turneringsdata (PublicPlayerRound.createdAt + Tournament.lastSyncAt):
//   48 timer i sesongen (april–oktober, Oslo-tid), ellers 8 dager.
// - SG-baseline (SgBaseline.fetchedAt) og PGA-sesong
//   (PgaPlayerSeason.lastUpdated): alltid 8 dager (ukentlige jobber).
//   Merk feltnavnene — verifisert mot prisma/schema.prisma: SgBaseline har
//   `fetchedAt` (ikke updatedAt), PgaPlayerSeason har `lastUpdated`.
//
// Kjøres mandag 08:00 UTC — ETTER alle mandagssyncene (05:00–07:30), så en
// vellykket mandagskjøring aldri rekker å bli flagget som stale.
import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";

export const VAKTBIKKJE_AGENT_NAME = "sync-vaktbikkje";

const ADMIN_LENKE = "/admin/agencyos";
const TIME_MS = 3_600_000;

export const GRENSE_SESONG_TIMER = 48;
export const GRENSE_UTENFOR_SESONG_TIMER = 8 * 24;
export const GRENSE_UKESJOBB_TIMER = 8 * 24;

// ── Ren ferskhetslogikk (ingen DB — testbar med datoer inn) ─────────────────

const osloManedFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Oslo",
  month: "numeric",
});

/** Turneringssesongen er april–oktober (Oslo-kalender). */
export function erTurneringssesong(now: Date): boolean {
  const maned = Number(osloManedFmt.format(now)); // 1–12
  return maned >= 4 && maned <= 10;
}

/** Grense for turneringsdata-synkene, avhengig av sesong. */
export function turneringsGrenseTimer(now: Date): number {
  return erTurneringssesong(now) ? GRENSE_SESONG_TIMER : GRENSE_UTENFOR_SESONG_TIMER;
}

export type FerskhetsKilde = {
  /** Klarspråk-navn på synken (brukes i varselteksten). */
  navn: string;
  /** Nyeste tidsstempel i databasen — null hvis kilden aldri har fått data. */
  sist: Date | null;
  grenseTimer: number;
};

export type FerskhetsBrudd = {
  navn: string;
  sist: Date | null;
  grenseTimer: number;
  /** Hele timer siden siste synk — null når det aldri har vært data. */
  timerSiden: number | null;
};

/** Finn kildene som har brutt ferskhetsgrensen sin (eller aldri har data). */
export function finnFerskhetsBrudd(
  kilder: FerskhetsKilde[],
  now: Date,
): FerskhetsBrudd[] {
  const brudd: FerskhetsBrudd[] = [];
  for (const k of kilder) {
    if (k.sist === null) {
      brudd.push({ navn: k.navn, sist: null, grenseTimer: k.grenseTimer, timerSiden: null });
      continue;
    }
    const timerSiden = Math.floor((now.getTime() - k.sist.getTime()) / TIME_MS);
    if (timerSiden > k.grenseTimer) {
      brudd.push({ navn: k.navn, sist: k.sist, grenseTimer: k.grenseTimer, timerSiden });
    }
  }
  return brudd;
}

const osloDatoTidFmt = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function grenseTekst(grenseTimer: number): string {
  return grenseTimer % 24 === 0 ? `${grenseTimer / 24} døgn` : `${grenseTimer} timer`;
}

/** Klarspråk-tekst for varselet: hvilken synk er stale, og siden når. */
export function bruddTekst(brudd: FerskhetsBrudd[]): string {
  const linjer = brudd.map((b) => {
    if (b.sist === null || b.timerSiden === null) {
      return `- ${b.navn}: har aldri levert data.`;
    }
    const dager = Math.floor(b.timerSiden / 24);
    const siden =
      dager >= 2 ? `${dager} dager siden` : `${b.timerSiden} timer siden`;
    return (
      `- ${b.navn}: siste data er fra ${osloDatoTidFmt.format(b.sist)} ` +
      `(${siden} — grensen er ${grenseTekst(b.grenseTimer)}).`
    );
  });
  return (
    "En eller flere datasynker ser ut til å ha stoppet:\n" +
    linjer.join("\n") +
    "\nSjekk cron-loggene og kildene før neste helgesynk."
  );
}

// ── Agent (DB + varsling) ───────────────────────────────────────────────────

export async function runSyncVaktbikkje(now: Date = new Date()): Promise<AgentResult> {
  return runAgent(VAKTBIKKJE_AGENT_NAME, null, async () => {
    const [runde, turnering, baseline, pga] = await Promise.all([
      prisma.publicPlayerRound.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.tournament.findFirst({
        where: { lastSyncAt: { not: null } },
        orderBy: { lastSyncAt: "desc" },
        select: { lastSyncAt: true },
      }),
      prisma.sgBaseline.findFirst({
        orderBy: { fetchedAt: "desc" },
        select: { fetchedAt: true },
      }),
      prisma.pgaPlayerSeason.findFirst({
        orderBy: { lastUpdated: "desc" },
        select: { lastUpdated: true },
      }),
    ]);

    const turneringsGrense = turneringsGrenseTimer(now);
    const kilder: FerskhetsKilde[] = [
      {
        navn: "Turneringsrunder (GolfBox/DataGolf)",
        sist: runde?.createdAt ?? null,
        grenseTimer: turneringsGrense,
      },
      {
        navn: "Turneringskalender (lastSyncAt)",
        sist: turnering?.lastSyncAt ?? null,
        grenseTimer: turneringsGrense,
      },
      {
        navn: "SG-baseline (DataGolf)",
        sist: baseline?.fetchedAt ?? null,
        grenseTimer: GRENSE_UKESJOBB_TIMER,
      },
      {
        navn: "PGA-sesongstatistikk (DataGolf)",
        sist: pga?.lastUpdated ?? null,
        grenseTimer: GRENSE_UKESJOBB_TIMER,
      },
    ];

    const brudd = finnFerskhetsBrudd(kilder, now);
    const bruddJson = brudd.map((b) => ({
      navn: b.navn,
      sist: b.sist?.toISOString() ?? null,
      grenseTimer: b.grenseTimer,
      timerSiden: b.timerSiden,
    }));

    if (brudd.length === 0) {
      return { output: { varslet: false, sjekket: kilder.length, brudd: [] } };
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.warn("[sync-vaktbikkje] fant ingen ADMIN-bruker — kan ikke varsle");
      return {
        output: {
          varslet: false,
          aarsak: "ingen admin-bruker funnet",
          sjekket: kilder.length,
          brudd: bruddJson,
        },
      };
    }

    await varsleAgentFunn({
      coachId: admin.id,
      tittel:
        brudd.length === 1
          ? "Synk-vaktbikkje: én datasynk har stoppet"
          : `Synk-vaktbikkje: ${brudd.length} datasynker har stoppet`,
      tekst: bruddTekst(brudd),
      lenke: ADMIN_LENKE,
    });

    return { output: { varslet: true, sjekket: kilder.length, brudd: bruddJson } };
  });
}
