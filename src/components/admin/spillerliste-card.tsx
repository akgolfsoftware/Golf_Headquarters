import Link from "next/link";
import type { AktivPlayer } from "@/lib/admin-hub-data";

export function SpillerlisteCard({ players }: { players: AktivPlayer[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sist aktive spillere
        </span>
        <Link href="/admin/elever" className="text-xs text-primary hover:underline active:text-primary/80 focus-visible:underline focus-visible:outline-none">
          Alle →
        </Link>
      </div>

      {players.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ingen spillere ennå.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {players.map((p) => {
            const initial = p.name.trim().charAt(0).toUpperCase() || "?";
            return (
              <li key={p.id} className="py-3">
                <Link
                  href={`/admin/elever/${p.id}`}
                  className="flex items-center gap-3 hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {p.hcp != null && `HCP ${p.hcp.toFixed(1).replace(".", ",")}`}
                      {p.hcp != null && " · "}
                      {p.tier}
                    </div>
                  </div>
                  {p.sisteAktivitet && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {p.sisteAktivitet.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
