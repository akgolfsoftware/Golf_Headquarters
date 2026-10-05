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
  "precision-komponenter.css",
  "precision-athletics.css",
]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

mock.module("next/navigation", {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {}, refresh() {} }),
  },
});
mock.module("next/link", { defaultExport: "a" });

// Server actions mockes: komponenttesten skal aldri nå Prisma.
const kall: { navn: string; args: unknown[] }[] = [];
const spion = (navn: string, svar: unknown = undefined) => async (...args: unknown[]) => {
  kall.push({ navn, args });
  return svar;
};
mock.module("@/lib/agents/actions", {
  namedExports: { acceptPlanAction: spion("acceptPlanAction"), rejectPlanAction: spion("rejectPlanAction") },
});
mock.module("@/app/admin/agencyos/caddie/dashbord/actions", {
  namedExports: {
    godkjennCaddieDraft: spion("godkjennCaddieDraft", { ok: true, status: "ok", summary: "" }),
    avvisProaktivtForslag: spion("avvisProaktivtForslag", { ok: true }),
  },
});
mock.module("@/app/admin/(legacy)/foresporsler/actions", {
  namedExports: { markerSomPlanlagt: spion("markerSomPlanlagt"), avslaaForespørsel: spion("avslaaForespørsel") },
});
mock.module("@/app/admin/tester/foreslatte/actions", {
  namedExports: { godkjennForslag: spion("godkjennForslag", { ok: true }), avvisForslag: spion("avvisForslag", { ok: true }) },
});
mock.module("@/app/admin/tournaments/actions", {
  namedExports: {
    mergeTurneringer: async (input: { sourceId: string; targetId: string }) => {
      kall.push({ navn: "mergeTurneringer", args: [input] });
      if (input.targetId === "feiler") return { ok: false, feil: "Mål er en dublett" };
      return { ok: true, flyttet: { entries: 3, results: 2, participants: 1 } };
    },
  },
});
mock.module("@/app/admin/(legacy)/stats/moderering/actions", {
  namedExports: {
    godkjennSak: spion("godkjennSak", { ok: true }),
    avvisSak: spion("avvisSak", { ok: true }),
    utforGdprSletting: async (id: string) => {
      kall.push({ navn: "utforGdprSletting", args: [id] });
      throw new Error("Saken er ikke godkjent");
    },
  },
});

const DEMOSPILLERE = ["Magnus Aasheim", "Emil Solberg", "Thea Nilsen", "Ingrid Berg", "Sara Holm", "Eira Solvang", "Kasper Moen", "Mathias Tveit", "Mari Solvang"];

describe("AG02Ko (Kø)", async () => {
  const { AG02Ko } = await import("@/components/admin/precision/AG02Ko");
  const { utforKoHandling } = await import("@/components/admin/precision/ag02-handlinger");

  test("tom kø uten data viser ekte tom tilstand, aldri demospillere", () => {
    for (const fane of ["godkjenninger", "agent", "test", "dublett", "moderering", "epost"]) {
      const html = renderToStaticMarkup(React.createElement(AG02Ko, { tilstand: "data", startFane: fane }));
      assert.match(html, /Ingen saker venter/, `fane ${fane}`);
      for (const navn of DEMOSPILLERE) assert.doesNotMatch(html, new RegExp(navn), `${navn} i fane ${fane}`);
    }
  });

  test("bare fanene brukeren har tilgang til vises", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, { tilstand: "data", faner: ["godkjenninger", "dubletter", "moderering"] }),
    );
    assert.match(html, /Godkjenninger/);
    assert.doesNotMatch(html, /Agentforslag/);
    assert.doesNotMatch(html, /E-postutkast/);
  });

  test("knapper uten ekte action finnes ikke", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "data",
        startFane: "epost",
        data: {
          godkjenninger: [], agentko: [], tester: [], dubletter: [], moderering: [],
          epost: [{ id: "e1", to: "X", email: "x@example.com", tpl: "EP-05", by: "Caddie", at: "I dag", svc: "Time", ready: "Klar", note: "Hei" }],
        },
      }),
    );
    assert.doesNotMatch(html, /Send e-post/);
    assert.doesNotMatch(html, /Sorter prioritet/);

    const tom = { godkjenninger: [], agentko: [], tester: [], dubletter: [], moderering: [], epost: [] };
    const dub = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "data",
        startFane: "dubletter",
        data: { ...tom, dubletter: [{ id: "d1", match: "M", kildeId: "d1", malId: "k1", a: { name: "A" }, b: { name: "B" } }] },
      }),
    );
    assert.match(dub, /Slå sammen/);
    assert.doesNotMatch(dub, /Ikke dublett/);

    const agent = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "data",
        startFane: "agentko",
        data: { ...tom, agentko: [{ id: "a1", who: "AgenticOS", title: "T", agent: "A", t: "I dag", body: "B", facts: [], out: "O" }] },
      }),
    );
    assert.match(agent, /Godkjenn/);
    assert.doesNotMatch(agent, /Rediger utkast/);
  });

  test("Godkjenn kaller acceptPlanAction og svarer ok først etter serveren", async () => {
    kall.length = 0;
    const res = await utforKoHandling({ type: "plan-godkjenn", id: "pa-1" });
    assert.deepEqual(res, { ok: true });
    assert.deepEqual(kall, [{ navn: "acceptPlanAction", args: ["pa-1"] }]);
  });

  test("Slå sammen kaller mergeTurneringer med manuell som kilde og kanonisk som mål", async () => {
    kall.length = 0;
    const res = await utforKoHandling({ type: "dublett-slaa-sammen", kildeId: "manuell-1", malId: "ngf-1" });
    assert.equal(res.ok, true);
    assert.deepEqual(kall, [{ navn: "mergeTurneringer", args: [{ sourceId: "manuell-1", targetId: "ngf-1" }] }]);
  });

  test("feil fra serveren gir feil, ikke suksess", async () => {
    const merge = await utforKoHandling({ type: "dublett-slaa-sammen", kildeId: "a", malId: "feiler" });
    assert.deepEqual(merge, { ok: false, feil: "Mål er en dublett" });
    const gdpr = await utforKoHandling({ type: "moderering-gdpr-utfor", id: "m1" });
    assert.deepEqual(gdpr, { ok: false, feil: "Saken er ikke godkjent" });
  });

  test("hver kilde i godkjenninger og de andre fanene treffer sin action", async () => {
    kall.length = 0;
    await utforKoHandling({ type: "caddie-send", id: "c1" });
    await utforKoHandling({ type: "foresporsel-planlagt", id: "f1" });
    await utforKoHandling({ type: "test-godkjenn", id: "t1" });
    await utforKoHandling({ type: "test-avvis", id: "t2" });
    await utforKoHandling({ type: "moderering-godkjenn", id: "m1" });
    await utforKoHandling({ type: "moderering-avvis", id: "m2" });
    await utforKoHandling({ type: "plan-avvis", id: "p2" });
    assert.deepEqual(
      kall.map((k) => k.navn),
      ["godkjennCaddieDraft", "markerSomPlanlagt", "godkjennForslag", "avvisForslag", "godkjennSak", "avvisSak", "rejectPlanAction"],
    );
  });

  test("rendrer alle faner når alle er tilgjengelige", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "data",
        startFane: "godkjenninger",
      })
    );

    assert.ok(html.length > 0, "HTML skal genereres");
    assert.match(html, /Kø/);
    assert.match(html, /Godkjenninger/);
    assert.match(html, /Agentforslag/);
    assert.match(html, /Tester/);
    assert.match(html, /Dubletter/);
    assert.match(html, /Moderering/);
    assert.match(html, /E-postutkast/);
  });

  test("rendrer tom tilstand med lenke til Cockpit", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "tom",
        startFane: "godkjenninger",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Ingen saker venter/);
    assert.match(html, /Til Cockpit/);
  });

  test("rendrer laster-tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "laster",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Henter køen …/);
  });

  test("rendrer feil-tilstand", () => {
    const html = renderToStaticMarkup(
      React.createElement(AG02Ko, {
        tilstand: "feil",
      })
    );

    assert.ok(html.length > 0);
    assert.match(html, /Køen kunne ikke hentes/);
    assert.match(html, /FEIL 502/);
  });
});
