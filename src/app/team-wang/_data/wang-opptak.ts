import "server-only";

import { prisma } from "@/lib/prisma";
import {
  KANDIDAT_STATUS,
  sorterKandidater,
  type WangKandidatStatus,
  type WangKontaktMottaker,
  type WangOpptakData,
} from "@/app/team-wang/_data/wang-opptak-visning";

/**
 * Opptak og koordinering for sportssjefen ved én WANG-skole (gruppe). Kallet skjer bare når serveren har
 * avgjort at brukeren er sportssjef og gruppe-ID-en kommer fra hentWangCoachGruppeId, aldri fra nettleseren.
 *
 * Egen skole ser kandidatenes status. Koordineringen viser WANG-skolenes kandidater som minst én skole har
 * stjernemerket eller logget kontakt med: navn, klubb, fødselsår, stjernemerker og kontaktlogg. Aldri status,
 * vurdering eller notater fra andre skoler.
 */
export async function hentWangOpptak(gruppeId: string, skoleaar: string): Promise<WangOpptakData> {
  const [gruppe, opptak, kandidater] = await Promise.all([
    prisma.group.findUnique({ where: { id: gruppeId }, select: { name: true } }),
    prisma.wangOpptak.findUnique({ where: { groupId_skoleaar: { groupId: gruppeId, skoleaar } }, select: { plasser: true } }),
    prisma.wangKandidat.findMany({
      where: { skoleaar },
      select: { id: true, groupId: true, navn: true, klubb: true, fodselsaar: true, status: true },
      orderBy: { navn: "asc" },
      take: 500,
    }),
  ]);

  const ider = kandidater.map((k) => k.id);
  const [stjerner, kontakter] = ider.length
    ? await Promise.all([
        prisma.wangKandidatStjerne.findMany({ where: { kandidatId: { in: ider } }, select: { kandidatId: true, groupId: true } }),
        prisma.wangKandidatKontakt.findMany({
          where: { kandidatId: { in: ider } },
          select: { id: true, kandidatId: true, groupId: true, personRolle: true, personNavn: true, mottaker: true, kontaktetAt: true },
          orderBy: { kontaktetAt: "desc" },
        }),
      ])
    : [[], []];

  const skoleIder = [...new Set([...stjerner.map((s) => s.groupId), ...kontakter.map((k) => k.groupId)])];
  const skoler = skoleIder.length
    ? await prisma.group.findMany({ where: { id: { in: skoleIder } }, select: { id: true, name: true } })
    : [];
  const skoleNavn = new Map(skoler.map((s) => [s.id, s.name]));
  const navnFor = (id: string) => skoleNavn.get(id) ?? "Annen WANG-skole";

  const stjerneEgen = new Set(stjerner.filter((s) => s.groupId === gruppeId).map((s) => s.kandidatId));

  const egne = kandidater
    .filter((k) => k.groupId === gruppeId)
    .map((k) => ({
      id: k.id,
      navn: k.navn,
      klubb: k.klubb,
      fodselsaar: k.fodselsaar,
      status: (KANDIDAT_STATUS as readonly string[]).includes(k.status) ? (k.status as WangKandidatStatus) : "SOKT",
      stjerneEgen: stjerneEgen.has(k.id),
    }));

  // En kandidat deles med de andre skolene først når en skole har stjernemerket eller logget kontakt.
  const koordinering = kandidater.map((k) => ({
    id: k.id,
    navn: k.navn,
    klubb: k.klubb,
    fodselsaar: k.fodselsaar,
    stjernerFra: stjerner.filter((s) => s.kandidatId === k.id).map((s) => navnFor(s.groupId)),
    stjerneEgen: stjerneEgen.has(k.id),
    kontakter: kontakter
      .filter((c) => c.kandidatId === k.id)
      .map((c) => ({
        id: c.id,
        skole: navnFor(c.groupId),
        personRolle: c.personRolle,
        personNavn: c.personNavn,
        mottaker: (c.mottaker === "FORESATTE" ? "FORESATTE" : "KANDIDAT") as WangKontaktMottaker,
        kontaktetAt: c.kontaktetAt.toISOString(),
      })),
  })).filter((k) => k.stjernerFra.length > 0 || k.kontakter.length > 0);

  return {
    skoleaar,
    skoleNavn: gruppe?.name ?? "WANG",
    plasser: opptak?.plasser ?? null,
    kandidater: sorterKandidater(egne),
    koordinering: sorterKandidater(koordinering),
  };
}
