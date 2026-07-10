/**
 * /stats/min-progresjon — v2. Swap av (mlegacy)-motparten. Auth-gate
 * (getCurrentUser + redirect) og Prisma-spørringene videreført 1:1 —
 * kun presentasjonen er byttet (MinProgresjonV2).
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { MinProgresjonV2 } from "@/components/marketing/v2/MarkedStatsMinProgresjonV2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Min SG-progresjon | AK Golf Stats",
  description: "Se din personlige SG-utvikling over tid. Trend per kategori og sammenligning mot referansespillere.",
  robots: { index: false },
};

async function hentBrukerProgresjon(userId: string) {
  const sammenligninger = await prisma.brukerSammenligning.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sgInputs = await prisma.brukerSgInput.findMany({
    where: { userId },
    orderBy: { dato: "asc" },
    take: 30,
  });

  return { sammenligninger, sgInputs };
}

export default async function MinProgresjonPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/stats/min-progresjon");

  const { sammenligninger, sgInputs } = await hentBrukerProgresjon(user.id);
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  return <MinProgresjonV2 fornavn={fornavn} sammenligninger={sammenligninger} sgInputs={sgInputs} />;
}
