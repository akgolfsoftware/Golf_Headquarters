import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ikkeOrgGruppeWhere, aktivtSpillerMedlemskapWhere, aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { AK_PROFIL_SCOPE, delerAkProfil } from "./ak-profil-regler";
import { laas, laasGruppemedlemskap, laasBrukere, databasetid } from "./ak-analyse-laas";

type Viewer = { id: string; role: string };
type Tx = Prisma.TransactionClient;
export const AK_PROFIL_TRANSAKSJON = { maxWait: 10_000, timeout: 20_000 };
export const AK_PROFIL_RAD_SELECT = { scope: true, mottakerGruppeId: true, mottakerUserId: true,
  gitt: true, gittAvRolle: true, gittAvUserId: true, tekstVersjon: true, createdAt: true } as const;

type Modus = "les" | "handling";
function trenerMedlemskap(id: string, modus: Modus) {
  return modus === "les" ? aktivtTrenerMedlemskapWhere(id) : { userId: id, role: "COACH", endedAt: null };
}

export function akProfilGruppeWhere(viewer?: Viewer, modus: Modus = "les"): Prisma.GroupWhereInput {
  return { managedByAkGolf: true, arkivertAt: null, ...ikkeOrgGruppeWhere(),
    ...(viewer && viewer.role !== "ADMIN" ? { OR: [
      { coachId: viewer.id }, { members: { some: trenerMedlemskap(viewer.id, modus) } },
    ] } : {}),
  };
}

/** Tilgang og selve datalesingen er samme transaksjon. Ingen ID-liste caches utenfor. */
export async function medAkProfiler<T>(viewer: Viewer, les: (tx: Tx, scope: Prisma.UserWhereInput) => Promise<T>, modus: Modus = "les"): Promise<T | null> {
  if (!viewer.id || !["ADMIN", "COACH"].includes(viewer.role)) return null;
  return prisma.$transaction(async tx => {
    const aktorWhere = { id: viewer.id, deletedAt: null, role: viewer.role as "ADMIN" | "COACH" };
    if (!await tx.user.findFirst({ where: aktorWhere, select: { id: true } })) return null;
    const kandidater = await tx.group.findMany({ where: akProfilGruppeWhere(viewer, modus), select: { id: true }, orderBy: { id: "asc" } });
    const medlemskap: Array<{ id: string; userId: string }> = [];
    // Globalt sortert låserekkefølge. Samme gruppelås som gi/trekk; vanlige
    // medlems-/rolle-/arkiveringsskrivere blokkeres av de delte radlåsene.
    for (const g of kandidater) {
      await laas(tx, g.id);
      medlemskap.push(...await laasGruppemedlemskap(tx, g.id));
    }
    const kontoer = await laasBrukere(tx, [viewer.id, ...medlemskap.map(m => m.userId)]);
    if (!await tx.user.findFirst({ where: aktorWhere, select: { id: true } })) return null;
    const grupper = await tx.group.findMany({ where: { AND: [akProfilGruppeWhere(viewer, modus),
      { id: { in: kandidater.map(g => g.id) } },
      ...(viewer.role === "ADMIN" ? [] : [{ OR: [{ coachId: viewer.id }, { members: { some: {
        ...trenerMedlemskap(viewer.id, modus), id: { in: medlemskap.map(m => m.id) },
      } } }] }]),
    ] }, select: { id: true } });
    const spillere = await tx.user.findMany({ where: { role: "PLAYER", deletedAt: null,
      id: { in: kontoer.map(k => k.id) }, groupMemberships: { some: { ...aktivtSpillerMedlemskapWhere(),
        id: { in: medlemskap.map(m => m.id) }, groupId: { in: grupper.map(g => g.id) },
      } },
    }, select: { id: true, dateOfBirth: true, requiresGuardianConsent: true,
      groupMemberships: { where: { ...aktivtSpillerMedlemskapWhere(), id: { in: medlemskap.map(m => m.id) },
        groupId: { in: grupper.map(g => g.id) } }, select: { groupId: true } },
    } });
    const ids = spillere.map(s => s.id);
    // Nåværende foreldrerett, også ved tilbakekalling av en gammel foreldretillatelse.
    const relasjoner = ids.length ? await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM parent_relations WHERE "childId" IN (${Prisma.join(ids)}) ORDER BY id FOR SHARE` : [];
    const foreldre = relasjoner.length ? await tx.parentRelation.findMany({ where: {
      id: { in: relasjoner.map(r => r.id) }, approved: true,
    }, select: { childId: true, parentId: true } }) : [];
    const naa = await databasetid(tx);
    const rader = ids.length ? await tx.delingsSamtykke.findMany({ where: { userId: { in: ids }, scope: AK_PROFIL_SCOPE,
      mottakerUserId: null, mottakerGruppeId: { in: grupper.map(g => g.id) },
    }, select: { userId: true, ...AK_PROFIL_RAD_SELECT } }) : [];
    const tillatte = spillere.filter(s => s.groupMemberships.some(m => delerAkProfil(rader.filter(r => r.userId === s.id), {
      spillerId: s.id, gruppeId: m.groupId, dateOfBirth: s.dateOfBirth, requiresGuardianConsent: s.requiresGuardianConsent,
      foresattIder: foreldre.filter(f => f.childId === s.id).map(f => f.parentId), naa,
    }))).map(s => s.id);
    return les(tx, { id: { in: tillatte }, role: "PLAYER", deletedAt: null });
  }, AK_PROFIL_TRANSAKSJON);
}
