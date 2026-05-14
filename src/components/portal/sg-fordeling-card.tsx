import Link from "next/link";
import type { SgAggregate } from "@/lib/sg";
import { formatSg } from "@/lib/sg";

const FELT: { key: keyof Pick<SgAggregate, "ott" | "app" | "arg" | "putt">; label: string; full: string }[] = [
  { key: "ott", label: "OTT", full: "Off the tee" },
  { key: "app", label: "APP", full: "Approach" },
  { key: "arg", label: "ARG", full: "Around the green" },
  { key: "putt", label: "PUTT", full: "Putting" },
];

const SG_MIN = -2;
const SG_MAX = 2;

function tilProsent(sg: number | null): number {
  if (sg == null) return 50;
  const klemt = Math.max(SG_MIN, Math.min(SG_MAX, sg));
  return ((klemt - SG_MIN) / (SG_MAX - SG_MIN)) * 100;
}

export function SgFordelingCard({ sg }: { sg: SgAggregate }) {
  const harData = sg.rundeAntall > 0;

  return (
    <Link
      href="/portal/mal"
      className="group block rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        SG-fordeling · 30d
      </span>

      {!harData ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen runder de siste 30 dagene.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {FELT.map((f) => {
            const verdi = sg[f.key];
            const erPositiv = verdi != null && verdi >= 0;
            return (
              <div key={f.key} className="flex items-center gap-4 text-xs">
                <span className="w-10 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {f.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-border/40">
                  <span
                    className="absolute top-0 h-full w-px bg-foreground/40"
                    style={{ left: "50%" }}
                  />
                  <div
                    className={`h-full rounded-full ${
                      erPositiv ? "bg-primary" : "bg-destructive"
                    }`}
                    style={
                      erPositiv
                        ? {
                            marginLeft: "50%",
                            width: `${Math.max(tilProsent(verdi) - 50, 2)}%`,
                          }
                        : {
                            marginLeft: `${tilProsent(verdi)}%`,
                            width: `${Math.max(50 - tilProsent(verdi), 2)}%`,
                          }
                    }
                  />
                </div>
                <span className="w-10 text-right font-mono tabular-nums text-foreground">
                  {formatSg(verdi)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground group-hover:text-foreground">
        Se alle runder →
      </p>
    </Link>
  );
}
