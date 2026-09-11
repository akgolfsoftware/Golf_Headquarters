/**
 * Bygger et minimalt Tailwind v4-lag for PH-06-riggen: scanner kun
 * SessionSummary/SpillerVurderingForm/LiveLoopNav/WhyDetails for
 * className-bruk og genererer tilsvarende utility-CSS med postcss +
 * @tailwindcss/postcss — samme motor Next bruker i den ekte builden, men
 * uten å måtte starte en dev-server eller database.
 *
 * Kjør: node tests/visual/playerhq-summary/build-tailwind.mjs
 * Skriver tests/visual/ut/playerhq-summary/tailwind.css (gitignorert).
 */
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HER = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HER, "..", "..", "..");
const UT_DIR = path.join(REPO_ROOT, "tests", "visual", "ut", "playerhq-summary");
const ENTRY_PATH = path.join(UT_DIR, "_tw-entry.css");

mkdirSync(UT_DIR, { recursive: true });

const entry = `@import "tailwindcss";\n@source "../../../../src/components/portal/live/**/*.tsx";\n`;
writeFileSync(ENTRY_PATH, entry, "utf8");

const css = readFileSync(ENTRY_PATH, "utf8");
const result = await postcss([tailwind()]).process(css, {
  from: ENTRY_PATH,
  to: path.join(UT_DIR, "tailwind.css"),
});
writeFileSync(path.join(UT_DIR, "tailwind.css"), result.css, "utf8");
console.log(`Tailwind-lag skrevet: ${result.css.length} bytes`);
