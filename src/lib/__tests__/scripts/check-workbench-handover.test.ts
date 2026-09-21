import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { kontrollerHandover } from "../../../../scripts/check-workbench-handover.mjs";

type Importkontroll = { filer: { fil: string; sha256: string; bytes: number }[] };
const KILDE = path.join(process.cwd(), "docs/design/workbench-handover");

test("valgt Workbench-kildepakke beholder fullstendighet, kontrollsummer og bildemål", async (t) => {
  const rot = mkdtempSync(path.join(tmpdir(), "workbench-kilde-test-"));
  t.after(() => rmSync(rot, { recursive: true, force: true }));
  const png = "WB-uke-coach-normal-390.png";
  const tilfeller: { navn: string; endre?: (mappe: string, kontroll: Importkontroll) => void; feil?: RegExp }[] = [
    { navn: "uendret valgt eksport består" },
    { navn: "manglende mobilreferanse avvises", endre: (_mappe, kontroll) => {
      kontroll.filer = kontroll.filer.filter((rad) => rad.fil !== png);
    }, feil: /Mangler i importkontrollen/ },
    { navn: "endret kildefil avvises", endre: (mappe) => {
      writeFileSync(path.join(mappe, "manifest.md"), "endret eksport");
    }, feil: /Endret kontrollsum/ },
    { navn: "feil bildemål avvises selv med oppdatert hash", endre: (mappe, kontroll) => {
      const data = readFileSync(path.join(mappe, png));
      data.writeUInt32BE(390, 16);
      writeFileSync(path.join(mappe, png), data);
      kontroll.filer.find((rad) => rad.fil === png)!.sha256 = createHash("sha256").update(data).digest("hex");
    }, feil: /Feil 2×-mål/ },
    { navn: "duplikater avvises", endre: (_mappe, kontroll) => {
      kontroll.filer.push(kontroll.filer[0]);
    }, feil: /Duplisert fil/ },
    { navn: "ukjente stier avvises", endre: (_mappe, kontroll) => {
      kontroll.filer[0].fil = "../utenfor.txt";
    }, feil: /ukjent fil eller ugyldig sti/ },
    { navn: "symlenke ut av kildepakken avvises", endre: (mappe) => {
      const logo = path.join(mappe, "assets/logo-ak-golf-hq.svg");
      const utenfor = path.join(rot, "utenfor.svg");
      writeFileSync(utenfor, readFileSync(logo));
      rmSync(logo);
      symlinkSync(utenfor, logo);
    }, feil: /utenfor kildepakken/ },
  ];
  for (const [i, tilfelle] of tilfeller.entries()) {
    await t.test(tilfelle.navn, () => {
      const mappe = path.join(rot, String(i));
      cpSync(KILDE, mappe, { recursive: true });
      const importsti = path.join(mappe, "import-kontroll.json");
      const kontroll: Importkontroll = JSON.parse(readFileSync(importsti, "utf8"));
      tilfelle.endre?.(mappe, kontroll);
      writeFileSync(importsti, JSON.stringify(kontroll));
      const resultat = kontrollerHandover(mappe);
      assert.equal(resultat.ok, !tilfelle.feil);
      if (tilfelle.feil) assert.match(resultat.feil.join("\n"), tilfelle.feil);
      else assert.deepEqual({ filer: resultat.filer, png: resultat.png }, { filer: 24, png: 16 });
    });
  }
});
