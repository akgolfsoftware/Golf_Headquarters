/**
 * /stats/min-progresjon — v2. Swap av (mlegacy)-motparten. Auth-gate
 * (getCurrentUser + redirect) og Prisma-spørringene videreført 1:1 —
 * kun presentasjonen er byttet (MinProgresjonV2).
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
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

  const progresjon = await hentBrukerProgresjon(user.id);
  // Sammenligningene er mot PGA-spillere fra Data Golf (referanse, estimert
  // Tour-score, SG-avstand) og vises bare for coach og admin (Anders 09.10.2026).
  // Egne SG-tall vises for alle.
  const sammenligninger = kanSeDataGolf(user) ? progresjon.sammenligninger : [];
  const { sgInputs } = progresjon;
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  return <MinProgresjonV2 fornavn={fornavn} sammenligninger={sammenligninger} sgInputs={sgInputs} />;
}
