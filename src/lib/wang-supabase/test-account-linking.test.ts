import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertSyntheticWangAuthIdentity,
  assertWangTestAccountTarget,
  expectedWangTestEmail,
  lagWangTestAccountPlan,
  WANG_DEMO_PROJECT_REF,
} from "./test-account-linking";
import { WANG_ROLES, type WangRole } from "./types";

const ids = Object.fromEntries(
  WANG_ROLES.map((role, index) => [
    role,
    `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  ]),
) as Record<WangRole, string>;

const validInput = {
  projectRef: WANG_DEMO_PROJECT_REF,
  studentId: "20000000-0000-4000-8000-000000000001",
  profileIds: ids,
};

describe("sikker kobling av WANG-testkontoer", () => {
  it("lager komplett plan uten e-postsending eller helseomfang", () => {
    const plan = lagWangTestAccountPlan(validInput);
    assert.equal(plan.profiles.length, WANG_ROLES.length);
    assert.deepEqual(plan.staffAssignments.map((item) => item.role), ["sports_director", "coach"]);
    assert.equal(plan.studentLink.profileId, ids.student);
    assert.deepEqual(plan.externalAccess.map((item) => item.role), ["guardian", "club_coach"]);
    for (const access of plan.externalAccess) {
      assert.equal(access.scopes.includes("wellbeing"), false);
      assert.match(access.expiresAt, /^2027-07-31T/);
    }
    assert.equal(plan.profiles.find((profile) => profile.role === "readonly")?.schoolScope, "fredrikstad");
  });

  it("krever riktig prosjekt og nøyaktig én unik ID per rolle", () => {
    assert.throws(
      () => lagWangTestAccountPlan({ ...validInput, projectRef: "feil-prosjekt" }),
      /godkjente WANG-databasen/,
    );
    const { readonly: _removed, ...missingRole } = ids;
    assert.throws(
      () => lagWangTestAccountPlan({ ...validInput, profileIds: missingRole }),
      /nøyaktig én ID/,
    );
    assert.throws(
      () => lagWangTestAccountPlan({
        ...validInput,
        profileIds: { ...ids, readonly: ids.student },
      }),
      /unik bruker-ID/,
    );
  });

  it("avviser ugyldig elev-ID", () => {
    assert.throws(
      () => lagWangTestAccountPlan({ ...validInput, studentId: "ikke-en-uuid" }),
      /studentId/,
    );
  });

  it("låser kjøring til korrekt WANG-URL og egen servernøkkel", () => {
    const target = assertWangTestAccountTarget({
      NEXT_PUBLIC_WANG_SUPABASE_URL: `https://${WANG_DEMO_PROJECT_REF}.supabase.co`,
      WANG_SUPABASE_SERVICE_ROLE_KEY: "syntetisk-testnokkel",
    });
    assert.equal(target.url, `https://${WANG_DEMO_PROJECT_REF}.supabase.co`);
    assert.throws(
      () => assertWangTestAccountTarget({
        NEXT_PUBLIC_WANG_SUPABASE_URL: "https://jdyyfpedserjnnfngeve.supabase.co",
        WANG_SUPABASE_SERVICE_ROLE_KEY: "syntetisk-testnokkel",
      }),
      /bare tillatt/,
    );
    assert.throws(
      () => assertWangTestAccountTarget({
        NEXT_PUBLIC_WANG_SUPABASE_URL: `https://${WANG_DEMO_PROJECT_REF}.supabase.co`,
      }),
      /SERVICE_ROLE_KEY/,
    );
  });

  it("krever fast syntetisk e-post og profilmarkør på Auth-brukeren", () => {
    const profile = lagWangTestAccountPlan(validInput).profiles[0];
    assert.doesNotThrow(() => assertSyntheticWangAuthIdentity(profile, {
      id: profile.id,
      email: expectedWangTestEmail(profile.profileKey),
      user_metadata: { wang_synthetic_profile_key: profile.profileKey },
    }));
    assert.throws(() => assertSyntheticWangAuthIdentity(profile, {
      id: profile.id,
      email: "person@example.com",
      user_metadata: { wang_synthetic_profile_key: profile.profileKey },
    }), /ikke en godkjent syntetisk/);
  });
});
