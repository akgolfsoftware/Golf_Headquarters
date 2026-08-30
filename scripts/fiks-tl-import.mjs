#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const LINE = 'import { TL } from "@/lib/v2/train-lock";\n';
let n = 0;
for (const f of walk(SRC)) {
  let src = fs.readFileSync(f, "utf8");
  if (!src.includes("TL.")) continue;
  if (src.includes('from "@/lib/v2/train-lock"')) continue;
  if (f.endsWith("train-lock.ts")) continue;
  if (src.startsWith('"use client";\n')) src = '"use client";\n' + LINE + src.slice('"use client";\n'.length);
  else if (src.startsWith("'use client';\n")) src = "'use client';\n" + LINE + src.slice("'use client';\n".length);
  else src = LINE + src;
  fs.writeFileSync(f, src);
  n++;
}
console.log(`La til TL-import i ${n} filer.`);
