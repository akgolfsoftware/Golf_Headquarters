/**
 * v10 Narrative Insight Card — portert fra components-insight-narrative.html.
 *
 * 7-del anatomi: strip · kicker · tittel · lede · pivots · rec-block · footnote.
 * Kun props — ingen DB-kall. Mapper bor i analysere-data.ts.
 */
import { Bookmark, Database, Lightbulb, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

export type NarrativePivot = {
  label: string;
  value: string;
  ctx: string;
  tone?: "pos" | "neg" | null;
};

export type NarrativeRec = {
  eyebrow?: string;
  text: string;
  icon?: "lightbulb" | "hourglass";
};

export type InsightNarrativeCardProps = {
  strip: "lime" | "pos" | "neg" | "warn" | "low";
  kicker: string;
  title: string;
  lede: string;
  pivots?: NarrativePivot[];
  reason?: string;
  rec?: NarrativeRec;
  footnote?: string;
  className?: string;
};

const STRIP_BG: Record<InsightNarrativeCardProps["strip"], string> = {
  lime: "bg-accent",
  pos: "bg-success",
  neg: "bg-destructive",
  warn: "bg-warning",
  low: "bg-border",
};

export function InsightNarrativeCard({
  strip,
  kicker,
  title,
  lede,
  pivots,
  reason,
  rec,
  footnote,
  className,
}: InsightNarrativeCardProps) {
  const isLow = strip === "low";

  // Rec-block styling: lav konfidens = lys sekundær bakgrunn, ellers mørk primary
  const recBg = isLow ? "bg-secondary" : "bg-primary";
  const recTextColor = isLow ? "text-foreground" : "text-primary-foreground";
  const recEyebrowColor = isLow ? "text-primary" : "text-accent";
  const RecIcon =
    rec?.icon === "hourglass" || isLow ? Hourglass : Lightbulb;
  const recEyebrow = rec?.eyebrow ?? (isLow ? "VENT MED HANDLING" : "ANBEFALING");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-border bg-card p-5 pl-6",
        className,
      )}
    >
      {/* 1. Strip — 4px venstrelist */}
      <div
        className={cn("absolute left-0 top-0 h-full w-1", STRIP_BG[strip])}
        aria-hidden
      />

      {/* 2. Kicker + bokmerke */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {kicker}
        </span>
        <Bookmark
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      {/* 3. Tittel */}
      <h2
        className={cn(
          "mt-3 font-display text-[17px] font-bold leading-snug tracking-[-0.02em]",
          isLow ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>

      {/* 4. Lede */}
      <p
        className={cn(
          "mt-2.5 text-[13px] leading-relaxed",
          isLow ? "text-muted-foreground/80" : "text-muted-foreground",
        )}
      >
        {lede}
      </p>

      {/* 5. Pivots — 2-kol grid med tall + kontekst */}
      {pivots && pivots.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {pivots.map((p, i) => (
            <div key={i} className="rounded-[10px] bg-secondary p-3">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {p.label}
              </span>
              <span
                className={cn(
                  "mt-1 block font-mono text-xl font-semibold leading-none tracking-[-0.02em]",
                  p.tone === "neg"
                    ? "text-destructive"
                    : p.tone === "pos"
                      ? "text-success"
                      : "text-foreground",
                )}
              >
                {p.value}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                {p.ctx}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 6. Reason (valgfri) */}
      {reason && (
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Hvorfor: </span>
          {reason}
        </p>
      )}

      {/* 7. Rec-block */}
      {rec && (
        <div
          className={cn(
            "mt-4 flex items-start gap-3 rounded-[10px] p-3.5",
            recBg,
          )}
        >
          <RecIcon
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              isLow ? "text-primary" : "text-accent",
            )}
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0">
            <div
              className={cn(
                "font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
                recEyebrowColor,
              )}
            >
              {recEyebrow}
            </div>
            <div
              className={cn("mt-1 text-[13px] leading-relaxed", recTextColor)}
            >
              {rec.text}
            </div>
          </div>
        </div>
      )}

      {/* 8. Footnote */}
      {footnote && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70">
          <Database className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{footnote}</span>
        </div>
      )}
    </div>
  );
}
