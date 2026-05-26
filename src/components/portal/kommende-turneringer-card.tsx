/**
 * PlayerHQ Hjem · Kommende turneringer-widget
 *
 * Viser de 3 neste TournamentEntry for innlogget spiller.
 * Server-component — hentes via prisma og rendres inline.
 */

import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

import { prisma } from "@/lib/prisma";

const PRIORITY_LABEL: Record<string, string> = {
  MAJOR: "Trening",
  NORMAL: "Utvikling",
  LOCAL: "Prestasjon",
};

const PRIORITY_CLASS: Record<string, string> = {
  MAJOR: "bg-primary/10 text-primary",
  NORMAL: "bg-accent/10 text-accent-foreground",
  LOCAL: "bg-secondary text-muted-foreground",
};

function dagerTil(dato: Date, naa: Date): number {
  const ms = dato.getTime() - naa.getTime();
  return Math.ceil(ms / 86_400_000);
}

function dagerTekst(n: number): string {
  if (n <= 0) return "I dag";
  if (n === 1) return "I morgen";
  if (n < 14) return `${n} dager til`;
  if (n < 60) return `${Math.round(n / 7)} uker til`;
  return `${Math.round(n / 30)} mnd til`;
}

export async function KommendeTurneringerCard({ userId }: { userId: string }) {
  const naa = new Date();

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      OR: [
        { tournament: { startDate: { gte: naa } } },
        { manualDate: { gte: naa } },
      ],
    },
    include: { tournament: { select: { name: true, startDate: true } } },
    take: 12,
  });

  const sortert = entries
    .map((e) => ({
      id: e.id,
      navn: e.tournament?.name ?? e.manualName ?? "Manuell turnering",
      dato: e.tournament?.startDate ?? e.manualDate,
      priority: e.priority,
    }))
    .filter((e): e is { id: string; navn: string; dato: Date; priority: string } => e.dato !== null)
    .sort((a, b) => a.dato.getTime() - b.dato.getTime())
    .slice(0, 3);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Kommende turneringer
          </span>
        </div>
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          Se alle
          <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
        </Link>
      </div>

      {sortert.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen kommende turneringer. Meld deg på fra{" "}
          <Link
            href="/portal/tren/turneringer"
            className="font-medium text-primary hover:underline"
          >
            turneringskatalogen
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {sortert.map((e) => {
            const n = dagerTil(e.dato, naa);
            return (
              <li
                key={e.id}
                className="flex items-center gap-4 py-2 first:pt-0 last:pb-0"
              >
                <div className="flex h-10 w-10 flex-none flex-col items-center justify-center rounded-md bg-secondary">
                  <span className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                    {e.dato.toLocaleDateString("nb-NO", { month: "short" })}
                  </span>
                  <span className="font-mono text-base font-semibold tabular-nums leading-none text-foreground">
                    {e.dato.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {e.navn}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {dagerTekst(n)}
                  </div>
                </div>
                <span
                  className={`flex-none rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    PRIORITY_CLASS[e.priority] ?? PRIORITY_CLASS.NORMAL
                  }`}
                >
                  {PRIORITY_LABEL[e.priority] ?? "Utvikling"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
