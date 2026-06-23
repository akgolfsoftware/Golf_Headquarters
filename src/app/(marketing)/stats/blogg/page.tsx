/**
 * /stats/blogg — datadrevne artikkelliste (design 18)
 *
 * Hero + featured-artikkel + kategori-filter + grid.
 * Henter data fra content/blogg/*.mdx via src/lib/blogg/posts.ts.
 * ISR 1t.
 */

import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getAllPosts,
  getFeaturedPost,
  getNonFeaturedPosts,
  formaterDato,
} from "@/lib/blogg/posts";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Analyse & statistikk | AK Golf Stats",
  description:
    "Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG.",
  alternates: { canonical: "https://akgolf.no/stats/blogg" },
  openGraph: {
    title: "Analyse: AK Golf Stats",
    description: "SG-analyse, juniordata, PGA Tour-tall. Gratis fra AK Golf.",
    url: "https://akgolf.no/stats/blogg",
    type: "website",
  },
};

export default function BloggListePage() {
  const alle = getAllPosts();
  const featured = getFeaturedPost();
  const rest = getNonFeaturedPosts();

  const alleKategorier = [
    "Alle",
    ...Array.from(new Set(alle.map((p) => p.kategori))),
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="stats-hero" style={{ paddingBottom: 40 }}>
        <Reveal>
          <StatsEyebrow>AK Golf Stats · Analyse</StatsEyebrow>
          <h1 className="font-display">
            Tall som{" "}
            <em className="stats-italic-accent">betyr noe</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 580 }}>
            Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG.
          </p>
        </Reveal>
      </section>

      {/* Featured-artikkel */}
      {featured && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <Link
              href={`/stats/blogg/${featured.slug}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-lg)",
                  overflow: "hidden",
                  background: "var(--s-card)",
                  minHeight: 320,
                  cursor: "pointer",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                className="stats-norske-card"
              >
                {/* Bilde-placeholder */}
                <div
                  style={{
                    background: "linear-gradient(135deg, var(--s-secondary) 0%, var(--s-border) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--s-muted-fg)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {featured.kategori.toUpperCase()}
                </div>
                <div
                  style={{
                    padding: 40,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      DENNE UKEN · {featured.kategori.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {featured.lestid} min
                    </span>
                  </div>
                  <h2
                    className="font-display"
                    style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}
                  >
                    {featured.tittel.split(" ").slice(0, 5).join(" ")}{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                      {featured.tittel.split(" ").slice(5).join(" ")}
                    </em>
                  </h2>
                  <p style={{ fontSize: 15, color: "var(--s-muted-fg)", lineHeight: 1.5, marginTop: 16 }}>
                    {featured.undertittel}
                  </p>
                  <div
                    style={{
                      marginTop: 20,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    AV {featured.forfatter.toUpperCase()} ·{" "}
                    {formaterDato(featured.publisert).toUpperCase()}
                    <ArrowRight size={12} strokeWidth={2} style={{ color: "var(--s-primary)" }} />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* Kategori-filter + grid */}
      <section className="stats-section stats-section-divider">
        <Reveal>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {alleKategorier.map((k) => (
              <span
                key={k}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--s-border)",
                  background: k === "Alle" ? "var(--s-primary)" : "transparent",
                  color: k === "Alle" ? "var(--s-primary-fg)" : "var(--s-muted-fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 50}>
              <Link
                href={`/stats/blogg/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div
                  className="stats-norske-card"
                  style={{ display: "flex", flexDirection: "column", gap: 0, cursor: "pointer" }}
                >
                  {/* Bilde-placeholder */}
                  <div
                    style={{
                      height: 160,
                      background: "linear-gradient(135deg, var(--s-secondary) 0%, var(--s-border) 100%)",
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
                      marginBottom: 12,
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
                    style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" }}
                  >
                    {p.tittel}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--s-muted-fg)", marginTop: 8, lineHeight: 1.5 }}>
                    {p.undertittel}
                  </p>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--s-primary)",
                    }}
                  >
                    Lesetid {p.lestid} min
                    <ArrowRight size={12} strokeWidth={2} />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
