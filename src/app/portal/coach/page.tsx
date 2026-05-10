import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachOversikt() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return <Paywall />;
  }

  const [coacher, mineSesjoner] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COACH" },
      select: { id: true, name: true, email: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.coachingSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Bli kjent med din coach
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pro-medlemmer kan chatte med AI-coach 24/7 og kontakte tilknyttet
          coach for direkte feedback.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/portal/coach/ai"
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              AI-coach
            </span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              24/7
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold leading-tight">
            Spør om hva som helst
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Personlig analyse basert på din profil, plan og siste runder.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
            Start samtale →
          </span>
        </Link>

        {coacher.length > 0 ? (
          <Link
            href={`/portal/coach/${coacher[0].id}`}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Direkte coach
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold leading-tight">
              {coacher[0].name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{coacher[0].email}</p>
            <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
              Se profil →
            </span>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Direkte coach
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Ingen coacher er registrert i plattformen ennå.
            </p>
          </div>
        )}
      </section>

      {mineSesjoner.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste samtaler
          </h3>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {mineSesjoner.map((s) => {
              const meldinger = Array.isArray(s.messages) ? s.messages.length : 0;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {s.kind === "AI" ? "AI-coach" : "Direkte"}
                    </span>
                    <span className="ml-3 text-muted-foreground">
                      {meldinger} meldinger
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {s.updatedAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Paywall() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Pro-funksjon
      </span>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
        Få en <em className="font-normal text-primary md:italic">personlig coach</em>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
        AI-coach 24/7, direkte kontakt med tilknyttet coach, og full innsikt i
        plan og fremgang. Alt for 300 kr/mnd.
      </p>
      <Link
        href="/portal/meg/abonnement"
        className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Oppgrader til Pro
      </Link>
    </div>
  );
}
