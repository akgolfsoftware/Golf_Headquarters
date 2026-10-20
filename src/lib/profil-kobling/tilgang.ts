/**
 * Porten for å lese en spillers komplette profil fra PlayerHQ, AgencyOS, WANG og Team Norway.
 * Reglene ligger i tilgang-regler.ts; her hentes faktaene fra serveren og profilen leses.
 *
 * Ingenting kommer fra klienten bortsett fra hvilken spiller og hvilken organisasjonsgruppe
 * (WANG/Team Norway) betrakteren handler i. Begge kontrolleres på nytt hver gang:
 * spilleren må være aktiv, og organisasjonstilgang krever gjeldende navngitt deling som
 * sjekkes under samme lås som tilbaketrekking (medNavngittProfil).
 */

import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { prisma } from "@/lib/prisma";
import { hentSpillerprofil } from "./data";
import { avgjorRelasjon, synlighet, type Relasjon } from "./tilgang-regler";
import type { Spillerprofil } from "./typer";

export type Betrakter = { id: string; role: string };
export type SpillerprofilSvar = { relasjon: Exclude<Relasjon, "INGEN">; profil: Spillerprofil | null };

/** Databaseklienten leseren skal bruke. Under en delingslås er det transaksjonen, ellers prisma. */
export type SpillerDb = Prisma.TransactionClient;

export type TilgangsKontekst = {
  relasjon: Exclude<Relasjon, "INGEN">;
  db: SpillerDb;
  /** Golf-ID (MemberID) bare for trenere. */
  kanSeGolfId: boolean;
};

/**
 * Kontrollerer tilgang og kjører `les` med riktig databaseklient. null = ingen tilgang (eller
 * spilleren finnes ikke). For organisasjonstrenere skjer `les` inne i delingslåsen, så en
 * tilbaketrekking virker med en gang. Alle lesere av en spillers profil skal gå gjennom denne.
 */
export async function medSpillerTilgang<T>(
  betrakter: Betrakter,
  spillerId: string,
  { gruppeId }: { gruppeId?: string },
  les: (kontekst: TilgangsKontekst) => Promise<T>,
): Promise<{ relasjon: Exclude<Relasjon, "INGEN">; data: T } | null> {
  if (!spillerId) return null;
  const aktiv = await prisma.user.findFirst({
    where: { id: spillerId, deletedAt: null, anonymisertAt: null },
    select: { id: true },
  });
  if (!aktiv) return null;

  const erEgen = betrakter.id === spillerId;
  const erCoachet =
    !erEgen &&
    (await prisma.user.findFirst({
      where: { AND: [{ id: spillerId }, coachScopedPlayerWhere(betrakter)] },
      select: { id: true },
    })) != null;

  const forsteRelasjon = avgjorRelasjon({
    betrakterId: betrakter.id,
    spillerId,
    betrakterRolle: betrakter.role,
    erCoachetAvBetrakter: erCoachet,
    harGjeldendeDeling: false,
  });

  if (forsteRelasjon === "SELV" || forsteRelasjon === "AK_COACH") {
    const data = await les({ relasjon: forsteRelasjon, db: prisma, kanSeGolfId: synlighet(forsteRelasjon).kanSeGolfId });
    return { relasjon: forsteRelasjon, data };
  }

  if (betrakter.role !== "COACH" || !gruppeId) return null;
  const delt = await medNavngittProfil(betrakter.id, spillerId, gruppeId, async (tx) => ({
    data: await les({ relasjon: "ORG_TRENER", db: tx, kanSeGolfId: synlighet("ORG_TRENER").kanSeGolfId }),
  }));
  return delt ? { relasjon: "ORG_TRENER", data: delt.data } : null;
}

/**
 * null = ingen tilgang. `profil: null` = tilgang, men spilleren har ikke koblet profilen sin ennå.
 * Disse to skal vises ulikt: det første er en lukket dør, det andre er en tom tilstand.
 */
export async function lesSpillerprofil(
  betrakter: Betrakter,
  spillerId: string,
  opsjoner: { gruppeId?: string } = {},
): Promise<SpillerprofilSvar | null> {
  const svar = await medSpillerTilgang(betrakter, spillerId, opsjoner, (k) =>
    hentSpillerprofil(spillerId, { inkluderGolfId: k.kanSeGolfId }, k.db),
  );
  return svar ? { relasjon: svar.relasjon, profil: svar.data } : null;
}
