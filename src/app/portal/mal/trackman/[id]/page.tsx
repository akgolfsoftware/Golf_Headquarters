import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DispersionPlot } from "./dispersion-plot";

export default async function TrackManDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id },
  });
  if (!sesjon) notFound();
  if (sesjon.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    notFound();
  }

  // Hent CLUB_AVG-signals knyttet til denne sesjonen
  const signals = await prisma.signal.findMany({
    where: {
      userId: sesjon.userId,
      kind: "CLUB_AVG",
    },
    orderBy: { computedAt: "desc" },
  });

  const klubbStats = signals
    .filter((s) => {
      const p = s.payload as { sessionId?: string } | null;
      return p?.sessionId === sesjon.id;
    })
    .map((s) => {
      const p = s.payload as { klubb?: string; antallSlag?: number };
      return {
        klubb: p.klubb ?? "Ukjent",
        snittDistanse: s.value ?? 0,
        antallSlag: p.antallSlag ?? 0,
      };
    });

  const rader = Array.isArray(sesjon.rawJson)
    ? (sesjon.rawJson as Record<string, string>[])
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/portal/mal/trackman"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle TrackMan-økter
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          TrackMan · {sesjon.source}
        </span>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight">
          Økt{" "}
          {sesjon.recordedAt.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {sesjon.shotCount} slag registrert.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Slag-dispersion
        </span>
        <div className="mt-4">
          <DispersionPlot rader={rader} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Per kølle (snitt-distanse)
        </span>
        {klubbStats.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Per-kølle-statistikk beregnes når trackman-agenten kjører. Trigges
            automatisk ved CSV-import.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {klubbStats.map((s) => (
              <li
                key={s.klubb}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">{s.klubb}</span>
                  <span className="ml-3 font-mono text-[10px] text-muted-foreground">
                    {s.antallSlag} slag
                  </span>
                </div>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {s.snittDistanse.toFixed(0)} m
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
