"use client";

import Link from "next/link";

type Props = {
  valgtDato: Date;
  serviceSlug: string;
  dager: number;
};

const UKEDAG = ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"];

export function DatoVelger({ valgtDato, serviceSlug, dager }: Props) {
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const datoer: Date[] = [];
  for (let i = 0; i < dager; i++) {
    const d = new Date(idag);
    d.setDate(idag.getDate() + i);
    datoer.push(d);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {datoer.map((d) => {
        const aktiv =
          d.getFullYear() === valgtDato.getFullYear() &&
          d.getMonth() === valgtDato.getMonth() &&
          d.getDate() === valgtDato.getDate();
        const iso = d.toISOString().split("T")[0];
        return (
          <Link
            key={iso}
            href={`/portal/booking/ny?service=${serviceSlug}&dato=${iso}`}
            scroll={false}
            className={`flex min-w-[64px] flex-col items-center rounded-md border px-4 py-2 transition-colors ${
              aktiv
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
              {UKEDAG[d.getDay()]}
            </span>
            <span className="font-display text-lg font-semibold tabular-nums">
              {d.getDate()}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
              {d.toLocaleDateString("nb-NO", { month: "short" })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
