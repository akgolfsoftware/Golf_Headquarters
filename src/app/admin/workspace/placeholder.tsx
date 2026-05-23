/**
 * <WorkspacePlaceholder> — felles placeholder-card for Workspace-ruter
 * mens Claude Design lager pixel-perfekt design.
 *
 * Erstattes 1:1 av faktiske komponenter etter design-runden.
 */

import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function WorkspacePlaceholder({
  title,
  description,
  nextSteps,
  cta,
}: {
  title: string;
  description: string;
  nextSteps: string[];
  cta?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            DESIGN PÅ VEI · CLAUDE DESIGN
          </div>
          <h2
            className="font-display mt-1 text-xl font-semibold tracking-tight"
            style={{ fontStyle: "italic" }}
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              NESTE STEG
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                    {i + 1}.
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {cta ? <div className="mt-5">{cta}</div> : null}
        </div>
      </div>
    </div>
  );
}
