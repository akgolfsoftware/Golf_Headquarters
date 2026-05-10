import type { SistRegistrert } from "@/lib/dashboard-data";

const ETIKETT: Record<SistRegistrert["type"], string> = {
  round: "Runde",
  test: "Test",
  trackman: "TrackMan",
};

const FARGE: Record<SistRegistrert["type"], string> = {
  round: "bg-pyr-spill/30 text-pyr-spill",
  test: "bg-destructive/15 text-destructive",
  trackman: "bg-primary/10 text-primary",
};

export function SistRegistrertCard({ items }: { items: SistRegistrert[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Sist registrert
      </span>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen registreringer ennå. Registrer en runde, test eller TrackMan-økt
          under Mål.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${FARGE[it.type]}`}
              >
                {ETIKETT[it.type]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">
                  {it.tittel}
                </div>
                <div className="text-xs text-muted-foreground">{it.detalj}</div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {it.dato.toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
