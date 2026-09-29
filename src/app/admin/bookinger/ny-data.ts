/**
 * Data til coachens bookingveiviser (AG-06 «Ny booking» og /admin/bookinger/ny).
 * Samme spørringer som den gamle /admin/bookinger/ny-siden (multi-coach
 * 2026-08-08): ADMIN ser alle aktive tjenester, COACH egne + felles; steder med
 * fasiliteter; coachers fasiliteter via tilgjengeligheten. Nytt 29.09.2026:
 * klipp igjen per spiller (coaching-pakken) for betalingsvalget Klipp, og
 * grupper coachen eier (samme regel som eierGruppen) for gruppebooking.
 */

import { prisma } from "@/lib/prisma";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { policyBannerTexts } from "@/lib/booking/policy";
import type { User } from "@/generated/prisma/client";

export type NyBookingData = {
  spillere: Array<{ id: string; navn: string; epost: string; klubb: string | null; klippIgjen: number | null }>;
  grupper: Array<{ id: string; navn: string; maksDeltakere: number | null }>;
  tjenester: Array<{ id: string; navn: string; varighetMin: number; prisOre: number; maksDeltakere: number; coachId: string | null; coachNavn: string | null }>;
  steder: Array<{ id: string; navn: string; adresse: string; fasiliteter: Array<{ id: string; navn: string; kapasitet: number }> }>;
  coacher: Array<{ id: string; navn: string; fasilitetIder: string[] }>;
  erAdmin: boolean;
  coachId: string;
  policy: string;
};

export async function hentNyBookingData(user: User): Promise<NyBookingData> {
  const erAdmin = user.role === "ADMIN";
  const [spillere, tjenester, lokasjoner, coacher, grupper] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true, email: true, homeClub: true },
      orderBy: { name: "asc" },
      take: 300,
    }),
    prisma.serviceType.findMany({
      where: { active: true, ...(erAdmin ? {} : { OR: [{ coachUserId: user.id }, { coachUserId: null }] }) },
      select: { id: true, name: true, durationMin: true, priceOre: true, maxDeltakere: true, coachUserId: true, coach: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        address: true,
        facilities: { where: { active: true }, select: { id: true, name: true, capacity: true }, orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    erAdmin
      ? prisma.user.findMany({ where: { role: { in: ["COACH", "ADMIN"] } }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 50 })
      : Promise.resolve([{ id: user.id, name: user.name }]),
    prisma.group.findMany({
      where: {
        arkivertAt: null,
        ...(erAdmin ? {} : { OR: [{ coachId: user.id }, { members: { some: { userId: user.id, role: "COACH", endedAt: null } } }] }),
      },
      select: { id: true, name: true, maxParticipants: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  const spillerIder = spillere.map((s) => s.id);
  const [pakker, tilg] = await Promise.all([
    spillerIder.length
      ? prisma.subscription.findMany({
          where: { kind: "COACHING", userId: { in: spillerIder } },
          select: { userId: true, status: true, currentPeriodEnd: true, monthlyCredits: true, creditsRemaining: true },
        })
      : Promise.resolve([]),
    coacher.length
      ? prisma.coachAvailability.findMany({ where: { coachId: { in: coacher.map((c) => c.id) }, active: true }, select: { coachId: true, locationId: true } })
      : Promise.resolve([]),
  ]);

  const klipp = new Map<string, number>();
  for (const p of pakker) {
    if (kanBrukeCredits(p) && p.monthlyCredits > 0) klipp.set(p.userId, p.creditsRemaining);
  }

  const stederPerCoach = new Map<string, Set<string>>();
  for (const r of tilg) {
    if (!r.coachId || !r.locationId) continue;
    const set = stederPerCoach.get(r.coachId) ?? new Set<string>();
    set.add(r.locationId);
    stederPerCoach.set(r.coachId, set);
  }
  const fasPerSted = new Map(lokasjoner.map((l) => [l.id, l.facilities.map((f) => f.id)]));

  return {
    erAdmin,
    coachId: user.id,
    policy: policyBannerTexts().cancel,
    spillere: spillere.map((s) => ({ id: s.id, navn: s.name ?? "Uten navn", epost: s.email, klubb: s.homeClub, klippIgjen: klipp.get(s.id) ?? null })),
    grupper: grupper.map((g) => ({ id: g.id, navn: g.name, maksDeltakere: g.maxParticipants })),
    tjenester: tjenester.map((t) => ({ id: t.id, navn: t.name, varighetMin: t.durationMin, prisOre: t.priceOre, maksDeltakere: t.maxDeltakere, coachId: t.coachUserId, coachNavn: t.coach?.name ?? null })),
    steder: lokasjoner.map((l) => ({ id: l.id, navn: l.name, adresse: l.address, fasiliteter: l.facilities.map((f) => ({ id: f.id, navn: f.name, kapasitet: f.capacity })) })),
    coacher: coacher.map((c) => {
      const steder = stederPerCoach.get(c.id);
      const fas = new Set<string>();
      for (const lid of steder ?? []) for (const fid of fasPerSted.get(lid) ?? []) fas.add(fid);
      return { id: c.id, navn: c.name ?? "Coach", fasilitetIder: [...fas] };
    }),
  };
}
