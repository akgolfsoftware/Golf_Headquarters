/**
 * PlayerHQ · SG-Hub · Benchmark vs PGA Tour
 *
 * Strokes Gained er Tour-relativt: midtlinjen (0) = PGA Tour-snitt.
 * Viser spillerens snitt-SG per område (OTT/APP/ARG/PUTT) mot Tour-baseline,
 * fra ekte Round-data via aggregateSg.
 */
import Link from "next/link";
import { ArrowLeft, Flag } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import SgBar from "@/components/athletic/data/sg-bar";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";

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
    { label: "APP", value: sg.app },
    { label: "ARG", value: sg.arg },
    { label: "PUTT", value: sg.putt },
  ];
  const verdier = omrader.map((o) => o.value).filter((v): v is number => v != null);
  const maxAbs = Math.max(2, ...verdier.map((v) => Math.ceil(Math.abs(v))));

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        SG-Hub
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · SG-Hub · Benchmark"
        titleLead="Du vs"
        titleItalic="PGA Tour"
        sub={
          harData
            ? `Snitt over ${sg.rundeAntall} ${sg.rundeAntall === 1 ? "runde" : "runder"}${sg.snittScore != null ? ` · snittscore ${sg.snittScore.toFixed(1).replace(".", ",")}` : ""}`
            : "Logg runder med Strokes Gained for å se benchmarken."
        }
      />

      {!harData ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Ingen SG-runder registrert ennå. Når du har logget runder med Strokes Gained,
            ser du her hvor du står mot Tour-snittet per område.
          </p>
        </div>
      ) : (
        <>
          {/* Total vs Tour */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                <Flag className="h-3 w-3 text-primary" strokeWidth={2} />
                SG total vs Tour
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {sg.total != null && sg.total >= 0
                  ? "Du henter inn slag på Tour-snittet."
                  : "Per runde mot PGA Tour-snittet (0)."}
              </div>
            </div>
            <div
              className="font-display text-4xl font-bold tabular-nums"
              style={{ color: (sg.total ?? 0) >= 0 ? "var(--success)" : "var(--destructive)" }}
            >
              {formatSg(sg.total)}
            </div>
          </div>

          {/* Per-område-barer */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Per område · midtlinjen = Tour-snitt
            </div>
            <div className="space-y-5">
              {omrader.map((o, i) =>
                o.value != null ? (
                  <SgBar key={o.label} label={o.label} value={o.value} max={maxAbs} idx={i} />
                ) : (
                  <div key={o.label} className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] font-bold tracking-[0.10em] text-muted-foreground">
                      SG-{o.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">ingen data</span>
                  </div>
                ),
              )}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-[1.5] text-muted-foreground">
              Til <span className="text-success">høyre/grønt</span> = bedre enn Tour-snittet.
              Til <span className="text-destructive">venstre/rødt</span> = bak. Strokes Gained
              måles mot PGA Tour, så 0 er alltid Tour-nivå.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
