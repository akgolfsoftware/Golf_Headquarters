import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { POSTS } from "../posts";

const DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Innlegg ikke funnet" };
  return {
    title: `${post.tittel} | AK Golf Academy`,
    description: post.ingress,
  };
}

export default async function BloggPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
          <Image
            src={post.bilde}
            alt={post.tittel}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        </div>
        <div className="mx-auto max-w-3xl px-6 -mt-28 relative">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
            <Link
              href="/blogg"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Tilbake til blogg
            </Link>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {post.tittel}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {DATO_FORMAT.format(new Date(post.dato))}
              </span>
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4" aria-hidden="true" />
                {post.forfatter}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-foreground">
          <p className="font-display text-xl text-muted-foreground md:italic">
            {post.ingress}
          </p>
          {post.innhold.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Les flere innlegg
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tanker fra coachene om trening, struktur og hva som faktisk
            flytter scoren.
          </p>
          <Link
            href="/blogg"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 font-display text-sm font-semibold tracking-[-0.005em] text-primary ring-1 ring-inset ring-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Til oversikten
          </Link>
        </div>
      </section>
    </div>
  );
}
