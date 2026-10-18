"use server";

// WANG Administrasjon (pakke W4): invitasjonslenke for trener og unntak i timeplanen.
// Bare sportssjef. Rollen og gruppa avgjøres på serveren for hvert kall; ingenting fra nettleseren
// bestemmer gruppe eller rolle. Ingen e-post sendes: sportssjefen kopierer lenken selv.

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { gruppeSlugForEpost } from "@/lib/domain/demo-grupper";
import { hentWangCoachGruppeId } from "@/app/team-wang/_data/wang-tilgang";
import { kanSeWangAdministrasjon, wangRolleFor } from "@/app/team-wang/_data/wang-rolle";
import {
  erGyldigTokenForm,
  hashInvitasjonToken,
  invitasjonSti,
  invitasjonUtloper,
  lagInvitasjonToken,
  lesUnntak,
  normaliserEpost,
} from "@/app/team-wang/_data/wang-admin-regler";

type Feil = { ok: false; feil: string };
export type LagInvitasjonSvar = { ok: true; sti: string; utloper: string } | Feil;
export type EnkelSvar = { ok: true } | Feil;
export type AksepterSvar = { ok: true } | Feil;

const IKKE_SPORTSSJEF: Feil = { ok: false, feil: "Bare sportssjef kan gjøre dette." };
const ADMIN_STI = "/team-wang/coach";

async function krevSportssjef(): Promise<{ brukerId: string; gruppeId: string } | null> {
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: "/wang?next=%2Fteam-wang%2Fcoach",
  });
  if (!kanSeWangAdministrasjon(wangRolleFor(bruker))) return null;
  const gruppeId = await hentWangCoachGruppeId(bruker);
  return gruppeId ? { brukerId: bruker.id, gruppeId } : null;
}

export async function lagTrenerInvitasjon(formData: FormData): Promise<LagInvitasjonSvar> {
  const tilgang = await krevSportssjef();
  if (!tilgang) return IKKE_SPORTSSJEF;
  const epost = normaliserEpost(formData.get("epost"));
  if (!epost) return { ok: false, feil: "Skriv en gyldig e-postadresse." };

  const token = lagInvitasjonToken();
  const expiresAt = invitasjonUtloper();
  await prisma.wangTrenerInvitasjon.create({
    data: {
      groupId: tilgang.gruppeId,
      mottakerEpost: epost,
      tokenHash: hashInvitasjonToken(token),
      opprettetAvId: tilgang.brukerId,
      expiresAt,
    },
  });
  revalidatePath(ADMIN_STI);
  return { ok: true, sti: invitasjonSti(token), utloper: expiresAt.toISOString() };
}

export async function trekkTrenerInvitasjon(id: string): Promise<EnkelSvar> {
  const tilgang = await krevSportssjef();
  if (!tilgang) return IKKE_SPORTSSJEF;
  // groupId i where: en sportssjef kan bare trekke invitasjoner i sin egen gruppe.
  const { count } = await prisma.wangTrenerInvitasjon.updateMany({
    where: { id, groupId: tilgang.gruppeId, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (count === 0) return { ok: false, feil: "Invitasjonen finnes ikke eller er allerede brukt." };
  revalidatePath(ADMIN_STI);
  return { ok: true };
}

export async function lagTimeplanUnntak(formData: FormData): Promise<EnkelSvar> {
  const tilgang = await krevSportssjef();
  if (!tilgang) return IKKE_SPORTSSJEF;
  const lest = lesUnntak({ fra: formData.get("fra"), til: formData.get("til"), tekst: formData.get("tekst") });
  if (!lest.ok) return lest;
  await prisma.wangTimeplanUnntak.create({
    data: {
      groupId: tilgang.gruppeId,
      fraDato: lest.fraDato,
      tilDato: lest.tilDato,
      tekst: lest.tekst,
      opprettetAvId: tilgang.brukerId,
    },
  });
  revalidatePath(ADMIN_STI);
  return { ok: true };
}

export async function fjernTimeplanUnntak(id: string): Promise<EnkelSvar> {
  const tilgang = await krevSportssjef();
  if (!tilgang) return IKKE_SPORTSSJEF;
  const { count } = await prisma.wangTimeplanUnntak.deleteMany({ where: { id, groupId: tilgang.gruppeId } });
  if (count === 0) return { ok: false, feil: "Unntaket finnes ikke." };
  revalidatePath(ADMIN_STI);
  return { ok: true };
}

/**
 * Treneren godtar invitasjonen. Krever innlogget COACH-konto med samme e-post som invitasjonen, og at
 * kontoen hører til samme WANG-gruppe (en demokonto når bare demogruppa). Gir COACH-medlemskap i gruppa.
 * Rollen på kontoen endres aldri herfra.
 */
export async function aksepterTrenerInvitasjon(token: string): Promise<AksepterSvar> {
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: "/wang?next=%2Fteam-wang%2Fcoach",
  });
  const ugyldig: Feil = { ok: false, feil: "Lenken er ugyldig, utløpt eller allerede brukt." };
  if (typeof token !== "string" || !erGyldigTokenForm(token)) return ugyldig;

  const inv = await prisma.wangTrenerInvitasjon.findUnique({ where: { tokenHash: hashInvitasjonToken(token) } });
  const naa = new Date();
  if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt.getTime() <= naa.getTime()) return ugyldig;

  const konto = await prisma.user.findUnique({ where: { id: bruker.id }, select: { email: true } });
  const epost = konto?.email?.trim().toLowerCase() ?? "";
  if (epost !== inv.mottakerEpost) {
    return { ok: false, feil: "Invitasjonen gjelder en annen e-postadresse. Logg inn med kontoen den ble laget for." };
  }
  const slug = gruppeSlugForEpost(epost, "WANG");
  const gruppe = slug ? await prisma.group.findUnique({ where: { slug }, select: { id: true, arkivertAt: true } }) : null;
  if (!gruppe || gruppe.id !== inv.groupId || gruppe.arkivertAt) {
    return { ok: false, feil: "Kontoen hører ikke til denne WANG-gruppa." };
  }

  return prisma.$transaction(async (tx) => {
    // Engangsbruk også ved to samtidige trykk: bare ett kall får count 1.
    const { count } = await tx.wangTrenerInvitasjon.updateMany({
      where: { id: inv.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: naa } },
      data: { acceptedAt: naa, acceptedByUserId: bruker.id },
    });
    if (count !== 1) return ugyldig;
    const medlem = await tx.groupMember.findUnique({
      where: { groupId_userId: { groupId: inv.groupId, userId: bruker.id } },
      select: { id: true, role: true, endedAt: true },
    });
    if (medlem && medlem.endedAt === null && medlem.role === "PLAYER") {
      throw new Error("WANG_INVITASJON_SPILLER");
    }
    if (!medlem) {
      await tx.groupMember.create({ data: { groupId: inv.groupId, userId: bruker.id, role: "COACH" } });
    } else if (medlem.endedAt !== null) {
      await tx.groupMember.update({ where: { id: medlem.id }, data: { role: "COACH", endedAt: null } });
    }
    return { ok: true } as const;
  }).catch((e: unknown) => {
    if (e instanceof Error && e.message === "WANG_INVITASJON_SPILLER") {
      return { ok: false, feil: "Kontoen er elev i gruppa og kan ikke bli trener med denne lenken." } as const;
    }
    throw e;
  });
}
