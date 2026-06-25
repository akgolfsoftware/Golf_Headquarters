/**
 * Bundle adversarial diff — krever vision-agent rapport fra samme screenshot-sett.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const OUT = process.argv[2];
const MANIFEST = process.argv[3];
if (!OUT || !MANIFEST) {
  console.error("Usage: node scripts/workbench-adversarial-diff.mjs <wb-gate-dir> <manifest.log>");
  process.exit(1);
}

// Vision review mot design-PNG (sub-agent ekvivalent)
const vision = spawnSync("npx", ["tsx", "scripts/workbench-adversarial-vision.ts", OUT], {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (vision.status !== 0) {
  console.error((vision.stderr || vision.stdout || "").trim());
  process.exit(1);
}

const manifest = await readFile(MANIFEST, "utf8");
const bundleTs =
  manifest.match(/Launch verification bundle — (.+)/)?.[1]?.trim() ??
  new Date().toISOString();

const pngs = (await readdir(OUT)).filter((f) => f.endsWith(".png")).sort();
const agentReport = await readFile(path.join(OUT, "adversarial-agent-report.md"), "utf8");
const flow = await readFile(path.join(OUT, "workbench-flow.log"), "utf8").catch(() => "");

const verdictMatch = agentReport.match(/VERDICT:\s*(\d+)\s+undocumented/i);
const undocumented = verdictMatch ? Number(verdictMatch[1]) : -1;
if (undocumented !== 0) {
  console.error(`Adversarial agent found ${undocumented} undocumented deviations`);
  process.exit(1);
}

const md = `# Workbench adversarial diff — launch bundle

**Spawn trace:** \`launch-verify-bundle.sh\` step 4b @ \`${bundleTs}\`
**ADVERSARIAL_AGENT:** claude-sonnet-4-6 vision review (design PNG vs gate screenshots, same run)

**Design-kilde:** \`.design-review/claude-code-handoff/screens/wb-*.png\`

**Implementasjon (denne kjøringen):**
${pngs.map((p) => `- \`wb-gate/${p}\``).join("\n")}

## Verdict: **0 undocumented deviations**

## Agent rapport

${agentReport.replace(/^#.*\n\n?/, "")}

## Funksjonell gate (workbench-flow.log)

${["MOVE_DRAG_BEFORE", "MOVE_DRAG_AFTER", "PUBLISH_CLICK", "MALER_BRUK"]
  .flatMap((key) =>
    flow
      .split("\n")
      .filter((l) => l.includes(key))
      .map((l) => `- ${l.replace(/^\[[^\]]+\]\s*/, "")}`),
  )
  .join("\n")}
`;

await writeFile(path.join(OUT, "adversarial-diff.md"), md);
console.log(`Wrote adversarial-diff.md @ bundle ${bundleTs}`);