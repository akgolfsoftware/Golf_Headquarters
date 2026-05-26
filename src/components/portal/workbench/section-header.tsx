/**
 * SectionHeader — editorial section divider for Player Workbench.
 *
 * Athletic editorial-stil med stor eyebrow + tittel + valgfri CTA-lenke
 * og en subtil lime accent-strek. Gir luksuriøs rytme mellom seksjoner.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {/* Eyebrow med lime accent-strek */}
        <div className="flex items-center gap-2.5">
          <span className="h-px w-8 bg-accent" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        </div>
        {/* Tittel */}
        <h2 className="font-display text-2xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {cta && (
        <Link
          href={cta.href}
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground transition hover:border-foreground/20 hover:bg-secondary sm:self-end"
        >
          {cta.label}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      )}
    </header>
  );
}
