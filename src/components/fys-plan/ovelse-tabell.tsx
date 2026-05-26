"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type OvelseRadData = {
  id: string;
  navn: string;
  sett: number;
  repsMin: number | null;
  repsMax: number | null;
  hvile: number | null; // sekunder
  belastningPst: number | null;
  rir: number | null;
  loggBelastningKg: number | null;
  loggRir: number | null;
  loggSett: number | null;
  loggRepsPerSett: string | null;
};

export type OvelseTabellProps = {
  rader: OvelseRadData[];
  onLogg?: (radId: string, logg: Partial<OvelseRadData>) => void | Promise<void>;
};

/**
 * Tabell-visning av øvelses-rader i en fysisk økt.
 *
 * Desktop: 7-kolonners tabell (Øvelse | Sett | Reps | Hvile | %1RM | RIR | Logg).
 * Mobile: hver rad rendres som stacked card.
 */
export function OvelseTabell({ rader, onLogg }: OvelseTabellProps) {
  if (rader.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Ingen øvelser i denne økta enda.
      </p>
    );
  }

  return (
    <div>
      {/* Desktop-tabell */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <Th className="text-left w-[28%]">Øvelse</Th>
                <Th>Sett</Th>
                <Th>Reps</Th>
                <Th>Hvile</Th>
                <Th>%1RM</Th>
                <Th>RIR</Th>
                <Th>Logg</Th>
              </tr>
            </thead>
            <tbody>
              {rader.map((rad, i) => (
                <tr
                  key={rad.id}
                  className={cn(
                    "border-t border-border",
                    i % 2 === 0 ? "bg-background" : "bg-card",
                  )}
                >
                  <Td className="text-left font-medium">{rad.navn}</Td>
                  <Td mono>{rad.sett}</Td>
                  <Td mono>{formatReps(rad.repsMin, rad.repsMax)}</Td>
                  <Td mono>{formatHvile(rad.hvile)}</Td>
                  <Td mono>{rad.belastningPst != null ? `${rad.belastningPst}%` : "—"}</Td>
                  <Td mono>{rad.rir ?? "—"}</Td>
                  <Td>
                    <LoggKnapper rad={rad} onLogg={onLogg} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-kort */}
      <div className="space-y-2 md:hidden">
        {rader.map((rad) => (
          <RadKort key={rad.id} rad={rad} onLogg={onLogg} />
        ))}
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  mono,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2 text-center text-foreground",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

function LoggKnapper({
  rad,
  onLogg,
}: {
  rad: OvelseRadData;
  onLogg?: OvelseTabellProps["onLogg"];
}) {
  const [belastning, setBelastning] = useState(
    rad.loggBelastningKg?.toString() ?? "",
  );
  const [rir, setRir] = useState(rad.loggRir?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!onLogg) return;
    setSaving(true);
    try {
      await onLogg(rad.id, {
        loggBelastningKg: belastning ? Number(belastning) : null,
        loggRir: rir ? Number(rir) : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Input
        type="number"
        placeholder="kg"
        value={belastning}
        onChange={(e) => setBelastning(e.target.value)}
        aria-label="Belastning i kg"
        className="h-8 w-16 text-xs"
      />
      <Input
        type="number"
        placeholder="RIR"
        value={rir}
        onChange={(e) => setRir(e.target.value)}
        aria-label="Reps in reserve"
        className="h-8 w-14 text-xs"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        aria-label="Lagre logg"
        className={cn(
          "grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity",
          "hover:opacity-90 disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        )}
      >
        <Save size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

function RadKort({
  rad,
  onLogg,
}: {
  rad: OvelseRadData;
  onLogg?: OvelseTabellProps["onLogg"];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <h4 className="font-display text-sm font-semibold leading-tight text-foreground">
        {rad.navn}
      </h4>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <KV label="Sett" value={rad.sett.toString()} />
        <KV label="Reps" value={formatReps(rad.repsMin, rad.repsMax)} />
        <KV label="Hvile" value={formatHvile(rad.hvile)} />
        <KV label="%1RM" value={rad.belastningPst != null ? `${rad.belastningPst}%` : "—"} />
        <KV label="RIR" value={rad.rir?.toString() ?? "—"} />
      </dl>
      <div className="pt-2 border-t border-border">
        <LoggKnapper rad={rad} onLogg={onLogg} />
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function formatReps(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) return `${min}-${max}`;
  return (min ?? max ?? "—").toString();
}

function formatHvile(sec: number | null): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const restSec = sec % 60;
  return restSec === 0 ? `${min}m` : `${min}m${restSec}`;
}
