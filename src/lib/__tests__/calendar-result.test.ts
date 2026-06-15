import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { kalenderBlokkererSlot } from "@/lib/booking/calendar-result";

const start = new Date("2026-07-01T10:00:00+02:00");
const end = new Date("2026-07-01T11:00:00+02:00");

describe("kalenderBlokkererSlot — fail-closed", () => {
  it("ok:false (kunne IKKE sjekke kalender) ⇒ slot blokkeres", () => {
    assert.equal(
      kalenderBlokkererSlot({ ok: false, reason: "invalid_grant", busy: [] }, start, end),
      true,
    );
  });

  it("ok:true uten opptatte tider ⇒ slot ledig", () => {
    assert.equal(kalenderBlokkererSlot({ ok: true, busy: [] }, start, end), false);
  });

  it("ok:true med overlappende opptatt tid ⇒ slot blokkeres", () => {
    const busy = [
      {
        start: new Date("2026-07-01T10:30:00+02:00"),
        end: new Date("2026-07-01T11:30:00+02:00"),
      },
    ];
    assert.equal(kalenderBlokkererSlot({ ok: true, busy }, start, end), true);
  });

  it("ok:true med ikke-overlappende opptatt tid ⇒ slot ledig", () => {
    const busy = [
      {
        start: new Date("2026-07-01T12:00:00+02:00"),
        end: new Date("2026-07-01T13:00:00+02:00"),
      },
    ];
    assert.equal(kalenderBlokkererSlot({ ok: true, busy }, start, end), false);
  });

  it("ok:false beholder busy vi rakk å hente, men blokkerer uansett", () => {
    const busy = [
      {
        start: new Date("2026-07-01T15:00:00+02:00"),
        end: new Date("2026-07-01T16:00:00+02:00"),
      },
    ];
    // Slot overlapper ikke den hentede busy-en, men ok:false ⇒ fortsatt blokkert.
    assert.equal(kalenderBlokkererSlot({ ok: false, reason: "api", busy }, start, end), true);
  });
});
