import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Search,
  Sparkles,
} from "lucide-react";
import { POSTS, type BlogPost } from "./posts";

export const metadata: Metadata = {
  title: "Blogg — AK Golf Academy",
  description:
    "Tanker, metoder og lærdom fra coaching-hverdagen i AK Golf Academy.",
};

const DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const CATEGORIES = ["Alle", "Coaching", "Junior", "Mental", "Utstyr"] as const;

// Avledet metadata per post (uten å endre BlogPost-modellen)
type PostMeta = { category: string; readMinutes: number; featured: boolean };

const META: Record<string, PostMeta> = {
  "hvorfor-struktur-slar-talent": {
    category: "Coaching",
    readMinutes: 7,
    featured: true,
  },
  "kortspill-er-hvor-runden-vinnes": {
    category: "Coaching",
    readMinutes: 6,
    featured: false,
  },
  "datadrevet-coaching-uten-overload": {
    category: "Utstyr",
    readMinutes: 8,
    featured: false,
  },
};

function metaFor(slug: string): PostMeta {
  return META[slug] ?? { category: "Coaching", readMinutes: 6, featured: false };
}

export default function BloggListe() {
  const sortert = [...POSTS].sort((a, b) => b.dato.localeCompare(a.dato));
  const featured = sortert.find((p) => metaFor(p.slug).featured) ?? sortert[0];
  const rest = sortert.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              AK Golf · Blogg
            </span>
            <h1 className="max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">
              Tanker, metoder og{" "}
              <em className="font-display font-normal italic text-primary">
                lærdom
              </em>{" "}
              fra coaching-hverdagen
            </h1>
            <p className="max-w-2xl text-[17px] leading-[1.6] text-muted-foreground">
              Vi deler hva vi ser når vi jobber med spillere fra første swing
              til NM-deltakelse. Skrevet av coachene i AK Golf Academy — uten
              markedsføringsfluff.
            </p>

            <form
              action="/blogg"
              method="get"
              className="mt-2 flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-background px-4 py-2"
            >
              <Search
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="text"
                name="q"
                placeholder="Søk i bloggen"
                aria-label="Søk i bloggen"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>
        </div>
      </section>

      {/* Kategori-filter */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-6">
          <span className="mr-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Kategori
          </span>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              type="button"
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <Link
              href={`/blogg/${featured.slug}`}
              className="group grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-secondary lg:aspect-auto lg:h-[480px]">
                <Image
                  src={featured.bilde}
                  alt={featured.tittel}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                    Utvalgt
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {metaFor(featured.slug).category}
                  </span>
                </div>
                <h2 className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[42px]">
                  {featured.tittel}
                </h2>
                <p className="text-[16px] leading-[1.6] text-muted-foreground">
                  {featured.ingress}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {featured.forfatter}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" strokeWidth={1.5} />
                    {DATO_FORMAT.format(new Date(featured.dato))}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" strokeWidth={1.5} />
                    {metaFor(featured.slug).readMinutes} min
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-primary group-hover:gap-3">
                  Les hele saken
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Kort-grid */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Nyere artikler
            </h2>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {rest.length} artikler
            </span>
          </div>

          {rest.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              Flere artikler kommer snart.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {/* Pagination-stub (én side foreløpig) */}
          {rest.length > 6 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-muted-foreground opacity-50"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Forrige
              </button>
              <PageBtn page={1} active />
              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground opacity-50"
              >
                Neste
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const meta = metaFor(post.slug);
  return (
    <Link
      href={`/blogg/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-sm"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        <Image
          src={post.bilde}
          alt={post.tittel}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {meta.category}
          </span>
          <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            {meta.readMinutes} min
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold leading-[1.25] tracking-tight">
          {post.tittel}
        </h3>
        <p className="line-clamp-3 text-[14px] leading-[1.55] text-muted-foreground">
          {post.ingress}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{post.forfatter}</span>
          <span className="font-mono tabular-nums">
            {DATO_FORMAT.format(new Date(post.dato))}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PageBtn({ page, active = false }: { page: number; active?: boolean }) {
  return (
    <button
      type="button"
      className={`grid h-10 w-10 place-items-center rounded-full font-mono text-[13px] font-semibold tabular-nums transition-colors ${
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {page}
    </button>
  );
}
