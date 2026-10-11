import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("server-only", { defaultExport: {} });

for (const css of [
  "precision-a2.css",
  "precision-a4.css",
  "precision-a5.css",
  "precision-a7.css",
  "precision-a17.css",
  "precision-a18.css",
  "precision-a19.css",
  "precision-komponenter.css",
  "precision-athletics.css",
]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

mock.module("next/navigation", {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {} }),
  },
});
mock.module("next/link", { defaultExport: "a" });

describe("AG19CaddieHub (Caddie og Jarvis AI-hub)", async () => {
  const { AG19CaddieHub } = await import("@/components/admin/precision/AG19CaddieHub");

  const data = {
    runs: [
      { id: "r1", agent: "Testagent", st: "Kjørt" as const, t: "05.10 06:00", dur: "4 s", err: null },
      { id: "r2", agent: "Feilagent", st: "Feilet" as const, t: "05.10 07:00", dur: "—", err: "Kjøringen feilet." },
    ],
    projects: [],
    skills: [["lese-trackman", "Lese TrackMan-data", "Kun lesing", true]] as [string, string, string, boolean][],
  };
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG19CaddieHub, props as never));

  test("viser ekte kjøringer uten falske godkjenninger", () => {
    const html = vis({ tilstand: "data", startFane: "ko", data });
    assert.match(html, /Testagent/);
    assert.match(html, /Feilagent/);
    assert.doesNotMatch(html, /Godkjenn og send|Forkast|Tobias|Lindvik|Oskar Vik/);
  });

  test("prosjekter ligger i Notion, skills er bare visning", () => {
    assert.match(vis({ tilstand: "data", startFane: "prosj", data }), /Prosjekter ligger i Notion/);
    const skills = vis({ tilstand: "data", startFane: "skills", data });
    assert.match(skills, /Lese TrackMan-data/);
    assert.match(skills, /IKKE KOBLET ENNÅ/);
  });

  test("samtalen er ikke koblet og gir ingen oppdiktede svar", () => {
    const html = vis({ tilstand: "data", startFane: "chat", data });
    assert.match(html, /Samtalen er ikke koblet ennå/);
    assert.match(html, /disabled/);
    assert.doesNotMatch(html, /ACWR|Magnus Aasheim/);
  });

  test("uten data vises tom tilstand, ikke demo", () => {
    const html = vis({ tilstand: "tom", startFane: "ko" });
    assert.match(html, /Ingen agentkjøringer/);
    assert.doesNotMatch(html, /Belastningsagent|Tobias/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter agentkjøringer/);
    assert.match(vis({ tilstand: "feil" }), /kunne ikke hentes/);
  });
});
