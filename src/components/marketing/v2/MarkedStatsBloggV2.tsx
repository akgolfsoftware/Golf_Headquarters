"use client";

/**
 * AK Golf HQ v2 — STATS/BLOGG (liste + detalj), retning C, mørk.
 * Ekte copy speilet 1:1 fra (mlegacy)/stats/blogg/**. Data (MDX-artikler i
 * content/blogg/*.mdx) hentes 1:1 via @/lib/blogg/posts — egen datakilde,
 * ikke samme som markedsbloggen på /blogg ((mlegacy)/blogg/posts.ts).
 * MDX-innholdet rendres server-side (dynamic import i page.tsx) og sendes
 * inn som MDXContent-komponent — denne fila styler prosa-elementene via
 * en scoped <style>-blokk (ren CSS, ingen styled-jsx-avhengighet).
 */
import type { ComponentType } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import type { BlogPostMeta, BlogPost } from "@/lib/blogg/posts";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon } from "./marked-ramme";

/**
 * Lokal date-formatter (ikke importert fra @/lib/blogg/posts — den filen
 * bruker `fs` og kan ikke bundles i en client component).
 */
function formaterDato(iso: string): string {
  const dato = new Date(iso);
  if (isNaN(dato.getTime())) return iso;
  return dato.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Delt: bilde-placeholder-flate (ingen ekte bilder i datakilden) ─── */
function Plassholder({ tekst, height }: { tekst: string; height?: number }) {
  return (
    <div
      style={{
        height,
        minHeight: height ? undefined : 140,
        background: `linear-gradient(135deg, ${T.panel2} 0%, ${T.panel3} 100%)`,
        borderRadius: T.rRow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.mono,
        fontSize: 11,
        color: T.mut,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {tekst}
    </div>
  );
}

/* =====================================================================
 * LISTE — /stats/blogg
 * =================================================================== */
export interface BloggListeV2Props {
  alle: BlogPostMeta[];
  featured: BlogPostMeta | undefined;
  rest: BlogPostMeta[];
}
export function BloggListeV2({ alle, featured, rest }: BloggListeV2Props) {
  const mobile = useMobile();
  const kategorier = ["Alle", ...Array.from(new Set(alle.map((p) => p.kategori)))];

  return (
    <StatsRamme mobile={mobile}>
      <Seksjon mobile={mobile}>
        <Eyebrow>AK Golf Stats · Analyse</Eyebrow>
        <HeroT mobile={mobile} em="betyr noe.">Tall som</HeroT>
        <Lede style={{ marginTop: 22, maxWidth: 580 }}>
          Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG.
        </Lede>
      </Seksjon>

      {featured && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Link href={`/stats/blogg/${featured.slug}`} style={{ textDecoration: "none" }}>
            <Kort hover pad="0" style={{ overflow: "hidden", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", minHeight: mobile ? undefined : 320 }}>
              <Plassholder tekst={featured.kategori} />
              <div style={{ padding: mobile ? "24px 22px" : 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Caps>Denne uken · {featured.kategori}</Caps>
                  <Caps>{featured.lestid} min</Caps>
                </div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 24 : 30, color: T.fg, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                  {featured.tittel}
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 14.5, color: T.fg2, lineHeight: 1.55, marginTop: 14 }}>{featured.undertittel}</p>
                <div style={{ marginTop: 18, fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, display: "flex", alignItems: "center", gap: 8 }}>
                  Av {featured.forfatter} · {formaterDato(featured.publisert)}
                  <Icon name="arrow-right" size={12} style={{ color: T.lime }} />
                </div>
              </div>
            </Kort>
          </Link>
        </Seksjon>
      )}

      <Seksjon mobile={mobile}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {kategorier.map((k) => (
            <span
              key={k}
              style={{
                padding: "7px 15px",
                borderRadius: 9999,
                border: `1px solid ${k === "Alle" ? "transparent" : T.borderS}`,
                background: k === "Alle" ? T.lime : "transparent",
                color: k === "Alle" ? T.onLime : T.fg2,
                fontFamily: T.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {k}
            </span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          {rest.map((p) => (
            <Link key={p.slug} href={`/stats/blogg/${p.slug}`} style={{ textDecoration: "none" }}>
              <Kort hover style={{ display: "flex", flexDirection: "column", gap: 0, minHeight: 280 }}>
                <Plassholder tekst={p.kategori} height={140} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                  <Caps>{p.kategori} · {formaterDato(p.publisert)}</Caps>
                  <Caps>{p.lestid} min</Caps>
                </div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.2, letterSpacing: "-0.01em", marginTop: 10 }}>
                  {p.tittel}
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 8, lineHeight: 1.5 }}>{p.undertittel}</p>
                <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.lime }}>
                  Lesetid {p.lestid} min
                  <Icon name="arrow-right" size={12} />
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      </Seksjon>
    </StatsRamme>
  );
}

/* =====================================================================
 * DETALJ — /stats/blogg/[slug]
 * =================================================================== */
export interface BloggDetaljV2Props {
  post: BlogPost;
  relaterte: BlogPostMeta[];
  MDXContent: ComponentType | null;
}
export function BloggDetaljV2({ post, relaterte, MDXContent }: BloggDetaljV2Props) {
  const mobile = useMobile();
  const initialer = post.forfatter.split(" ").map((n) => n[0]).join("");

  return (
    <StatsRamme mobile={mobile}>
      <Seksjon mobile={mobile} style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: mobile ? 32 : 48 }}>
        <MCta ghost small icon="arrow-left" href="/stats/blogg">Alle artikler</MCta>
        <div style={{ marginTop: 20 }}>
          <Eyebrow>{post.kategori} · {post.tags.slice(0, 2).join(" · ")}</Eyebrow>
          <HeroT mobile={mobile}>{post.tittel}</HeroT>
          <Lede style={{ marginTop: 18, maxWidth: 720 }}>{post.undertittel}</Lede>
          <div style={{ marginTop: 22, fontFamily: T.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span>Av {post.forfatter}</span>
            <span>·</span>
            <span>{formaterDato(post.publisert)}</span>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="clock" size={12} />
              {post.lestid} min lesetid
            </span>
          </div>
        </div>
      </Seksjon>

      <Seksjon mobile={mobile}>
        <div style={{ maxWidth: 720, margin: "0 auto" }} className="stats-mdx-prose">
          {MDXContent ? <MDXContent /> : <p style={{ color: T.mut, fontStyle: "italic" }}>Innhold ikke tilgjengelig.</p>}
        </div>
        <style>{`
          .stats-mdx-prose { font-family: ${T.ui}; font-size: 15.5px; line-height: 1.75; color: ${T.fg2}; }
          .stats-mdx-prose h2 { font-family: ${T.disp}; font-weight: 700; font-size: 26px; color: ${T.fg}; letter-spacing: -0.015em; margin: 40px 0 16px; }
          .stats-mdx-prose h3 { font-family: ${T.disp}; font-weight: 700; font-size: 20px; color: ${T.fg}; letter-spacing: -0.01em; margin: 32px 0 12px; }
          .stats-mdx-prose p { margin: 0 0 18px; }
          .stats-mdx-prose a { color: ${T.lime}; text-decoration: underline; text-underline-offset: 2px; }
          .stats-mdx-prose strong { color: ${T.fg}; font-weight: 700; }
          .stats-mdx-prose ul, .stats-mdx-prose ol { margin: 0 0 18px; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; }
          .stats-mdx-prose blockquote { border-left: 2px solid ${T.lime}; padding: 4px 0 4px 18px; margin: 24px 0; color: ${T.fg}; font-style: italic; }
          .stats-mdx-prose code { font-family: ${T.mono}; font-size: 13.5px; background: ${T.panel2}; border: 1px solid ${T.border}; border-radius: 4px; padding: 1px 6px; color: ${T.fg}; }
          .stats-mdx-prose table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13.5px; }
          .stats-mdx-prose th, .stats-mdx-prose td { border-bottom: 1px solid ${T.border}; padding: 10px 12px; text-align: left; }
          .stats-mdx-prose th { font-family: ${T.mono}; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.mut}; }
        `}</style>
      </Seksjon>

      <Seksjon mobile={mobile}>
        <Kort pad={mobile ? "22px" : "28px"} style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.lime, color: T.onLime, display: "grid", placeItems: "center", fontFamily: T.mono, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
            {initialer}
          </div>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{post.forfatter}</div>
            <Caps style={{ marginTop: 4 }}>CEO, AK Golf Group · Stats-redaksjonen</Caps>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 8, lineHeight: 1.5 }}>
              Dataanalytiker og golf-coach. Bygger AK Golf Stats for å gi norske spillere tilgang til data de fortjener.
            </p>
          </div>
        </Kort>
      </Seksjon>

      {relaterte.length > 0 && (
        <Seksjon mobile={mobile}>
          <Caps>Les også</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile}>Andre analyser.</SeksT>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 24 }}>
            {relaterte.map((p) => (
              <Link key={p.slug} href={`/stats/blogg/${p.slug}`} style={{ textDecoration: "none" }}>
                <Kort hover>
                  <Plassholder tekst={p.kategori} height={110} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                    <Caps>{p.kategori} · {formaterDato(p.publisert)}</Caps>
                    <Caps>{p.lestid} min</Caps>
                  </div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, lineHeight: 1.2, letterSpacing: "-0.01em", marginTop: 8 }}>
                    {p.tittel}
                  </div>
                </Kort>
              </Link>
            ))}
          </div>
        </Seksjon>
      )}
    </StatsRamme>
  );
}
