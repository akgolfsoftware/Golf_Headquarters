"use client";

/**
 * AK Golf HQ — markedsside BLOGG-LISTE (/blogg), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html
 * (§filterrad + §kat). Ekte copy speilet fra (mlegacy)/blogg/page.tsx +
 * blogg-liste.tsx. Postene (posts.ts) er uendret hjelpefil.
 */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/v2";
import { PkShell } from "./paper/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkFilterrad, PkKat, PkTom } from "./paper/PkPrimitives";

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
  const [aktivKategori, setAktivKategori] = useState<(typeof CATEGORIES)[number]>("Alle");

  const filtrert = useMemo(
    () => (aktivKategori === "Alle" ? posts : posts.filter((p) => p.category === aktivKategori)),
    [posts, aktivKategori],
  );
  const featured = filtrert.find((p) => p.featured) ?? filtrert[0] ?? null;
  const rest = filtrert.filter((p) => p.slug !== featured?.slug);

  return (
    <PkShell aktiv="/blogg" dataSlug="marketing-blogg-liste">
      <PkSek>
        <PkEyebrow>Blogg · AK Golf Academy</PkEyebrow>
        <PkHero>Tanker, metoder og lærdom</PkHero>
        <PkIng>
          Innsikt fra treningshverdagen, analyse av norsk og internasjonal golf, og konkrete råd du
          faktisk kan bruke. Skrevet av coachene i AK Golf Academy.
        </PkIng>

        <PkFilterrad label="Filtrer på kategori">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={aktivKategori === cat}
              onClick={() => setAktivKategori(cat)}
            >
              {cat}
            </button>
          ))}
        </PkFilterrad>
      </PkSek>

      {featured && (
        <PkSek notop>
          <Link href={`/blogg/${featured.slug}`} className="pk-kort pk-kort-hover" style={{ display: "block" }}>
            <div className="pk-featured">
              <div style={{ position: "relative", aspectRatio: "16 / 9", width: "100%", background: "var(--p-soft)" }}>
                <Image src={featured.bilde} alt={featured.tittel} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
              </div>
              <div className="pk-kort-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--p-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--p-on-accent)",
                      background: "var(--p-accent)",
                      borderRadius: 9999,
                      padding: "4px 10px",
                    }}
                  >
                    Utvalgt
                  </span>
                  <span className="pk-meta">{featured.category}</span>
                </div>
                <span className="pk-navn" style={{ fontSize: 26 }}>
                  {featured.tittel}
                </span>
                <p>{featured.ingress}</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 16, fontFamily: "var(--p-ui)", fontSize: 12.5, color: "var(--p-muted)" }}>
                  <span style={{ color: "var(--p-fg)", fontWeight: 600 }}>{featured.forfatter}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Icon name="calendar" size={13} />
                    {NB_DATE.format(new Date(featured.dato))}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Icon name="clock" size={13} />
                    {featured.readMinutes} min
                  </span>
                </div>
                <span className="pk-lesmer">Les hele saken →</span>
              </div>
            </div>
          </Link>
        </PkSek>
      )}

      <PkSek notop>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: "var(--p-disp)", fontWeight: 600, fontSize: 22, color: "var(--p-fg)" }}>Nyere artikler</span>
          <span className="pk-eyebrow">{rest.length} artikler</span>
        </div>

        {rest.length === 0 ? (
          <PkTom
            title={filtrert.length === 0 ? "Ingen artikler i denne kategorien ennå" : "Flere artikler kommer snart"}
            description="Prøv en annen kategori, eller kom tilbake senere — vi publiserer jevnlig."
          />
        ) : (
          <PkKat>
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </PkKat>
        )}
      </PkSek>
    </PkShell>
  );
}

function PostCard({ post }: { post: BloggPostMeta }) {
  return (
    <Link href={`/blogg/${post.slug}`} className="pk-kort pk-kort-hover">
      <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: "var(--p-soft)" }}>
        <Image src={post.bilde} alt={post.tittel} fill sizes="(max-width: 860px) 100vw, 33vw" style={{ objectFit: "cover" }} />
      </div>
      <div className="pk-kort-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pk-meta">{post.category}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--p-ui)", fontSize: 11.5, color: "var(--p-muted)" }}>
            <Icon name="clock" size={12} />
            {post.readMinutes} min
          </span>
        </div>
        <span className="pk-navn" style={{ fontSize: 17 }}>
          {post.tittel}
        </span>
        <p style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.ingress}</p>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--p-hairline)",
            paddingTop: 12,
            fontFamily: "var(--p-ui)",
            fontSize: 11.5,
            color: "var(--p-muted)",
          }}
        >
          <span style={{ color: "var(--p-fg)", fontWeight: 600 }}>{post.forfatter}</span>
          <span style={{ fontFamily: "var(--p-mono)", fontVariantNumeric: "tabular-nums" }}>{NB_DATE.format(new Date(post.dato))}</span>
        </div>
      </div>
    </Link>
  );
}
