import { Clock, Activity } from "lucide-react";
import type { Ukedag } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type OktKortData = {
  id: string;
  navn: string;
  dag: Ukedag | null;
  estimertMinutter: number | null;
  antallOvelser: number;
};

const DAG_LABEL: Record<Ukedag, string> = {
  MAN: "Man",
  TIR: "Tir",
  ONS: "Ons",
  TOR: "Tor",
  FRE: "Fre",
  LOR: "Lør",
  SON: "Søn",
};

/**
 * Kort for en enkelt fysisk-økt innenfor en uke.
 * Klikkbart → åpner øvelses-tabell (modal eller dedikert side).
 */
export function OktKort({
  okt,
  onClick,
}: {
  okt: OktKortData;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-card p-4 text-left transition-all",
        "hover:border-primary hover:bg-card/80 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-sm font-semibold leading-snug text-foreground">
          {okt.navn}
        </h4>
        {okt.dag && (
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-secondary-foreground">
            {DAG_LABEL[okt.dag]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Activity size={12} strokeWidth={1.5} aria-hidden />
          <span className="font-mono tabular-nums">
            {okt.antallOvelser} øv
          </span>
        </span>
        {okt.estimertMinutter !== null && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} strokeWidth={1.5} aria-hidden />
            <span className="font-mono tabular-nums">
              {okt.estimertMinutter} min
            </span>
          </span>
        )}
      </div>
    </button>
  );
}
