"use client";

/**
 * HjelpSearch — interaktivt søkefelt med filter mot artikkel-liste.
 *
 * Lokal state, ingen server-roundtrip. Designet matchet mot
 * wireframe/design-files-v2/final/11-hjelp.html (search-big + suggested).
 */

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

export type HelpArticle = {
  id: string;
  title: string;
  category: string;
  readMin: number;
  snippet: string;
};

const SUGGESTED = ["Logg runde", "Pyramide", "Oppgrader til Pro", "Bytt coach"];

export function HjelpSearch({ articles }: { articles: ReadonlyArray<HelpArticle> }) {
  const [query, setQuery] = useState("");

  const results = useMemo<ReadonlyArray<HelpArticle>>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [query, articles]);

  const hasQuery = query.trim().length > 0;
  const showResults = query.trim().length >= 2;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto w-full max-w-xl">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk hjelp-artikler eller skriv et spørsmål…"
          aria-label="Søk hjelp-artikler"
          className="w-full rounded-lg border border-input bg-card px-4 py-4 pl-12 pr-12 text-[15px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Tøm søk"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {!hasQuery && (
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTED.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setQuery(label)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] text-foreground hover:border-primary hover:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <section
          aria-label={`Søkeresultater for ${query}`}
          className="mx-auto w-full max-w-2xl"
        >
          <div className="mb-2 flex items-baseline justify-between px-2">
            <h2 className="font-display text-lg font-semibold italic text-foreground">
              Søkeresultater
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {results.length} treff
            </span>
          </div>
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ingen treff på «{query}». Prøv et annet ord eller kontakt support.
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-card">
              {results.map((article) => (
                <li key={article.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`#${article.id}`}
                    className="block px-6 py-4 hover:bg-secondary"
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {article.title}
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                      {article.snippet}
                    </p>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {article.category} · {article.readMin} min
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
