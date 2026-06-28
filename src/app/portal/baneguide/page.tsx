/**
 * PlayerHQ Baneguide-bibliotek (/portal/baneguide) — skjerm 1 (fase 5).
 * Lyst tema. Baner med geometri + baner spilleren har spilt. Ekte data;
 * tom-tilstand når ingen baner. Skall eies av portal-layoutet.
 */
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneLibrary } from "@/lib/baneguide/queries";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticBadge } from "@/components/athletic/badge";

export const dynamic = "force-dynamic";

export default async function BaneguidePage() {
  const user = await requirePortalUser();
  const baner = await getBaneLibrary(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AthleticEyebrow>Baneguide</AthleticEyebrow>
      <h1 className="mt-1.5 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
        Banene dine
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Spredningen din på hver bane du spiller.
      </p>

      {baner.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Ingen baner ennå. Logg en runde for å komme i gang.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {baner.map((b) => (
            <li key={b.id}>
              <Link
                href={`/portal/baneguide/${b.id}`}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg font-bold text-foreground">{b.navn}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.klubb}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {b.hasGeometry ? (
                    <AthleticBadge variant="lime">{b.holesMapped} hull</AthleticBadge>
                  ) : (
                    <AthleticBadge variant="neutral">Kommer</AthleticBadge>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {b.playerRounds} runder
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
