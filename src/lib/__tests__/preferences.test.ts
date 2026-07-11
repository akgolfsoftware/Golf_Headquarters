import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { lesPreferences, lesRaaPreferences, DEFAULT_PREFERENCES } from "@/lib/preferences";

describe("lesRaaPreferences", () => {
  it("returnerer tomt objekt for null/manglende preferences", () => {
    assert.deepEqual(lesRaaPreferences({ preferences: null }), {});
  });

  it("bevarer ukjente nøkler (onboarding, trening) ved siden av kjente felt", () => {
    const raw = {
      spraak: "nb",
      onboarding: { stepCompleted: 3, hcp: 12 },
      trening: { okterPerUke: 4 },
    };
    const rå = lesRaaPreferences({ preferences: raw });
    assert.deepEqual(rå.onboarding, { stepCompleted: 3, hcp: 12 });
    assert.deepEqual(rå.trening, { okterPerUke: 4 });
    assert.equal(rå.spraak, "nb");
  });

  it("simulerer en innstillings-lagring uten å slette onboarding-blobben", () => {
    // Reproduserer bug-scenariet: bruker har onboarding-data fra før,
    // så lagrer en helt urelatert innstilling (f.eks. sgHubMode).
    const brukerMedOnboarding = {
      preferences: {
        ...DEFAULT_PREFERENCES,
        onboarding: { stepCompleted: 7, completedAt: "2026-07-01" },
      },
    };

    // Riktig mønster (fikset): rå-merge som base.
    const riktigOppdatert = {
      ...lesRaaPreferences(brukerMedOnboarding),
      sgHubMode: "advanced",
    } as Record<string, unknown>;
    assert.deepEqual(riktigOppdatert.onboarding, {
      stepCompleted: 7,
      completedAt: "2026-07-01",
    });
    assert.equal(riktigOppdatert.sgHubMode, "advanced");

    // Feil mønster (den gamle buggen): lesPreferences() som base sletter onboarding.
    const feilOppdatert = {
      ...lesPreferences(brukerMedOnboarding),
      sgHubMode: "advanced",
    } as Record<string, unknown>;
    assert.equal(feilOppdatert.onboarding, undefined);
  });
});
