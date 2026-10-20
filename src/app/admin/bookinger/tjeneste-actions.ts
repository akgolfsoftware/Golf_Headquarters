"use server";

/**
 * Tjenester i AgencyOS (bookingplanen steg 2, Anders 15.10.2026): opprett,
 * endre, slå av og på, og slett. Erstatter handlingene som lå under den gamle
 * siden /admin/services, som nå sender videre til /admin/bookinger?fane=tjenester.
 *
 * Tjenester er en delt admin-ressurs uten per-coach eierskap; vernet er
 * rollegrensen `requireCoachActionUser` (COACH og ADMIN). Pris lagres i øre.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FacilityType } from "@/generated/prisma/client";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { erTjenesteKategori } from "@/lib/booking/tjeneste-kategori";
import { lagTjenesteSlug } from "@/lib/booking/tjeneste-slug";

export type TjenesteInput = {
  name: string;
  description?: string | null;
  /** Pris i øre. 0 er lov (gratis, f.eks. WANG-økt). */
  priceOre: number;
  durationMin: number;
  maxDeltakere: number;
  /** Null = felles (gruppe, WANG). */
  coachUserId?: string | null;
  /** Null = ikke satt; da gjettes stedet fra navnet (tjeneste-sted.ts). */
  locationId?: string | null;
  kategori?: string | null;
  /** Romtype tjenesten krever på stedet (f.eks. STUDIO). Null = ingen bestemt romtype; utelatt = uendret. */
  facilityType?: FacilityType | null;
  bufferForMin: number;
  bufferEtterMin: number;
  minVarselTimer: number;
  maksDagerFram: number;
  active: boolean;
};

export type TjenesteResultat = { ok: true; id: string } | { ok: false; feil: string };

const heltall = (min: number, maks: number) => z.number().int().min(min).max(maks);
const valgfriId = z.string().min(1).max(64).nullish().transform((v) => v || null);

const TjenesteSchema = z.object({
  name: z.string().trim().min(2, "Navnet må ha minst 2 tegn.").max(120, "Navnet er for langt."),
  description: z.string().trim().max(1000).nullish().transform((v) => v || null),
  priceOre: heltall(0, 100_000_000),
  durationMin: heltall(5, 600),
  maxDeltakere: heltall(1, 20),
  coachUserId: valgfriId,
  locationId: valgfriId,
  kategori: z
    .string()
    .nullish()
    .transform((v) => v || null)
    .refine((v) => v === null || erTjenesteKategori(v), "Ukjent kategori."),
  facilityType: z.enum(Object.values(FacilityType) as [FacilityType, ...FacilityType[]]).nullish(),
  bufferForMin: heltall(0, 240),
  bufferEtterMin: heltall(0, 240),
  minVarselTimer: heltall(0, 24 * 30),
  maksDagerFram: heltall(1, 365),
  active: z.boolean(),
});

async function ledigSlug(name: string): Promise<string | null> {
  const slug = lagTjenesteSlug(name);
  if (!slug) return null;
  let kandidat = slug;
  let teller = 1;
  while (await prisma.serviceType.findUnique({ where: { slug: kandidat }, select: { id: true } })) {
    teller++;
    kandidat = `${slug}-${teller}`;
  }
  return kandidat;
}

/** Sjekk at coach og sted finnes, så skjemaet ikke lagrer en død peker. */
async function sjekkPekere(data: { coachUserId: string | null; locationId: string | null }): Promise<string | null> {
  if (data.coachUserId) {
    const coach = await prisma.user.findFirst({
      where: { id: data.coachUserId, role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
      select: { id: true },
    });
    if (!coach) return "Coachen finnes ikke.";
  }
  if (data.locationId) {
    const sted = await prisma.location.findUnique({ where: { id: data.locationId }, select: { id: true } });
    if (!sted) return "Stedet finnes ikke.";
  }
  return null;
}

function revalider() {
  revalidatePath("/admin/bookinger");
  revalidatePath("/booking");
}

export async function opprettTjeneste(input: TjenesteInput): Promise<TjenesteResultat> {
  const user = await requireCoachActionUser();
  const parsed = TjenesteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig tjeneste." };
  const data = parsed.data;

  const pekerFeil = await sjekkPekere(data);
  if (pekerFeil) return { ok: false, feil: pekerFeil };

  const slug = await ledigSlug(data.name);
  if (!slug) return { ok: false, feil: "Navnet må inneholde bokstaver eller tall." };

  const ny = await prisma.serviceType.create({
    data: { slug, ...data },
    select: { id: true },
  });
  await audit({
    actorId: user.id,
    action: "service.created",
    target: `ServiceType:${ny.id}`,
    metadata: { name: data.name, priceOre: data.priceOre },
  });
  revalider();
  return { ok: true, id: ny.id };
}

export async function oppdaterTjeneste(id: string, input: TjenesteInput): Promise<TjenesteResultat> {
  const user = await requireCoachActionUser();
  const parsed = TjenesteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig tjeneste." };
  const data = parsed.data;

  const pekerFeil = await sjekkPekere(data);
  if (pekerFeil) return { ok: false, feil: pekerFeil };

  // Slug beholdes: den står i bookinglenker og Stripe-metadata.
  await prisma.serviceType.update({ where: { id }, data });
  await audit({
    actorId: user.id,
    action: "service.updated",
    target: `ServiceType:${id}`,
    metadata: { name: data.name, priceOre: data.priceOre },
  });
  revalider();
  return { ok: true, id };
}

/** Slå av (eller på) uten å slette: bookinger som peker på tjenesten beholdes. */
export async function settTjenesteAktiv(id: string, active: boolean): Promise<TjenesteResultat> {
  const user = await requireCoachActionUser();
  await prisma.serviceType.update({ where: { id }, data: { active } });
  await audit({
    actorId: user.id,
    action: active ? "service.activated" : "service.deactivated",
    target: `ServiceType:${id}`,
  });
  revalider();
  return { ok: true, id };
}

/** Slett for godt. Bare lov når ingen booking peker på tjenesten; ellers slå av. */
export async function slettTjeneste(id: string): Promise<TjenesteResultat> {
  const user = await requireCoachActionUser();
  const antallBookinger = await prisma.booking.count({ where: { serviceTypeId: id } });
  if (antallBookinger > 0) {
    return { ok: false, feil: "Tjenesten har bookinger og kan ikke slettes. Slå den av i stedet." };
  }
  await prisma.serviceType.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "service.deleted",
    target: `ServiceType:${id}`,
  });
  revalider();
  return { ok: true, id };
}
