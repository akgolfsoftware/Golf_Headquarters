// Filsystem-basert blog. Markdown-filer i content/blog/*.md med YAML frontmatter.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags: string[];
  body: string;
};

const BLOG_DIR = join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): {
  meta: Record<string, string | string[]>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string | string[]> = {};
  const linjer = match[1].split("\n");
  for (const linje of linjer) {
    const kolonIdx = linje.indexOf(":");
    if (kolonIdx === -1) continue;
    const key = linje.slice(0, kolonIdx).trim();
    let val = linje.slice(kolonIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""));
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: match[2] };
}

export function getAllPosts(): BlogPost[] {
  const filer = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return filer
    .map((fil) => {
      const raw = readFileSync(join(BLOG_DIR, fil), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug: (meta.slug as string) ?? fil.replace(/\.md$/, ""),
        title: (meta.title as string) ?? fil,
        description: (meta.description as string) ?? "",
        publishedAt: (meta.publishedAt as string) ?? "",
        author: (meta.author as string) ?? "AK Golf",
        tags: (meta.tags as string[]) ?? [],
        body,
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

// Enkel Markdown → HTML (kun headings, paragrafer, fet, lister)
export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let inParagraph = false;

  function lukkParagraf() {
    if (inParagraph) {
      out.push("</p>");
      inParagraph = false;
    }
  }
  function lukkListe() {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  }

  for (const linje of lines) {
    const trimmed = linje.trim();
    if (!trimmed) {
      lukkParagraf();
      lukkListe();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      lukkParagraf();
      lukkListe();
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      lukkParagraf();
      lukkListe();
      out.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("- ")) {
      lukkParagraf();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
    } else {
      lukkListe();
      if (!inParagraph) {
        out.push("<p>");
        inParagraph = true;
      } else {
        out.push(" ");
      }
      out.push(inlineFormat(trimmed));
    }
  }
  lukkParagraf();
  lukkListe();
  return out.join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}
