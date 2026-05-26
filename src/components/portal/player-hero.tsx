/**
 * PlayerHero — delt hero-komponent for alle PlayerHQ-sub-sider.
 * Drop-in erstatning for PageHeader. Samme props.
 */

import { AthleticEyebrow } from "@/components/athletic";
import type { ReactNode } from "react";

export function PlayerHero({
  eyebrow,
  titleLead,
  titleItalic,
  titleTrail,
  sub,
  actions,
}: {
  eyebrow?: string;
  titleLead?: string;
  titleItalic: string;
  titleTrail?: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <header
      role="banner"
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow ? <AthleticEyebrow>{eyebrow}</AthleticEyebrow> : null}
        <h1 className="font-display mt-1.5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {titleLead ? `${titleLead} ` : ""}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            {titleItalic}
          </em>
          {titleTrail ? ` ${titleTrail}` : ""}
        </h1>
        {sub ? (
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{sub}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
