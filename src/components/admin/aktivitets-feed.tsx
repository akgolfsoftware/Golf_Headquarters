import Link from "next/link";
import type { AktivitetsItem } from "@/lib/admin-hub-data";

const TYPE_LABEL: Record<AktivitetsItem["type"], string> = {
  round: "Runde",
  test: "Test",
  trackman: "TrackMan",
  session: "Økt",
};

const TYPE_FARGE: Record<AktivitetsItem["type"], string> = {
  round: "bg-pyr-spill/30 text-pyr-spill",
  test: "bg-destructive/15 text-destructive",
  trackman: "bg-primary/10 text-primary",
  session: "bg-accent/30 text-foreground",
};

export function AktivitetsFeed({ items }: { items: AktivitetsItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Aktivitet siste 14 dager
      </span>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen registrert aktivitet ennå.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 py-3 text-sm">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${TYPE_FARGE[it.type]}`}
              >
                {TYPE_LABEL[it.type]}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/elever/${it.brukerId}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {it.brukerNavn}
                </Link>
                <div className="text-xs text-muted-foreground">{it.beskrivelse}</div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {it.dato.toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                })}{" "}
                {it.dato.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
