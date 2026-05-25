"use client";

/**
 * Filter-pills for test-katalog. Bruker query-param `?filter=` slik at
 * server-komponenten kan filtrere ved data-henting.
 */
import Link from "next/link";

type FilterValg = "alle" | "standard" | "mine" | "coach-godkjent" | "akademi";

const FILTRE: Array<{ verdi: FilterValg; label: string }> = [
  { verdi: "alle", label: "Alle" },
  { verdi: "standard", label: "Standard" },
  { verdi: "mine", label: "Mine" },
  { verdi: "coach-godkjent", label: "Coach-godkjent" },
  { verdi: "akademi", label: "Akademi" },
];

export function TestKatalogFilter({ aktiv }: { aktiv: FilterValg }) {
  return (
    <nav aria-label="Filtrer tester" className="flex flex-wrap gap-2">
      {FILTRE.map((f) => {
        const erAktiv = f.verdi === aktiv;
        return (
          <Link
            key={f.verdi}
            href={
              f.verdi === "alle"
                ? "/portal/tren/tester/katalog"
                : `/portal/tren/tester/katalog?filter=${f.verdi}`
            }
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 font-mono text-[10px] uppercase tracking-[0.10em] transition-colors ${
              erAktiv
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
