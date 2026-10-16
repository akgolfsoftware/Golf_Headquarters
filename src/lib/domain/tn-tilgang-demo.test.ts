/** Demokontoene i Team Norway når bare demogruppa (Anders 15.10.2026, valg A). */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

const epostFor: Record<string, string> = { "demo-tn": "demo@golfforbundet.no", "demo-wang": "demo@wang.no", trener: "trener@golfforbundet.no" };
const slugOppslag: string[] = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async ({ where }: { where: { id: string } }) => ({ email: epostFor[where.id] }) },
      group: {
        findUnique: async ({ where }: { where: { slug: string } }) => {
          slugOppslag.push(where.slug);
          return { id: `${where.slug}-id`, name: where.slug };
        },
      },
      groupMember: {
        // Medlem overalt: viser at gruppevalget, ikke medlemskapet, holder demokontoen ute.
        findFirst: async () => ({ id: "medlem", role: "COACH" }),
        count: async () => 0,
      },
    },
  },
});

test.beforeEach(() => { slugOppslag.length = 0; });

test("demo@golfforbundet.no får demogruppa og slår aldri opp den ekte", async () => {
  const { hentTnOversiktForBruker, hentTnGruppeForBruker, erSportssjef } = await import("./tn-tilgang");
  const oversikt = await hentTnOversiktForBruker({ id: "demo-tn", role: "COACH" });
  assert.equal(oversikt?.gruppe.id, "team-norway-demo-id");
  assert.equal((await hentTnGruppeForBruker("demo-tn"))?.slug, "team-norway-demo");
  assert.equal(await erSportssjef({ id: "demo-tn", role: "COACH" }), true);
  assert.ok(slugOppslag.length > 0 && slugOppslag.every((s) => s === "team-norway-demo"));
});

test("WANG-demokontoen når ikke Team Norway", async () => {
  const { hentTnOversiktForBruker, erSportssjef } = await import("./tn-tilgang");
  assert.equal(await hentTnOversiktForBruker({ id: "demo-wang", role: "COACH" }), null);
  assert.equal(await erSportssjef({ id: "demo-wang", role: "COACH" }), false);
  assert.equal(slugOppslag.length, 0);
});

test("vanlig trener får den ekte gruppa", async () => {
  const { hentTnGruppeForBruker } = await import("./tn-tilgang");
  assert.equal((await hentTnGruppeForBruker("trener"))?.slug, "team-norway");
});

test("demokontoen kan ikke legge til, endre eller avslutte trenere", async () => {
  const { leggTilTrener, settTilgang, avsluttTilgang } = await import("./tn-tilgang");
  const caller = { id: "demo-tn", role: "COACH" as const };
  await assert.rejects(leggTilTrener({ caller, epost: "noen@golfforbundet.no", rolle: "COACH" }), /Demokontoen/);
  await assert.rejects(settTilgang({ caller, groupId: "team-norway-demo-id", targetUserId: "x", rolle: "COACH", fraIso: "2026-10-01", tilIso: null }), /Demokontoen/);
  await assert.rejects(avsluttTilgang({ caller, groupId: "team-norway-demo-id", targetUserId: "x" }), /Demokontoen/);
});
