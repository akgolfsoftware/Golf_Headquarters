import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nesteBesteHandling, finnDagensAktiveOkt } from "./neste-beste-handling";

const TOM_DAG = { harPlanTilGodkjenning: false, dagensOkt: null, ukenHarOkter: false };

describe("nesteBesteHandling", () => {
  it("plan til godkjenning vinner over alt annet", () => {
    const r = nesteBesteHandling({
      harPlanTilGodkjenning: true,
      dagensOkt: { href: "/portal/gjennomfore/x", title: "Økt", status: "PLANNED" },
      ukenHarOkter: true,
    });
    assert.equal(r.regel, "plan-godkjenning");
    assert.equal(r.href, "/portal/planlegge/workbench");
  });

  it("dagens PLANNED-økt gir Start-CTA til øktens href", () => {
    const r = nesteBesteHandling({
      ...TOM_DAG,
      dagensOkt: { href: "/portal/gjennomfore/abc", title: "Nærspill", status: "PLANNED" },
      ukenHarOkter: true,
    });
    assert.equal(r.regel, "start-okt");
    assert.equal(r.href, "/portal/gjennomfore/abc");
  });

  it("dagens IN_PROGRESS-økt gir også Start-CTA (fortsett økten)", () => {
    const r = nesteBesteHandling({
      ...TOM_DAG,
      dagensOkt: { href: "/portal/gjennomfore/abc", title: "Nærspill", status: "IN_PROGRESS" },
      ukenHarOkter: true,
    });
    assert.equal(r.regel, "start-okt");
  });

  it("dagens COMPLETED-økt teller ikke som «kommende» — faller videre til neste regel", () => {
    const r = nesteBesteHandling({
      harPlanTilGodkjenning: false,
      dagensOkt: { href: "/portal/gjennomfore/abc", title: "Nærspill", status: "COMPLETED" },
      ukenHarOkter: false,
    });
    assert.equal(r.regel, "planlegg-uke");
  });

  it("dagens SKIPPED/CANCELLED-økt teller ikke som «kommende»", () => {
    for (const status of ["SKIPPED", "CANCELLED"] as const) {
      const r = nesteBesteHandling({
        harPlanTilGodkjenning: false,
        dagensOkt: { href: "/portal/gjennomfore/x", title: "Økt", status },
        ukenHarOkter: true,
      });
      // Status er «ferdig» i regelen (ikke start) — men dagensOkt er fortsatt satt,
      // så vi lander i fallback «Se uka» (ikke hviledag uten okt-objekt).
      assert.equal(r.regel, "fallback", `status=${status}`);
      assert.match(r.href, /workbench/);
    }
  });

  it("tom ukeplan uten dagens økt gir Planlegg uka", () => {
    const r = nesteBesteHandling(TOM_DAG);
    assert.equal(r.regel, "planlegg-uke");
    assert.match(r.href, /workbench/);
  });

  it("ingen dagens økt men uken har andre økter → hviledag (Workbench, ikke Start)", () => {
    const r = nesteBesteHandling({ harPlanTilGodkjenning: false, dagensOkt: null, ukenHarOkter: true });
    assert.equal(r.regel, "hviledag");
    assert.match(r.href, /workbench/);
    assert.match(r.tekst, /Workbench/i);
  });

  it("prioritet: plan-godkjenning > start-økt > planlegg-uke > hviledag", () => {
    // Alle fire betingelser samtidig sanne bortsett fra plan → sjekk nest-høyeste vinner
    const kunOktOgUke = nesteBesteHandling({
      harPlanTilGodkjenning: false,
      dagensOkt: { href: "/x", title: "y", status: "PLANNED" },
      ukenHarOkter: false,
    });
    assert.equal(kunOktOgUke.regel, "start-okt");
  });
});

describe("finnDagensAktiveOkt", () => {
  it("morgenøkt fullført, ettermiddagsøkt fortsatt planlagt → plukker ettermiddagsøkten", () => {
    const r = finnDagensAktiveOkt([
      { id: "morgen", status: "COMPLETED" },
      { id: "ettermiddag", status: "PLANNED" },
    ]);
    assert.equal(r?.id, "ettermiddag");
  });

  it("alle økter i dag ferdig/avlyst → null (ingen aktiv)", () => {
    const r = finnDagensAktiveOkt([
      { id: "a", status: "COMPLETED" },
      { id: "b", status: "CANCELLED" },
      { id: "c", status: "SKIPPED" },
    ]);
    assert.equal(r, null);
  });

  it("tom liste → null", () => {
    assert.equal(finnDagensAktiveOkt([]), null);
  });

  it("første økt allerede aktiv → plukkes uendret", () => {
    const r = finnDagensAktiveOkt([
      { id: "a", status: "IN_PROGRESS" },
      { id: "b", status: "PLANNED" },
    ]);
    assert.equal(r?.id, "a");
  });
});
