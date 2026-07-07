import type { Metadata } from "next";
import { Search } from "lucide-react";
import {
  Em,
  SectionEyebrow,
} from "@/components/marketing/marketing-sections";
import { POSTS } from "./posts";
import { BloggListe, type PostWithMeta } from "./blogg-liste";

export const metadata: Metadata = {
  title: "Blogg fra AK Golf Academy",
  description:
    "Tanker, metoder og lærdom fra coaching-hverdagen i AK Golf Academy.",
};

// Avledet metadata per post (uten å endre BlogPost-modellen)
type PostMeta = { category: string; readMinutes: number; featured: boolean };

const META: Record<string, PostMeta> = {
  "hvorfor-struktur-slar-talent": {
    category: "Coaching",
    readMinutes: 7,
    featured: true,
  },
  "naerspill-er-hvor-runden-vinnes": {
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

export default function BloggSide() {
  const posts: PostWithMeta[] = [...POSTS]
    .sort((a, b) => b.dato.localeCompare(a.dato))
    .map((p) => ({ ...p, ...metaFor(p.slug) }));

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 md:py-24">
          <div className="flex flex-col items-start gap-6">
            <SectionEyebrow>Blogg · AK Golf Academy</SectionEyebrow>
            <h1 className="max-w-[22ch] text-balance font-display text-[clamp(36px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.025em]">
              Tanker, metoder og <Em>lærdom</Em> fra coaching-hverdagen
            </h1>
            <p className="max-w-2xl text-[17px] leading-[1.6] text-muted-foreground">
              Innsikt fra treningshverdagen, analyse av norsk og internasjonal
              golf, og konkrete råd du faktisk kan bruke. Skrevet av coachene i
              AK Golf Academy.
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
                className="w-full bg-transparent text-[14px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
              />
            </form>
          </div>
        </div>
      </section>

      <BloggListe posts={posts} />
    </div>
  );
}
