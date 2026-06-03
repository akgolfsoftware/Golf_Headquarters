"use client";

/**
 * AgencyOS Innboks — coachens samle-innboks (meldinger, fakturaer, forespørsler).
 * Presentasjonell og props-drevet. Rad-mønsteret er portet fra v10-fasiten:
 *   public/design-handover/agencyos/components-agency-dashboard.html (kol. 2 INNBOKS)
 *   — ulest-prikk (rød), avatar-initialer, navn + type-pill, preview, mono-tid.
 * Skalert opp fra cockpit-kolonnen til full innboks-skjerm med filter-tabs.
 *
 * Type-piller mapper til designsystem-tokens (ingen hardkodet hex):
 *   melding → secondary, godkjenn/bekreftet → lime, forespørsel → info,
 *   råd → amber, forfalt → destructive, behandle/svar → warning.
 *
 * INGEN Prisma/DB/auth — kun presentasjon.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ───────────────────────────────────────────────────────
export type InnboksType =
  | "melding"
  | "godkjenn"
  | "bekreftet"
  | "forespørsel"
  | "råd"
  | "forfalt"
  | "behandle"
  | "svar";

export type InnboksItem = {
  id: string;
  initials: string;
  sender: string;
  type: InnboksType;
  typeLabel: string;
  preview: string;
  when: string;
  unread: boolean;
  href: string;
};

export type InnboksData = {
  items: InnboksItem[];
};

// Filter-kategori → predikat over en item.
type FilterKey = "alle" | "uleste" | "meldinger" | "faktura" | "foresporsler";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "uleste", label: "Uleste" },
  { key: "meldinger", label: "Meldinger" },
  { key: "faktura", label: "Faktura" },
  { key: "foresporsler", label: "Forespørsler" },
];

// ── Token-mappinger (ingen hardkodet hex) ───────────────────────
const typeClass: Record<InnboksType, string> = {
  melding: "bg-secondary text-muted-foreground",
  godkjenn: "bg-[var(--color-pyr-spill-track)] text-primary",
  bekreftet: "bg-[var(--color-pyr-spill-track)] text-primary",
  forespørsel: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  råd: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  forfalt: "bg-destructive/10 text-destructive",
  behandle: "bg-warning/10 text-warning",
  svar: "bg-warning/10 text-warning",
};

function matchesFilter(item: InnboksItem, key: FilterKey): boolean {
  switch (key) {
    case "alle":
      return true;
    case "uleste":
      return item.unread;
    case "meldinger":
      return item.type === "melding" || item.type === "råd";
    case "faktura":
      return item.type === "forfalt" || item.type === "behandle";
    case "foresporsler":
      return (
        item.type === "forespørsel" ||
        item.type === "godkjenn" ||
        item.type === "svar"
      );
    default:
      return true;
  }
}

// ── Enkelt innboks-rad (desktop tabell-rad / mobil stablet kort) ──
function InnboksRad({ item, first }: { item: InnboksItem; first: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative grid grid-cols-[28px_1fr_auto] items-center gap-x-3 px-3 py-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:gap-x-3.5 sm:px-4 sm:py-3.5",
        // Mobil: hvert kort er separat boks. Desktop: sammenhengende rader med skillelinjer.
        "mb-2 rounded-xl border border-border bg-card sm:mb-0 sm:rounded-none sm:border-x-0 sm:border-b sm:border-t-0",
        first && "sm:border-t-0",
      )}
    >
      {item.unread && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-destructive sm:h-1 sm:w-1"
        />
      )}

      {/* Uniform sand-avatar for alle innboks-rader (jf. v10). Ulest-signal
          er den røde prikken til venstre — ikke avatarfarge. */}
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[10px] font-bold text-foreground"
        aria-hidden
      >
        {item.initials}
      </span>

      <div className="flex min-w-0 flex-col leading-tight">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-[13px] font-semibold tracking-[-0.005em]",
              item.unread ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {item.sender}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-[3px] px-1.5 py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em]",
              typeClass[item.type],
            )}
          >
            {item.typeLabel}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 truncate text-[12px] tracking-[-0.005em] text-foreground",
            item.unread && "font-semibold",
          )}
        >
          {item.preview}
        </span>
      </div>

      <span className="shrink-0 self-start pt-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground sm:self-center sm:pt-0">
        {item.when}
      </span>
    </Link>
  );
}

// ── Hoved-komponent ─────────────────────────────────────────────
export function InnboksListe({ data }: { data: InnboksData }) {
  const [filter, setFilter] = useState<FilterKey>("alle");

  const unreadTotal = useMemo(
    () => data.items.filter((i) => i.unread).length,
    [data.items],
  );

  const visible = useMemo(
    () => data.items.filter((i) => matchesFilter(i, filter)),
    [data.items, filter],
  );

  // Tellere per filter for badge i tab-rad.
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      alle: data.items.length,
      uleste: 0,
      meldinger: 0,
      faktura: 0,
      foresporsler: 0,
    };
    for (const item of data.items) {
      if (matchesFilter(item, "uleste")) c.uleste += 1;
      if (matchesFilter(item, "meldinger")) c.meldinger += 1;
      if (matchesFilter(item, "faktura")) c.faktura += 1;
      if (matchesFilter(item, "foresporsler")) c.foresporsler += 1;
    }
    return c;
  }, [data.items]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Side-header — speiler fasiten: tittel venstre, status høyre */}
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          Innboks
        </h1>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              unreadTotal > 0 ? "bg-destructive" : "bg-success",
            )}
          />
          <span className={unreadTotal > 0 ? "text-destructive" : "text-success"}>
            {unreadTotal > 0 ? `${unreadTotal} uleste` : "Alt besvart"}
          </span>
        </span>
      </header>

      {/* Filter-tabs — lokal state. Scrollbar/kompakt på mobil. */}
      <div
        role="tablist"
        aria-label="Filtrer innboks"
        className="mt-6 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "font-mono text-[10px] font-bold tabular-nums",
                  active ? "text-primary-foreground/80" : "text-muted-foreground/70",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Innboks-kort med rad-liste */}
      <div className="mt-4 sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-card">
        {/* Liste-header (kun desktop) — speiler col-head i fasiten */}
        <div className="hidden items-center gap-2 border-b border-border px-4 py-3 sm:flex">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            Siste 24 t
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            {visible.length}
          </span>
          <span className="ml-auto inline-flex h-[22px] cursor-default items-center gap-1 rounded-full bg-secondary px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {FILTERS.find((f) => f.key === filter)?.label}
            <ChevronDown className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
          </span>
        </div>

        {visible.length > 0 ? (
          <div>
            {visible.map((item, idx) => (
              <InnboksRad key={item.id} item={item} first={idx === 0} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-20 text-center sm:rounded-none sm:border-0 sm:py-24">
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/30"
            >
              <Inbox className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </span>
            <p className="mt-5 font-display text-xl font-bold tracking-[-0.01em] text-foreground">
              Ingen treff her
            </p>
            <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
              Ingen elementer i dette filteret akkurat nå.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
