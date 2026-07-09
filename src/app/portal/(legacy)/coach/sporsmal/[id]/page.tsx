import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { SporsmalReaksjoner, RelaterteSporsmal, SvarSkjema } from "./sporsmal-interaktiv";

type RouteProps = {
  params: Promise<{ id: string }>;
};

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

export default async function CoachSporsmalDetalj({ params }: RouteProps) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const { id } = await params;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) notFound();

  const asker = await prisma.user.findUnique({
    where: { id: question.askerUserId },
    select: { name: true },
  });
  const askerNavn = asker?.name ?? "Ukjent spiller";
  const besvart = question.status === "ANSWERED" && question.answer;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach/sporsmal"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Spørsmål
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / spørsmål /{" "}
          <span className="font-semibold text-foreground">{id}</span>
        </span>
      </nav>

      <main className="mx-auto max-w-[760px] space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            {besvart && question.answeredAt
              ? `Svar fra coach · besvart ${formatDatoTid(question.answeredAt)}`
              : "Venter på svar"}
          </span>
          <h1 className="font-display text-2xl font-semibold leading-[1.05] -tracking-[0.02em] sm:text-3xl md:text-[38px]">
            Spørsmål til{" "}
            <em className="font-display italic font-normal text-primary">coach</em>
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Stilt {formatDatoTid(question.createdAt)}
          </p>
        </div>

        {/* Question card */}
        <article className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
            {initialer(askerNavn)}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2 text-[12px]">
              <span className="font-semibold text-foreground">{askerNavn}</span>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {formatDatoTid(question.createdAt)}
              </span>
            </div>
            <h2 className="font-display text-[19px] font-semibold leading-tight -tracking-[0.01em]">
              {question.title}
            </h2>
            <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-foreground">
              {question.body}
            </p>
          </div>
        </article>

        {besvart ? (
          <>
            {/* Answer card */}
            <article className="rounded-2xl border border-primary/30 bg-card p-4 shadow-[0_0_0_4px_rgba(0,88,64,0.04)] md:p-6">
              <header className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                  Besvart
                </span>
                {question.answeredAt && (
                  <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">
                    {formatDatoTid(question.answeredAt)}
                  </span>
                )}
              </header>

              <div className="space-y-4 pt-6 text-[14.5px] leading-relaxed text-foreground">
                <p className="whitespace-pre-line">{question.answer}</p>

                <div className="flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    Stilt {formatDatoTid(question.createdAt)}
                  </span>
                  {question.answeredAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
                      Besvart {formatDatoTid(question.answeredAt)}
                    </span>
                  )}
                </div>
              </div>
            </article>

            {/* Reaction */}
            <SporsmalReaksjoner />
          </>
        ) : (
          /* Answer form — vist når spørsmålet ikke er besvart */
          <SvarSkjema questionId={question.id} />
        )}

        {/* Related */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              Liknende spørsmål andre har stilt
            </h3>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              3 relaterte
            </span>
          </div>
          <RelaterteSporsmal />
        </section>
      </main>
    </div>
  );
}
