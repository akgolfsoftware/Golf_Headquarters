import Link from "next/link";
import { ArrowUpRight, MessageSquare, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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

  const hovedcoach = coacher[0];
  const andreCoacher = coacher.slice(1);
  const aiSesjoner = mineSesjoner.filter((s) => s.kind === "AI").length;
  const directSesjoner = mineSesjoner.filter((s) => s.kind === "DIRECT").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Coach"
        titleLead="Bli kjent med din"
        titleItalic="coach"
        sub="Pro-medlemmer kan chatte med AI-coach 24/7 og kontakte tilknyttet coach for direkte feedback."
      />

      {/* To-kolonne hovedkort: AI + Hovedcoach */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/portal/coach/ai"
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <Sparkles size={12} strokeWidth={1.5} className="text-accent-foreground" />
              AI-coach
            </span>
            <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              24/7
            </span>
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
            Spør om <em className="font-normal italic text-primary">hva som helst</em>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Personlig analyse basert på din profil, plan og siste runder.
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
            Start samtale
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </span>
        </Link>

        {hovedcoach ? (
          <Link
            href={`/portal/coach/${hovedcoach.id}`}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-mono text-base font-semibold text-primary-foreground">
                {hovedcoach.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Din coach
                </span>
                <h3 className="mt-1 truncate font-display text-lg font-semibold leading-tight">
                  {hovedcoach.name}
                </h3>
              </div>
            </div>
            <p className="mt-4 truncate text-sm text-muted-foreground">
              {hovedcoach.email}
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              Se profil
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </span>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Direkte coach
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              Ingen coacher er registrert i plattformen enda.
            </p>
          </div>
        )}
      </section>

      {/* Stat-pills */}
      {(aiSesjoner > 0 || directSesjoner > 0) && (
        <section className="flex flex-wrap gap-2">
          {aiSesjoner > 0 && (
            <StatPill label={`${aiSesjoner} AI-samtaler`} />
          )}
          {directSesjoner > 0 && (
            <StatPill label={`${directSesjoner} direkte tråder`} />
          )}
        </section>
      )}

      {/* Andre coacher */}
      {andreCoacher.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users size={14} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Andre coacher du har tilgang til
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {andreCoacher.map((c) => (
              <Link
                key={c.id}
                href={`/portal/coach/${c.id}`}
                className="group flex items-center gap-4 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-mono text-sm font-semibold text-foreground">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold leading-none">
                    {c.name}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-muted-foreground">
                    {c.email}
                  </div>
                </div>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Siste samtaler */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare size={14} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste samtaler
          </span>
        </div>
        {mineSesjoner.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            titleItalic="Ingen samtaler"
            titleTrail="enda"
            sub="Start en AI-samtale eller send melding til coachen din."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {mineSesjoner.map((s) => {
              const meldinger = Array.isArray(s.messages) ? s.messages.length : 0;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between px-4 py-4 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {s.kind === "AI" ? "AI-coach" : "Direkte"}
                    </span>
                    <span className="ml-4 text-muted-foreground">
                      {meldinger} meldinger
                    </span>
                  </div>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {s.updatedAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-1 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

function Paywall() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Coach"
        titleLead="Få en"
        titleItalic="personlig coach"
        sub="AI-coach 24/7, direkte kontakt med tilknyttet coach, og full innsikt i plan og fremgang. Alt for 300 kr/mnd."
      />
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro-funksjon
        </span>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Oppgrader for å chatte med AI-coach, sende meldinger til coachen
          din og motta planer og notater.
        </p>
        <Link
          href="/portal/meg/abonnement"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Oppgrader til Pro
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
