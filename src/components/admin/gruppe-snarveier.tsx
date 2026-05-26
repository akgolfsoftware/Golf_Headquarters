import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Hardkodet fallback hvis Group-tabellen er tom.
const FALLBACK_GRUPPER: { id: string; name: string; level: string | null }[] = [
  { id: "wang", name: "WANG Toppidrett", level: "A1" },
  { id: "gfgk-jr", name: "GFGK Junior", level: "A3" },
];

const LEVEL_TONE: Record<string, string> = {
  A1: "bg-primary text-primary-foreground",
  A2: "bg-pyr-tek/80 text-white",
  A3: "bg-accent text-accent-foreground",
  A4: "bg-pyr-spill/70 text-foreground",
  A5: "bg-pyr-turn text-foreground",
};

export async function GruppeSnarveier() {
  const grupper = await prisma.group.findMany({
    orderBy: [{ level: "asc" }, { name: "asc" }],
    take: 6,
    select: { id: true, name: true, level: true },
  });

  const visning = grupper.length > 0 ? grupper : FALLBACK_GRUPPER;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Grupper
        </span>
        <Link
          href="/admin/spillere"
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
        >
          Alle →
        </Link>
      </div>
      <ul className="space-y-1.5">
        {visning.map((g) => {
          const tone = g.level ? LEVEL_TONE[g.level] ?? "bg-secondary text-foreground" : "bg-secondary text-foreground";
          return (
            <li key={g.id}>
              <Link
                href={`/admin/elever?group=${g.id}`}
                className="group flex items-center justify-between gap-2 rounded-md border border-transparent bg-secondary/40 px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-secondary"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="truncate font-medium text-foreground">{g.name}</span>
                </span>
                {g.level && (
                  <span
                    className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${tone}`}
                  >
                    {g.level}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-[1.4] text-muted-foreground">
        Klikk en gruppe for å filtrere spillere.
      </p>
    </div>
  );
}
