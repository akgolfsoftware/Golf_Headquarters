import assert from "node:assert/strict";
import { test } from "node:test";
import { syncDatagolfTak } from "./tak-sync";

test("HQ DataGolf-proffsynk stopper før API- eller databaseskriving", async () => {
  await assert.rejects(
    () => syncDatagolfTak(),
    /DataGolf-synk blokkert i HQ/,
  );
});
