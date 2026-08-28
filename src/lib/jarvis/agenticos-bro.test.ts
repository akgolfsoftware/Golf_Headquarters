/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/agenticos-bro.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggAgenticosInnsamlere } from "./agenticos-visning";
import type { AgenticosBroStatus } from "@/lib/jarvis/types";

const tom: AgenticosBroStatus = {
  ulosteGodkjenninger: 0,
  planActions: 0,
  caddieDrafts: 0,
  sessionRequests: 0,
  sisteAgentKjoring: null,
  feiledeSisteDognet: 0,
};

describe("byggAgenticosInnsamlere", () => {
  it("viser uløste i kø-raden uten å merke den som FEILET", () => {
    const rader = byggAgenticosInnsamlere({ ...tom, ulosteGodkjenninger: 3 });
    const ko = rader.find((r) => r.id === "agenticos-ko");
    assert.ok(ko);
    assert.equal(ko.helse, "OK");
    assert.equal(ko.feilmelding, "3 uløste i /admin/godkjenninger");
  });

  it("siste agent ERROR → FEILET på agent-raden", () => {
    const rader = byggAgenticosInnsamlere({
      ...tom,
      sisteAgentKjoring: {
        agentName: "plan-watcher",
        status: "ERROR",
        createdAt: "2026-08-16T10:00:00.000Z",
        error: "timeout",
      },
    });
    const ag = rader.find((r) => r.id === "agenticos-agenter");
    assert.ok(ag);
    assert.equal(ag.helse, "FEILET");
    assert.equal(ag.feilmelding, "plan-watcher: timeout");
  });

  it("ingen kjøring → UKJENT", () => {
    const rader = byggAgenticosInnsamlere(tom);
    const ag = rader.find((r) => r.id === "agenticos-agenter");
    assert.equal(ag?.helse, "UKJENT");
  });
});
