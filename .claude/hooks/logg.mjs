#!/usr/bin/env node
/**
 * PostToolUse-hook — sporbarhetslogg (Agentic OS nivå 2).
 * Appender én linje per fullført handling til ~/ak-brain/logg/YYYY-MM-DD.md
 * med tidsstempel (Europe/Oslo). Finnes ikke ak-brain (f.eks. sky-container),
 * hopper vi stille over — loggen er et Mac-hub-anliggende.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const brain = process.env.AK_BRAIN_PATH ?? join(homedir(), "ak-brain");
if (!existsSync(brain)) process.exit(0);

const tool = input.tool_name ?? "?";
const ti = input.tool_input ?? {};
const hva =
  ti.description ??
  ti.file_path ??
  (typeof ti.command === "string" ? ti.command.slice(0, 120) : "") ??
  "";

const naa = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).formatToParts(new Date());
const del = (t) => naa.find((p) => p.type === t)?.value ?? "";
const dato = `${del("year")}-${del("month")}-${del("day")}`;
const klokke = `${del("hour")}:${del("minute")}`;

try {
  const mappe = join(brain, "logg");
  mkdirSync(mappe, { recursive: true });
  appendFileSync(
    join(mappe, `${dato}.md`),
    `- ${klokke} [${tool}] ${String(hva).replaceAll("\n", " ")}\n`,
    "utf-8",
  );
} catch {
  // logging feiler aldri en økt
}
process.exit(0);
