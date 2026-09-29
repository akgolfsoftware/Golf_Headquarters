import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import type { UserRole } from "@/generated/prisma/client";
import { getCurrentUserRaw, type UserMedTilgang } from "@/lib/auth/getCurrentUser";
import { vurderTrenerflate } from "@/lib/auth/domene-sperre";
import { WANG_TOPPIDRETT_DEMO_SLUG } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";
import { WANG_LOGG_INN, type WangRolle } from "@/lib/wang/wang-ruter";
import { WANG_TOPPIDRETT_SLUG } from "./wang-tilgang";

/**
 * Serverporten for WANG-trenerflaten (alt under src/app/team-wang/(trener)/).
 * Fellessiden /team-wang og /team-wang/logg-inn står utenfor og er åpne.
 *
 * Slipper inn (Anders 27.–28.09.2026):
 *   - plattform-ADMIN (Anders) som Sportssjef i den ekte WANG-gruppen,
 *     uansett e-postdomene.
 *   - @wang.no med plattformrolle COACH og aktivt COACH- eller ASSISTANT-
 *     medlemskap i WANG Toppidrett-gruppen (eller demogruppen).
 * Rollen: Sportssjef = gruppens hovedcoach (`Group.hovedcoachId`) eller ADMIN.
 * Alle andre trenere i gruppen er Trener. Det finnes ingen egen
 * sportssjef-kolonne; hovedcoach er det nærmeste eksisterende feltet.
 *
 * Avvist bruker sendes til /team-wang/logg-inn?avvist=domene|rolle.
 * Hver skjerm kaller `krevWangTrener()` (eller `krevWangSportssjef()`) selv —
 * en delt layout kjøres ikke på nytt ved navigering og er ingen sikkerhetsgrense.
 */

export type WangTrenerGruppe = { id: string; name: string; slug: string };

export type WangTrenerKontekst = {
  bruker: UserMedTilgang;
  gruppe: WangTrenerGruppe;
  rolle: WangRolle;
  /** Sant for demogruppen (oppdiktede elever). Skjermen kan merke det. */
  erDemo: boolean;
};

/** Sportssjef er ADMIN eller gruppens hovedcoach. Ren funksjon, låst av test. */
export function wangRolleFor(input: { plattformRolle: UserRole; brukerId: string; hovedcoachId: string | null }): WangRolle {
  if (input.plattformRolle === "ADMIN") return "SPORTSSJEF";
  return input.hovedcoachId !== null && input.hovedcoachId === input.brukerId ? "SPORTSSJEF" : "TRENER";
}

const gruppeValg = { id: true, name: true, slug: true, hovedcoachId: true } as const;

async function finnGruppeOgMedlemskap(bruker: { id: string; role: UserRole }) {
  const medlemskap = await prisma.groupMember.findMany({
    where: {
      userId: bruker.id,
      endedAt: null,
      role: { in: ["COACH", "ASSISTANT"] },
      group: { slug: { in: [WANG_TOPPIDRETT_SLUG, WANG_TOPPIDRETT_DEMO_SLUG] } },
    },
    select: { role: true, group: { select: gruppeValg } },
  });
  // Den ekte gruppen vinner over demogruppen hvis en trener står i begge.
  const ekte = medlemskap.find((m) => m.group.slug === WANG_TOPPIDRETT_SLUG);
  const valgt = ekte ?? medlemskap[0] ?? null;
  if (valgt) return { gruppe: valgt.group, gruppeRolle: valgt.role };
  if (bruker.role === "ADMIN") {
    const gruppe = await prisma.group.findUnique({ where: { slug: WANG_TOPPIDRETT_SLUG }, select: gruppeValg });
    return gruppe ? { gruppe, gruppeRolle: null } : null;
  }
  return null;
}

export const krevWangTrener = cache(async (): Promise<WangTrenerKontekst> => {
  const bruker = await getCurrentUserRaw();
  if (!bruker) redirect(WANG_LOGG_INN);

  const funn = await finnGruppeOgMedlemskap(bruker);
  const vurdering = vurderTrenerflate({
    flate: "wang",
    epost: bruker.email,
    plattformRolle: bruker.role,
    gruppeRolle: funn?.gruppeRolle ?? null,
  });
  if (!vurdering.ok) redirect(`${WANG_LOGG_INN}?avvist=${vurdering.grunn}`);
  if (!funn?.gruppe.slug) redirect(`${WANG_LOGG_INN}?avvist=rolle`);

  const { gruppe } = funn;
  return {
    bruker,
    gruppe: { id: gruppe.id, name: gruppe.name, slug: gruppe.slug ?? "" },
    rolle: wangRolleFor({ plattformRolle: bruker.role, brukerId: bruker.id, hovedcoachId: gruppe.hovedcoachId }),
    erDemo: gruppe.slug === WANG_TOPPIDRETT_DEMO_SLUG,
  };
});

/** For Administrasjon (WANG-19, 34, 26, 31, 32, 33). Trener får 404, ikke en halv side. */
export async function krevWangSportssjef(): Promise<WangTrenerKontekst> {
  const kontekst = await krevWangTrener();
  if (kontekst.rolle !== "SPORTSSJEF") notFound();
  return kontekst;
}
