/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/meg/connectors/notion.test.ts
 *
 * Tester kun byggOppgaveFilter — den rene filter-byggeren bak
 * notionOppgaver()'s valgfrie virksomhet-filter. notionOppgaver() selv
 * krever en aktiv Notion-tilkobling + nettverk og testes derfor ikke her.
 *
 * TODO(verifiser-mot-notion-schema): disse testene antar at "Virksomhet"
 * finnes som select ELLER multi_select i Tasks-databasen — se merknad ved
 * byggOppgaveFilter i notion.ts.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { byggOppgaveFilter } from "./notion";

test("byggOppgaveFilter uten virksomhet returnerer kun status-filteret (bakoverkompatibelt)", () => {
  const filter = byggOppgaveFilter();
  assert.deepEqual(filter, { property: "Status", status: { does_not_equal: "Completed" } });
});

test("byggOppgaveFilter med virksomhet kombinerer status og select/multi_select-OR", () => {
  const filter = byggOppgaveFilter("WANG Toppidrett Fredrikstad") as {
    and: unknown[];
  };
  assert.ok("and" in filter);
  assert.equal(filter.and.length, 2);
  assert.deepEqual(filter.and[0], { property: "Status", status: { does_not_equal: "Completed" } });
  assert.deepEqual(filter.and[1], {
    or: [
      { property: "Virksomhet", select: { equals: "WANG Toppidrett Fredrikstad" } },
      { property: "Virksomhet", multi_select: { contains: "WANG Toppidrett Fredrikstad" } },
    ],
  });
});
