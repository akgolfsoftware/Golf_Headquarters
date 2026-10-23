/**
 * Kjernelogikken i scripts/check-fasit-sitering.mjs (fase 1 økt 5, 05.09.2026):
 * siteringsparser, utgått-liste fra SCREEN-INDEX, Rigg/Avvik-lesing og
 * vurderingen som avgjør feil vs. rapport. Git-regresjonen bruker et isolert,
 * midlertidig repo uten nettverk, hooks eller prosjektets spillerdata.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  finnTrainLockSiteringer,
  finnPaperSiteringer,
  finnRiggLabels,
  finnAvvik,
  lesUtgaatte,
  lesRiggLabels,
  vurderFil,
  FASIT_LINJE,
  endredeMotOriginMain,
} from "../../../scripts/check-fasit-sitering.mjs";

const FASIT = new Set([
  "PH-01 I dag.dc.html",
  "PH-12 Analyse én runde.dc.html",
  "AG-04 Stall.dc.html",
  "P-05 iPhone Agenda.dc.html",
]);
const UTGAATT = new Set(["P-05 iPhone Agenda.dc.html"]);
const RIGG = new Set(["PH-01 I dag"]);

test("før commit kontrolleres ustagede nye skjermer på samme måte som staged og endrede filer", (t) => {
  const rot = mkdtempSync(path.join(tmpdir(), "hq-fasit-git-"));
  t.after(() => rmSync(rot, { recursive: true, force: true }));
  const git = (...args: string[]) => execFileSync("git", [
    "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false",
    "-c", "user.name=Test", "-c", "user.email=test@example.invalid", ...args,
  ], { cwd: rot, stdio: "pipe" });
  git("init", "--quiet");
  mkdirSync(path.join(rot, "src"));
  const kilde = " * Fasit: docs/design-system/utkast-playerhq/meg.html\n * Avvik: ugyldig format";
  writeFileSync(path.join(rot, "src/gammel.tsx"), kilde);
  writeFileSync(path.join(rot, "src/endret.tsx"), kilde);
  writeFileSync(path.join(rot, ".gitignore"), "src/ignorert.tsx\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "test baseline");
  git("update-ref", "refs/remotes/origin/main", "HEAD");

  writeFileSync(path.join(rot, "src/endret.tsx"), `${kilde}\nendring`);
  writeFileSync(path.join(rot, "src/staged.tsx"), kilde);
  git("add", "src/staged.tsx");
  const nySti = "src/ny æøå\nmed mellomrom.tsx";
  writeFileSync(path.join(rot, nySti), kilde);
  writeFileSync(path.join(rot, "src/ignorert.tsx"), kilde);
  writeFileSync(path.join(rot, "utenfor.tsx"), kilde);

  const endrede = endredeMotOriginMain(rot);
  assert.deepEqual(endrede, new Set(["src/endret.tsx", "src/staged.tsx", nySti]));
  const v = vurderFil({ sti: nySti, kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: endrede!.has(nySti) });
  assert.equal(v.feil.length, 1, "nytt samtykkekort med feil Avvik-format skal stoppes før git add");
});

test("finner sitering med full sti og bare filnavn i backticks", () => {
  const kilde = [
    "/**",
    " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html (tilstandene)",
    " * Fasit: `AG-04 Stall.dc.html` (mobil), `AG-16 iPad Stall split.dc.html`",
    " */",
  ].join("\n");
  assert.deepEqual(finnTrainLockSiteringer(kilde).sort(), [
    "AG-04 Stall.dc.html",
    "AG-16 iPad Stall split.dc.html",
    "PH-01 I dag.dc.html",
  ]);
});

test("normaliserer æ/ø/å/é til NFC så filnavn matcher uansett tastatur/filsystem", () => {
  const nfd = "PH-12 Analyse én runde.dc.html";
  const kilde = ` * Fasit: designsystem/train-lock/${nfd}`;
  const [funn] = finnTrainLockSiteringer(kilde);
  assert.equal(funn, "PH-12 Analyse én runde.dc.html".normalize("NFC"));
  assert.ok(FASIT.has(funn));
});

test("(+ FO-01L lys)-notasjon uten .dc.html valideres ikke, feiler ikke", () => {
  const kilde = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html (+ PH-01L lys).";
  assert.deepEqual(finnTrainLockSiteringer(kilde), ["PH-01 I dag.dc.html"]);
});

test("bare filnavn i backticks krever Train-lock-kode — canvas-navn som `Analyse.dc.html` telles ikke", () => {
  const kilde = " * «Tester»-pillen i `Analyse.dc.html` er IKKE bygget. Fasit: `S3-03 Spiller profil bento.dc.html`";
  assert.deepEqual(finnTrainLockSiteringer(kilde), ["S3-03 Spiller profil bento.dc.html"]);
});

test("Fasit-linje gjenkjennes i blokk-, linje- og «Fasit (kanon …):»-form", () => {
  assert.ok(FASIT_LINJE.test(" * Fasit: x"));
  assert.ok(FASIT_LINJE.test("    // Fasit: x"));
  assert.ok(FASIT_LINJE.test(" * Fasit (kanon for struktur, D2):\n * x"));
  assert.ok(!FASIT_LINJE.test(" * Fasiten viser noe"));
});

test("Paper-siteringer telles, ikke som Train-lock", () => {
  const kilde = " * Fasit: designsystem/paper/fase2/playerhq/playerhq-drills.html.";
  assert.deepEqual(finnPaperSiteringer(kilde), ["designsystem/paper/fase2/playerhq/playerhq-drills.html"]);
  assert.deepEqual(finnTrainLockSiteringer(kilde), []);
});

test("lesUtgaatte tar bare navn som står FØR ordet «utgått» på kulepunktet", () => {
  const index = [
    "## PH · Player HQ",
    "| `PH-07 Plan.dc.html` | 1 | 390 | PH-07 Plan |",
    "## Kjente hull",
    "- `GAP-00 Kart.dc.html` mangler `data-screen-label` — referansebrett.",
    "- `P-05 iPhone Agenda.dc.html` er **utgått som fasit for `/portal/planlegge`** — Plan porter mot `PH-07 Plan.dc.html` + `PH-08 Plan tom uke.dc.html`.",
  ].join("\n");
  assert.deepEqual(lesUtgaatte(index), ["P-05 iPhone Agenda.dc.html"]);
});

test("lesRiggLabels leser label-feltene i skjerm-mapping", () => {
  const mapping =
    'export const X = [\n  {\n    label: "PH-01 I dag",\n    rute: "/portal",\n  },\n  {\n    label: "TE-01 Tester hub",\n  },\n];';
  assert.deepEqual(lesRiggLabels(mapping), ["PH-01 I dag", "TE-01 Tester hub"]);
});

test("Rigg og Avvik leses fra filhodet", () => {
  assert.deepEqual(finnRiggLabels(" * Rigg: PH-01 I dag\n * Rigg: PH-01 I dag Dynamic Type XL"), [
    "PH-01 I dag",
    "PH-01 I dag Dynamic Type XL",
  ]);
  assert.deepEqual(finnAvvik(" * Avvik:\n *   - Kilder-panelet grupperer annerledes"), {
    finnes: true,
    harPunkter: true,
  });
  assert.deepEqual(finnAvvik(" * Avvik:\n * Neste avsnitt uten punkt"), { finnes: true, harPunkter: false });
  assert.deepEqual(finnAvvik(" * Avviket er kjent"), { finnes: false, harPunkter: false });
});

test("vurderFil: ukjent fil, utgått fil og ukjent Rigg-label er feil", () => {
  const kilde = [
    " * Fasit: designsystem/train-lock/PH-99 Finnes ikke.dc.html",
    " * Fasit: designsystem/train-lock/P-05 iPhone Agenda.dc.html",
    " * Rigg: PH-99 Finnes ikke",
  ].join("\n");
  const v = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: false });
  assert.equal(v.feil.length, 3);
  assert.match(v.feil[0], /ikke finnes/);
  assert.match(v.feil[1], /utgått/);
  assert.match(v.feil[2], /Rigg: «PH-99 Finnes ikke» finnes ikke/);
});

test("vurderFil: .tsx med Fasit uten Rigg/Avvik rapporteres — og feiler kun når fila er endret", () => {
  const kilde = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html";
  const uendret = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: false });
  assert.deepEqual(uendret.feil, []);
  assert.deepEqual(uendret.rapport, ["src/x.tsx"]);
  const endret = vurderFil({ sti: "src/x.tsx", kilde, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true });
  assert.equal(endret.feil.length, 1);
  assert.match(endret.feil[0], /endret mot origin\/main/);
});

test("vurderFil: Rigg med gyldig label eller Avvik med punkt gjør endret fil grønn; .ts-filer krever ikke Rigg/Avvik", () => {
  const medRigg = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html\n * Rigg: PH-01 I dag";
  assert.deepEqual(
    vurderFil({ sti: "src/x.tsx", kilde: medRigg, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true }).feil,
    [],
  );
  const medAvvik = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html\n * Avvik:\n *   - ingen lys-variant tegnet";
  assert.deepEqual(
    vurderFil({ sti: "src/x.tsx", kilde: medAvvik, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true }).feil,
    [],
  );
  const libFil = " * Fasit: designsystem/train-lock/PH-01 I dag.dc.html";
  const v = vurderFil({ sti: "src/lib/x.ts", kilde: libFil, fasitFiler: FASIT, utgaatte: UTGAATT, riggLabels: RIGG, endret: true });
  assert.deepEqual(v.feil, []);
  assert.deepEqual(v.rapport, []);
});
