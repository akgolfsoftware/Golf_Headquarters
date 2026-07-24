"use server";

/**
 * Server actions for /admin/anlegg — lokasjoner + fasiliteter.
 *
 * 17. juli 2026: zod-validering lagt på alle mutasjoner, og hard delete
 * (deleteLocation/deleteFacility) er FJERNET — bookinger og availability
 * refererer lokasjoner/fasiliteter, og Location→Facility har onDelete:
 * Cascade, så sletting ville kaskade-slettet data. Deaktivering
 * (setLocationActive/setFacilityActive med `active=false`) er riktig vei:
 * deaktiverte anlegg vises ikke i booking, og kan aktiveres igjen.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";


const lokasjonSchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(300),
  active: z.boolean(),
  // GPS-posisjon (valgfri). Nullable med vilje: eksplisitt null NULLSTILLER
  // posisjonen i DB (`?? undefined` ville latt gammel verdi stå — se gotchas.md).
  // Gyldig lat/lng-range håndheves her; tomt kart = null (ingen posisjon satt).
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});
export type LocationInput = z.input<typeof lokasjonSchema>;

/** Lat/lng skal alltid være satt sammen — begge eller ingen (aldri halv posisjon). */
function normaliserPosisjon(lat: number | null, lng: number | null): { latitude: number | null; longitude: number | null } {
  if (lat == null || lng == null) return { latitude: null, longitude: null };
  return { latitude: lat, longitude: lng };
}

export async function createLocation(input: LocationInput) {
  const user = await requireCoachActionUser();
  const data = lokasjonSchema.parse(input);
  const { latitude, longitude } = normaliserPosisjon(data.latitude ?? null, data.longitude ?? null);
  const ny = await prisma.location.create({
    data: { name: data.name, address: data.address, active: data.active, latitude, longitude },
  });
  await audit({
    actorId: user.id,
    action: "location.created",
    target: `Location:${ny.id}`,
  });
  revalidatePath("/admin/anlegg");
}

export async function updateLocation(id: string, input: LocationInput) {
  const user = await requireCoachActionUser();
  const data = lokasjonSchema.parse(input);
  // Eksplisitt null nullstiller posisjonen (jf. gotcha: `?? undefined` ville
  // latt gammel lat/lng stå urørt).
  const { latitude, longitude } = normaliserPosisjon(data.latitude ?? null, data.longitude ?? null);
  await prisma.location.update({
    where: { id },
    data: { name: data.name, address: data.address, active: data.active, latitude, longitude },
  });
  await audit({ actorId: user.id, action: "location.updated", target: `Location:${id}` });
  revalidatePath("/admin/anlegg");
}

/** Soft delete/gjenoppretting — aldri hard delete (bookinger/availability refererer lokasjonen). */
export async function setLocationActive(id: string, active: boolean) {
  const user = await requireCoachActionUser();
  await prisma.location.update({ where: { id }, data: { active: z.boolean().parse(active) } });
  await audit({
    actorId: user.id,
    action: active ? "location.activated" : "location.deactivated",
    target: `Location:${id}`,
  });
  revalidatePath("/admin/anlegg");
}

const fasilitetSchema = z.object({
  name: z.string().trim().min(1).max(200),
  capacity: z.number().int().min(1).max(500),
  active: z.boolean(),
  // Speiler Prisma-enumet FacilityType — valideres her så klienten kan
  // sende ren streng uten import fra generert klient.
  type: z.enum([
    "STUDIO", "RANGE_1F", "RANGE_2F", "PUTTING_GREEN", "SHORT_GAME",
    "COURSE_9H", "COURSE_18H", "SPECIFIC_HOLES", "GENERAL",
  ]),
  // Nullable med vilje: eksplisitt null NULLSTILLER beskrivelsen i DB
  // (`?? undefined` ville latt gammel verdi stå — se gotchas.md).
  description: z.string().trim().max(500).nullable(),
});
export type FacilityInput = z.input<typeof fasilitetSchema>;

export async function createFacility(locationId: string, input: FacilityInput) {
  const user = await requireCoachActionUser();
  const data = fasilitetSchema.parse(input);
  const ny = await prisma.facility.create({
    data: { locationId: z.string().min(1).parse(locationId), ...data },
  });
  await audit({
    actorId: user.id,
    action: "facility.created",
    target: `Facility:${ny.id}`,
  });
  revalidatePath("/admin/anlegg");
}

export async function updateFacility(id: string, input: FacilityInput) {
  const user = await requireCoachActionUser();
  const data = fasilitetSchema.parse(input);
  await prisma.facility.update({ where: { id }, data });
  await audit({ actorId: user.id, action: "facility.updated", target: `Facility:${id}` });
  revalidatePath("/admin/anlegg");
}

/** Soft delete/gjenoppretting — aldri hard delete (bookinger refererer fasiliteten). */
export async function setFacilityActive(id: string, active: boolean) {
  const user = await requireCoachActionUser();
  await prisma.facility.update({ where: { id }, data: { active: z.boolean().parse(active) } });
  await audit({
    actorId: user.id,
    action: active ? "facility.activated" : "facility.deactivated",
    target: `Facility:${id}`,
  });
  revalidatePath("/admin/anlegg");
}
