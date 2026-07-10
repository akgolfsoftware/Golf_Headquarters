"use client";

/**
 * AK Golf HQ v2 — markedsside BLOGG-LISTE (/blogg), retning C, mørk. Ekte
 * copy speilet fra (mlegacy)/blogg/page.tsx + blogg-liste.tsx (kategori-
 * filter, featured post, kort-grid). Postene (posts.ts) er uendret hjelpefil.
 */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, Lede, Seksjon, useMobile } from "./marked-ramme";

export type BloggPostMeta = {
  slug: string;
  tittel: string;
  ingress: string;
  dato: string;
  forfatter: string;
  bilde: string;
  category: string;
  readMinutes: number;
  featured: boolean;
};

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const CATEGORIES = ["Alle", "Coaching", "Junior", "Mental", "Utstyr"] as const;

export function MarkedBloggListeV2({ posts }: { posts: BloggPostMeta[] }) {
  const mobile = useMobile();
  const [aktivKategori, setAktivKategori] = useState<(typeof CATEGORIES)[number]>("Alle");

  const filtrert = useMemo(
    () => (aktivKategori === "Alle" ? posts : posts.filter((p) => p.category === aktivKategori)),
    [posts, aktivKategori],
  );
  const featured = filtrert.find((p) => p.featured) ?? filtrert[0] ?? null;
  const rest = filtrert.filter((p) => p.slug !== featured?.slug);

  return (
    <MRamme mobile={mobile} aktiv="blogg">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 24 : 32 }}>
        <Eyebrow>Blogg · AK Golf Academy</Eyebrow>
        <HeroT mobile={mobile} em="lærdom">Tanker, metoder og</HeroT>
        <Lede style={{ marginTop: 18 }}>
          Innsikt fra treningshverdagen, analyse av norsk og internasjonal golf, og konkrete råd du faktisk kan bruke. Skrevet av coachene i AK Golf Academy.
        </Lede>
      </Seksjon>

      {/* Kategori-filter */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Caps>Kategori</Caps>
          {CATEGORIES.map((cat) => {
            const on = aktivKategori === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setAktivKategori(cat)}
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: 9999,
                  color: on ? T.onLime : T.fg2,
                  background: on ? T.lime : T.panel2,
                  border: `1px solid ${on ? "transparent" : T.border}`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </Seksjon>

      {/* Featured */}
      {featured && (
        <Seksjon mobile={mobile} style={{ paddingTop: 28 }}>
          <Link href={`/blogg/${featured.slug}`} style={{ textDecoration: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 1fr", gap: mobile ? 20 : 40, alignItems: "center" }}>
              <div style={{ position: "relative", aspectRatio: mobile ? "16 / 10" : "4 / 3", width: "100%", borderRadius: T.rCard, overflow: "hidden", border: `1px solid ${T.border}`, background: T.panel2 }}>
                <Image src={featured.bilde} alt={featured.tittel} fill priority sizes={mobile ? "100vw" : "60vw"} style={{ objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.onLime, background: T.lime, borderRadius: 9999, padding: "4px 10px" }}>
                    Utvalgt
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, background: T.panel2, borderRadius: 9999, padding: "4px 10px" }}>
                    {featured.category}
                  </span>
                </div>
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 26 : 32, color: T.fg, marginTop: 14, display: "block", letterSpacing: "-0.02em", lineHeight: 1.12 }}>
                  {featured.tittel}
                </span>
                <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>{featured.ingress}</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 16, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                  <span style={{ color: T.fg, fontWeight: 600 }}>{featured.forfatter}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Icon name="calendar" size={13} />
                    {NB_DATE.format(new Date(featured.dato))}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Icon name="clock" size={13} />
                    {featured.readMinutes} min
                  </span>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.lime, marginTop: 18 }}>
                  Les hele saken
                  <Icon name="arrow-right" size={14} />
                </span>
              </div>
            </div>
          </Link>
        </Seksjon>
      )}

      {/* Kort-grid */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, letterSpacing: "-0.015em" }}>Nyere artikler</span>
          <Caps>{rest.length} artikler</Caps>
        </div>

        {rest.length === 0 ? (
          <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.mut }}>
            {filtrert.length === 0 ? "Ingen artikler i denne kategorien ennå." : "Flere artikler kommer snart."}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Seksjon>
    </MRamme>
  );
}

function PostCard({ post }: { post: BloggPostMeta }) {
  return (
    <Link href={`/blogg/${post.slug}`} style={{ textDecoration: "none" }}>
      <Kort pad="0" hover style={{ overflow: "hidden", height: "100%" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: T.panel2 }}>
          <Image src={post.bilde} alt={post.tittel} fill sizes="(max-width: 860px) 100vw, 33vw" style={{ objectFit: "cover" }} />
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, background: T.panel2, borderRadius: 9999, padding: "3px 9px" }}>
              {post.category}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
              <Icon name="clock" size={12} />
              {post.readMinutes} min
            </span>
          </div>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.25, letterSpacing: "-0.015em" }}>{post.tittel}</span>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.ingress}
          </p>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 12, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
            <span style={{ color: T.fg, fontWeight: 600 }}>{post.forfatter}</span>
            <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{NB_DATE.format(new Date(post.dato))}</span>
          </div>
        </div>
      </Kort>
    </Link>
  );
}
