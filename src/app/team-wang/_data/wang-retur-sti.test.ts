import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { wangReturSti } from "./wang-retur-sti";

describe("wangReturSti", () => {
  it("beholder WANG-stier, inkludert coach og IUP", () => {
    assert.equal(wangReturSti("/team-wang"), "/team-wang");
    assert.equal(wangReturSti("/team-wang/coach"), "/team-wang/coach");
    assert.equal(
      wangReturSti("/team-wang/coach/iup/elev-1"),
      "/team-wang/coach/iup/elev-1",
    );
  });

  it("avviser open redirect, portal og login-sløyfe", () => {
    assert.equal(wangReturSti("https://evil.example"), "/team-wang");
    assert.equal(wangReturSti("//evil.example"), "/team-wang");
    assert.equal(wangReturSti("/portal"), "/team-wang");
    assert.equal(wangReturSti("/team-wang/logg-inn"), "/team-wang");
    assert.equal(wangReturSti("/team-wang/coach/../logg-inn"), "/team-wang");
    assert.equal(wangReturSti(null), "/team-wang");
  });
});
