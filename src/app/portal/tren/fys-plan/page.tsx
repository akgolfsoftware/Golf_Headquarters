/**
 * FYS-plan — plan-liste (PlayerHQ).
 *
 * Viser aktive og arkiverte fysiske treningsplaner i 2-kolonners grid.
 * Per plan Del 31 (FYS-plan modul, 2026-05-24).
 */

import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FysPlanCard } from "@/components/fys-plan";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function FysPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const planer = await prisma.fysiskPlan.findMany({
    where: { userId: user.id },
    orderBy: { startDato: "desc" },
    include: {
      uker: {
        select: {
          id: true,
          okter: { select: { id: true } },
        },
      },
    },
  });

  const enriched = planer.map((p) => ({
    id: p.id,
    navn: p.navn,
    status: p.status,
    startDato: p.startDato,
    sluttDato: p.sluttDato,
    ukerCount: p.uker.length,
    okterCount: p.uker.reduce((s, u) => s + u.okter.length, 0),
  }));

  const aktive = enriched.filter((p) => p.status !== "ARCHIVED");
  const arkiverte = enriched.filter((p) => p.status === "ARCHIVED");

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Tren · Fysisk plan
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl">
            Fysiske treningsplaner
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Periodiserte planer for styrke og kondisjon. Gruppert per uke med
            økter, øvelser og logging av sett/reps/belastning.
          </p>
        </div>
        <Link
          href="/portal/tren/fys-plan/ny"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden />
          Ny plan
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Aktive · {aktive.length}
        </h2>
        {aktive.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            titleItalic="Ingen aktiv plan"
            titleTrail="enda."
            sub="Lag din første fysiske treningsplan for å begynne å logge styrke- og kondisjonsøkter."
            cta={
              <Link
                href="/portal/tren/fys-plan/ny"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus size={16} strokeWidth={1.75} aria-hidden />
                Lag din første plan
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {aktive.map((p) => (
              <FysPlanCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>

      {arkiverte.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Arkiverte · {arkiverte.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {arkiverte.map((p) => (
              <FysPlanCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
