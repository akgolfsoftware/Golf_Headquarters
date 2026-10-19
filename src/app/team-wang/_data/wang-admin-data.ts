// Server-only: invitasjoner og timeplanunntak for WANG Administrasjon (pakke W4).
// Kalles bare fra siden etter at rollen er sjekket (sportssjef).

import "server-only";

import { prisma } from "@/lib/prisma";
import { ukenummer } from "@/lib/uke-helpers";
import { invitasjonStatus } from "./wang-admin-regler";
import type { WangAdminData } from "./wang-admin-visning";

export async function hentWangAdminData(gruppeId: string, naa: Date = new Date()): Promise<WangAdminData> {
  const sistUke = new Date(naa.getTime() - 7 * 86_400_000);
  const [invitasjoner, unntak] = await Promise.all([
    prisma.wangTrenerInvitasjon.findMany({
      // Ventende og nylig utløpte; brukte og trukne vises ikke.
      where: { groupId: gruppeId, acceptedAt: null, revokedAt: null, expiresAt: { gt: sistUke } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, mottakerEpost: true, expiresAt: true, acceptedAt: true, revokedAt: true },
    }),
    prisma.wangTimeplanUnntak.findMany({
      // Unntak som ikke er over: slutt (eller start) i dag eller senere.
      where: {
        groupId: gruppeId,
        OR: [{ tilDato: { gte: idagUtc(naa) } }, { tilDato: null, fraDato: { gte: idagUtc(naa) } }],
      },
      orderBy: { fraDato: "asc" },
      take: 30,
      select: { id: true, fraDato: true, tilDato: true, tekst: true },
    }),
  ]);
  return {
    invitasjoner: invitasjoner.map((i) => ({
      id: i.id,
      epost: i.mottakerEpost,
      utloper: i.expiresAt.toISOString(),
      utlopt: invitasjonStatus(i, naa) === "UTLOPT",
    })),
    unntak: unntak.map((u) => ({
      id: u.id,
      uke: ukenummer(u.fraDato),
      fra: u.fraDato.toISOString().slice(0, 10),
      til: u.tilDato ? u.tilDato.toISOString().slice(0, 10) : null,
      tekst: u.tekst,
    })),
  };
}

/** Dagens norske kalenderdag som UTC-midnatt, samme form som DATE-feltene. */
function idagUtc(naa: Date): Date {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(naa).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
