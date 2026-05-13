// Read-only barn-profil for forelder. Viser planer, økter, rating, mål, HCP.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Target, Star, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function BarnProfil({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const { childId } = await params;

  const tilhorer = await assertBarnTilhorerForelder(user.id, childId);
  if (!tilhorer) notFound();

  const barn = await prisma.user.findUnique({
    where: { id: childId },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            orderBy: { scheduledAt: "desc" },
            take: 10,
            include: { log: { select: { rating: true, completedAt: true } } },
          },
        },
      },
      goals: { where: { status: "ACTIVE" }, take: 5, orderBy: { createdAt: "desc" } },
      rounds: { orderBy: { playedAt: "desc" }, take: 10 },
    },
  });

  if (!barn || barn.role !== "PLAYER") notFound();

  const aktivPlan = barn.trainingPlans[0] ?? null;

  return (
    <div className="space-y-8">
      <Link
        href="/forelder/barn"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Mine barn
      </Link>

      <PageHeader
        eyebrow="Foreldreportal · Profil"
        titleLead={barn.name.split(" ")[0] ?? barn.name}
        titleItalic={barn.name.split(" ").slice(1).join(" ") || "profil"}
        sub={`HCP ${barn.hcp ?? "—"} · ${barn.homeClub ?? "Ingen hjemmeklubb"}`}
      />

      {/* Aktiv plan */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            Aktiv plan
          </h2>
        </div>
        {!aktivPlan ? (
          <div className="px-6 py-6 text-sm text-muted-foreground">Ingen aktiv plan.</div>
        ) : (
          <div className="px-6 py-4">
            <div className="font-display text-lg font-semibold">{aktivPlan.name}</div>
            <ul className="mt-4 divide-y divide-border">
              {aktivPlan.sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {NB_DATO.format(s.scheduledAt)} · {s.pyramidArea} · {s.status}
                    </div>
                  </div>
                  {s.log?.rating != null ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {s.log.rating}/5
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Mål */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Target className="h-3 w-3" strokeWidth={1.5} />
            Aktive mål
          </h2>
        </div>
        {barn.goals.length === 0 ? (
          <div className="px-6 py-6 text-sm text-muted-foreground">Ingen mål satt.</div>
        ) : (
          <ul className="divide-y divide-border">
            {barn.goals.map((g) => (
              <li key={g.id} className="px-6 py-3 text-sm">
                <div className="font-semibold">{g.title}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {g.type}
                  {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* HCP-historikk fra runder */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            Siste runder
          </h2>
        </div>
        {barn.rounds.length === 0 ? (
          <div className="px-6 py-6 text-sm text-muted-foreground">Ingen runder registrert.</div>
        ) : (
          <ul className="divide-y divide-border">
            {barn.rounds.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <div className="font-semibold">{NB_DATO.format(r.playedAt)}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  Score {r.score}
                  {r.sgTotal != null ? ` · SG ${r.sgTotal.toFixed(1)}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
