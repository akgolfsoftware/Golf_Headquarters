import "server-only";
import { prisma } from "@/lib/prisma";
import { lesForelderSamtykker } from "./forelder-kontekst";
import { isAwaitingGuardianConsent } from "./auth/minor";

const profilSelect = { id: true, name: true, email: true, phone: true, homeClub: true, hcp: true, school: true,
  dateOfBirth: true, createdAt: true, preferences: true, requiresGuardianConsent: true, guardianConsentGivenAt: true } as const;
type Profil = NonNullable<Awaited<ReturnType<typeof lesProfil>>>;
function lesProfil(id: string, parentId?: string) {
  return prisma.user.findFirst({ where: { id, deletedAt: null, ...(parentId ? { parentRelations: { some: { parentId, approved: true } } } : {}) }, select: profilSelect });
}
function profilDto(u: Profil) {
  return { id: u.id, navn: u.name, epost: u.email, telefon: u.phone, hjemmeklubb: u.homeClub, hcp: u.hcp,
    skole: u.school, fodselsdato: u.dateOfBirth?.toISOString() ?? null, opprettet: u.createdAt.toISOString(),
    samtykker: lesForelderSamtykker(u.preferences) };
}

/** Foresattinnsyn er ikke barnets komplette private kontoeksport. Ingen rå JSON. */
export async function lastForelderEksport(parentId: string) {
  const forelder = await lesProfil(parentId);
  const relasjoner = await prisma.parentRelation.findMany({ where: { parentId, approved: true, child: { deletedAt: null } },
    select: { childId: true, relationship: true }, orderBy: { createdAt: "asc" } });
  const barn = await Promise.all(relasjoner.map(async (relasjon) => {
    const child = await lesProfil(relasjon.childId, parentId);
    if (!child) return null;
    const tilgang = { deletedAt: null, parentRelations: { some: { parentId, approved: true } } };
    const [bookinger, betalinger, varsler, treningsokter] = await Promise.all([
      prisma.booking.findMany({ where: { userId: child.id, user: tilgang }, orderBy: { startAt: "desc" },
        select: { id: true, startAt: true, endAt: true, status: true, priceOre: true, serviceType: { select: { name: true } }, location: { select: { name: true } } } }),
      prisma.payment.findMany({ where: { userId: child.id, user: tilgang }, orderBy: { createdAt: "desc" },
        select: { id: true, type: true, amountOre: true, status: true, createdAt: true } }),
      prisma.notification.findMany({ where: { userId: parentId, link: `/forelder/barn/${child.id}` }, orderBy: { createdAt: "desc" },
        select: { id: true, type: true, title: true, createdAt: true } }),
      isAwaitingGuardianConsent(child) ? Promise.resolve([]) : prisma.trainingPlanSessionLog.findMany({
        where: { completedAt: { not: null }, session: { plan: { userId: child.id, user: tilgang } } },
        orderBy: { startedAt: "desc" }, select: { id: true, startedAt: true, completedAt: true, session: { select: { title: true } } } }),
    ]);
    return { relasjon: relasjon.relationship, profil: profilDto(child),
      bookinger: bookinger.map((b) => ({ id: b.id, start: b.startAt.toISOString(), slutt: b.endAt.toISOString(), tjeneste: b.serviceType.name, sted: b.location.name, status: b.status, prisOre: b.priceOre })),
      betalinger: betalinger.map((p) => ({ id: p.id, type: p.type, belopOre: p.amountOre, status: p.status, dato: p.createdAt.toISOString() })),
      treningsokter: treningsokter.map((l) => ({ id: l.id, tittel: l.session.title, startet: l.startedAt.toISOString(), fullfort: l.completedAt?.toISOString() ?? null })),
      varsler: varsler.map((n) => ({ id: n.id, type: n.type, tittel: n.title, dato: n.createdAt.toISOString() })),
    };
  }));
  return { eksportert: new Date().toISOString(), kilde: "AK Golf HQ — foreldreinnsyn",
    omfang: "Delte profilopplysninger, registrerte samtykker, bookinger, betalinger og oppmøte. Barnets private refleksjoner, utkast, samtaler, helsemålinger og DataGolf-grunnlag inngår ikke.",
    forelder: forelder ? profilDto(forelder) : null, barn: barn.filter((b): b is NonNullable<typeof b> => b !== null) };
}
