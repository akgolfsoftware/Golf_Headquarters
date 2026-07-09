import "server-only";
import { readFileSync } from "fs";
import { join } from "path";

const EXAMPLES_DIR = join(process.cwd(), "src/lib/ai-coach/examples");

type DialogLine = {
  context?: string;
  player_says?: string;
  anders_style_reply?: string;
};

/** Leser N tilfeldige few-shot-linjer fra live-coach-dialog.jsonl. */
export function loadFewShotExamples(fileName: string, limit = 3): string[] {
  try {
    const raw = readFileSync(join(EXAMPLES_DIR, fileName), "utf8");
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed: DialogLine[] = [];
    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line) as DialogLine);
      } catch {
        /* skip malformed */
      }
    }
    return parsed.slice(0, limit).map((row) => {
      const ctx = row.context ? `[${row.context}] ` : "";
      return `${ctx}Spiller: «${row.player_says ?? ""}»\nCoach: ${row.anders_style_reply ?? ""}`;
    });
  } catch {
    return [];
  }
}

export function formatFewShotBlock(examples: string[]): string {
  if (examples.length === 0) return "";
  return `\n\n<eksempler>\n${examples.join("\n\n---\n\n")}\n</eksempler>`;
}