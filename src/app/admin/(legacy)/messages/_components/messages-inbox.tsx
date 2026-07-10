"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

type Tråd = {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userTier: string;
  preview: string;
  sisteRolle: string | null;
  tidspunkt: Date;
  meldingerAntall: number;
  ulest: boolean;
  fromMe: boolean;
};

type Props = {
  tråder: Tråd[];
  aktivId: string | null;
  aktivtFilter: "alle" | "ulest" | "merkede";
  antallAlle: number;
  antallUlest: number;
};

function formaterTid(d: Date): string {
  const nå = new Date();
  const diff = nå.getTime() - d.getTime();
  const minutter = Math.floor(diff / 60_000);
  const timer = Math.floor(diff / 3_600_000);
  const dager = Math.floor(diff / 86_400_000);
  if (minutter < 1) return "nå";
  if (minutter < 60) return `${minutter}m`;
  if (timer < 24) {
    return d.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (dager < 7) return d.toLocaleDateString("nb-NO", { weekday: "short" });
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

export function MessagesInbox({
  tråder,
  aktivId,
  aktivtFilter,
  antallAlle,
  antallUlest,
}: Props) {
  const [søk, setSøk] = useState("");
  const filtrert = søk.trim()
    ? tråder.filter((t) =>
        t.userName.toLowerCase().includes(søk.toLowerCase()) ||
        t.preview.toLowerCase().includes(søk.toLowerCase()),
      )
    : tråder;

  return (
    <section className="flex flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border px-4 pb-4 pt-4">
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary px-4 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <input
            type="text"
            value={søk}
            onChange={(e) => setSøk(e.target.value)}
            placeholder="Søk navn, tråd …"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>
      </div>
      <div className="flex gap-1 border-b border-border px-4 py-2">
        <FilterLink filter="alle" aktivt={aktivtFilter} count={antallAlle}>
          Alle
        </FilterLink>
        <FilterLink filter="ulest" aktivt={aktivtFilter} count={antallUlest}>
          Uleste
        </FilterLink>
        <FilterLink filter="merkede" aktivt={aktivtFilter} count={0}>
          Merkede
        </FilterLink>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtrert.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Ingen samtaler i denne visningen
          </div>
        ) : (
          filtrert.map((t) => (
            <Link
              key={t.id}
              href={`/admin/innboks?thread=${t.id}${aktivtFilter !== "alle" ? `&filter=${aktivtFilter}` : ""}`}
              scroll={false}
              className={`relative grid grid-cols-[36px_1fr] gap-4 border-b border-border px-4 py-4 transition-colors hover:bg-secondary ${
                t.id === aktivId
                  ? "bg-secondary shadow-[inset_3px_0_0_var(--color-primary)]"
                  : ""
              }`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
                {t.userInitials}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`truncate text-[13px] tracking-tight ${
                      t.ulest ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {t.userName}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formaterTid(t.tidspunkt)}
                  </span>
                </div>
                <div
                  className={`mt-0.5 line-clamp-2 text-[12px] leading-snug ${
                    t.ulest ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.fromMe && (
                    <span className="text-muted-foreground/70">Du: </span>
                  )}
                  {t.preview}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span>{t.meldingerAntall} meldinger</span>
                  {t.userTier === "PRO" && (
                    <span className="inline-flex items-center rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-semibold text-accent-foreground">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              {t.ulest && (
                <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function FilterLink({
  filter,
  aktivt,
  count,
  children,
}: {
  filter: "alle" | "ulest" | "merkede";
  aktivt: "alle" | "ulest" | "merkede";
  count: number;
  children: React.ReactNode;
}) {
  const active = aktivt === filter;
  return (
    <Link
      href={filter === "alle" ? "/admin/innboks" : `/admin/innboks?filter=${filter}`}
      scroll={false}
      className={`flex-1 rounded-md py-1.5 text-center text-[12px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}{" "}
      <span className="font-mono text-[10px] opacity-70">{count}</span>
    </Link>
  );
}
