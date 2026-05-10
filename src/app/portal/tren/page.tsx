import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  formatPeriode,
  ukenummer,
  sammeDag,
} from "@/lib/uke-helpers";
import { UkeStripe } from "@/components/portal/uke-stripe";
import { SesjonDetalj } from "@/components/portal/sesjon-detalj";

type Search = { dato?: string };

export default async function TrenPlan({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  const valgtDato = params.dato ? new Date(params.dato) : new Date();
  const ukestart = startOfWeek(valgtDato);
  const ukeslutt = endOfWeek(valgtDato);

  const aktivePlaner = await prisma.trainingPlan.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true, name: true },
  });
  const planIds = aktivePlaner.map((p) => p.id);

  const sessions = planIds.length
    ? await prisma.trainingPlanSession.findMany({
        where: {
          planId: { in: planIds },
          scheduledAt: { gte: ukestart, lt: ukeslutt },
        },
        include: { drills: { include: { exercise: true } } },
        orderBy: { scheduledAt: "asc" },
      })
    : [];

  const dagensSesjoner = sessions.filter((s) =>
    sammeDag(new Date(s.scheduledAt), valgtDato)
  );

  const forrigeUke = new Date(ukestart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukestart);
  nesteUke.setDate(nesteUke.getDate() + 7);

  const kanStarte = user.tier !== "GRATIS";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            {aktivePlaner.length > 0 ? aktivePlaner[0].name : "Min plan"}
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Uke {ukenummer(ukestart)} · {formatPeriode(ukestart, ukeslutt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/portal/tren?dato=${forrigeUke.toISOString().split("T")[0]}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground hover:border-border"
          >
            ← Forrige
          </Link>
          <Link
            href="/portal/tren"
            className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground hover:border-border"
          >
            I dag
          </Link>
          <Link
            href={`/portal/tren?dato=${nesteUke.toISOString().split("T")[0]}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground hover:border-border"
          >
            Neste →
          </Link>
        </div>
      </div>

      <UkeStripe
        ukestart={ukestart}
        sessions={sessions}
        valgtDato={valgtDato}
        bygglenke={(dato) =>
          `/portal/tren?dato=${dato.toISOString().split("T")[0]}`
        }
      />

      {aktivePlaner.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Du har ingen aktiv treningsplan ennå.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Opprett en økt via «Ny økt»-wizard eller bli tildelt en plan av coach.
          </p>
        </div>
      ) : dagensSesjoner.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen økt planlagt {sammeDag(valgtDato, new Date()) ? "i dag" : "denne dagen"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dagensSesjoner.map((s) => (
            <SesjonDetalj
              key={s.id}
              session={s}
              drills={s.drills}
              kanStarte={kanStarte}
            />
          ))}
        </div>
      )}
    </div>
  );
}
