/**
 * O05/O07: trekkEksternLeser er ADMIN-only og merker alle aktive
 * gruppetilganger trukket, inkludert komplett-profil-capability.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "admin-a", role: "ADMIN" as string, name: "Admin" };
let leser: { id: string; role: string; email: string } | null = {
  id: "leser-1",
  role: "GUEST",
  email: "leser@test.no",
};
let revokedAt: Date | null = null;
let slettedeCapabilities: string[] = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: {
    resendKlient: () => ({ emails: { send: async () => undefined } }),
    FRA_EPOST: "post@akgolf.no",
  },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireAdminActionUser: async () => {
      if (bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => leser,
      },
      eksternLeserGruppe: {
        updateMany: async ({ data }: { data: { revokedAt: Date } }) => {
          revokedAt = data.revokedAt;
          return { count: 1 };
        },
      },
      userCapability: {
        deleteMany: async ({
          where,
        }: {
          where: { capability?: { in: string[] } };
        }) => {
          slettedeCapabilities = where.capability?.in ?? [];
          return { count: slettedeCapabilities.length };
        },
      },
    },
  },
});

async function actions() {
  return import("./ekstern-leser-actions");
}

test.beforeEach(() => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin" };
  leser = { id: "leser-1", role: "GUEST", email: "leser@test.no" };
  revokedAt = null;
  slettedeCapabilities = [];
});

test("trekkEksternLeser avviser ikke-admin uten å skrive", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach" };
  const { trekkEksternLeser } = await actions();
  const svar = await trekkEksternLeser("leser-1");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /forbidden/);
  assert.equal(revokedAt, null);
  assert.equal(slettedeCapabilities.length, 0);
});

test("trekkEksternLeser avviser bruker som ikke er ekstern leser", async () => {
  leser = { id: "spiller-1", role: "PLAYER", email: "spiller@test.no" };
  const { trekkEksternLeser } = await actions();
  const svar = await trekkEksternLeser("spiller-1");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /ekstern leser/);
  assert.equal(revokedAt, null);
});

test("trekkEksternLeser merker tilgang trukket og fjerner alle innsyn-capabilities", async () => {
  const { trekkEksternLeser } = await actions();
  const svar = await trekkEksternLeser("leser-1");
  assert.equal(svar.ok, true);
  assert.ok(revokedAt instanceof Date);
  assert.ok(slettedeCapabilities.includes("view_shared_test_results"));
  assert.ok(slettedeCapabilities.includes("view_shared_stats"));
  assert.ok(slettedeCapabilities.includes("view_shared_full_profile"));
});
