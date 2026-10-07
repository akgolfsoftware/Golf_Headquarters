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
  "precision-a21.css",
  "precision-a22.css",
  "precision-a23.css",
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

describe("AG23Oppsett (Innstillinger og oppsett)", async () => {
  const { AG23Oppsett } = await import("@/components/admin/precision/AG23Oppsett");
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG23Oppsett, props as never));

  const data = {
    team: [
      { id: "a", name: "Testadmin", role: "Admin", access: "Admin" as const, email: "admin@test.no" },
      { id: "b", name: "Testcoach", role: "Coach", access: "Coach" as const, email: null },
    ],
    profil: { navn: "Testadmin", epost: "admin@test.no", rolle: "Admin" },
  };

  test("team viser ekte medlemmer, og — der e-post ikke kan vises", () => {
    const html = vis({ tilstand: "data", startFane: "team", data });
    assert.match(html, /Testadmin/);
    assert.match(html, /Testcoach/);
    assert.doesNotMatch(html, /demo\.no|Kari Demo|Line Demo/);
  });

  test("profil er bare visning", () => {
    const html = vis({ tilstand: "data", startFane: "profil", data });
    assert.match(html, /admin@test\.no/);
    assert.match(html, /IKKE KOBLET ENNÅ/);
    assert.doesNotMatch(html, /Lagre/);
  });

  test("ukoblede faner gir ingen falske innstillinger eller integrasjonsstatus", () => {
    for (const fane of ["varsler", "integr", "mark"]) {
      const html = vis({ tilstand: "data", startFane: fane, data });
      assert.doesNotMatch(html, /Koblet ·|SIST HENTET|Book time hos|ACWR over 1,5/);
    }
    const virks = vis({ tilstand: "data", startFane: "virks", data });
    assert.doesNotMatch(virks, /000 000 000|DEMODATA/);
  });

  test("invitasjon lenker til egne sider i stedet for å lage lokale medlemmer", () => {
    assert.match(vis({ tilstand: "data", startFane: "inviter", data }), /\/admin\/team\/inviter/);
    assert.match(vis({ tilstand: "data", startFane: "ekstern", data }), /\/admin\/team\/ekstern/);
  });

  test("uten data vises ingen demoteam", () => {
    const html = vis({ startFane: "team" });
    assert.match(html, /Ingen teammedlemmer å vise/);
    assert.doesNotMatch(html, /Anders Kristiansen|demo\.no/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter oppsett/);
    assert.match(vis({ tilstand: "feil" }), /Oppsettet kunne ikke hentes/);
  });
});
