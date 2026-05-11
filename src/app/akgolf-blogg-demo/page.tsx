/**
 * Marketing demo — Blogg-forside (akgolf.no/blogg)
 * Hero, kategori-filter, 9 blogg-kort med featured først, pagination.
 * Server component. Bruker felles MarketingNav + MarketingFooter fra _marketing-demo/chrome.
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  Search,
  Sparkles,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "../_marketing-demo/chrome";

const CATEGORIES = [
  "Alle",
  "Coaching",
  "Junior",
  "Mental",
  "Utstyr",
  "Bedrift",
] as const;

type Category = (typeof CATEGORIES)[number];

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Exclude<Category, "Alle">;
  author: string;
  date: string;
  readMinutes: number;
  imageHue: number;
  featured?: boolean;
};

const POSTS: Post[] = [
  {
    slug: "treningsplan-som-fungerer",
    title: "Slik bygger du en treningsplan som faktisk fungerer",
    excerpt:
      "Vi har coachet over 200 spillere de siste tre sesongene. Her er strukturen som skiller dem som blir bedre fra dem som står på stedet hvil.",
    category: "Coaching",
    author: "Anders Kristiansen",
    date: "8. mai 2026",
    readMinutes: 9,
    imageHue: 159,
    featured: true,
  },
  {
    slug: "putting-20-minutter",
    title: "Slik trener du putting på 20 minutter daglig",
    excerpt:
      "Du trenger ikke en time på greenen. Med riktig progresjon og fokus, gir 20 minutter mer effekt enn de fleste vet.",
    category: "Coaching",
    author: "Sara Pedersen",
    date: "2. mai 2026",
    readMinutes: 6,
    imageHue: 72,
  },
  {
    slug: "mental-trening-undervurdert",
    title: "Hvorfor mental trening er undervurdert i golf",
    excerpt:
      "Spillere som scorer best under press, har én ting felles. Det er ikke teknikken — det er rutinen mellom slagene.",
    category: "Mental",
    author: "Tom Andersen",
    date: "28. april 2026",
    readMinutes: 7,
    imageHue: 200,
  },
  {
    slug: "5-tips-foreldre-junior",
    title: "5 tips for foreldre til juniorgolfere",
    excerpt:
      "Den vanskeligste rollen i juniorgolf er foreldrerollen. Her er praktiske grep som faktisk hjelper barnet ditt over tid.",
    category: "Junior",
    author: "Anders Kristiansen",
    date: "22. april 2026",
    readMinutes: 8,
    imageHue: 30,
  },
  {
    slug: "trackman-data-tolkning",
    title: "Hva TrackMan-tallene egentlig forteller deg",
    excerpt:
      "Spin rate, launch angle, smash factor — vi forklarer hva som faktisk betyr noe for handicap-spillere.",
    category: "Utstyr",
    author: "Anders Kristiansen",
    date: "15. april 2026",
    readMinutes: 11,
    imageHue: 280,
  },
  {
    slug: "bedrift-event-gjennomforing",
    title: "Slik arrangerer du et bedriftsevent som blir husket",
    excerpt:
      "Vi har vært vertskap for over 40 bedriftsdager. Her er de tre tingene som skiller en god dag fra en glemt dag.",
    category: "Bedrift",
    author: "Sara Pedersen",
    date: "10. april 2026",
    readMinutes: 6,
    imageHue: 220,
  },
  {
    slug: "vinterforberedelse",
    title: "Hva gode spillere gjør i vintermånedene",
    excerpt:
      "Sesongen vinnes ofte før den begynner. Slik bruker våre Elite-spillere desember til mars.",
    category: "Coaching",
    author: "Tom Andersen",
    date: "3. april 2026",
    readMinutes: 8,
    imageHue: 195,
  },
  {
    slug: "konkurransepuls-junior",
    title: "Hvordan håndtere konkurransepuls — for juniorer",
    excerpt:
      "Mange unge spillere har teknikken på plass, men taper struktur når det gjelder. Vi viser hvordan vi trener dette systematisk.",
    category: "Junior",
    author: "Anders Kristiansen",
    date: "27. mars 2026",
    readMinutes: 7,
    imageHue: 340,
  },
  {
    slug: "ny-driver-2026",
    title: "Trenger du virkelig en ny driver i 2026?",
    excerpt:
      "Vi tester de nye modellene mot 2-3 år gamle drivere. Konklusjonen er ikke det produsentene ønsker at du skal høre.",
    category: "Utstyr",
    author: "Tom Andersen",
    date: "20. mars 2026",
    readMinutes: 10,
    imageHue: 260,
  },
];

export default function BloggDemo() {
  const featured = POSTS.find((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav active="Forside" />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              AK Golf · Blogg
            </span>
            <h1 className="max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">
              Tanker, metoder og{" "}
              <em className="font-display font-normal italic [font-family:var(--font-instrument-serif),serif]">
                lærdom
              </em>{" "}
              fra coaching-hverdagen
            </h1>
            <p className="max-w-2xl text-[17px] leading-[1.6] text-muted-foreground">
              Vi deler hva vi ser når vi jobber med spillere fra første swing til
              NM-deltakelse. Skrevet av Anders, Sara og Tom — uten markedsføringsfluff.
            </p>

            <div className="mt-2 flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
              <Search
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Søk i bloggen"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
            </div>
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

      {/* Featured post */}
      {featured && (
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <Link
              href={`/akgolf-blogg-post-demo`}
              className="group grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]"
            >
              <PostImage hue={featured.imageHue} large />
              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                    Utvalgt
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {featured.category}
                  </span>
                </div>
                <h2 className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight md:text-[42px]">
                  {featured.title}
                </h2>
                <p className="text-[16px] leading-[1.6] text-muted-foreground">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {featured.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {featured.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {featured.readMinutes} min
                  </span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary group-hover:gap-2.5 transition-all">
                  Les hele saken
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid med blogg-kort */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-[28px] font-semibold tracking-tight">
              Nyere artikler
            </h2>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {rest.length} artikler
            </span>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex items-center justify-center gap-2">
            <button className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Forrige
            </button>
            <PageBtn page={1} active />
            <PageBtn page={2} />
            <PageBtn page={3} />
            <span className="px-2 text-muted-foreground">…</span>
            <PageBtn page={8} />
            <button className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Neste
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href="/akgolf-blogg-post-demo"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-sm"
    >
      <PostImage hue={post.imageHue} />
      <div className="flex flex-1 flex-col gap-3 p-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            {post.readMinutes} min
          </span>
        </div>
        <h3 className="font-display text-[20px] font-semibold leading-[1.25] tracking-tight">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-[14px] leading-[1.55] text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{post.author}</span>
          <span>{post.date}</span>
        </div>
      </div>
    </Link>
  );
}

function PostImage({ hue, large = false }: { hue: number; large?: boolean }) {
  const height = large ? "h-[420px]" : "h-52";
  return (
    <div
      className={`relative ${height} w-full overflow-hidden rounded-2xl bg-secondary`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 28% 88%) 0%, hsl(${hue} 18% 76%) 100%)`,
      }}
    >
      <div className="absolute inset-0 grid place-items-center opacity-30">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
          AK Golf · bilde
        </span>
      </div>
    </div>
  );
}

function PageBtn({ page, active = false }: { page: number; active?: boolean }) {
  return (
    <button
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
