import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — AK Golf`,
    description: post.description,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.body);

  return (
    <article className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Alle artikler
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <time>{post.publishedAt}</time>
            <span>·</span>
            <span>{post.author}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
        </header>

        <div
          className="mt-12 space-y-5 text-base leading-relaxed text-foreground [&_h1]:mt-12 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mb-1 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:space-y-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            <em className="font-normal text-primary md:italic">Klar</em> for å prøve?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Lag konto på 30 sekunder. Gratis å starte.
          </p>
          <Link
            href="/auth/signup"
            className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Kom i gang →
          </Link>
        </footer>
      </div>
    </article>
  );
}
