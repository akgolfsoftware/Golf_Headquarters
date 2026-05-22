"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Bell,
  BotMessageSquare,
  Calendar,
  CheckCheck,
  ClipboardList,
  CreditCard,
  Info,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { markNotificationsRead } from "./actions";

export type VarselItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type FilterId = "alle" | "uleste" | "coach" | "booking" | "betaling" | "system";

const FILTRE: { id: FilterId; label: string; color: string }[] = [
  { id: "alle", label: "Alle", color: "" },
  { id: "uleste", label: "Uleste", color: "bg-primary" },
  { id: "coach", label: "Coach", color: "bg-primary" },
  { id: "booking", label: "Bookinger", color: "bg-[#2C7D52]" },
  { id: "betaling", label: "Betaling", color: "bg-amber-600" },
  { id: "system", label: "System", color: "bg-muted-foreground" },
];

const IKON_MAP: Record<string, LucideIcon> = {
  booking: Calendar,
  plan: ClipboardList,
  achievement: Trophy,
  melding: MessageSquare,
  drill: Target,
  trackman: Zap,
  system: Info,
  ai: BotMessageSquare,
  betaling: CreditCard,
};

type Kategori = "coach" | "booking" | "betaling" | "system" | "ai";

const TYPE_TIL_KATEGORI: Record<string, Kategori> = {
  melding: "coach",
  plan: "coach",
  drill: "coach",
  booking: "booking",
  betaling: "betaling",
  trackman: "system",
  system: "system",
  ai: "ai",
  achievement: "system",
};

const KATEGORI_BADGE_STIL: Record<Kategori, string> = {
  coach: "bg-primary/10 text-primary border-primary/25",
  booking: "bg-[#2C7D52]/15 text-[#2C7D52] border-[#2C7D52]/25",
  ai: "bg-accent/30 text-[#3B4310] border-accent/45",
  betaling: "bg-amber-100 text-amber-700 border-amber-300/50",
  system: "bg-muted text-muted-foreground border-transparent",
};

const KATEGORI_LABEL: Record<Kategori, string> = {
  coach: "COACH",
  booking: "BOOKING",
  ai: "AI-CADDIE",
  betaling: "BETALING",
  system: "SYSTEM",
};

function getDayKey(d: Date): "i-dag" | "i-gar" | "denne-uka" | "tidligere" {
  const now = new Date();
  const sammeDato = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sammeDato(d, now)) return "i-dag";

  const iGaar = new Date(now);
  iGaar.setDate(iGaar.getDate() - 1);
  if (sammeDato(d, iGaar)) return "i-gar";

  const ukeStart = new Date(now);
  ukeStart.setDate(now.getDate() - now.getDay());
  ukeStart.setHours(0, 0, 0, 0);
  if (d >= ukeStart) return "denne-uka";

  return "tidligere";
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formatDatoTid(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

const GRUPPE_TITLER = {
  "i-dag": "I dag",
  "i-gar": "I går",
  "denne-uka": "Denne uka",
  "tidligere": "Tidligere",
};

export function VarslerClient({
  varsler,
  demo,
}: {
  varsler: VarselItem[];
  demo: boolean;
}) {
  const [filter, setFilter] = useState<FilterId>("alle");
  const [pending, startTransition] = useTransition();

  const ulestAntall = varsler.filter((v) => !v.readAt).length;

  const FILTRERINGSTYPER: Record<Exclude<FilterId, "alle" | "uleste">, string[]> = {
    coach: ["melding", "plan", "drill"],
    booking: ["booking"],
    betaling: ["betaling"],
    system: ["system", "trackman", "achievement", "ai"],
  };

  const filtrert = useMemo(() => {
    if (filter === "alle") return varsler;
    if (filter === "uleste") return varsler.filter((v) => !v.readAt);
    const typer = FILTRERINGSTYPER[filter as Exclude<FilterId, "alle" | "uleste">];
    return varsler.filter((v) => typer?.includes(v.type) ?? false);
    // FILTRERINGSTYPER er en konstant — trygg å exclude fra deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, varsler]);

  function antallForFilter(f: FilterId): number {
    if (f === "alle") return varsler.length;
    if (f === "uleste") return ulestAntall;
    const typer = FILTRERINGSTYPER[f as Exclude<FilterId, "alle" | "uleste">];
    return varsler.filter((v) => typer?.includes(v.type) ?? false).length;
  }

  const grupper = useMemo(() => {
    const map: Record<"i-dag" | "i-gar" | "denne-uka" | "tidligere", VarselItem[]> = {
      "i-dag": [],
      "i-gar": [],
      "denne-uka": [],
      "tidligere": [],
    };
    for (const v of filtrert) {
      map[getDayKey(v.createdAt)].push(v);
    }
    return map;
  }, [filtrert]);

  function markerAlleLest() {
    if (demo) return;
    startTransition(async () => {
      await markNotificationsRead();
    });
  }

  return (
    <div className="space-y-0 pb-20 md:pb-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="px-4 py-4 md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
                Var<em className="font-normal italic text-primary">sler</em>
              </h1>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                {ulestAntall > 0 ? (
                  <span className="font-bold text-primary">
                    {ulestAntall} uleste
                  </span>
                ) : (
                  <span>Ingen uleste</span>
                )}
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{varsler.length} totalt</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>siste 30 dager</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
                Innstillinger
              </button>
              {ulestAntall > 0 && (
                <button
                  type="button"
                  onClick={markerAlleLest}
                  disabled={pending || demo}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  {pending ? "Markerer…" : "Marker alle som lest"}
                </button>
              )}
            </div>
          </div>

          {/* Filter-pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pb-1">
            {FILTRE.map((f) => {
              const aktiv = filter === f.id;
              const antall = antallForFilter(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium leading-none transition-colors ${
                    aktiv
                      ? "border-accent bg-accent text-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {f.color && !aktiv && (
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${f.color}`}
                    />
                  )}
                  {f.label}
                  <span
                    className={`font-mono text-[10px] font-semibold tracking-[0.04em] ${
                      aktiv ? "text-foreground/65" : "text-muted-foreground"
                    }`}
                  >
                    {antall}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {demo && (
        <div className="mx-4 mt-4 rounded-md border border-border bg-secondary/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground md:mx-8">
          Demo-data — ekte varsler vises her etter hvert
        </div>
      )}

      {/* Innhold */}
      {filtrert.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-4 py-6 md:px-8">
          <div className="space-y-8">
            {(["i-dag", "i-gar", "denne-uka", "tidligere"] as const).map((key) => {
              const items = grupper[key];
              if (items.length === 0) return null;
              const tittel = GRUPPE_TITLER[key];
              return (
                <DagGruppe
                  key={key}
                  tittel={tittel}
                  items={items}
                  visDato={key === "denne-uka" || key === "tidligere"}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DagGruppe({
  tittel,
  items,
  visDato,
}: {
  tittel: string;
  items: VarselItem[];
  visDato?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          <em className="font-normal italic text-primary">{tittel}</em>
        </h2>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {items.length} {items.length === 1 ? "hendelse" : "hendelser"}
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((v) => (
          <VarselRad key={v.id} v={v} visDato={visDato} />
        ))}
      </ul>
    </section>
  );
}

function VarselRad({
  v,
  visDato,
}: {
  v: VarselItem;
  visDato?: boolean;
}) {
  const Icon = IKON_MAP[v.type] ?? Info;
  const ulest = !v.readAt;
  const kategori: Kategori = TYPE_TIL_KATEGORI[v.type] ?? "system";
  const tidsstempel = visDato
    ? formatDatoTid(v.createdAt)
    : formatTid(v.createdAt);

  const inner = (
    <div
      className={`grid items-center gap-3.5 overflow-hidden rounded-2xl border bg-card pr-4 transition-colors hover:bg-muted/30 ${
        ulest ? "border-primary/30" : "border-border"
      }`}
      style={{ gridTemplateColumns: "4px 40px 1fr auto" }}
    >
      {/* Ulest-stripe */}
      <div
        className={`self-stretch rounded-l-2xl ${
          ulest ? "bg-accent" : "bg-transparent"
        }`}
      />

      {/* Avatar/ikon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${
          kategori === "ai"
            ? "border-primary bg-primary text-primary-foreground"
            : kategori === "coach"
              ? "border-border bg-[#DCE7E1] text-primary"
              : kategori === "booking"
                ? "border-border bg-primary/10 text-primary"
                : kategori === "betaling"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-dashed border-border bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>

      {/* Body */}
      <div className="min-w-0 py-3.5">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] ${
              KATEGORI_BADGE_STIL[kategori]
            }`}
          >
            {KATEGORI_LABEL[kategori]}
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
            {tidsstempel}
          </span>
        </div>
        <p
          className={`font-display text-sm font-semibold leading-snug tracking-tight ${
            ulest ? "text-foreground" : "font-medium text-muted-foreground"
          }`}
        >
          {v.title}
        </p>
        {v.body && (
          <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted-foreground">
            {v.body}
          </p>
        )}
      </div>

      {/* Mer-knapp */}
      <button
        type="button"
        aria-label="Mer"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );

  return (
    <li>
      {v.link ? (
        <Link href={v.link} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bell className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          Ingen varsler her — du er{" "}
          <em className="font-normal italic text-primary">à jour</em>
        </h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Alt nytt vises her: meldinger fra coach, AI-forslag, bookinger og
          fakturaer.
        </p>
      </div>
    </div>
  );
}
