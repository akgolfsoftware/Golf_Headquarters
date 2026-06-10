/**
 * ForelderHjem — Foreldreportal · "Mine barn"-oversikt (presentasjonell).
 *
 * Mobil-først, selvstendig layout (INGEN player/coach-sidebar). Sentrert
 * smal kolonne på desktop. Header-blokk (eyebrow + display-headline med
 * italic primary + helper) venstrejustert, etterfulgt av enten:
 *   - tom-tilstand (stiplet kort, person-ikon, melding) når `barn` er tom, eller
 *   - liste over barn-kort som lenker til hvert barns profil.
 *
 * Props-drevet: ingen Prisma/DB/auth. Pixel-fasit:
 * public/design-handover/_screens/fo-barn.png (tom-tilstand).
 *
 * DS-tokens (bg, text, border) + lucide-ikoner. Ingen hex, ingen emoji.
 */

import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

export type ForelderBarn = {
  id: string;
  /** Visningsnavn, f.eks. "Øyvind Rohjan". Fornavnet rendres i italic primary. */
  navn: string;
  /** Relasjon + HCP-linje, f.eks. "Sønn · HCP 12,4". */
  meta: string;
};

export type ForelderHjemData = {
  eyebrow: string;
  /** Tekst før den italic-pregede delen, f.eks. "Mine". */
  titleLead: string;
  /** Italic primary-del, f.eks. "barn". */
  titleItalic: string;
  helper: string;
  /** Tomt array → tom-tilstand (fasit). Ellers liste med barn-kort. */
  barn: ForelderBarn[];
  /** Tom-tilstand tekster. */
  emptyTitle: string;
  emptyBody: string;
};

export function ForelderHjem({ data }: { data: ForelderHjemData }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[560px] px-6 pb-24 pt-12 md:pt-16">
        {/* ── Header ───────────────────────────────────────────── */}
        <header>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {data.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.05] -tracking-[0.025em] text-foreground">
            {data.titleLead}{" "}
            <em className="font-normal italic text-primary">{data.titleItalic}</em>
          </h1>
          <p className="mt-3 font-sans text-[17px] leading-[1.5] text-muted-foreground">
            {data.helper}
          </p>
        </header>

        {/* ── Innhold: tom-tilstand eller liste ────────────────── */}
        {data.barn.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <span className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full bg-secondary text-muted-foreground">
              <UserRound className="h-8 w-8" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="mt-6 font-display text-[22px] font-bold -tracking-[0.01em] text-foreground">
              {data.emptyTitle}
            </p>
            <p className="mx-auto mt-2 max-w-[420px] font-sans text-[17px] leading-[1.5] text-muted-foreground">
              {data.emptyBody}
            </p>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {data.barn.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/forelder/barn/${b.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-[20px] font-semibold text-primary-foreground"
                  >
                    {b.navn.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {b.meta}
                    </div>
                    <h2 className="mt-0.5 truncate font-display text-[19px] font-semibold -tracking-[0.01em] text-foreground">
                      <em className="font-normal italic text-primary">
                        {b.navn.split(" ")[0]}
                      </em>
                      {b.navn.split(" ").slice(1).join(" ")
                        ? ` ${b.navn.split(" ").slice(1).join(" ")}`
                        : ""}
                    </h2>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
