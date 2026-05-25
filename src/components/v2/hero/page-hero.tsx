"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type PageHeroProps = {
  /** Eyebrow text above title */
  eyebrow: string;
  /** Main title */
  title: string;
  /** Italic accent portion appended after title */
  italic?: string;
  /** Lead paragraph */
  lead?: string;
  /** Breadcrumb label shown above eyebrow */
  crumb?: string;
  /** Breadcrumb href */
  crumbHref?: string;
};

export default function PageHero({
  eyebrow,
  title,
  italic,
  lead,
  crumb,
  crumbHref = "/",
}: PageHeroProps) {
  return (
    <header className="flex flex-col gap-2 mb-8">
      {crumb && (
        <Link
          href={crumbHref}
          className="inline-flex items-center gap-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground self-start"
        >
          <ChevronLeft size={12} strokeWidth={2.5} /> {crumb}
        </Link>
      )}

      <span className="eyebrow eyebrow-w-strek">{eyebrow}</span>

      <h1
        className="m-0 font-display font-bold leading-[0.95] tracking-[-0.03em]"
        style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
      >
        {title}
        {italic && (
          <>
            {" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              {italic}
            </span>
          </>
        )}
      </h1>

      {lead && (
        <p className="m-0 text-[15px] text-muted-foreground max-w-[62ch]">
          {lead}
        </p>
      )}
    </header>
  );
}
