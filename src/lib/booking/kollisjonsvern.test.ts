import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@/generated/prisma/client";
import {
  BookingKollisjon,
  erKollisjonsfeil,
  kollisjonsmelding,
  KOLLISJON_MELDING,
  sjekkKollisjon,
} from "./kollisjonsvern";

function lagP2002(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
  });
}

test("erKollisjonsfeil: BookingKollisjon regnes som kollisjon", () => {
  assert.equal(erKollisjonsfeil(new BookingKollisjon("opptatt")), true);
});

test("erKollisjonsfeil: Prisma P2002 (unique-brudd) regnes som kollisjon", () => {
  assert.equal(erKollisjonsfeil(lagP2002()), true);
});

test("erKollisjonsfeil: melding som nevner EXCLUSION-constraintet regnes som kollisjon", () => {
  assert.equal(
    erKollisjonsfeil(new Error('violates exclusion constraint "booking_coach_no_overlap"')),
    true,
  );
});

test("erKollisjonsfeil: melding som nevner Postgres-koden 23P01 regnes som kollisjon", () => {
  assert.equal(erKollisjonsfeil(new Error("error 23P01: exclusion violation")), true);
});

test("erKollisjonsfeil: uante feil (annen Prisma-kode, vanlig Error, ikke-Error) er IKKE kollisjon", () => {
  const annenPrismaFeil = new Prisma.PrismaClientKnownRequestError("Not found", {
    code: "P2025",
    clientVersion: "test",
  });
  assert.equal(erKollisjonsfeil(annenPrismaFeil), false);
  assert.equal(erKollisjonsfeil(new Error("noe helt annet gikk galt")), false);
  assert.equal(erKollisjonsfeil("streng, ikke en feil"), false);
  assert.equal(erKollisjonsfeil(undefined), false);
});

test("kollisjonsmelding: BookingKollisjon beholder sin egen melding", () => {
  assert.equal(kollisjonsmelding(new BookingKollisjon("Alle plassene er opptatt.")), "Alle plassene er opptatt.");
});

test("kollisjonsmelding: alt annet faller tilbake til standard KOLLISJON_MELDING", () => {
  assert.equal(kollisjonsmelding(lagP2002()), KOLLISJON_MELDING);
  assert.equal(kollisjonsmelding(new Error("db timeout")), KOLLISJON_MELDING);
});

// --- sjekkKollisjon: fake tx som implementerer akkurat det funksjonen bruker ---

type BookingRow = { id: string; startAt: Date; endAt: Date; status: string };

function lagFakeTx(opts: {
  bookinger?: BookingRow[];
  facilityCapacity?: number | null;
}) {
  const bookinger = opts.bookinger ?? [];
  const overlapper = (b: BookingRow, startAt: Date, endAt: Date) =>
    b.status !== "CANCELLED" && b.startAt.getTime() < endAt.getTime() && b.endAt.getTime() > startAt.getTime();

  return {
    $executeRaw: async () => 0,
    booking: {
      findFirst: async ({ where }: { where: { coachId?: string; startAt: { lt: Date }; endAt: { gt: Date }; id?: { not: string } } }) => {
        const match = bookinger.find(
          (b) =>
            overlapper(b, where.endAt.gt, where.startAt.lt) &&
            (!where.id || b.id !== where.id.not),
        );
        return match ? { id: match.id } : null;
      },
      count: async ({ where }: { where: { startAt: { lt: Date }; endAt: { gt: Date }; id?: { not: string } } }) =>
        bookinger.filter(
          (b) =>
            overlapper(b, where.endAt.gt, where.startAt.lt) &&
            (!where.id || b.id !== where.id.not),
        ).length,
    },
    facility: {
      findUnique: async () =>
        opts.facilityCapacity === undefined ? null : { capacity: opts.facilityCapacity },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

test("sjekkKollisjon: kaster BookingKollisjon når coachen har en overlappende booking", async () => {
  const tx = lagFakeTx({
    bookinger: [
      {
        id: "b1",
        startAt: new Date("2026-07-20T10:00:00Z"),
        endAt: new Date("2026-07-20T11:00:00Z"),
        status: "CONFIRMED",
      },
    ],
  });

  await assert.rejects(
    () =>
      sjekkKollisjon(tx, {
        coachId: "coach-1",
        startAt: new Date("2026-07-20T10:30:00Z"),
        endAt: new Date("2026-07-20T11:30:00Z"),
      }),
    BookingKollisjon,
  );
});

test("sjekkKollisjon: går gjennom når overlappende booking er CANCELLED", async () => {
  const tx = lagFakeTx({
    bookinger: [
      {
        id: "b1",
        startAt: new Date("2026-07-20T10:00:00Z"),
        endAt: new Date("2026-07-20T11:00:00Z"),
        status: "CANCELLED",
      },
    ],
  });

  await assert.doesNotReject(() =>
    sjekkKollisjon(tx, {
      coachId: "coach-1",
      startAt: new Date("2026-07-20T10:30:00Z"),
      endAt: new Date("2026-07-20T11:30:00Z"),
    }),
  );
});

test("sjekkKollisjon: ekskluderBookingId hindrer at bookingen som flyttes kolliderer med seg selv", async () => {
  const tx = lagFakeTx({
    bookinger: [
      {
        id: "b1",
        startAt: new Date("2026-07-20T10:00:00Z"),
        endAt: new Date("2026-07-20T11:00:00Z"),
        status: "CONFIRMED",
      },
    ],
  });

  await assert.doesNotReject(() =>
    sjekkKollisjon(tx, {
      coachId: "coach-1",
      startAt: new Date("2026-07-20T10:00:00Z"),
      endAt: new Date("2026-07-20T11:00:00Z"),
      ekskluderBookingId: "b1",
    }),
  );
});

test("sjekkKollisjon: kaster BookingKollisjon (fullt) når fasilitetens kapasitet er nådd", async () => {
  const tx = lagFakeTx({
    bookinger: [
      { id: "b1", startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), status: "CONFIRMED" },
      { id: "b2", startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), status: "CONFIRMED" },
    ],
    facilityCapacity: 2,
  });

  await assert.rejects(
    () =>
      sjekkKollisjon(tx, {
        facilityId: "fac-1",
        startAt: new Date("2026-07-20T10:15:00Z"),
        endAt: new Date("2026-07-20T10:45:00Z"),
      }),
    BookingKollisjon,
  );
});

test("sjekkKollisjon: fasilitet under kapasitet slipper gjennom", async () => {
  const tx = lagFakeTx({
    bookinger: [
      { id: "b1", startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), status: "CONFIRMED" },
    ],
    facilityCapacity: 2,
  });

  await assert.doesNotReject(() =>
    sjekkKollisjon(tx, {
      facilityId: "fac-1",
      startAt: new Date("2026-07-20T10:15:00Z"),
      endAt: new Date("2026-07-20T10:45:00Z"),
    }),
  );
});

test("sjekkKollisjon: manglende facility.capacity faller tilbake til 1 (range/simulator uten satt kapasitet er enkeltplass)", async () => {
  const tx = lagFakeTx({
    bookinger: [
      { id: "b1", startAt: new Date("2026-07-20T10:00:00Z"), endAt: new Date("2026-07-20T11:00:00Z"), status: "CONFIRMED" },
    ],
    facilityCapacity: null,
  });

  await assert.rejects(
    () =>
      sjekkKollisjon(tx, {
        facilityId: "fac-1",
        startAt: new Date("2026-07-20T10:15:00Z"),
        endAt: new Date("2026-07-20T10:45:00Z"),
      }),
    BookingKollisjon,
  );
});
