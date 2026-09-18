import assert from "node:assert/strict";
import { test } from "node:test";
import { TN_SCREEN_ROLES, canAccessScreen, type TnScreen } from "./access.ts";
import {
  MOBILE_TABS,
  NAV_GROUPS,
  PLAYER_MOBILE_TABS,
  PLAYER_NAV_GROUPS,
  SCREEN_TITLES,
} from "./nav.ts";

function navIds(groups: typeof NAV_GROUPS): TnScreen[] {
  return groups.flatMap((g) => g.items.map((i) => i.id));
}

test("SCREEN_TITLES dekker alle TnScreen", () => {
  const roles = Object.keys(TN_SCREEN_ROLES).sort();
  const titles = Object.keys(SCREEN_TITLES).sort();
  assert.deepEqual(titles, roles);
});

test("trener-meny peker bare på kjente skjermer", () => {
  for (const id of navIds(NAV_GROUPS)) {
    assert.ok(id in TN_SCREEN_ROLES, id);
    assert.ok(SCREEN_TITLES[id]);
  }
});

test("spiller-meny er IUP-hjem, uten tilgang og uttak", () => {
  const ids = navIds(PLAYER_NAV_GROUPS);
  assert.equal(ids[0], "iup");
  assert.ok(ids.includes("live"));
  assert.ok(ids.includes("samtykke"));
  assert.equal(ids.includes("tilgang"), false);
  assert.equal(ids.includes("inviter"), false);
  assert.equal(ids.includes("uttak"), false);
  assert.equal(ids.includes("oversikt"), false);
  for (const id of ids) assert.ok(id in TN_SCREEN_ROLES, id);
});

test("FO-filter fjerner Live fra spiller-meny", () => {
  const visible = PLAYER_NAV_GROUPS.flatMap((g) =>
    g.items.filter((i) => canAccessScreen("FO", i.id)).map((i) => i.id),
  );
  assert.equal(visible.includes("live"), false);
  assert.ok(visible.includes("iup"));
  assert.ok(visible.includes("samtykke"));
});

test("mobilfaner: fem spor, spiller starter på IUP", () => {
  assert.equal(MOBILE_TABS.length, 5);
  assert.equal(PLAYER_MOBILE_TABS.length, 5);
  assert.equal(MOBILE_TABS[0]?.id, "oversikt");
  assert.equal(PLAYER_MOBILE_TABS[0]?.id, "iup");
  assert.equal(MOBILE_TABS.at(-1)?.id, "mer");
  assert.equal(PLAYER_MOBILE_TABS.at(-1)?.id, "mer");
});
