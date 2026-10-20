import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  erGodkjentSyntetiskWangAuthBruker,
  lagWangTestAccountSpecs,
  lagWangTestCredentialDocument,
} from "./test-account-provisioning";
import { WANG_DEMO_PROJECT_REF } from "./test-account-linking";
import { WANG_ROLES } from "./types";

describe("oppretting av syntetiske WANG-testkontoer", () => {
  it("lager nøyaktig én fast example.invalid-konto per rolle", () => {
    const specs = lagWangTestAccountSpecs();
    assert.equal(specs.length, WANG_ROLES.length);
    assert.deepEqual(specs.map((spec) => spec.role), [...WANG_ROLES]);
    assert.equal(new Set(specs.map((spec) => spec.email)).size, WANG_ROLES.length);
    for (const spec of specs) {
      assert.match(spec.email, /^wang-demo-[a-z0-9-]+@example\.invalid$/);
    }
  });

  it("krever både serverstyrt og brukerrettet syntetisk markør", () => {
    const spec = lagWangTestAccountSpecs()[0];
    assert.equal(erGodkjentSyntetiskWangAuthBruker(spec, {
      email: spec.email,
      app_metadata: {
        wang_synthetic: true,
        wang_synthetic_profile_key: spec.profileKey,
      },
      user_metadata: { wang_synthetic_profile_key: spec.profileKey },
    }), true);
    assert.equal(erGodkjentSyntetiskWangAuthBruker(spec, {
      email: spec.email,
      app_metadata: { wang_synthetic: false },
      user_metadata: { wang_synthetic_profile_key: spec.profileKey },
    }), false);
  });

  it("lager privat koblingsgrunnlag uten ekte adresser eller navn", () => {
    const accounts = lagWangTestAccountSpecs().map((spec, index) => ({
      ...spec,
      id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      password: `sikker-testkode-${String(index + 1).padStart(10, "0")}`,
    }));
    const document = lagWangTestCredentialDocument({
      studentId: "20000000-0000-4000-8000-000000000001",
      accounts,
    });
    assert.equal(document.projectRef, WANG_DEMO_PROJECT_REF);
    assert.equal(document.accounts.length, WANG_ROLES.length);
    assert.deepEqual(Object.keys(document.profileIds), [...WANG_ROLES]);
    assert.equal(JSON.stringify(document).includes("Fiktiv "), false);
    assert.equal(document.accounts.every((account) => account.email.endsWith("@example.invalid")), true);
  });

  it("avviser manglende roller og korte passord", () => {
    const accounts = lagWangTestAccountSpecs().map((spec, index) => ({
      ...spec,
      id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      password: "for-kort",
    }));
    assert.throws(() => lagWangTestCredentialDocument({
      studentId: "20000000-0000-4000-8000-000000000001",
      accounts,
    }), /Ugyldig syntetisk testkonto/);
    assert.throws(() => lagWangTestCredentialDocument({
      studentId: "20000000-0000-4000-8000-000000000001",
      accounts: accounts.slice(1).map((account) => ({ ...account, password: "langt-nok-testpassord-12345" })),
    }), /nøyaktig én konto/);
    assert.throws(() => lagWangTestCredentialDocument({
      studentId: "20000000-0000-4000-8000-000000000001",
      accounts: accounts.map((account, index) => ({
        ...account,
        id: index === 0 ? accounts[1].id : account.id,
        password: "langt-nok-testpassord-12345",
      })),
    }), /unik bruker-ID/);
  });
});
