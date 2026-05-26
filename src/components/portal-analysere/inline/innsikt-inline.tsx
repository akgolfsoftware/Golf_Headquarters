/**
 * <InnsiktInline> — inline AI-innsikt-content for Analysere-tab.
 * Liste over siste SgInsight-rader.
 */

import Link from "next/link";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function InnsiktInline({ userId }: { userId: string }) {
  const innsikter = await prisma.sgInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      createdAt: true,
    },
  });

  if (innsikter.length === 0) {
    return <TomTilstand />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Siste {innsikter.length} innsikter
        </h3>
        <Link
          href="/portal/innsikt"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
        >
          Full innsikt
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="space-y-2">
        {innsikter.map((i) => (
          <div
            key={i.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-foreground">
                <Lightbulb className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                    {i.category}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {NB_DATE.format(i.createdAt)}
                  </span>
                </div>
                <h4 className="mt-1 font-display text-base font-semibold tracking-tight">
                  {i.title}
                </h4>
                {i.body && (
                  <p className="mt-1 text-[13px] leading-[1.5] text-muted-foreground">
                    {i.body}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TomTilstand() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
        Ingen AI-innsikter ennå
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Logg flere runder med SG-data så genererer AI-en analyser automatisk.
      </p>
    </div>
  );
}
