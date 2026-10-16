import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { erBeskyttetWangAppSti, tryggWangAppRetursti } from "./routes";

describe("WANG app-ruter", () => {
  it("beskytter appen, men lar den separate innloggingen være åpen", () => {
    assert.equal(erBeskyttetWangAppSti("/team-wang/app"), true);
    assert.equal(erBeskyttetWangAppSti("/team-wang/app/utovere"), true);
    assert.equal(erBeskyttetWangAppSti("/team-wang/app/meldinger"), true);
    assert.equal(
      erBeskyttetWangAppSti("/team-wang/app/meldinger/00000000-0000-4000-8000-000000000001"),
      true,
    );
    assert.equal(erBeskyttetWangAppSti("/team-wang/app/logg-inn"), false);
    assert.equal(erBeskyttetWangAppSti("/team-wang/app/logg-inn/hjelp"), false);
    assert.equal(erBeskyttetWangAppSti("/team-wang/app-ond"), false);
  });

  it("beholder bare interne returstier i den separate WANG-appen", () => {
    assert.equal(
      tryggWangAppRetursti("/team-wang/app?fane=oversikt#status"),
      "/team-wang/app?fane=oversikt#status",
    );
    for (const value of [
      "/team-wang",
      "/team-wang/coach",
      "/team-wang/app/logg-inn",
      "https://ond.example/team-wang/app",
      "//ond.example/team-wang/app",
      "/team-wang/app\\@ond.example",
      undefined,
    ]) {
      assert.equal(tryggWangAppRetursti(value), "/team-wang/app");
    }
  });
});
