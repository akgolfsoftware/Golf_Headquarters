/**
 * Delte primitiver for Meg-undersidene — portet fra fersk Claude Design-fasit
 * (ph-screens.jsx · MeSub/SetGroup/SetRow + playerhq.css .set-group/.set-row).
 *
 * MeSub: side-skall med eyebrow + page-title (em = primary italic) + lead.
 *   Mobil: page-pad-kolonne. Desktop: samme innhold, innhold maks 680px.
 * SetGroup: card-gruppe med avrundede hjørner og delelinjer.
 * SetRow: rad med ikon-chip (38px, secondary/primary), tittel + mono-meta, høyre-slot.
 * SetLinkRow: SetRow som <Link> med chevron — for navigerbare rader.
 *
 * Server-vennlige (ingen state). Tokens fra globals.css — ingen hardkodet hex.
 */

import { Eyebrow } from "@/components/athletic/golfdata";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function MeSub({
  eyebrow,
  title,
  italic,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    // px-1 her + px-4 i PortalShell-main = fasitens 20px side-padding på mobil
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <div className="mb-[18px]">
        <Eyebrow as="span">{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
          {title}
          {italic && (
            <>
              {" "}
              <em className="font-normal italic text-primary">{italic}</em>
            </>
          )}
        </h1>
        {lead && (
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{lead}</p>
        )}
      </div>
      <div className="max-w-[680px]">{children}</div>
    </div>
  );
}

export function SetGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-[22px]">
      {label && (
        <div className="mb-2 mt-1 flex items-baseline justify-between pt-2">
          <Eyebrow as="span">{label}</Eyebrow>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </div>
  );
}

export function SetRow({
  icon: Icon,
  title,
  meta,
  right,
}: {
  icon?: LucideIcon;
  title: string;
  meta?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-border px-[18px] py-[15px] last:border-b-0">
      {Icon && (
        <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-secondary text-primary">
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">{title}</span>
        {meta && <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{meta}</span>}
      </span>
      {right}
    </div>
  );
}

/** SetRow som lenke — samme indre struktur som SetRow, pluss hover/fokus og chevron. */
export function SetLinkRow({
  href,
  icon: Icon,
  title,
  meta,
  right,
}: {
  href: string;
  icon?: LucideIcon;
  title: string;
  meta?: string;
  right?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 border-b border-border px-[18px] py-[15px] last:border-b-0 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {Icon && (
        <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-secondary text-primary">
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">{title}</span>
        {meta && <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{meta}</span>}
      </span>
      {right}
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

/** Mono-verdi i høyre-slot (fasitens .sr-val). */
export function SetVal({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs text-muted-foreground">{children}</span>;
}
