// Fase 4 — detaljert: property-kontekst + navngitte farger. Midlertidig, slettes før PR.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("git ls-files 'src/**/*.tsx'", { encoding: "utf8" }).trim().split("\n");
const MARK = "style={{";
function exprs(src) {
  const out = []; let i = 0;
  for (;;) {
    const at = src.indexOf(MARK, i); if (at === -1) break;
    let p = at + "style={".length, depth = 0, inStr = null, esc = false; const start = p;
    for (; p < src.length; p++) {
      const c = src[p];
      if (esc) { esc = false; continue; }
      if (inStr) { if (c === "\\") { esc = true; continue; } if (c === inStr) inStr = null; continue; }
      if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
      if (c === "{") depth++; else if (c === "}") { depth--; if (!depth) { p++; break; } }
    }
    out.push({ text: src.slice(start, p), line: src.slice(0, at).split("\n").length });
    i = p;
  }
  return out;
}
const NAMED = ["white", "black", "transparent", "currentcolor", "red", "green", "orange", "gray", "grey", "silver", "gold"];
const LIT = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(\s*[0-9][^)]*\)/g;
const NAMEDRE = new RegExp(`["'\`](${NAMED.join("|")})["'\`]`, "gi");

const rows = [];
const namedCount = new Map();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!src.includes(MARK)) continue;
  for (const e of exprs(src)) {
    for (const m of e.text.matchAll(LIT)) {
      // finn nærmeste property-navn før treffet
      const before = e.text.slice(0, m.index);
      const props = [...before.matchAll(/([A-Za-z][A-Za-z0-9]*)\s*:/g)];
      const prop = props.length ? props[props.length - 1][1] : "?";
      rows.push({ file: f, line: e.line, prop, raw: m[0] });
    }
    for (const m of e.text.matchAll(NAMEDRE)) {
      const k = m[1].toLowerCase();
      namedCount.set(k, (namedCount.get(k) || 0) + 1);
    }
  }
}
const byProp = new Map();
for (const r of rows) byProp.set(r.prop, (byProp.get(r.prop) || 0) + 1);
writeFileSync("/tmp/gap-detail.json", JSON.stringify({ rows, byProp: [...byProp].sort((a, b) => b[1] - a[1]), named: [...namedCount].sort((a, b) => b[1] - a[1]) }, null, 2));
console.log("literaler:", rows.length);
console.log("per prop:", JSON.stringify([...byProp].sort((a, b) => b[1] - a[1])));
console.log("navngitte:", JSON.stringify([...namedCount].sort((a, b) => b[1] - a[1])));
