import "server-only";
import { createHash } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ikkeOrgGruppeWhere, aktivtSpillerMedlemskapWhere, aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";
import { AK_PROFIL_SCOPE, gyldigAkProfilRad } from "./ak-profil-regler";
import { laas, laasGruppemedlemskap, laasBrukere, databasetid } from "./ak-analyse-laas";

type Viewer = { id: string; role: string };
type Tx = Prisma.TransactionClient;
export const AK_PROFIL_TRANSAKSJON = { maxWait: 10_000, timeout: 20_000 };
export const AK_PROFIL_RAD_SELECT = { id: true, scope: true, mottakerGruppeId: true, mottakerUserId: true,
  gitt: true, gittAvRolle: true, gittAvUserId: true, tekstVersjon: true, createdAt: true } as const;

/** Internal equality evidence only; never a bearer permission or model input. */
export type AkProfilGrunnlag = { spillerId: string; gruppeId: string; fingeravtrykk: string };

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
export async function medAkProfiler<T>(viewer: Viewer, les: (tx: Tx, scope: Prisma.UserWhereInput, grunnlag: readonly AkProfilGrunnlag[]) => Promise<T>, modus: Modus = "les", avgrensning?: { gruppeId: string; medGrunnlag?: boolean }): Promise<T | null> {
  if (!viewer.id || !["ADMIN", "COACH"].includes(viewer.role)) return null;
  if (avgrensning && (typeof avgrensning.gruppeId !== "string" || !avgrensning.gruppeId.trim())) return null;
  return prisma.$transaction(async tx => {
    const aktorWhere = { id: viewer.id, deletedAt: null, role: viewer.role as "ADMIN" | "COACH" };
    if (!await tx.user.findFirst({ where: aktorWhere, select: { id: true } })) return null;
    const kandidater = await tx.group.findMany({ where: { ...akProfilGruppeWhere(viewer, modus),
      ...(avgrensning ? { id: avgrensning.gruppeId } : {}),
    }, select: { id: true }, orderBy: { id: "asc" } });
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
        groupId: { in: grupper.map(g => g.id) } }, select: { id: true, groupId: true } },
    } });
    const ids = spillere.map(s => s.id);
    // Nåværende foreldrerett, også ved tilbakekalling av en gammel foreldretillatelse.
    const relasjoner = ids.length ? await tx.$queryRaw<Array<{ id: string; revisjon: string }>>`
      SELECT id, xmin::text AS revisjon FROM parent_relations WHERE "childId" IN (${Prisma.join(ids)}) ORDER BY id FOR SHARE` : [];
    const foreldre = relasjoner.length ? await tx.parentRelation.findMany({ where: {
      id: { in: relasjoner.map(r => r.id) }, approved: true,
    }, select: { id: true, childId: true, parentId: true } }) : [];
    const naa = await databasetid(tx);
    const rader = ids.length ? await tx.delingsSamtykke.findMany({ where: { userId: { in: ids }, scope: AK_PROFIL_SCOPE,
      mottakerUserId: null, mottakerGruppeId: { in: grupper.map(g => g.id) },
    }, select: { userId: true, ...AK_PROFIL_RAD_SELECT } }) : [];
    // PostgreSQL row versions catch end/rejoin and archive/restore even when IDs
    // and current values are unchanged. Only requested by split-operation callers.
    const revisjoner = avgrensning?.medGrunnlag && medlemskap.length
      ? await tx.$queryRaw<Array<{ id: string; medlem: string; gruppe: string; spiller: string; aktor: string }>>`
        SELECT m.id, m.xmin::text AS medlem, g.xmin::text AS gruppe, u.xmin::text AS spiller, a.xmin::text AS aktor
        FROM group_members m JOIN groups g ON g.id = m."groupId"
        JOIN users u ON u.id = m."userId" CROSS JOIN users a
        WHERE m.id IN (${Prisma.join(medlemskap.map(m => m.id))}) AND a.id = ${viewer.id}` : [];
    const tillatte = new Set<string>();
    const grunnlag: AkProfilGrunnlag[] = [];
    for (const spiller of spillere) {
      const spillerForeldre = foreldre.filter(f => f.childId === spiller.id);
      for (const medlem of spiller.groupMemberships) {
        const rad = gyldigAkProfilRad(rader.filter(r => r.userId === spiller.id), {
          spillerId: spiller.id, gruppeId: medlem.groupId, dateOfBirth: spiller.dateOfBirth,
          requiresGuardianConsent: spiller.requiresGuardianConsent,
          foresattIder: spillerForeldre.map(f => f.parentId), naa,
        });
        if (!rad) continue;
        tillatte.add(spiller.id);
        if (!avgrensning?.medGrunnlag) continue;
        const revisjon = revisjoner.find(r => r.id === medlem.id);
        if (!revisjon) continue;
        // A fresh yes is a different basis even if the text version is unchanged.
        // IDs remain server-side. The digest is equality evidence, not authorization.
        const relasjonerForGiver = rad.gittAvRolle === "FORESATT"
          ? spillerForeldre.filter(f => f.parentId === rad.gittAvUserId).map(f => [f.id, relasjoner.find(r => r.id === f.id)?.revisjon ?? null]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))) : [];
        if (typeof rad.id !== "string" || !rad.id || typeof medlem.id !== "string" || !medlem.id) continue;
        grunnlag.push({ spillerId: spiller.id, gruppeId: medlem.groupId,
          fingeravtrykk: createHash("sha256").update(JSON.stringify([
            "ak-profil-grunnlag-v1", viewer.id, viewer.role, spiller.id, medlem.groupId, medlem.id,
            rad.id, rad.scope, rad.mottakerUserId, rad.tekstVersjon, rad.createdAt.toISOString(),
            rad.gittAvRolle, rad.gittAvUserId, spiller.dateOfBirth?.toISOString() ?? null,
            spiller.requiresGuardianConsent, relasjonerForGiver,
            revisjon.medlem, revisjon.gruppe, revisjon.spiller, revisjon.aktor,
          ])).digest("hex"),
        });
      }
    }
    return les(tx, { id: { in: [...tillatte] }, role: "PLAYER", deletedAt: null }, grunnlag);
  }, AK_PROFIL_TRANSAKSJON);
}
