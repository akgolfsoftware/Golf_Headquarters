import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";

type Aktiv = "tabell" | "tavle";

export function SpillereTabs({ aktiv }: { aktiv: Aktiv }) {
  return (
    <div className="inline-flex w-fit gap-0.5 rounded-md bg-secondary p-1">
      <Link
        href="/admin/spillere"
        className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
          aktiv === "tabell"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Table2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tabell
      </Link>
      <Link
        href="/admin/board"
        className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
          aktiv === "tavle"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tavle
      </Link>
    </div>
  );
}
