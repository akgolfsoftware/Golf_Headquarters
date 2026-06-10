/**
 * /admin/teknisk-plan — Oversikt over tekniske planer per spiller
 *
 * Viser alle PLAYER-brukere med status for teknisk plan,
 * samt maler som kan brukes som utgangspunkt.
 */
import Link from "next/link";
import { ChevronRight, ClipboardList, Plus, Settings2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function TekniskPlanOversikt() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, maler] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        hcp: true,
        homeClub: true,
        avatarUrl: true,
        trainingPlans: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            sessions: {
              where: { pyramidArea: "TEK" },
              select: { id: true, status: true, durationMin: true },
            },
          },
          take: 1,
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.planTemplate.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Verktøy"
        titleItalic="Teknisk Plan"
        sub={`${spillere.length} spillere · ${maler.length} maler tilgjengelig`}
        actions={
          <Link
            href="/admin/plans/templates/ny"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={14} strokeWidth={1.5} />
            Ny teknisk plan-mal
          </Link>
        }
      />

      {/* Aktive planer per spiller */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Aktive planer per spiller · {spillere.length} spillere
          </h2>
        </div>

        {spillere.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            titleItalic="Ingen spillere"
            titleTrail="registrert"
            sub="Opprett spillere under Elever for å komme i gang."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Spiller</th>
                  <th className="px-4 py-4 font-medium">Aktiv plan</th>
                  <th className="px-4 py-4 text-right font-medium">TEK-økter</th>
                  <th className="px-4 py-4 text-right font-medium">TEK fullført</th>
                  <th className="px-6 py-4 font-medium">Handling</th>
                </tr>
              </thead>
              <tbody>
                {spillere.map((s) => {
                  const aktivPlan = s.trainingPlans[0] ?? null;
                  const tekOkter = aktivPlan?.sessions ?? [];
                  const tekTotalt = tekOkter.length;
                  const tekFullfort = tekOkter.filter(
                    (o) => o.status === "COMPLETED"
                  ).length;
                  const tekTid = tekOkter.reduce(
                    (sum, o) => sum + o.durationMin,
                    0
                  );

                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 hover:bg-secondary/40"
                    >
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-semibold leading-tight text-foreground">
                          {s.name}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          HCP {s.hcp?.toFixed(1).replace(".", ",") ?? "—"}
                          {s.homeClub ? ` · ${s.homeClub}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {aktivPlan ? (
                          <div>
                            <Link
                              href={`/admin/plans/${aktivPlan.id}`}
                              className="text-[12px] font-medium text-foreground hover:text-primary"
                            >
                              {aktivPlan.name}
                            </Link>
                            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {aktivPlan.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">
                            Ingen aktiv plan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-mono text-[13px] tabular-nums text-foreground">
                          {tekTotalt}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {(tekTid / 60).toFixed(1).replace(".", ",")} t
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div
                          className={`font-mono text-[13px] tabular-nums ${
                            tekTotalt > 0 && tekFullfort / tekTotalt >= 0.75
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {tekTotalt > 0
                            ? `${Math.round((tekFullfort / tekTotalt) * 100)}%`
                            : "—"}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {tekFullfort}/{tekTotalt}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/teknisk-plan/${s.id}`}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                        >
                          Teknisk plan
                          <ChevronRight size={12} strokeWidth={1.5} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Maler */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Maler · {maler.length}
          </h2>
          <Link
            href="/admin/plans/templates"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Se alle plan-maler
          </Link>
        </div>

        {maler.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Settings2 size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-muted-foreground">
              Ingen plan-maler ennå.
            </p>
            <Link
              href="/admin/plans/templates/ny"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={14} strokeWidth={1.5} />
              Ny teknisk plan-mal
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maler.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">
                      {m.name}
                    </div>
                    {m.description && (
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {m.description}
                      </p>
                    )}
                    <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {m.varighetUker} uker
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/plans/templates`}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                  >
                    Bruk mal
                    <ChevronRight size={12} strokeWidth={1.5} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
