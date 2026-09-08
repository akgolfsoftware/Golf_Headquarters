import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  liveHrefForStatus,
  liveRouteForResolved,
  type ResolvedLiveSession,
} from "./live-route";

function wb(overstyr: Partial<ResolvedLiveSession> = {}): ResolvedLiveSession {
  return {
    kind: "wb",
    id: "wb-1",
    status: "PUBLISHED",
    playerId: "spiller-1",
    coachId: "coach-1",
    hostId: null,
    isParticipant: false,
    ...overstyr,
  };
}

describe("live-route", () => {
  it("wb PUBLISHED eiet av spilleren → brief, ikke notFound", () => {
    const rute = liveRouteForResolved(wb({ status: "PUBLISHED" }), {
      userId: "spiller-1",
      isCoach: false,
    });
    assert.deepEqual(rute, {
      type: "redirect",
      href: "/portal/live/wb-1/brief",
    });
  });

  it("wb IN_PROGRESS → tapper", () => {
    assert.equal(
      liveHrefForStatus("wb", "IN_PROGRESS", "wb-1"),
      "/portal/live/wb-1/tapper",
    );
  });

  it("wb COMPLETED → summary", () => {
    assert.equal(
      liveHrefForStatus("wb", "COMPLETED", "wb-1"),
      "/portal/live/wb-1/summary",
    );
  });

  it("wb SCHEDULED → brief", () => {
    assert.equal(
      liveHrefForStatus("wb", "PUBLISHED", "wb-1"),
      "/portal/live/wb-1/brief",
    );
    assert.equal(
      liveHrefForStatus("wb", "SCHEDULED", "wb-1"),
      "/portal/live/wb-1/brief",
    );
  });

  it("wb annen spiller uten coach → forbidden, ikke notFound", () => {
    const rute = liveRouteForResolved(wb(), {
      userId: "annen",
      isCoach: false,
    });
    assert.equal(rute.type, "forbidden");
  });

  it("mangler økt → notFound", () => {
    assert.deepEqual(
      liveRouteForResolved(null, { userId: "spiller-1", isCoach: false }),
      { type: "notfound" },
    );
  });

  it("v2 IN_PROGRESS → active, plan ACTIVE → tapper", () => {
    assert.equal(
      liveHrefForStatus("v2", "IN_PROGRESS", "v2-1"),
      "/portal/live/v2-1/active",
    );
    assert.equal(
      liveHrefForStatus("plan", "ACTIVE", "p-1"),
      "/portal/live/p-1/tapper",
    );
  });
});
