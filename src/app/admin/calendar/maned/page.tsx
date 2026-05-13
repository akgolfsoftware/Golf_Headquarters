/**
 * CoachHQ — Kalender (måneds-vy).
 *
 * Stub-side inntil maaneds-vyen bygges i v2. Lenker tilbake til uke-vyen.
 */

import Link from "next/link";
import { ArrowLeft, CalendarRange } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

const ICON_STROKE = 1.75;

export default async function KalenderManedPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="flex flex-col gap-8 px-6 py-8 md:px-10 md:py-10">
      <PageHeader
        eyebrow="Kalender · Måned"
        titleLead="En"
        titleItalic="måned"
        titleTrail="om gangen."
        sub="Måneds-vyen kommer i v2. Bruk uke-vyen i mellomtiden."
      />

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground">
          <CalendarRange className="h-5 w-5" strokeWidth={ICON_STROKE} aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-normal italic leading-tight tracking-[-0.01em] text-foreground">
            Måneds-vy kommer i v2
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            Inntil videre planlegger vi i uke-vyen. Du kan bla mellom uker
            der og se hele måneden som sammenheng.
          </p>
        </div>
        <Link
          href="/admin/calendar"
          className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          Tilbake til uke-vy
        </Link>
      </div>
    </div>
  );
}
