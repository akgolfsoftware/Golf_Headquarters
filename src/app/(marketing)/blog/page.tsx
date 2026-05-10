import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog — AK Golf",
  description: "Trening, metode og innsikt for golfere som vil bli bedre.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Blog
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Trening</em> & innsikt
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Artikler om metode, AI-coaching og hvordan plattformen fungerer.
          </p>
        </header>

        <ul className="mt-16 space-y-6">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <time>{p.publishedAt}</time>
                  <span>·</span>
                  <span>{p.author}</span>
                  {p.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{p.tags.join(" / ")}</span>
                    </>
                  )}
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
                  {p.title}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {p.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  Les artikkel →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
