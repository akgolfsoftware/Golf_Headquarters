import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEG_ALL_TOOLS, MEG_EXEC_BY_NAME } from "@/lib/meg/tools";

describe("Fase 4+5 — Gmail- og Disk-verktøy", () => {
  it("registrerer alle Gmail- og Disk-verktøy", () => {
    const names = MEG_ALL_TOOLS.map((t) => t.name);
    for (const n of ["gmail_sok", "gmail_les_traad", "gmail_lag_utkast", "disk_sok", "disk_les_fil", "disk_opprett"]) {
      assert.ok(names.includes(n), `mangler verktøy: ${n}`);
      assert.equal(typeof MEG_EXEC_BY_NAME[n], "function", `mangler executor: ${n}`);
    }
  });

  it("gmail_lag_utkast krever til/emne/tekst", () => {
    const t = MEG_ALL_TOOLS.find((x) => x.name === "gmail_lag_utkast");
    assert.deepEqual(t?.input_schema.required, ["til", "emne", "tekst"]);
  });

  it("disk_opprett krever navn/innhold", () => {
    const t = MEG_ALL_TOOLS.find((x) => x.name === "disk_opprett");
    assert.deepEqual(t?.input_schema.required, ["navn", "innhold"]);
  });
});

describe("buildRawMessage", () => {
  it("base64url-koder en RFC822-melding med ikke-ASCII-emne", async () => {
    const { buildRawMessage } = await import("@/lib/google-gmail");
    const raw = buildRawMessage({ til: "a@b.no", emne: "Møte i går", tekst: "Hei på deg" });
    assert.match(raw, /^[A-Za-z0-9_-]+$/);
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    assert.match(decoded, /To: a@b\.no/);
    assert.match(decoded, /Subject: =\?UTF-8\?B\?/);
    assert.match(decoded, /Hei på deg/);
  });
});
