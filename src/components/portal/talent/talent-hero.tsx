/**
 * Felles hero for PlayerHQ Talent-sider.
 * Eyebrow + italic-tittel (Familjen Grotesk) + lead-tekst.
 */

import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  italic: string;
  rest?: string;
  lead?: string;
  right?: ReactNode;
};

export function TalentHero({ eyebrow, italic, rest, lead, right }: Props) {
  return (
    <header className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="mt-2 font-display text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl">
          <em className="italic text-primary">{italic}</em>
          {rest ? <span> {rest}</span> : null}
        </h1>
        {lead ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {lead}
          </p>
        ) : null}
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>
  );
}
