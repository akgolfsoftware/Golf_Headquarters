import "server-only";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const KUNNSKAP_DIR = join(process.cwd(), "src/lib/ai-coach/kunnskap");
const MAX_CHARS = 8000;

const TAG_MAP: Record<string, string[]> = {
  OTT: ["morad-p1", "morad-fault-over-top", "morad-fault-sway"],
  APP: ["morad-p7", "morad-fault-face-open", "sg-to-morad"],
  ARG: ["morad-drill", "morad-fault-casting"],
  PUTT: ["confidence-bands"],
  TEK: ["morad-p4", "canon-l-fase"],
};

export function selectKnowledgeFiles(context: {
  sgArea?: string;
  faultId?: string;
}): string[] {
  let files: string[];
  try {
    files = readdirSync(KUNNSKAP_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const preferred = new Set<string>();
  if (context.sgArea && TAG_MAP[context.sgArea]) {
    for (const tag of TAG_MAP[context.sgArea]) {
      const match = files.find((f) => f.includes(tag));
      if (match) preferred.add(match);
    }
  }
  if (context.faultId) {
    const match = files.find((f) => f.includes(context.faultId!.replace(/_/g, "-")));
    if (match) preferred.add(match);
  }

  const ordered = [
    ...preferred,
    ...files.filter((f) => !preferred.has(f)),
  ].slice(0, 5);

  let total = 0;
  const chunks: string[] = [];
  for (const file of ordered) {
    const text = readFileSync(join(KUNNSKAP_DIR, file), "utf8");
    if (total + text.length > MAX_CHARS) break;
    chunks.push(`<!-- ${file} -->\n${text}`);
    total += text.length;
  }
  return chunks;
}