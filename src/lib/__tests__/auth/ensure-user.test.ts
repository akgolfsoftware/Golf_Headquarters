/**
 * Tester for ensureUser (lazy Prisma-rad fra Supabase user_metadata) —
 * utvidet i plan T3 med TalentHQ-kilde:
 *
 *  1. `kilde: "talenthq"` i metadata → raden opprettes med profilType TALENT
 *     og profilKilde TALENTHQ — og tier tvinges fortsatt til GRATIS uansett
 *     hva metadata påstår (klient-kontrollert, aldri privilegium).
 *  2. Uten kilde → ingen profilType/profilKilde i create (DB-default STANDARD).
 *  3. Eksisterende bruker: upsert-update-grenen er TOM — profilType røres
 *     aldri ved senere innlogginger, selv med talenthq-metadata.
 *  4. Pending-rad (claimPendingAccountByEmail) → kun authId kobles, upsert
 *     kjøres ikke — invitasjonsflytens profilType bevares.
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import).
 * Modulen under test importeres KUN ÉN GANG per fil, så scenarioene kjøres
 * sekvensielt med mutérbar mock-tilstand. claimPendingAccountByEmail mockes
 * IKKE — den går mot samme prisma-mock (findFirst/update), så koblingen
 * ensureUser → claim testes reelt.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import type { User as AuthUser } from "@supabase/supabase-js";

type UpsertArgs = {
  where: { authId: string };
  update: Record<string, unknown>;
  create: Record<string, unknown>;
};
type UpdateArgs = { where: unknown; data: Record<string, unknown> };

function authBruker(overrides: {
  id?: string;
  email?: string;
  meta?: Record<string, unknown>;
} = {}): AuthUser {
  return {
    id: overrides.id ?? "auth-1",
    aud: "authenticated",
    created_at: "2026-08-16T00:00:00Z",
    app_metadata: {},
    user_metadata: overrides.meta ?? {},
    email: overrides.email ?? "spiller@example.com",
  };
}

test("ensureUser — TalentHQ-kilde, tier-tvang og urørt eksisterende profil", async (t) => {
  // --- mutérbar mock-tilstand ---
  let findFirstResultat: Record<string, unknown> | null = null;
  const upserts: UpsertArgs[] = [];
  const updates: UpdateArgs[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        user: {
          findFirst: async () => findFirstResultat,
          update: async (args: UpdateArgs) => {
            updates.push(args);
            return { ...(findFirstResultat ?? {}), ...args.data };
          },
          upsert: async (args: UpsertArgs) => {
            upserts.push(args);
            return { id: "u-1", ...args.create };
          },
        },
      },
    },
  });

  const { ensureUser } = await import("@/lib/auth/ensureUser");

  await t.test("uten role/tier i metadata → null, ingen upsert", async () => {
    const res = await ensureUser(authBruker({ meta: {} }));
    assert.equal(res, null);
    assert.equal(upserts.length, 0);
  });

  await t.test(
    "kilde=talenthq → profilType TALENT + profilKilde TALENTHQ, tier tvunget GRATIS",
    async () => {
      const res = await ensureUser(
        authBruker({
          id: "auth-talent",
          email: "talent@example.com",
          // Klienten påstår PRO — skal aldri vinne.
          meta: { role: "PLAYER", tier: "PRO", kilde: "talenthq", firstName: "Øyvind", lastName: "Rohjan" },
        }),
      );
      assert.ok(res);
      assert.equal(upserts.length, 1);
      const { create, update } = upserts[0];
      assert.equal(create.profilType, "TALENT");
      assert.equal(create.profilKilde, "TALENTHQ");
      assert.equal(create.tier, "GRATIS");
      assert.equal(create.role, "PLAYER");
      assert.equal(create.name, "Øyvind Rohjan");
      // Update-grenen skal være tom uansett metadata.
      assert.deepEqual(update, {});
    },
  );

  await t.test("vanlig spiller uten kilde → TALENT med kilde SIGNUP", async () => {
    // Endret 2026-08-29: gratisnivået er standard for alle nye spillere.
    // Uten dette ville en ny bruker landet på INGEN, siden den usynlige
    // prøveperioden er fjernet fra resolveTilgang samtidig.
    await ensureUser(
      authBruker({
        id: "auth-standard",
        email: "standard@example.com",
        meta: { role: "PLAYER", tier: "GRATIS" },
      }),
    );
    assert.equal(upserts.length, 2);
    const { create } = upserts[1];
    assert.equal(create.profilType, "TALENT");
    assert.equal(create.profilKilde, "SIGNUP");
    assert.equal(create.tier, "GRATIS");
  });

  await t.test(
    "eksisterende bruker (upsert-update): profilType røres ALDRI ved senere innlogginger",
    async () => {
      // Selv om en eksisterende STANDARD-bruker logger inn via talenthq-lenken,
      // er update-grenen tom — upsert kan ikke endre noe på raden.
      await ensureUser(
        authBruker({
          id: "auth-eksisterende",
          email: "finnes@example.com",
          meta: { role: "PLAYER", tier: "GRATIS", kilde: "talenthq" },
        }),
      );
      assert.equal(upserts.length, 3);
      assert.deepEqual(upserts[2].update, {});
    },
  );

  await t.test("pending-rad claimes: kun authId oppdateres, upsert kjøres ikke", async () => {
    // Invitasjonsflyten (inviterSpillereTilGruppe) har allerede satt
    // profilType TALENT på raden — claim skal bevare den ved kun å koble authId.
    findFirstResultat = {
      id: "u-pending",
      authId: "pending-123",
      email: "invitert@example.com",
      profilType: "TALENT",
      profilKilde: "TALENTHQ",
    };
    const res = await ensureUser(
      authBruker({ id: "auth-ekte", email: "invitert@example.com", meta: {} }),
    );
    assert.ok(res);
    assert.equal(updates.length, 1);
    assert.deepEqual(updates[0].data, { authId: "auth-ekte" });
    // Ingen ny upsert — raden er den samme, profilType urørt.
    assert.equal(upserts.length, 3);
  });

  // Står sist med vilje: subtestene over teller upserts absolutt, så en ny
  // opprettelse tidligere i rekka forskyver dem.
  await t.test("forelder får IKKE portalens gratisnivå", async () => {
    // Foreldre har egen app (/forelder) og styres ikke av portal-nivåene.
    findFirstResultat = null;
    await ensureUser(
      authBruker({
        id: "auth-forelder",
        email: "forelder@example.com",
        meta: { role: "PARENT", tier: "GRATIS" },
      }),
    );
    const { create } = upserts[upserts.length - 1];
    assert.equal("profilType" in create, false);
    assert.equal("profilKilde" in create, false);
    assert.equal(create.role, "PARENT");
  });
});
