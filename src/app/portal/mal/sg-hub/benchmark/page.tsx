/**
 * PlayerHQ · SG-Hub · Benchmark vs Team Norway / PGA Tour
 *
 * Strokes Gained er Tour-relativt: midtlinjen (0) = PGA Tour-snitt.
 * Viser spillerens snitt-SG per område (OTT/APP/ARG/PUTT) mot Tour-baseline,
 * fra ekte Round-data via aggregateSg.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg } from "@/lib/sg";

export const dynamic = "force-dynamic";

export default async function BenchmarkPage() {
  const user = await requirePortalUser();

  const rounds = await prisma.round.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "desc" },
    take: 20,
  });

  const sg = aggregateSg(rounds);
  const harData = sg.rundeAntall > 0;

  const omrader = [
    { label: "OTT", value: sg.ott },
    { label: "Approach", value: sg.app },
    { label: "ARG", value: sg.arg },
    { label: "Putting", value: sg.putt },
  ];
  const verdier = omrader.map((o) => o.value).filter((v): v is number => v != null);
  const maxAbs = Math.max(2, ...verdier.map((v) => Math.ceil(Math.abs(v))));

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      {/* Back link */}
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG-Hub
      </Link>

      {/* Editorial header */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
          Benchmark{" "}
          <em className="italic" style={{ color: "#005840" }}>
            sammenligning
          </em>
        </h1>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Team Norway · PGA TOUR benchmark
        </p>
      </div>

      {/* Content */}
      {!harData ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Ingen SG-runder registrert ennå. Logg runder med Strokes Gained for å se
            benchmark-sammenligningen.
          </p>
          <Link
            href="/portal/mal/sg-hub"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "#005840" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Tilbake til SG-Hub
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Card title */}
          <p className="mb-5 font-display text-[14px] font-bold text-foreground">
            SG vs Team Norway
          </p>

          <div className="space-y-5">
            {omrader.map((o) => {
              const val = o.value;
              const playerPct =
                val != null ? Math.min(100, Math.max(0, (val / maxAbs / 2 + 0.5) * 100)) : 50;
              const isPositive = val != null && val >= 0;
              const deltaLabel =
                val != null
                  ? `${isPositive ? "+" : ""}${val.toFixed(2)}`
                  : "–";

              return (
                <div key={o.label} className="space-y-2">
                  {/* Label + delta row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {o.label}
                    </span>
                    <span
                      className={
                        val == null
                          ? "font-mono text-[12px] font-semibold text-muted-foreground"
                          : isPositive
                            ? "font-mono text-[12px] font-semibold"
                            : "font-mono text-[12px] font-semibold text-destructive"
                      }
                      style={val != null && isPositive ? { color: "#005840" } : undefined}
                    >
                      {deltaLabel}
                    </span>
                  </div>

                  {/* Dual progress bar */}
                  <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                    {/* Player bar */}
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${playerPct}%`, backgroundColor: "#005840" }}
                    />
                    {/* Benchmark reference at 50% */}
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: "50%",
                        backgroundColor: "#D1F843",
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
