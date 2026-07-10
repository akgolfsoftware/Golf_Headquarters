/**
 * /stats/blogg/[slug] — artikkeldetal (design 18)
 *
 * Editorial magazine-spread. Forfatter-box. Relaterte artikler.
 * MDX-innhold rendres via dynamic import av content/blogg/{slug}.mdx.
 * ISR 1t.
 */

import "../../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import {
  getAllPosts,
  getPostBySlug,
  getRelaterte,
  formaterDato,
} from "@/lib/blogg/posts";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artikkel ikke funnet | AK Golf Stats" };
  return {
    title: `${post.tittel} | AK Golf Stats`,
    description: post.undertittel,
    alternates: { canonical: `https://akgolf.no/stats/blogg/${slug}` },
    openGraph: {
      title: post.tittel,
      description: post.undertittel,
      url: `https://akgolf.no/stats/blogg/${slug}`,
      type: "article",
      authors: [post.forfatter],
      publishedTime: post.publisert,
    },
  };
}

export default async function BloggDetaljPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relaterte = getRelaterte(slug, post.kategori).slice(0, 3);

  // Dynamic import av MDX-modulen — kompilert av Next.js via @next/mdx
  let MDXContent: React.ComponentType | null = null;
  try {
    const mod = (await import(
      /* webpackMode: "eager" */
      `../../../../../../../content/blogg/${slug}.mdx`
    )) as { default: React.ComponentType };
    MDXContent = mod.default;
  } catch {
    MDXContent = null;
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero-header */}
      <section
        className="stats-hero"
        style={{ paddingBottom: 0, borderBottom: "1px solid var(--s-border)" }}
      >
        <Reveal>
          <Link
            href="/stats/blogg"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Alle artikler
          </Link>
          <StatsEyebrow>
            {post.kategori} · {post.tags.slice(0, 2).join(" · ")}
          </StatsEyebrow>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              marginTop: 16,
              maxWidth: 880,
            }}
          >
            {post.tittel}
          </h1>
          <p className="stats-hero-sub" style={{ fontSize: 20, maxWidth: 720, marginTop: 20 }}>
            {post.undertittel}
          </p>
          <div
            style={{
              marginTop: 24,
              marginBottom: 48,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span>AV {post.forfatter.toUpperCase()}</span>
            <span>·</span>
            <span>{formaterDato(post.publisert).toUpperCase()}</span>
            <span>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} strokeWidth={2} />
              {post.lestid} min lesetid
            </span>
          </div>
        </Reveal>
      </section>

      {/* Artikkelinnhold — MDX */}
      <section
        style={{
          maxWidth: 720,
          margin: "64px auto",
          padding: "0 32px",
        }}
      >
        <Reveal>
          {MDXContent ? (
            <MDXContent />
          ) : (
            <p style={{ color: "var(--s-muted-fg)", fontStyle: "italic" }}>
              Innhold ikke tilgjengelig.
            </p>
          )}
        </Reveal>
      </section>

      {/* Forfatter-boks */}
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto 64px",
          padding: "0 32px",
        }}
      >
        <Reveal>
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: 28,
              background: "var(--s-secondary)",
              borderRadius: "var(--s-r-lg)",
              border: "1px solid var(--s-border)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--s-primary)",
                color: "var(--s-primary-fg)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {post.forfatter
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}
              >
                {post.forfatter}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                  marginTop: 4,
                }}
              >
                CEO, AK Golf Group · Stats-redaksjonen
              </div>
              <p style={{ fontSize: 13, color: "var(--s-muted-fg)", marginTop: 8, lineHeight: 1.5 }}>
                Dataanalytiker og golf-coach. Bygger AK Golf Stats for å gi norske spillere
                tilgang til data de fortjener.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Relaterte artikler */}
      {relaterte.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Les også</StatsEyebrow>
                <h2 className="font-display">
                  Andre{" "}
                  <em className="stats-italic-accent">analyser</em>.
                </h2>
              </div>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {relaterte.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/stats/blogg/${p.slug}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div className="stats-norske-card" style={{ cursor: "pointer" }}>
                    <div
                      style={{
                        height: 120,
                        background:
                          "linear-gradient(135deg, var(--s-secondary) 0%, var(--s-border) 100%)",
                        borderRadius: "var(--s-r-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--s-muted-fg)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 16,
                      }}
                    >
                      {p.kategori.toUpperCase()}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--s-muted-fg)",
                        }}
                      >
                        {p.kategori.toUpperCase()} · {formaterDato(p.publisert).toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--s-muted-fg)",
                        }}
                      >
                        {p.lestid} min
                      </span>
                    </div>
                    <h3
                      className="font-display"
                      style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" }}
                    >
                      {p.tittel}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
