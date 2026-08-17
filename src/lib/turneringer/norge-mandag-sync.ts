/**
 * Mandagssync for norsk turneringsdata-lag.
 * - DataGolf NOR-spillerliste (eksisterende)
 * - GolfBox schedule (kommende + frister)
 * - Navnelink + backfill
 * - Dedupe formateringsvarianter
 *
 * Herdet (T7): hvert steg kjører i egen try/catch — én feil stopper ikke
 * resten av kjeden. Feil samles opp, varsles til admin via varsleAgentFunn,
 * og oppsummeringen viser status per steg.
 */
import { prisma } from "@/lib/prisma";
import { syncNorwegianPlayers } from "@/lib/turneringer/sync";
import { syncGolfBoxSchedules } from "@/lib/turneringer/golfbox-sync";
import {
  linkPublicPlayersByExactName,
  backfillTournamentResultsForLinkedUsers,
} from "@/lib/turneringer/link-public-players";
import { runDedupePlayerNames } from "@/lib/turneringer/dedupe-player-names";
import { varsleAgentFunn } from "@/lib/agents/agent-notify";

export type StegResultat<T> =
  | { ok: true; resultat: T }
  | { ok: false; feil: string };

export type NorgeMandagSyncOppsummering = {
  ok: boolean;
  feil: string[];
  steg: {
    players: StegResultat<{ added: number; updated: number }>;
    golfbox: StegResultat<{ customers: number; events: number; upcoming: number }>;
    link: StegResultat<{ linked: number; scannedUsers: number }>;
    backfill: StegResultat<{ mirrored: number }>;
    dedupe: StegResultat<{ mergedGroups: number; fuzzyLeft: number }>;
  };
};

async function kjorSteg<T>(
  navn: string,
  feil: string[],
  fn: () => Promise<T>,
): Promise<StegResultat<T>> {
  try {
    return { ok: true, resultat: await fn() };
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    console.error(`[norge-mandag-sync] steg "${navn}" feilet:`, err);
    feil.push(`${navn}: ${melding}`);
    return { ok: false, feil: melding };
  }
}

export async function runNorgeMandagSync(): Promise<NorgeMandagSyncOppsummering> {
  const feil: string[] = [];

  const players = await kjorSteg("spillerliste (DataGolf NOR)", feil, () =>
    syncNorwegianPlayers(),
  );
  const golfbox = await kjorSteg("GolfBox-kalender", feil, () =>
    syncGolfBoxSchedules(prisma),
  );
  const link = await kjorSteg("navnelink", feil, async () => {
    const r = await linkPublicPlayersByExactName(prisma);
    return { linked: r.linked, scannedUsers: r.scannedUsers };
  });
  const backfill = await kjorSteg("backfill resultater", feil, async () => {
    const r = await backfillTournamentResultsForLinkedUsers(prisma);
    return { mirrored: r.mirrored };
  });
  const dedupe = await kjorSteg("dedupe spillernavn", feil, async () => {
    const r = await runDedupePlayerNames(prisma, { apply: true });
    return { mergedGroups: r.mergedGroups, fuzzyLeft: r.fuzzyLeft };
  });

  if (feil.length > 0) {
    // Varsling er best-effort — en feilende varselkanal skal ikke velte
    // oppsummeringen (samme prinsipp som agent-notify selv).
    try {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) {
        await varsleAgentFunn({
          coachId: admin.id,
          tittel: `Mandagssync turneringer: ${feil.length} av 5 steg feilet`,
          tekst:
            "Disse stegene i mandagssyncen for norske turneringer feilet:\n" +
            feil.map((f) => `- ${f}`).join("\n") +
            "\nDe øvrige stegene kjørte som normalt.",
          lenke: "/admin/agencyos",
        });
      } else {
        console.warn("[norge-mandag-sync] fant ingen ADMIN-bruker — kan ikke varsle");
      }
    } catch (err) {
      console.error("[norge-mandag-sync] varsling feilet:", err);
    }
  }

  return {
    ok: feil.length === 0,
    feil,
    steg: { players, golfbox, link, backfill, dedupe },
  };
}
