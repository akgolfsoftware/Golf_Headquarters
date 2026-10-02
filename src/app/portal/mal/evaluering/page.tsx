import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentEgenIup } from "@/lib/iup/lagring";
import { hentEgenIupOversikt } from "@/lib/iup/oversikt";
import { PHIupEvaluering } from "@/components/portal/precision/iup-evaluering";

export const dynamic = "force-dynamic";
export const metadata = { title: "Evaluering · PlayerHQ" };

const Parametre = z.object({
  id: z.string().min(1).max(120).optional(),
  ny: z.enum(["UTVIKLINGSSJEKK", "SESONGEVALUERING"]).optional(),
  forDato: z.iso.datetime().optional(),
  forId: z.string().min(1).max(120).optional(),
}).refine((p) => !(p.id && p.ny));

export default async function IupEvalueringPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = Parametre.safeParse(await searchParams);
  if (!parsed.success) notFound();
  const p = parsed.data;
  const [oversikt, historikk, uleste] = await Promise.all([
    hentEgenIupOversikt({ forDato: p.forDato, forId: p.forId }),
    p.id ? hentEgenIup({ id: p.id }) : Promise.resolve(null),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!oversikt || (p.id && !historikk)) notFound();
  return <PHIupEvaluering key={historikk ? `${historikk.id}-${historikk.revisjon}` : p.ny ?? "oversikt"}
    oversikt={oversikt} historikk={historikk} nyType={p.ny ?? null} uleste={uleste} />;
}
