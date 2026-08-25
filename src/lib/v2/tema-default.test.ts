/**
 * Tema-standarden per rute — regelen to halvdeler leser.
 *
 * Bakgrunn (25.08.2026): rot-layout stempler `data-v2-tema` på `<html>` ved
 * SSR, og `V2Shell` synker attributtet ved client-side rutebytte. Da mørk
 * default ble innført for PlayerHQ og AgencyOS, var det shell-halvdelen som
 * var lett å glemme — den sa «alltid lys uten dark-cookie», og ville snudd
 * flaten tilbake til lys ved første navigering uansett hva serveren stemplet.
 * Begge leser nå `standardTema`. Disse testene låser den regelen.
 *
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { erTrainLockFlate, standardTema } from "./tema-default";

describe("standardTema", () => {
  it("gir mørk på PlayerHQ og AgencyOS (Train-lock)", () => {
    for (const path of ["/portal", "/portal/", "/admin", "/admin/agencyos", "/portal/analysere/datagolf"]) {
      assert.equal(standardTema(path), "dark", path);
      assert.equal(erTrainLockFlate(path), true, path);
    }
  });

  it("holder auth og forelder lyse", () => {
    // /auth: beslutning 13.08 + PP-A A4. /forelder: omfang uavklart.
    for (const path of ["/auth", "/auth/login", "/forelder", "/forelder/bookinger"]) {
      assert.equal(standardTema(path), "light", path);
      assert.equal(erTrainLockFlate(path), false, path);
    }
  });

  it("treffer ikke ruter som bare deler prefiks-tekst", () => {
    // «/portalen» og «/administrasjon» er ikke PlayerHQ/AgencyOS.
    for (const path of ["/portalen", "/administrasjon", "/portal-noe"]) {
      assert.equal(erTrainLockFlate(path), false, path);
      assert.equal(standardTema(path), "light", path);
    }
  });

  it("gir lys for tom sti og rot", () => {
    assert.equal(standardTema(""), "light");
    assert.equal(standardTema("/"), "light");
  });
});
