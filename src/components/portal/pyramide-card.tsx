import Link from "next/link";
import {
  PYR_REKKEFOLGE,
  PYR_BG_KLASSE,
  prosentPerArea,
  type PyramideAggregat,
} from "@/lib/pyramide";

export function PyramideCard({
  data,
  tittel = "Pyramide · siste 14 dager",
}: {
  data: PyramideAggregat;
  tittel?: string;
}) {
  const prosent = prosentPerArea(data);
  const harData = Object.values(data).some((v) => v > 0);

  return (
    <Link
      href="/portal/tren"
      className="group block rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {tittel}
      </span>

      {!harData ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Ingen fullførte økter ennå. Pyramide-fordeling vises etter første
          gjennomførte økt.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {PYR_REKKEFOLGE.map((omr) => {
            const pct = prosent[omr];
            const min = data[omr];
            return (
              <div key={omr} className="flex items-center gap-4">
                <span className="w-12 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {omr}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-border/40">
                  <div
                    className={`h-full ${PYR_BG_KLASSE[omr]}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-xs tabular-nums text-foreground">
                  {pct}%
                </span>
                <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">
                  {min} min
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground group-hover:text-foreground">
        Se planen →
      </p>
    </Link>
  );
}
