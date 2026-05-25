import { ArrowRight } from "lucide-react";
import Link from "next/link";

export type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Label for optional CTA link button */
  cta?: string;
  /** Href for CTA button */
  ctaHref?: string;
  /** Large ghost number shown decoratively in top-right */
  ghostNum?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
  ctaHref = "#",
  ghostNum,
}: SectionHeaderProps) {
  return (
    <header className="relative flex flex-col gap-2 mb-4">
      {ghostNum && (
        <span
          aria-hidden
          className="absolute right-0 font-display italic font-bold leading-none pointer-events-none select-none"
          style={{
            top: -16,
            fontSize: 96,
            color: "color-mix(in oklab, var(--foreground) 5%, transparent)",
          }}
        >
          {ghostNum}
        </span>
      )}

      <div className="flex flex-col gap-2 relative">
        <span className="eyebrow eyebrow-w-strek">{eyebrow}</span>
        <h2
          className="m-0 font-display font-bold tracking-[-0.02em] text-foreground"
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            textWrap: "balance",
          } as React.CSSProperties}
        >
          {title}
        </h2>
        {description && (
          <p className="m-0 text-[14px] text-muted-foreground max-w-[60ch]">
            {description}
          </p>
        )}
      </div>

      {cta && (
        <Link
          href={ctaHref}
          className="absolute right-0 bottom-0 inline-flex items-center gap-[6px] px-[14px] py-2 rounded-full border border-border font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground no-underline"
          style={{ background: "var(--card)" }}
        >
          {cta} <ArrowRight size={14} />
        </Link>
      )}
    </header>
  );
}
