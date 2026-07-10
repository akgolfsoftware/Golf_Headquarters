import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { StillSporsmalForm } from "./still-sporsmal-form";

export const dynamic = "force-dynamic";

type RouteProps = {
  searchParams: Promise<{ sendt?: string }>;
};

function formatDatoTid(d: Date) {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StillSporsmalPage({ searchParams }: RouteProps) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { sendt } = await searchParams;

  // Spillerens egne spørsmål — nyeste først.
  const mine = await prisma.question.findMany({
    where: { askerUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach/melding"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / spørsmål /{" "}
          <span className="font-semibold text-foreground">nytt</span>
        </span>
      </nav>

      <main className="mx-auto max-w-[760px] space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Nytt spørsmål
          </span>
          <h1 className="font-display text-2xl font-semibold leading-[1.05] -tracking-[0.02em] sm:text-3xl md:text-[38px]">
            Still spørsmål til{" "}
            <em className="font-display italic font-normal text-primary">coach</em>
          </h1>
          <p className="max-w-[600px] text-[14.5px] text-muted-foreground">
            Skriv en kort tittel og spørsmålet ditt. Coachen din får det rett i
            innboksen og svarer typisk innen 4 timer på hverdager.
          </p>
        </div>

        {sendt && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-accent/15 px-4 py-3 text-[13.5px] font-semibold text-primary">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            Spørsmålet er sendt til coachen din.
          </div>
        )}

        <StillSporsmalForm />

        {/* Mine spørsmål */}
        <section className="space-y-3 pt-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              Mine spørsmål
            </h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              {mine.length} totalt
            </span>
          </div>

          {mine.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                <MessageSquare className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="text-[15px] font-semibold">Ingen spørsmål ennå</div>
              <p className="max-w-sm font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                Spørsmålene du sender, dukker opp her med status.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {mine.map((q) => {
                const besvart = q.status === "ANSWERED";
                return (
                  <li key={q.id}>
                    <Link
                      href={`/portal/coach/sporsmal/${q.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 hover:-translate-y-px hover:border-muted-foreground"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${
                              besvart
                                ? "bg-accent/20 text-primary"
                                : "bg-warning/15 text-warning"
                            }`}
                          >
                            {besvart ? "Besvart" : "Venter"}
                          </span>
                          <span className="font-mono text-[10.5px] text-muted-foreground">
                            {formatDatoTid(q.createdAt)}
                          </span>
                        </div>
                        <div className="truncate font-display text-[15px] font-semibold leading-tight -tracking-[0.01em]">
                          {q.title}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
