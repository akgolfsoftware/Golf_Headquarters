/**
 * Tilgangskontrakt for TN-02. Kjør med `npm test` eller målrettet via tsx.
 * Modulen importeres etter prisma-mocken, så ingen ekte database berøres.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

type Medlemskap = { role: string } | null;

test("TN-oversikt krever ADMIN eller aktivt medlemskap i den kanoniske gruppen", async (t) => {
  let gruppe: { id: string; name: string } | null = {
    id: "gruppe-team-norway",
    name: "Team Norway Golf",
  };
  let medlemskap: Medlemskap = { role: "PLAYER" };
  let gruppefeil: Error | null = null;
  let medlemskapsfeil: Error | null = null;
  let tellerKall = 0;
  let sisteMedlemskapWhere: Record<string, unknown> | undefined;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        group: {
          findUnique: async () => {
            if (gruppefeil) throw gruppefeil;
            return gruppe;
          },
        },
        groupMember: {
          findFirst: async (args: { where: Record<string, unknown> }) => {
            sisteMedlemskapWhere = args.where;
            if (medlemskapsfeil) throw medlemskapsfeil;
            return medlemskap;
          },
          count: async () => {
            tellerKall += 1;
            return tellerKall % 2 === 1 ? 7 : 3;
          },
        },
      },
    },
  });

  const { hentTnOversiktForBruker } = await import("./tn-tilgang");

  const medlem = await hentTnOversiktForBruker({ id: "spiller-1", role: "PLAYER" });
  assert.ok(medlem);
  assert.equal(medlem.rolle, "PLAYER");
  assert.equal(medlem.erAktivtMedlem, true);
  assert.equal(medlem.antallSpillere, 7);
  assert.equal(medlem.antallTrenere, 3);
  assert.deepEqual(sisteMedlemskapWhere, {
    groupId: "gruppe-team-norway",
    userId: "spiller-1",
    endedAt: null,
  });

  medlemskap = null;
  tellerKall = 0;
  const uvedkommende = await hentTnOversiktForBruker({ id: "annen-1", role: "PLAYER" });
  assert.equal(uvedkommende, null);
  assert.equal(tellerKall, 0, "uvedkommende skal ikke få lest aggregater");

  const avsluttet = await hentTnOversiktForBruker({ id: "tidligere-1", role: "COACH" });
  assert.equal(avsluttet, null);
  assert.equal(sisteMedlemskapWhere?.endedAt, null, "avsluttede medlemskap må filtreres bort i databasen");

  tellerKall = 0;
  const admin = await hentTnOversiktForBruker({ id: "admin-1", role: "ADMIN" });
  assert.ok(admin);
  assert.equal(admin.rolle, "ADMIN");
  assert.equal(admin.erAktivtMedlem, false);
  assert.equal(admin.antallSpillere, 7);
  assert.equal(admin.antallTrenere, 3);

  gruppe = null;
  tellerKall = 0;
  assert.equal(await hentTnOversiktForBruker({ id: "admin-1", role: "ADMIN" }), null);
  assert.equal(tellerKall, 0, "manglende gruppe skal ikke gi delvise tall");

  gruppe = { id: "gruppe-team-norway", name: "Team Norway Golf" };
  gruppefeil = new Error("database utilgjengelig");
  await assert.rejects(
    hentTnOversiktForBruker({ id: "admin-1", role: "ADMIN" }),
    /database utilgjengelig/,
  );

  gruppefeil = null;
  medlemskapsfeil = new Error("medlemskap kunne ikke leses");
  await assert.rejects(
    hentTnOversiktForBruker({ id: "spiller-1", role: "PLAYER" }),
    /medlemskap kunne ikke leses/,
  );
});
