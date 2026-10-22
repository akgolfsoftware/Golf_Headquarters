"use server";

/**
 * Egne mål og vinduer for TrackMan per spiller, kølle og parameter (Anders 22.10.2026, §TRACKMAN I
 * TEAM NORWAY-TESTENE punkt 6). Trener og spiller kan sette dem; hver endring lagrer hvem og når.
 * «Tilbake til standard» sletter det egne målet, og standardvinduet gjelder igjen.
 * Tilgang: spilleren selv, eller Team Norway-trener med gruppe-rolle COACH og navngitt deling.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { tnTrenerKanSkriveFor } from "@/lib/domain/tn-trener-skriv";
import { prisma } from "@/lib/prisma";
import { TM_PARAMETRE } from "@/lib/trackman/statistikk";

const tallEllerTomt = z.string().trim().max(20).transform((v, ctx) => {
  if (!v) return null;
  const n = Number(v.replace("−", "-").replace(",", "."));
  if (!Number.isFinite(n)) { ctx.addIssue({ code: "custom", message: "Skriv et tall." }); return z.NEVER; }
  return n;
});

const MaalSchema = z.object({
  spillerId: z.string().min(1).max(200),
  kolle: z.string().trim().min(1).max(60),
  parameter: z.enum(TM_PARAMETRE.map((p) => p.key) as [string, ...string[]]),
  maal: tallEllerTomt,
  vinduMin: tallEllerTomt,
  vinduMax: tallEllerTomt,
  handling: z.enum(["lagre", "standard"]),
  tilbake: z.string().startsWith("/team-norway/").max(500),
});

export async function lagreTrackManMaal(formData: FormData): Promise<void> {
  const bruker = await requirePortalUser({ tillatDemo: true });
  const parsed = MaalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${String(formData.get("tilbake") ?? "/team-norway")}&feil=maal`);
  const d = parsed.data;
  const kanSkrive = bruker.id === d.spillerId || (await tnTrenerKanSkriveFor(bruker, d.spillerId));
  if (!kanSkrive) redirect(`${d.tilbake}&feil=tilgang`);
  if (d.vinduMin !== null && d.vinduMax !== null && d.vinduMin > d.vinduMax) redirect(`${d.tilbake}&feil=vindu`);
  const where = { spillerId_kolle_parameter: { spillerId: d.spillerId, kolle: d.kolle, parameter: d.parameter } };
  if (d.handling === "standard") {
    await prisma.trackManMaal.deleteMany({ where: { spillerId: d.spillerId, kolle: d.kolle, parameter: d.parameter } });
  } else {
    const data = { maal: d.maal, vinduMin: d.vinduMin, vinduMax: d.vinduMax, settAvId: bruker.id, settAt: new Date() };
    await prisma.trackManMaal.upsert({ where, create: { spillerId: d.spillerId, kolle: d.kolle, parameter: d.parameter, ...data }, update: data });
  }
  revalidatePath(`/team-norway/spiller/${d.spillerId}/tester/trackman`);
  redirect(d.tilbake);
}
