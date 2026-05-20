"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Bell,
  Calendar,
  CheckCheck,
  ClipboardList,
  Info,
  MessageSquare,
  Target,
  Trash2,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  deleteNotifications,
  markNotificationsRead,
} from "./actions";

export type VarselItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type FilterId = "alle" | "uleste" | "coach" | "system" | "mal";

const FILTRE: { id: FilterId; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "uleste", label: "Uleste" },
  { id: "coach", label: "Coach" },
  { id: "system", label: "System" },
  { id: "mal", label: "Mål" },
];

const IKON_MAP: Record<string, LucideIcon> = {
  booking: Calendar,
  plan: ClipboardList,
  achievement: Trophy,
  melding: MessageSquare,
  drill: Target,
  trackman: Zap,
  system: Info,
};

// Hvilke type-strenger faller inn under hvert filter.
const FILTER_TYPER: Record<Exclude<FilterId, "alle" | "uleste">, string[]> = {
  coach: ["melding", "plan", "drill"],
  system: ["system", "booking", "trackman"],
  mal: ["achievement"],
};

function gruppeNoekkel(d: Date): "i-dag" | "i-gar" | "tidligere" {
  const now = new Date();
  const sammeDato = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sammeDato(d, now)) return "i-dag";
  const i_gaar = new Date(now);
  i_gaar.setDate(i_gaar.getDate() - 1);
  if (sammeDato(d, i_gaar)) return "i-gar";
  return "tidligere";
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export function VarslerClient({
  varsler,
  demo,
}: {
  varsler: VarselItem[];
  demo: boolean;
}) {
  const [filter, setFilter] = useState<FilterId>("alle");
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const filtrert = useMemo(() => {
    if (filter === "alle") return varsler;
    if (filter === "uleste") return varsler.filter((v) => !v.readAt);
    const typer = FILTER_TYPER[filter];
    return varsler.filter((v) => typer.includes(v.type));
  }, [filter, varsler]);

  const grupper = useMemo(() => {
    const out: Record<"i-dag" | "i-gar" | "tidligere", VarselItem[]> = {
      "i-dag": [],
      "i-gar": [],
      tidligere: [],
    };
    for (const v of filtrert) out[gruppeNoekkel(v.createdAt)].push(v);
    return out;
  }, [filtrert]);

  const ulestAntall = varsler.filter((v) => !v.readAt).length;
  const harValgte = valgte.size > 0;
  const erDemo = demo;

  function toggleValgt(id: string) {
    setValgte((prev) => {
      const neste = new Set(prev);
      if (neste.has(id)) neste.delete(id);
      else neste.add(id);
      return neste;
    });
  }

  function markerAlleLest() {
    if (erDemo) return;
    startTransition(async () => {
      await markNotificationsRead();
    });
  }

  function slettValgte() {
    if (erDemo || valgte.size === 0) return;
    const ids = Array.from(valgte);
    startTransition(async () => {
      await deleteNotifications(ids);
      setValgte(new Set());
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MINE VARSLER"
        titleLead="Alle"
        titleItalic="varsler"
        sub={
          ulestAntall > 0
            ? `${ulestAntall} ulest · klikk for å gå til kilden.`
            : "Alt er lest. Bra jobba."
        }
        actions={
          ulestAntall > 0 ? (
            <button
              type="button"
              onClick={markerAlleLest}
              disabled={pending || erDemo}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              {pending ? "Markerer …" : "Marker alle som lest"}
            </button>
          ) : undefined
        }
      />

      {erDemo && (
        <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
          Demo-data · ekte varsler kommer her etter hvert
        </div>
      )}

      {/* Filter-pills */}
      <nav
        aria-label="Filter varsler"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTRE.map((f) => {
          const aktiv = filter === f.id;
          const antall =
            f.id === "alle"
              ? varsler.length
              : f.id === "uleste"
                ? ulestAntall
                : varsler.filter((v) =>
                    FILTER_TYPER[f.id as Exclude<FilterId, "alle" | "uleste">].includes(v.type),
                  ).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {f.label}
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  aktiv ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {antall}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bulk actions */}
      {harValgte && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.10em] text-muted-foreground">
            {valgte.size} valgt
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setValgte(new Set())}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={slettValgte}
              disabled={pending || erDemo}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              {pending ? "Sletter …" : "Slett valgte"}
            </button>
          </div>
        </div>
      )}

      {/* Innhold */}
      {filtrert.length === 0 ? (
        <EmptyState
          icon={Bell}
          titleItalic="Ingen varsler"
          titleTrail="ennå"
          sub="Vi sier fra her når noe skjer — coach-meldinger, plan-oppdateringer, milepæler."
        />
      ) : (
        <div className="space-y-8">
          <Gruppe
            tittel="I dag"
            items={grupper["i-dag"]}
            valgte={valgte}
            onToggle={toggleValgt}
          />
          <Gruppe
            tittel="I går"
            items={grupper["i-gar"]}
            valgte={valgte}
            onToggle={toggleValgt}
          />
          <Gruppe
            tittel="Tidligere"
            items={grupper.tidligere}
            valgte={valgte}
            onToggle={toggleValgt}
            visDato
          />
        </div>
      )}
    </div>
  );
}

function Gruppe({
  tittel,
  items,
  valgte,
  onToggle,
  visDato,
}: {
  tittel: string;
  items: VarselItem[];
  valgte: Set<string>;
  onToggle: (id: string) => void;
  visDato?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {tittel}
      </h2>
      <ul className="space-y-2">
        {items.map((v) => (
          <Rad
            key={v.id}
            v={v}
            checked={valgte.has(v.id)}
            onToggle={() => onToggle(v.id)}
            visDato={visDato}
          />
        ))}
      </ul>
    </section>
  );
}

function Rad({
  v,
  checked,
  onToggle,
  visDato,
}: {
  v: VarselItem;
  checked: boolean;
  onToggle: () => void;
  visDato?: boolean;
}) {
  const Icon = IKON_MAP[v.type] ?? Info;
  const ulest = !v.readAt;
  const tidsstempel = visDato
    ? `${formatDato(v.createdAt)} · ${formatTid(v.createdAt)}`
    : formatTid(v.createdAt);

  const inner = (
    <div
      className={`flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 ${
        ulest
          ? "border-primary/30 bg-primary/5"
          : "border-border"
      }`}
    >
      <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {v.title}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            {tidsstempel}
          </span>
        </div>
        {v.body && (
          <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
        )}
        {v.link && (
          <span className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            Gå til kilden →
          </span>
        )}
      </div>
      <span
        aria-label={ulest ? "Ulest" : "Behandlet"}
        className={`mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${
          ulest ? "bg-destructive" : "bg-primary/70"
        }`}
      />
    </div>
  );

  return (
    <li className="relative">
      <label
        className="absolute left-3 top-3 z-10 inline-flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={`Velg ${v.title}`}
          className="h-4 w-4 cursor-pointer rounded-sm border-input accent-primary"
        />
      </label>
      <div className="pl-7">
        {v.link ? (
          <Link href={v.link} className="block">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </li>
  );
}
