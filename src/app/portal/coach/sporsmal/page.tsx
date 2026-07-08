/**
 * PlayerHQ Coach Spørsmål — liste (/portal/coach/sporsmal).
 * Re-komponert til v13-referanseanatomien (D3, 2026-07-06):
 * golfdata-scope wrapper, Eyebrow + display-h1, Card-rader med status-Tag.
 * Datahenting uendret.
 */

import Link from "next/link";
import { ArrowLeft, ChevronRight, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { Card, Eyebrow, Tag } from "@/components/athletic/golfdata";

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
    <div className="golfdata-scope mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      {/* Tilbake */}
      <div className="mb-3">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Hero */}
      <Eyebrow tone="default" className="mb-2.5">
        Coach · Spørsmål · {questions.length}
      </Eyebrow>
      <h1 className="font-display text-[29px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
        Spørsmål fra{" "}
        <em className="font-medium italic text-primary">spillere</em>
      </h1>

      <div className="mt-5">
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
          <ul className="space-y-2.5">
            {questions.map((q) => {
              const navn = askerNavn.get(q.askerUserId) ?? "Ukjent spiller";
              const besvart = q.status === "ANSWERED";
              return (
                <li key={q.id}>
                  <Link href={`/portal/coach/sporsmal/${q.id}`} className="block">
                    <Card interactive compact>
                      <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
                          {initialer(navn)}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13.5px] font-semibold text-foreground">
                              {navn}
                            </span>
                            <Tag size="sm" variant={besvart ? "up" : "signal"}>
                              {besvart ? "Besvart" : "Åpent"}
                            </Tag>
                            <span className="font-mono text-[10.5px] text-muted-foreground">
                              {formatDatoTid(q.createdAt)}
                            </span>
                          </div>
                          <div className="truncate font-display text-[15px] font-semibold leading-tight -tracking-[0.01em]">
                            {q.title}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
