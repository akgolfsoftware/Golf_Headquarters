import Link from "next/link";
import { ArrowLeft, ChevronRight, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function initialer(navn: string) {
  return (
    navn
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function formatDatoTid(d: Date) {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CoachSporsmalListe() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Spørsmål rettet til denne coachen + spørsmål uten tildelt coach (åpen kø).
  const questions = await prisma.question.findMany({
    where: { OR: [{ coachUserId: user.id }, { coachUserId: null }] },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const askerNavn = new Map<string, string>();
  const askerIds = [...new Set(questions.map((q) => q.askerUserId))];
  if (askerIds.length > 0) {
    const askere = await prisma.user.findMany({
      where: { id: { in: askerIds } },
      select: { id: true, name: true },
    });
    for (const a of askere) askerNavn.set(a.id, a.name);
  }

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / spørsmål
        </span>
      </nav>

      <main className="mx-auto max-w-[760px] space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Spørsmål · {questions.length}
          </span>
          <h1 className="font-display text-2xl font-semibold leading-[1.05] -tracking-[0.02em] sm:text-3xl md:text-[38px]">
            Spørsmål fra{" "}
            <em className="font-display italic font-normal text-primary">spillere</em>
          </h1>
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <MessageSquare className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="text-[15px] font-semibold">Ingen spørsmål ennå</div>
            <p className="max-w-sm font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              Når en spiller stiller deg et spørsmål, dukker det opp her.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {questions.map((q) => {
              const navn = askerNavn.get(q.askerUserId) ?? "Ukjent spiller";
              const besvart = q.status === "ANSWERED";
              return (
                <li key={q.id}>
                  <Link
                    href={`/portal/coach/sporsmal/${q.id}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 hover:-translate-y-px hover:border-muted-foreground"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                      {initialer(navn)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[13.5px] font-semibold text-foreground">
                          {navn}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${
                            besvart
                              ? "bg-accent/20 text-primary"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {besvart ? "Besvart" : "Åpent"}
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
      </main>
    </div>
  );
}
