"use server";

/**
 * Serverhandlinger for WANG Tester (WG-03 og WANG-37).
 *
 * Tilgang: innlogget (getCurrentUser) OG WANG-trenerporten (krevWangTrener),
 * og eleven må være aktiv spiller i trenerens egen gruppe. Resultatet
 * lagres med `userId` = eleven og `recordedById` = treneren — aldri omvendt.
 * Hver skriving havner i revisjonsloggen.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { lesDatoTekst } from "@/lib/wang/tester-konkurranse/format";
import { erNgfTest, resultatTekst } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export type FysLagreTilstand = { ok: boolean; melding: string } | null;

const FysInput = z.object({
  elevId: z.string().min(1).max(64),
  testId: z.string().min(1).max(64),
  verdi: z.string().trim().min(1).max(12),
  dato: z.string().trim().min(8).max(10),
});

async function erAktivElev(gruppeId: string, elevId: string): Promise<boolean> {
  const m = await prisma.groupMember.findFirst({ where: { groupId: gruppeId, userId: elevId, role: "PLAYER", endedAt: null }, select: { id: true } });
  return m !== null;
}

export async function lagreFysiskResultat(_forrige: FysLagreTilstand, formData: FormData): Promise<FysLagreTilstand> {
  const innlogget = await getCurrentUser();
  if (!innlogget) return { ok: false, melding: "Du må logge inn på nytt før du kan lagre." };
  const { bruker, gruppe } = await krevWangTrener();

  const parsed = FysInput.safeParse({
    elevId: formData.get("elevId"), testId: formData.get("testId"), verdi: formData.get("verdi"), dato: formData.get("dato"),
  });
  if (!parsed.success) return { ok: false, melding: "Fyll inn elev, test, resultat og dato." };
  const { elevId, testId } = parsed.data;

  const verdi = Number(parsed.data.verdi.replace(",", "."));
  if (!Number.isFinite(verdi) || verdi <= 0 || verdi >= 10_000) return { ok: false, melding: "Resultatet må være et tall større enn null." };
  const dato = lesDatoTekst(parsed.data.dato);
  if (!dato) return { ok: false, melding: "Skriv datoen som DD.MM.ÅÅÅÅ." };
  if (dato.getTime() > Date.now() + 86_400_000) return { ok: false, melding: "Datoen kan ikke være frem i tid." };

  if (!(await erAktivElev(gruppe.id, elevId))) return { ok: false, melding: "Eleven er ikke i gruppa di." };
  const test = await prisma.testDefinition.findFirst({ where: { id: testId, pyramidArea: "FYS", erCanon: true, isCustom: false }, select: { id: true, name: true } });
  if (!test) return { ok: false, melding: "Testen finnes ikke blant de fysiske testene." };

  const resultat = await prisma.testResult.create({
    data: { userId: elevId, testId: test.id, takenAt: dato, score: verdi, recordedById: bruker.id, attestationMode: "NONE" },
    select: { id: true },
  });
  await audit({ actorId: bruker.id, action: "wang.test.fysisk.lagret", target: elevId, metadata: { testId: test.id, resultatId: resultat.id, gruppeId: gruppe.id } });

  revalidatePath(wangHref("WG-03"));
  revalidatePath(wangHref("WANG-23"));
  return { ok: true, melding: `${test.name} er lagt til i elevens historikk.` };
}

const KontrollInput = z.object({ resultatId: z.string().min(1).max(64) });

/**
 * WANG-37 «Kontroller»: treneren bekrefter et ført resultat. Lagres som
 * attestering på resultatet (witnessStatus ATTESTED, witnessUserId = trener).
 * Bare resultater ført på en testdag i trenerens egen gruppe.
 */
export async function kontrollerResultat(formData: FormData): Promise<void> {
  const innlogget = await getCurrentUser();
  if (!innlogget) return;
  const { bruker, gruppe } = await krevWangTrener();
  const parsed = KontrollInput.safeParse({ resultatId: formData.get("resultatId") });
  if (!parsed.success) return;

  const deltaker = await prisma.testDayParticipant.findFirst({
    where: { resultId: parsed.data.resultatId, testDay: { groupId: gruppe.id } },
    select: { playerId: true, result: { select: { id: true, witnessStatus: true, score: true, details: true, test: { select: { id: true, name: true, scoringRule: true, pyramidArea: true } } } } },
  });
  if (!deltaker?.result || deltaker.result.witnessStatus === "ATTESTED") return;
  // Utkast (NGF-protokoll uten avklart skala) kan ikke kontrolleres.
  if (erNgfTest(deltaker.result.test.id) && resultatTekst(deltaker.result.test, deltaker.result.score, deltaker.result.details).tall === null) return;

  await prisma.testResult.update({
    where: { id: deltaker.result.id },
    data: { witnessStatus: "ATTESTED", witnessUserId: bruker.id, attestationMode: "DIGITAL" },
  });
  await audit({ actorId: bruker.id, action: "wang.test.kontrollert", target: deltaker.playerId, metadata: { resultatId: deltaker.result.id, gruppeId: gruppe.id } });
  revalidatePath(wangHref("WANG-37"));
  revalidatePath(wangHref("WANG-23"));
}
