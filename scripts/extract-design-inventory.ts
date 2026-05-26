#!/usr/bin/env tsx
/**
 * Skann public/design-handover/ rekursivt og produser inventar.json
 * for alle HTML-filer: tittel, h1, knapper, lenker.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "public", "design-handover");
const OUT = join(process.cwd(), "docs", "design-koblinger", "inventar.json");

type Button = {
  text: string;
  href?: string;
  type: "button" | "link";
};

type DesignFile = {
  file: string;
  title: string;
  h1: string;
  buttonCount: number;
  linkCount: number;
  buttons: Button[];
  sizeBytes: number;
};

function listHtml(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listHtml(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function pickAttr(tag: string, attr: string): string | undefined {
  const m = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return m?.[1];
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extract(file: string): DesignFile {
  const html = readFileSync(file, "utf-8");
  const titleM = html.match(/<title>([^<]*)<\/title>/i);
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const buttons: Button[] = [];

  // <button>...</button>
  for (const m of html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)) {
    const text = stripTags(m[1]).slice(0, 80);
    if (text && text.length > 1) buttons.push({ text, type: "button" });
  }

  // <a href="...">...</a>
  for (const m of html.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = pickAttr(`<a ${m[1]}>`, "href");
    const text = stripTags(m[2]).slice(0, 80);
    if (text && text.length > 1) {
      buttons.push({ text, href, type: "link" });
    }
  }

  // Dedupe by text+href
  const seen = new Set<string>();
  const dedup = buttons.filter((b) => {
    const k = `${b.type}|${b.text}|${b.href ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    file: relative(join(process.cwd(), "public"), file),
    title: titleM?.[1]?.trim() ?? "",
    h1: stripTags(h1M?.[1] ?? "").slice(0, 120),
    buttonCount: dedup.filter((b) => b.type === "button").length,
    linkCount: dedup.filter((b) => b.type === "link").length,
    buttons: dedup.slice(0, 200), // cap
    sizeBytes: html.length,
  };
}

function main() {
  const files = listHtml(ROOT).sort();
  console.log(`Fant ${files.length} HTML-filer`);
  const result: DesignFile[] = files.map(extract);
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`Skrev ${OUT}`);
  console.log(`Total knapper: ${result.reduce((a, b) => a + b.buttonCount, 0)}`);
  console.log(`Total lenker:  ${result.reduce((a, b) => a + b.linkCount, 0)}`);
}

main();
