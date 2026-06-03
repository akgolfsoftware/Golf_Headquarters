"use client";

/**
 * AgencyOS · Bookinger — alle bookinger + manuell (inline) ny-booking.
 *
 * Presentasjonell og props-drevet. Portet pixel-mot v10-fasiten
 * (public/design-handover/_screens/ag-bookinger.png +
 *  public/design-handover/agencyos/components-agency-bookings.html).
 *
 * Struktur:
 *   - Tittelrad: eyebrow + "Uke N · M bookinger" + periode-meta (høyre)
 *   - Toolbar: segmentert periode-pill (I DAG · UKE N · UKE N+1 · ALLE) +
 *     dropdown-filtre (Coach · Status · Type) + Eksport + Ny booking
 *   - Inline ny-booking-form (lime banner) — togglet av "Ny booking", lukket i fasit
 *   - Tabell gruppert per dag (datehead-rad), 8 kolonner
 *   - Paginering
 *
 * INGEN Prisma/DB/auth — data kommer inn via props. Interaktivitet er lokal
 * UI-state (aktiv periode, åpen ny-booking-form) for produksjonsklar følelse.
 */

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Flag,
  MapPin,
  Plus,
  PlusCircle,
  Radar,
  Search,
  User,
  UserX,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
 * Typer
 * ────────────────────────────────────────────────────────────────────────── */

export type BookingStatus =
  | "bekreftet"
  | "pagaar"
  | "uten-coach"
  | "avbestilt"
  | "fullfort";

export type BookingType = "coaching" | "trackman" | "gruppe" | "bane";

export type CreditDisplay =
  /** Segmentert credit-saldo (telleren av nevneren). */
  | { kind: "credits"; used: number; total: number; tone?: "ok" | "warn" | "danger"; pay?: boolean }
  /** Pay-as-you-go uten credit-pakke. */
  | { kind: "pay" }
  /** Inkludert i medlemskap (f.eks. gruppetime). */
  | { kind: "inkl" };

export type AvatarTone = "neutral" | "primary" | "lime";

export type BookingRow = {
  id: string;
  /** Spiller-initialer + navn + undertekst. */
  player: { initials: string; name: string; sub: string; tone?: AvatarTone };
  /** Ukedag (TIR) + dato (2/6). */
  date: { dow: string; dm: string };
  /** Starttid (17:00) + varighet ("20 m"). */
  time: { start: string; dur: string };
  /** Coach — eller null for "Tildel coach". */
  coach: { initials: string; name: string } | null;
  type: BookingType;
  credit: CreditDisplay;
  location: string;
  status: BookingStatus;
  /** Lenke til booking-detalj (rad-klikk). */
  href?: string;
};

export type BookingDayGroup = {
  /** Datotittel, f.eks. "TIR 2 JUN". */
  label: string;
  /** Antall bookinger i gruppen (vises i datehead). */
  count: number;
  /** Markér som "i dag" (lime puls-dot). */
  today?: boolean;
  /** Valgfri ekstra-meta i datehead, f.eks. "1 pågår". */
  extraMeta?: string;
  rows: BookingRow[];
};

export type PeriodTab = { key: string; label: string };

export type FilterDropdown = { key: string; icon: LucideIcon; label: string; value: string; active?: boolean };

export type BookingerData = {
  /** Periode-tittel, f.eks. "Uke 23". */
  periodLabel: string;
  /** Totalt antall bookinger i perioden. */
  totalBookings: number;
  /** Høyre-meta i tittelrad. Tom liste → "ingen i perioden". */
  headMeta: { value: string; label: string }[];
  periodTabs: PeriodTab[];
  /** Nøkkel på aktiv periode-tab (initial). */
  activePeriod: string;
  filters: FilterDropdown[];
  groups: BookingDayGroup[];
  pagination: {
    fromTo: string; // "1–1"
    total: number; // 1
    scope: string; // "uke 23"
    page: number;
    pages: number;
  };
};

/* ──────────────────────────────────────────────────────────────────────────
 * Sub-komponenter
 * ────────────────────────────────────────────────────────────────────────── */

const avatarToneCls: Record<AvatarTone, string> = {
  neutral: "bg-secondary text-foreground",
  primary: "bg-primary text-accent",
  lime: "bg-accent text-primary",
};

/** Liten flat tabell-avatar (28px) med initialer. */
function CellAvatar({
  initials,
  tone = "neutral",
  size = 28,
}: {
  initials: string;
  tone?: AvatarTone;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold uppercase",
        size <= 18 ? "text-[8px]" : "text-[10px]",
        avatarToneCls[tone],
      )}
    >
      {initials}
    </span>
  );
}

const typeMeta: Record<BookingType, { label: string; icon: LucideIcon; cls: string }> = {
  coaching: { label: "Coaching", icon: User, cls: "bg-primary/10 text-success-foreground" },
  trackman: { label: "TrackMan", icon: Radar, cls: "bg-info/10 text-info" },
  gruppe: { label: "Gruppe", icon: Users, cls: "bg-warning/15 text-warning" },
  bane: { label: "Bane / Spill", icon: Flag, cls: "bg-accent/30 text-primary" },
};

function TypePill({ type }: { type: BookingType }) {
  const m = typeMeta[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-[7px] pr-[9px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em]",
        m.cls,
      )}
    >
      <m.icon className="h-2.5 w-2.5 shrink-0" strokeWidth={1.5} aria-hidden />
      {m.label}
    </span>
  );
}

const statusMeta: Record<BookingStatus, { label: string; pill: string; dot: string }> = {
  bekreftet: {
    label: "Bekreftet",
    pill: "bg-primary/10 text-success-foreground",
    dot: "bg-success [box-shadow:0_0_6px_rgba(26,125,86,0.6)]",
  },
  pagaar: { label: "Pågår", pill: "bg-accent/30 text-primary", dot: "bg-primary" },
  "uten-coach": { label: "Uten coach", pill: "bg-warning/15 text-warning", dot: "bg-warning" },
  avbestilt: { label: "Avbestilt", pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  fullfort: { label: "Fullført", pill: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground" },
};

function StatusPillBooking({ status }: { status: BookingStatus }) {
  const m = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
        m.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

/** Segmentert credit-bar (fast bredde, ett segment = én credit). */
function CreditCell({ credit }: { credit: CreditDisplay }) {
  if (credit.kind === "inkl") {
    return (
      <span className="inline-flex items-center">
        <span className="rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning">
          Inkl.
        </span>
      </span>
    );
  }
  if (credit.kind === "pay") {
    return (
      <span className="inline-flex items-center">
        <span className="rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning">
          Pay
        </span>
      </span>
    );
  }

  const tone = credit.tone ?? "ok";
  const fracCls =
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-warning" : "text-foreground";
  const segOn =
    tone === "danger" ? "bg-destructive" : tone === "warn" ? "bg-warning" : "bg-primary";

  return (
    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
      <span className={cn("text-xs font-extrabold tracking-[-0.01em]", fracCls)}>
        {credit.used}
        <span className="font-medium text-muted-foreground">/{credit.total}</span>
      </span>
      <span className="inline-flex w-[88px] gap-[2px]" aria-hidden>
        {Array.from({ length: credit.total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 min-w-0 flex-1 rounded-full",
              i < credit.used ? segOn : "bg-foreground/10",
            )}
          />
        ))}
      </span>
      {credit.pay && (
        <span className="rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning">
          Pay
        </span>
      )}
    </span>
  );
}

/** Segmentert periode-pill (én container, indre pill-tabs). */
function PeriodTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: PeriodTab[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Tidsperiode"
      className="inline-flex items-center gap-0 rounded-full border border-border bg-card p-0.5"
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.key)}
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] transition-colors",
              on ? "bg-primary text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** Dropdown-filter-knapp (label + valgt verdi + chevron). */
function FilterDrop({ filter }: { filter: FilterDropdown }) {
  const { icon: Icon, label, value, active } = filter;
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border py-0 pl-3 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] transition-colors",
        active
          ? "border-primary bg-primary text-accent"
          : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon
        className={cn("h-3 w-3 shrink-0", active ? "text-accent" : "text-muted-foreground")}
        strokeWidth={1.5}
        aria-hidden
      />
      <span className={cn(active ? "text-accent/80" : "text-muted-foreground")}>{label}</span>
      {value}
      <ChevronDown
        className={cn("h-3 w-3 shrink-0", active ? "text-accent" : "text-muted-foreground")}
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  );
}

/* ── Inline ny-booking-form ──────────────────────────────────────────────── */

function NewBookingForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative border-b border-accent bg-accent/10 px-5 pb-4 pt-3.5">
      <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
        <PlusCircle className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        Ny booking · utkast
        <button
          type="button"
          onClick={onClose}
          aria-label="Avbryt ny booking"
          className="ml-auto inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
        >
          <X className="h-3 w-3" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="grid items-end gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] xl:[grid-template-columns:minmax(220px,1.6fr)_140px_110px_minmax(160px,1fr)_auto]">
        <FormField label="Spiller">
          <span className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-sm text-foreground">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <input
              type="text"
              placeholder="Søk spiller…"
              className="min-w-0 flex-1 border-0 bg-transparent font-sans text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          </span>
        </FormField>

        <FormField label="Dato">
          <FormFakeInput icon={Calendar}>Velg dato</FormFakeInput>
        </FormField>

        <FormField label="Tid">
          <FormFakeInput icon={Clock}>Velg tid</FormFakeInput>
        </FormField>

        <FormField label="Type · varighet">
          <FormFakeInput icon={Radar}>TrackMan · 60 m</FormFakeInput>
        </FormField>

        <FormField label="" srLabel="Handlinger">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-colors hover:bg-[var(--color-brand-primary-hover)]"
            >
              <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
              Bekreft
            </button>
          </div>
        </FormField>
      </div>
    </div>
  );
}

function FormField({
  label,
  srLabel,
  children,
}: {
  label: string;
  srLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
      ) : (
        <span aria-hidden className="h-[12px] select-none">
          {srLabel && <span className="sr-only">{srLabel}</span>}
        </span>
      )}
      {children}
    </div>
  );
}

function FormFakeInput({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-[13px] text-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      {children}
      <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
    </span>
  );
}

/* ── Tabell-rad ──────────────────────────────────────────────────────────── */

function BookingTableRow({ row }: { row: BookingRow }) {
  const playerInner = (
    <div className="flex items-center gap-2.5">
      <CellAvatar initials={row.player.initials} tone={row.player.tone} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
          {row.player.name}
        </span>
        <span className="mt-px block truncate font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {row.player.sub}
        </span>
      </span>
    </div>
  );

  return (
    <tr className="border-b border-border transition-colors hover:bg-primary/[0.03]">
      <td className="px-3 py-3 align-middle">
        {row.href ? (
          <Link href={row.href} className="block rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {playerInner}
          </Link>
        ) : (
          playerInner
        )}
      </td>
      <td className="px-3 py-3 align-middle">
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {row.date.dow}
          </span>
          <span className="font-mono text-[13px] font-extrabold tracking-[-0.005em] text-foreground tabular-nums">
            {row.date.dm}
          </span>
        </span>
      </td>
      <td className="px-3 py-3 align-middle">
        <span className="inline-flex items-baseline gap-1.5 font-mono tabular-nums">
          <span className="text-[13px] font-extrabold tracking-[-0.01em] text-foreground">
            {row.time.start}
          </span>
          <span className="text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            {row.time.dur}
          </span>
        </span>
      </td>
      <td className="px-3 py-3 align-middle">
        {row.coach ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
            <CellAvatar initials={row.coach.initials} size={18} />
            {row.coach.name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
            <UserX className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
            Tildel coach
          </span>
        )}
      </td>
      <td className="px-3 py-3 align-middle">
        <TypePill type={row.type} />
      </td>
      <td className="px-3 py-3 align-middle">
        <CreditCell credit={row.credit} />
      </td>
      <td className="px-3 py-3 align-middle">
        <span className="inline-flex items-start gap-1.5 text-xs tracking-[-0.005em] text-muted-foreground">
          <MapPin className="mt-px h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
          {row.location}
        </span>
      </td>
      <td className="px-3 py-3 align-middle">
        <StatusPillBooking status={row.status} />
      </td>
    </tr>
  );
}

/* ── Mobil-kort (stacked, < md) ──────────────────────────────────────────── */

function BookingCard({ row }: { row: BookingRow }) {
  const inner = (
    <>
      {/* Topp: spiller + status */}
      <div className="flex items-center gap-2.5">
        <CellAvatar initials={row.player.initials} tone={row.player.tone} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
            {row.player.name}
          </span>
          <span className="mt-px truncate font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {row.player.sub}
          </span>
        </span>
        <StatusPillBooking status={row.status} />
      </div>

      {/* Tid + dato + type */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-baseline gap-1.5 font-mono tabular-nums">
          <span className="text-[13px] font-extrabold tracking-[-0.01em] text-foreground">
            {row.time.start}
          </span>
          <span className="text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            {row.time.dur}
          </span>
        </span>
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {row.date.dow} {row.date.dm}
        </span>
        <TypePill type={row.type} />
      </div>

      {/* Coach + lokasjon + credits */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {row.coach ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
            <CellAvatar initials={row.coach.initials} size={18} />
            {row.coach.name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
            <UserX className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
            Tildel coach
          </span>
        )}
        <span className="inline-flex items-start gap-1.5 text-xs tracking-[-0.005em] text-muted-foreground">
          <MapPin className="mt-px h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
          {row.location}
        </span>
        <CreditCell credit={row.credit} />
      </div>
    </>
  );

  return (
    <li className="px-5 py-3.5 transition-colors hover:bg-primary/[0.03]">
      {row.href ? (
        <Link
          href={row.href}
          className="flex flex-col gap-3 rounded no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex flex-col gap-3">{inner}</div>
      )}
    </li>
  );
}

function MobileBookingList({ groups }: { groups: BookingDayGroup[] }) {
  return (
    <div className="md:hidden">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="flex items-center gap-2 border-y border-border bg-secondary/30 px-5 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                g.today
                  ? "bg-accent [box-shadow:0_0_6px_rgba(209,248,67,0.7)]"
                  : "bg-muted-foreground",
              )}
            />
            <span className="inline-flex flex-wrap items-center gap-x-2">
              {g.label}
              {g.today && <span className="text-foreground">· I DAG</span>}
              <span className="font-bold text-muted-foreground">
                · <b className="font-extrabold text-foreground">{g.count}</b> bookinger
              </span>
              {g.extraMeta && (
                <span className="font-bold text-muted-foreground">· {g.extraMeta}</span>
              )}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {g.rows.map((row) => (
              <BookingCard key={row.id} row={row} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Hovedkomponent
 * ────────────────────────────────────────────────────────────────────────── */

export function Bookinger({ data }: { data: BookingerData }) {
  const [activePeriod, setActivePeriod] = useState(data.activePeriod);
  const [newOpen, setNewOpen] = useState(false);

  const empty = data.headMeta.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* TITTELRAD */}
        <div className="flex flex-wrap items-baseline gap-3 px-5 pb-3 pt-4">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            Bookinger
          </span>
          <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
            {data.periodLabel} · {data.totalBookings} bookinger
          </h2>
          <span className="ml-auto inline-flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            {empty ? (
              <span>ingen i perioden</span>
            ) : (
              data.headMeta.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-4">
                  {i > 0 && <span aria-hidden>·</span>}
                  <span>
                    <b className="font-extrabold text-foreground">{m.value}</b> {m.label}
                  </span>
                </span>
              ))
            )}
          </span>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-y border-border bg-secondary/30 px-5 py-2.5">
          <PeriodTabs tabs={data.periodTabs} active={activePeriod} onSelect={setActivePeriod} />
          {data.filters.map((f) => (
            <FilterDrop key={f.key} filter={f} />
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
            >
              <Download className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
              Eksport
            </button>
            <button
              type="button"
              onClick={() => setNewOpen((v) => !v)}
              aria-expanded={newOpen}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-colors hover:bg-[var(--color-brand-primary-hover)]"
            >
              <Plus className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
              Ny booking
            </button>
          </div>
        </div>

        {/* INLINE NY-BOOKING (togglet, lukket i fasit) */}
        {newOpen && <NewBookingForm onClose={() => setNewOpen(false)} />}

        {/* TABELL — desktop (kort-liste på mobil under) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed border-collapse font-sans">
            <colgroup>
              <col className="w-[220px]" />
              <col className="w-[110px]" />
              <col className="w-[110px]" />
              <col className="w-[130px]" />
              <col className="w-[132px]" />
              <col className="w-[150px]" />
              <col className="w-[138px]" />
              <col className="w-[124px]" />
            </colgroup>
            <thead>
              <tr>
                {["Spiller", "Dato", "Tid", "Coach", "Type", "Credits", "Lokasjon", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-border bg-card px-3 py-2.5 text-left font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => (
                <React.Fragment key={g.label}>
                  <tr>
                    <td
                      colSpan={8}
                      className="border-y border-border bg-secondary/30 px-5 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            g.today
                              ? "bg-accent [box-shadow:0_0_6px_rgba(209,248,67,0.7)]"
                              : "bg-muted-foreground",
                          )}
                        />
                        {g.label}
                        {g.today && <span className="text-foreground"> · I DAG</span>}
                        {" · "}
                        <span className="font-bold text-muted-foreground">
                          <b className="font-extrabold text-foreground">{g.count}</b> bookinger
                        </span>
                        {g.extraMeta && (
                          <span className="font-bold text-muted-foreground">· {g.extraMeta}</span>
                        )}
                      </span>
                    </td>
                  </tr>
                  {g.rows.map((row) => (
                    <BookingTableRow key={row.id} row={row} />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBIL — stacked kort */}
        <MobileBookingList groups={data.groups} />

        {/* PAGINERING */}
        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary/30 px-5 py-3">
          <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            Viser <b className="font-extrabold text-foreground">{data.pagination.fromTo}</b> av{" "}
            <b className="font-extrabold text-foreground">{data.pagination.total}</b> ·{" "}
            {data.pagination.scope}
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-label="Forrige side"
              disabled={data.pagination.page <= 1}
              className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            </button>
            {Array.from({ length: data.pagination.pages }).map((_, i) => {
              const n = i + 1;
              const on = n === data.pagination.page;
              return (
                <button
                  key={n}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-md border px-2 font-mono text-[11px] font-extrabold tabular-nums transition-colors",
                    on
                      ? "border-primary bg-primary text-accent"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Neste side"
              disabled={data.pagination.page >= data.pagination.pages}
              className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
