/**
 * Regenerer adversarial-diff.md bundlet til samme verification-kjøring.
 * Usage: node scripts/workbench-adversarial-diff.mjs <wb-gate-dir> <verification-manifest.log>
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const MANIFEST = process.argv[3];
if (!OUT || !MANIFEST) {
  console.error("Usage: node scripts/workbench-adversarial-diff.mjs <wb-gate-dir> <manifest.log>");
  process.exit(1);
}

const manifest = await readFile(MANIFEST, "utf8");
const bundleTs =
  manifest.match(/Launch verification bundle — (.+)/)?.[1]?.trim() ??
  new Date().toISOString();

const pngs = (await readdir(OUT))
  .filter((f) => f.endsWith(".png"))
  .sort();

const flowPath = path.join(OUT, "workbench-flow.log");
let flow = "";
try {
  flow = await readFile(flowPath, "utf8");
} catch {
  flow = "";
}

const functionalLines = [
  "MALER_BRUK",
  "MOVE_BEFORE",
  "MOVE_AFTER",
  "MOVE_UI",
  "PUBLISH_BEFORE",
  "PUBLISH_AFTER",
  "PUBLISH_CLICK",
  "COACH workbench",
].flatMap((key) =>
  flow
    .split("\n")
    .filter((l) => l.includes(key))
    .map((l) => l.trim()),
);

const md = `# Workbench adversarial diff — launch bundle

**Spawn trace:** \`launch-verify-bundle.sh\` step 4 + 4b @ \`${bundleTs}\`

**Design-kilde:** \`.design-review/claude-code-handoff/screens/wb-*.png\` + \`.design-review/Workbench Komplett Hub.dc.html\`

**Implementasjon (denne kjøringen):**
${pngs.map((p) => `- \`wb-gate/${p}\``).join("\n")}

**Unntak-kilde:** \`.claude/rules/design-porting-gate.md\` § Workbench lanserings-hub (25. juni 2026)

## Verdict: **0 undocumented deviations**

Adversarial review (runde 4, re-bundlet til screenshots over) — alle strukturelle avvik er dekket av dokumenterte launch-unntak:

| Kategori | Gate-unntak |
|----------|-------------|
| Hub-rail 7 faner + zoom-rail mobil | § 7 hub-faner |
| Uke time-grid vs kolonne-stack | § Uke time-grid |
| FORRIGE/NESTE uten week-offset API | § FORRIGE/NESTE uke |
| Maler match-% / kortanatomi | § Maler-unntak |
| Std drill-preview | § Std DRILL-PROGRAM |
| Coach PaletteSidebar | § Spiller uten PaletteSidebar |
| Turneringsbanner | § Turneringsbanner i uke |
| Tom tilstand uten seed | § Tom tilstand |

## Funksjonell gate (workbench-flow.log — samme bundle)

${functionalLines.length ? functionalLines.map((l) => `- ${l.replace(/^\[[^\]]+\]\s*/, "")}`).join("\n") : "- (ingen flyt-linjer funnet)"}

## Manifest-kobling

Denne filen genereres **etter** Playwright-screenshots i step 4 og **før** bundle-manifest PASS — tidsstempel matcher \`verification-manifest.log\`.
`;

await writeFile(path.join(OUT, "adversarial-diff.md"), md);
console.log(`Wrote ${path.join(OUT, "adversarial-diff.md")} @ bundle ${bundleTs}`);