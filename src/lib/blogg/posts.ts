/**
 * src/lib/blogg/posts.ts
 *
 * Hjelper for å lese MDX-filer fra content/blogg/*.mdx.
 * Bruker gray-matter for YAML-frontmatter-parsing.
 * Kjøres utelukkende server-side (RSC / generateStaticParams).
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOGG_DIR = path.join(process.cwd(), "content/blogg");

export type BlogPostMeta = {
  slug: string;
  tittel: string;
  undertittel: string;
  forfatter: string;
  publisert: string;
  kategori: string;
  lestid: number;
  featured: boolean;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  innhold: string;
};

/** Les og parse én MDX-fil. Returnerer null hvis filen ikke finnes. */
function parseFile(filePath: string): BlogPost | null {
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug: String(data.slug ?? ""),
    tittel: String(data.tittel ?? ""),
    undertittel: String(data.undertittel ?? ""),
    forfatter: String(data.forfatter ?? ""),
    publisert: String(data.publisert ?? ""),
    kategori: String(data.kategori ?? ""),
    lestid: Number(data.lestid ?? 0),
    featured: Boolean(data.featured ?? false),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    innhold: content,
  };
}

/**
 * Hent alle artikler, sortert nyeste først (etter publisert-dato).
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOGG_DIR)) return [];

  const files = fs
    .readdirSync(BLOGG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    const parsed = parseFile(path.join(BLOGG_DIR, file));
    if (!parsed) continue;
    // Ekskluder innhold-feltet fra metadata-listen
    const meta: BlogPostMeta = {
      slug: parsed.slug,
      tittel: parsed.tittel,
      undertittel: parsed.undertittel,
      forfatter: parsed.forfatter,
      publisert: parsed.publisert,
      kategori: parsed.kategori,
      lestid: parsed.lestid,
      featured: parsed.featured,
      tags: parsed.tags,
    };
    posts.push(meta);
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publisert).getTime() - new Date(a.publisert).getTime()
  );
}

/**
 * Hent én artikkel med full innholdstekst.
 * Returnerer null hvis slug ikke finnes.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOGG_DIR, `${slug}.mdx`);
  const post = parseFile(filePath);
  if (!post) {
    // Prøv .md-variant
    const mdPath = path.join(BLOGG_DIR, `${slug}.md`);
    return parseFile(mdPath);
  }
  return post;
}

/**
 * Hent inntil 3 relaterte artikler (samme kategori, ikke denne artikkelen).
 */
export function getRelaterte(slug: string, kategori: string): BlogPostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.kategori === kategori)
    .slice(0, 3);
}

/**
 * Hent featured-artikkel. Returnerer første featured, eller første artikkel.
 */
export function getFeaturedPost(): BlogPostMeta | undefined {
  const alle = getAllPosts();
  return alle.find((p) => p.featured) ?? alle[0];
}

/**
 * Hent alle ikke-featured artikler.
 */
export function getNonFeaturedPosts(): BlogPostMeta[] {
  return getAllPosts().filter((p) => !p.featured);
}

/**
 * Formater publisert-dato til norsk visningsformat.
 * "2026-05-19" → "19. mai 2026"
 */
export function formaterDato(iso: string): string {
  const dato = new Date(iso);
  if (isNaN(dato.getTime())) return iso;
  return dato.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
