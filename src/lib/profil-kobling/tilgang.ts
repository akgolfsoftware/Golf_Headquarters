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

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { medNavngittProfil } from "@/lib/deling/profil-lesing";
import { prisma } from "@/lib/prisma";
import { hentSpillerprofil } from "./data";
import { avgjorRelasjon, synlighet, type Relasjon } from "./tilgang-regler";
import type { Spillerprofil } from "./typer";

export type Betrakter = { id: string; role: string };
export type SpillerprofilSvar = { relasjon: Exclude<Relasjon, "INGEN">; profil: Spillerprofil | null };

/**
 * null = ingen tilgang (eller spilleren finnes ikke). `profil: null` = tilgang, men spilleren har
 * ikke koblet profilen sin ennå. Disse to skal vises ulikt: det første er en lukket dør, det andre
 * er en tom tilstand med en oppfordring.
 */
export async function lesSpillerprofil(
  betrakter: Betrakter,
  spillerId: string,
  { gruppeId }: { gruppeId?: string } = {},
): Promise<SpillerprofilSvar | null> {
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
    const { kanSeGolfId } = synlighet(forsteRelasjon);
    return { relasjon: forsteRelasjon, profil: await hentSpillerprofil(spillerId, { inkluderGolfId: kanSeGolfId }) };
  }

  if (betrakter.role !== "COACH" || !gruppeId) return null;
  const delt = await medNavngittProfil(betrakter.id, spillerId, gruppeId, async (tx) => ({
    profil: await hentSpillerprofil(spillerId, { inkluderGolfId: synlighet("ORG_TRENER").kanSeGolfId }, tx),
  }));
  return delt ? { relasjon: "ORG_TRENER", profil: delt.profil } : null;
}
