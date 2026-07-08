/**
 * ForelderHero — delt hero-komponent for alle foreldreportal-sider.
 * Matcher PlayerHQ Oversikt-mønsteret (avatar venstre + Familjen Grotesk + Familjen Grotesk italic).
 */

import { Eyebrow, Avatar } from "@/components/athletic/golfdata";
import Link from "next/link";
import { Camera } from "lucide-react";
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
      <Eyebrow as="span">{eyebrow}</Eyebrow>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {avatarInitials || avatarUrl ? (
          <Link
            href="/forelder/innstillinger"
            aria-label="Endre profilbilde"
            className="group relative inline-block"
          >
            <Avatar
              src={avatarUrl ?? undefined}
              name={avatarInitials ?? "??"}
              size="xl"
              className="shadow-[0_8px_24px_rgba(0,88,64,0.18)] transition group-hover:shadow-[0_8px_32px_rgba(0,88,64,0.28)]"
            />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/0 text-white opacity-0 transition group-hover:bg-primary/60 group-hover:opacity-100"
            >
              <Camera className="h-6 w-6" strokeWidth={1.75} />
            </span>
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {titleLead ? `${titleLead} ` : ""}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "var(--font-familjen-grotesk), sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
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
