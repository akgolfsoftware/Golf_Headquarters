import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildMonthViewModel, buildPeriodViewModel, buildYearViewModel } from "@/lib/domain/workbench/operations";
import { parsePlanKontekst } from "@/lib/workbench/plan-kontekst";

mock.module("next/navigation", { namedExports: { useRouter: () => ({ push() {}, refresh() {} }) } });
mock.module("next/link", { defaultExport: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) });
mock.module("@/lib/workbench/wb-actions", { namedExports: {
  createSeasonPlan() {}, deleteSeasonPeriod() {}, loadPeriod() {}, publishSessions() {}, saveSeasonPeriod() {},
} });
mock.module("@/components/workbench/SourcesPanel", { namedExports: { SourcesPanel: () => null } });
mock.module("@/components/workbench/PublishConfirmDialog", { namedExports: { PublishConfirmDialog: () => null } });
mock.module("@/components/precision/pa", { namedExports: { Knapp: () => null } });
mock.module("@/components/precision/pa-a4", { namedExports: { Ark: () => null } });
mock.module("@/components/precision/pa-a5", { namedExports: { InlineVarsel: () => null } });
mock.module("@/components/precision/pa-workbench", { namedExports: { Valgpille: () => null } });
mock.module("@/components/workbench/WeekGrid", { namedExports: { osloIdag: () => "2026-10-02" } });


const mode = { kind: "PLAYER" as const, subjectId: "p1", sources: [] };
const referanse = parsePlanKontekst({ uke: "2026-10-05", aar: "2026", maned: "2026-10", periode: "p1-periode", okt: "o1" }).referanse;
const year = buildYearViewModel(2026, [], mode, 0, [{ id: "p1-periode", type: "GRUNN", startDate: "2026-09-28", endDate: "2026-10-25", focus: null }], [], [], "2026-10-02");
const period = buildPeriodViewModel(2026, year.periods, "p1-periode", [], mode, "2026-10-02");
const month = buildMonthViewModel("2026-10-01", [], mode, 0, "Oktober 2026", "2026-10-02");

function hrefs(html: string): URL[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => new URL(m[1].replaceAll("&amp;", "&"), "https://test.invalid"));
}

describe("Workbench-komponentenes kontekstlenker", async () => {
  const { WorkbenchAar } = await import("@/components/workbench/WorkbenchAar");
  const { WorkbenchManed } = await import("@/components/workbench/WorkbenchManed");
  const { WorkbenchPeriode } = await import("@/components/workbench/WorkbenchPeriode");

  it("År åpner valgt periode med uke, måned og økt på begge flater", () => {
    for (const routeSurface of ["player", "agency"] as const) {
      const html = renderToStaticMarkup(createElement(WorkbenchAar, { playerId: "p1", spillerNavn: "Syntetisk spiller", aar: year, kilder: [], planKontekst: referanse, routeSurface }));
      const links = hrefs(html).filter((url) => url.searchParams.get("periode") === "p1-periode");
      assert.ok(links.length >= 2, "desktop og mobil åpner samme periode");
      for (const url of links) {
        assert.equal(url.searchParams.get("uke"), "2026-10-05");
        assert.equal(url.searchParams.get("okt"), "o1");
        assert.equal(url.searchParams.get("maned"), "2026-10");
        assert.equal(url.pathname, routeSurface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/p1");
      }
    }
  });

  it("Periode og tom Måned åpner valgt uke 41 fremfor første uke 40", () => {
    const common = { playerId: "p1", spillerNavn: "Syntetisk spiller", kilder: [], planKontekst: referanse, routeSurface: "player" as const };
    for (const element of [createElement(WorkbenchPeriode, { ...common, periode: period }), createElement(WorkbenchManed, { ...common, maned: month })]) {
      const html = renderToStaticMarkup(element);
      const mobile = html.split('class="wb-mobile-summary"')[1];
      assert.ok(mobile, "mobil oppsummering finnes");
      const links = hrefs(mobile).filter((url) => url.searchParams.get("niva") === "uke");
      assert.ok(links.length > 0);
      for (const url of links) {
        assert.equal(url.searchParams.get("uke"), "2026-10-05");
        assert.equal(url.searchParams.get("periode"), "p1-periode");
        assert.equal(url.searchParams.get("okt"), "o1");
      }
    }
  });

  it("valgt uke bevares i alle sju nivålenker fra År/Periode/Måned", () => {
    const common = { playerId: "p1", spillerNavn: "Syntetisk spiller", kilder: [], planKontekst: referanse, routeSurface: "player" as const };
    for (const element of [createElement(WorkbenchAar, { ...common, aar: year }), createElement(WorkbenchPeriode, { ...common, periode: period }), createElement(WorkbenchManed, { ...common, maned: month })]) {
      const html = renderToStaticMarkup(element);
      const pills = html.split('role="tablist"')[1].split("</div>")[0];
      const links = hrefs(pills);
      assert.equal(links.length, 7);
      for (const url of links) {
        assert.equal(url.searchParams.get("uke"), "2026-10-05");
        assert.equal(url.searchParams.get("aar"), "2026");
        assert.equal(url.searchParams.get("maned"), "2026-10");
        assert.equal(url.searchParams.get("okt"), "o1");
      }
    }
  });
});
