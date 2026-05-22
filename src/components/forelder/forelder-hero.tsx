/**
 * ForelderHero — delt hero-komponent for alle foreldreportal-sider.
 * Matcher PlayerHQ Oversikt-mønsteret (avatar venstre + Inter Tight + Instrument Serif italic).
 */

import { AthleticAvatar, AthleticEyebrow } from "@/components/athletic";
import type { ReactNode } from "react";

export function ForelderHero({
  eyebrow,
  titleLead,
  titleItalic,
  titleTrail,
  sub,
  avatarUrl,
  avatarInitials,
  actions,
}: {
  eyebrow: string;
  titleLead?: string;
  titleItalic: string;
  titleTrail?: string;
  sub?: string;
  avatarUrl?: string | null;
  avatarInitials?: string;
  actions?: ReactNode;
}) {
  return (
    <section>
      <AthleticEyebrow>{eyebrow}</AthleticEyebrow>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {avatarInitials || avatarUrl ? (
          <AthleticAvatar
            src={avatarUrl ?? undefined}
            initials={avatarInitials ?? "??"}
            size="xl"
            borderColor="white"
            className="shadow-[0_8px_24px_rgba(0,88,64,0.18)]"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {titleLead ? `${titleLead} ` : ""}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              {titleItalic}
            </em>
            {titleTrail ? ` ${titleTrail}` : ""}
          </h1>
          {sub ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
