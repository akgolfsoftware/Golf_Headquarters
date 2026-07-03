"use client";

/**
 * AgencyOS — booking-oversikt (/admin/bookinger).
 * Pixel-port av [historisk fasit, fjernet 2026-07-03] agencyos/components-agency-bookings.html.
 *
 * Tittel-rad (BOOKINGER · uke · stats) · toolbar (periode-pill-tabs +
 * dropdown-filtre + eksport + Ny booking) · inline lime-tint ny-booking-form
 * (autocomplete spiller med credit-saldo + credit-check) · dag-gruppert tabell
 * (8 kolonner med status-prikk + segmentert credit-bar) · paginering.
 *
 * Bygget med DS-tokens (ingen hardkodet hex) + lucide. Interaktivitet er
 * klient-side (filter/pill/form-toggle/autocomplete); data kommer fra
 * loadBookinger som serialisert props.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Download,
  Flag,
  MapPin,
  Plus,
  PlusCircle,
  Radar,
  Search,
  Tag,
  User as UserIcon,
  UserCog,
  Users,
  UserX,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer (delt med data-loaderen) ──────────────────────────────
export type StatusKey = "bekreftet" | "pagaar" | "uten" | "avbestilt" | "fullf";
export type TypeKind = "coach" | "tm" | "gruppe" | "bane";

export type BookingCredit =
  | { mode: "credit"; remaining: number; total: number; tone: "ok" | "warn" | "danger" }
  | { mode: "inkl"; tone: "ok" }
  | { mode: "pay"; tone: "danger" };

export type BookingRow = {
  id: string;
  startMs: number;
  dayKey: string;
  dayLabel: string;
  isToday: boolean;
  weekStartMs: number;
  weekNo: number;
  dow: string;
  dateShort: string;
  time: string;
  durMin: number;
  playerName: string;
  playerInitials: string;
  playerSub: string;
  coachName: string | null;
  coachInitials: string | null;
  coachId: string | null;
  type: { kind: TypeKind; label: string };
  credit: BookingCredit;
  location: string;
  status: StatusKey;
};

export type BookingStat = { label: string; value: number };
export type CoachOption = { id: string; name: string; initials: string };
export type PlayerOption = {
  id: string;
  name: string;
  initials: string;
  sub: string;
  creditsRemaining: number | null;
  creditsTotal: number | null;
};
export type ServiceTypeOption = {
  id: string;
  name: string;
  durationMin: number;
  priceOre: number;
};

export type BookingerViewProps = {
  rows: BookingRow[];
  stats: BookingStat[];
  coachOptions: CoachOption[];
  playerOptions: PlayerOption[];
  serviceOptions: ServiceTypeOption[];
  nowMs: number;
  currentWeekNo: number;
  currentWeekStartMs: number;
};

const PAGE_SIZE = 8;

// ── Type-pille tone-klasser ─────────────────────────────────────
const typeMeta: Record<TypeKind, { icon: LucideIcon; cls: string }> = {
  coach: { icon: UserIcon, cls: "bg-success/10 text-success-foreground" },
  tm: { icon: Radar, cls: "bg-info/10 text-info-foreground" },
  gruppe: { icon: Users, cls: "bg-warning/15 text-warning-foreground" },
  bane: { icon: Flag, cls: "bg-accent/30 text-primary" },
};

// ── Status-pille tone-klasser + prikk-farge ─────────────────────
const statusMeta: Record<
  StatusKey,
  { label: string; cls: string; dot: string }
> = {
  bekreftet: {
    label: "Bekreftet",
    cls: "bg-success/10 text-success-foreground",
    dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.6)]",
  },
  pagaar: { label: "Pågår", cls: "bg-accent/30 text-primary", dot: "bg-primary" },
  uten: { label: "Uten coach", cls: "bg-warning/15 text-warning-foreground", dot: "bg-warning" },
  avbestilt: { label: "Avbestilt", cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  fullf: { label: "Fullført", cls: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground" },
};

// ── Avatar (tabell-tett, ikke athletic — 28px/18px) ─────────────
function Avatar({
  initials,
  tone = "default",
  size = "md",
}: {
  initials: string;
  tone?: "default" | "pri" | "lime";
  size?: "md" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        size === "md" ? "h-7 w-7 text-[10px]" : "h-[18px] w-[18px] text-[8px]",
        tone === "pri"
          ? "bg-primary text-primary-foreground"
          : tone === "lime"
            ? "bg-accent text-primary"
            : "bg-secondary text-foreground",
      )}
    >
      {initials}
    </span>
  );
}

// ── Segmentert credit-bar (fast bredde, 1 segment = 1 credit) ───
function CreditBar({ remaining, total, tone }: { remaining: number; total: number; tone: "ok" | "warn" | "danger" }) {
  const onCls = tone === "warn" ? "bg-warning" : tone === "danger" ? "bg-destructive" : "bg-primary";
  return (
    <span className="inline-flex w-[88px] gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 min-w-0 flex-1 rounded-full",
            i < remaining ? onCls : "bg-foreground/[0.08]",
          )}
        />
      ))}
    </span>
  );
}

function CreditCell({ credit }: { credit: BookingCredit }) {
  if (credit.mode === "inkl") {
    return (
      <span className="inline-flex items-center gap-2 font-mono tabular-nums">
        <span className="rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning-foreground">
          Inkl.
        </span>
      </span>
    );
  }
  if (credit.mode === "pay") {
    return (
      <span className="inline-flex items-center gap-2 font-mono tabular-nums">
        <span className="text-xs font-extrabold tracking-[-0.01em] text-destructive">
          0<span className="font-semibold text-muted-foreground">/4</span>
        </span>
        <CreditBar remaining={0} total={4} tone="danger" />
        <span className="rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-warning-foreground">
          Pay
        </span>
      </span>
    );
  }
  const fracCls =
    credit.tone === "warn" ? "text-warning" : credit.tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
      <span className={cn("text-xs font-extrabold tracking-[-0.01em]", fracCls)}>
        {credit.remaining}
        <span className="font-semibold text-muted-foreground">/{credit.total}</span>
      </span>
      <CreditBar remaining={credit.remaining} total={credit.total} tone={credit.tone} />
    </span>
  );
}

// ── Toolbar dropdown-knapp ──────────────────────────────────────
function FilterDrop({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border py-0 pl-3 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em]",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon className={cn("h-3 w-3", active ? "text-accent" : "text-muted-foreground")} strokeWidth={1.75} aria-hidden />
      <span className={active ? "text-accent" : "text-muted-foreground"}>{label}</span>
      {value}
      <ChevronDown className={cn("h-3 w-3", active ? "text-accent" : "text-muted-foreground")} strokeWidth={2} aria-hidden />
    </button>
  );
}

// ── Inline ny-booking-form (lime-tint) ──────────────────────────
function NewBookingForm({
  players,
  services,
  onClose,
}: {
  players: PlayerOption[];
  services: ServiceTypeOption[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? players.filter((p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q))
      : players;
    return base.slice(0, 5);
  }, [players, query]);

  const selected = players.find((p) => p.id === selectedId) ?? null;
  const service = services[0] ?? null;
  const cost = 1; // 1-til-1 coaching trekker 1 credit
  const hasCredits = selected?.creditsRemaining != null && selected.creditsTotal != null;
  const after = hasCredits ? Math.max(0, selected!.creditsRemaining! - cost) : null;
  const creditsOk = hasCredits ? selected!.creditsRemaining! >= cost : false;

  const showAuto = query.trim().length > 0 && !selected;

  return (
    <div className="relative border-b border-accent bg-accent/10 px-5 pb-4 pt-3.5">
      <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
        <PlusCircle className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Ny booking · utkast
        <button
          type="button"
          onClick={onClose}
          aria-label="Avbryt"
          className="ml-auto inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-primary hover:bg-primary/[0.08]"
        >
          <X className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-1 items-end gap-2.5 lg:grid-cols-[240px_140px_110px_170px_1fr_auto]">
        {/* Spiller — autocomplete */}
        <div className="relative flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            Spiller
          </span>
          <span
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-2.5",
              showAuto ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.10)]" : "border-input",
            )}
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <input
              type="text"
              value={selected ? selected.name : query}
              onChange={(e) => {
                setSelectedId(null);
                setQuery(e.target.value);
              }}
              placeholder="Søk navn…"
              className="min-w-0 flex-1 bg-transparent font-sans text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
          </span>

          {showAuto && matches.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 rounded-lg border border-border bg-card p-1 shadow-md">
              {matches.map((p, i) => {
                const fracTone =
                  p.creditsRemaining == null
                    ? "text-destructive"
                    : p.creditsRemaining <= 1
                      ? "text-warning"
                      : "text-foreground";
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setSelectedId(p.id);
                      setQuery("");
                    }}
                    className={cn(
                      "grid w-full grid-cols-[24px_1fr_auto] items-center gap-x-2 rounded-md px-2 py-1.5 text-left hover:bg-primary/[0.06]",
                      i === 0 && "bg-primary/[0.06]",
                    )}
                  >
                    <Avatar initials={p.initials} tone={i === 0 ? "pri" : "default"} size="md" />
                    <span className="text-[13px] tracking-[-0.005em] text-foreground">
                      {p.name}
                      <span className="mt-px block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                        {p.sub || "—"}
                      </span>
                    </span>
                    <span className={cn("font-mono text-[10px] font-extrabold tabular-nums", fracTone)}>
                      {p.creditsRemaining != null && p.creditsTotal != null
                        ? `${p.creditsRemaining}/${p.creditsTotal}`
                        : "PAY"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dato */}
        <FormStatic label="Dato" icon={Calendar} value="Velg dato" />
        {/* Tid */}
        <FormStatic label="Tid" icon={Clock} value="Velg tid" />
        {/* Type · varighet */}
        <FormStatic
          label="Type · varighet"
          icon={Radar}
          value={service ? `${service.name} · ${service.durationMin} m` : "Velg type"}
        />

        {/* Credit-check */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            Credits
          </span>
          {selected && hasCredits ? (
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent bg-card px-3 font-mono text-[11px] font-bold tracking-[0.04em] text-foreground">
              <span className="font-semibold text-muted-foreground">
                Trekker <b className="font-extrabold text-foreground">{cost}</b>
              </span>
              <span className="h-3.5 w-px bg-border" />
              <span>
                Etter <b className="font-extrabold">{after} / {selected.creditsTotal}</b>
              </span>
              {creditsOk ? (
                <span className="inline-flex items-center gap-1 font-extrabold text-success">
                  <CheckCircle2 className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
                  OK
                </span>
              ) : (
                <span className="font-extrabold text-destructive">MANGLER</span>
              )}
            </span>
          ) : (
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 font-mono text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
              {selected ? "Pay-as-you-go" : "Velg spiller"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-transparent">
            .
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="button"
              disabled={!selected || (!creditsOk && hasCredits)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Bekreft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormStatic({ label, icon: Icon, value }: { label: string; icon: LucideIcon; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-[13px] text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        {value}
        <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
      </span>
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
type Period = "idag" | "uke" | "neste" | "alle";

export function BookingerView({
  rows,
  stats,
  coachOptions,
  playerOptions,
  serviceOptions,
  nowMs,
  currentWeekNo,
  currentWeekStartMs,
}: BookingerViewProps) {
  const [period, setPeriod] = useState<Period>("uke");
  const [coachId, setCoachId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusKey | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeKind | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(0);

  const nextWeekStart = currentWeekStartMs + 604_800_000;
  const todayStart = (() => {
    const d = new Date(nowMs);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const todayEnd = todayStart + 86_400_000;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (period === "idag" && !(r.startMs >= todayStart && r.startMs < todayEnd)) return false;
      if (period === "uke" && r.weekStartMs !== currentWeekStartMs) return false;
      if (period === "neste" && r.weekStartMs !== nextWeekStart) return false;
      if (coachId && r.coachId !== coachId) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (typeFilter && r.type.kind !== typeFilter) return false;
      return true;
    });
  }, [rows, period, coachId, statusFilter, typeFilter, todayStart, todayEnd, currentWeekStartMs, nextWeekStart]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const showingTo = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE);

  // Stats for tittel (kontekstuell tekst).
  const statTekst = stats
    .filter((s) => s.value > 0)
    .map((s) => ({ value: s.value, label: s.label }));

  const periodLabel =
    period === "idag"
      ? "I dag"
      : period === "uke"
        ? `Uke ${currentWeekNo}`
        : period === "neste"
          ? `Uke ${currentWeekNo + 1}`
          : "Alle";

  // Dag-grupper for synlig side.
  const groups = useMemo(() => {
    const map = new Map<string, BookingRow[]>();
    for (const r of pageRows) {
      const arr = map.get(r.dayKey) ?? [];
      arr.push(r);
      map.set(r.dayKey, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [pageRows]);

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  const setPeriodR = resetPage(setPeriod);
  const setCoachR = resetPage<string | null>(setCoachId);
  const setStatusR = resetPage<StatusKey | null>(setStatusFilter);
  const setTypeR = resetPage<TypeKind | null>(setTypeFilter);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* TITLE */}
      <div className="flex flex-wrap items-baseline gap-4 px-5 pb-3 pt-[18px]">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Bookinger
        </span>
        <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
          {periodLabel} · {filtered.length} bookinger
        </h2>
        <span className="ml-auto inline-flex flex-wrap items-center gap-x-4 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          {statTekst.length === 0 ? (
            <span>ingen i perioden</span>
          ) : (
            statTekst.map((s, i) => (
              <span key={s.label} className="inline-flex items-center gap-4">
                {i > 0 && <span aria-hidden>·</span>}
                <span>
                  <b className="font-extrabold text-foreground">{s.value}</b> {s.label}
                </span>
              </span>
            ))
          )}
        </span>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 border-y border-border bg-secondary px-5 py-2.5">
        <div className="mr-1 inline-flex gap-0 rounded-full border border-border bg-card p-0.5">
          {(
            [
              ["idag", "I dag"],
              ["uke", `Uke ${currentWeekNo}`],
              ["neste", `Uke ${currentWeekNo + 1}`],
              ["alle", "Alle"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriodR(key)}
              className={cn(
                "h-6 rounded-full px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                period === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <FilterDrop
          icon={UserCog}
          label="Coach"
          value={coachId ? coachOptions.find((c) => c.id === coachId)?.name ?? "Alle" : "Alle"}
          active={coachId != null}
          onClick={() => {
            // Enkel syklus gjennom coacher (dropdown-popover er utenfor scope for denne porten).
            if (coachOptions.length === 0) return;
            const idx = coachId ? coachOptions.findIndex((c) => c.id === coachId) : -1;
            const next = coachOptions[idx + 1];
            setCoachR(next ? next.id : null);
          }}
        />
        <FilterDrop
          icon={CircleDot}
          label="Status"
          value={statusFilter ? statusMeta[statusFilter].label : "Alle"}
          active={statusFilter != null}
          onClick={() => {
            const order: (StatusKey | null)[] = ["bekreftet", "pagaar", "uten", "fullf", "avbestilt", null];
            const idx = order.indexOf(statusFilter);
            setStatusR(order[(idx + 1) % order.length]);
          }}
        />
        <FilterDrop
          icon={Tag}
          label="Type"
          value={typeFilter ? labelForType(typeFilter) : "Alle"}
          active={typeFilter != null}
          onClick={() => {
            const order: (TypeKind | null)[] = ["coach", "tm", "gruppe", "bane", null];
            const idx = order.indexOf(typeFilter);
            setTypeR(order[(idx + 1) % order.length]);
          }}
        />

        <div className="ml-auto inline-flex gap-1.5">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
          >
            <Download className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            Eksport
          </button>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
            Ny booking
          </button>
        </div>
      </div>

      {/* INLINE NEW BOOKING FORM */}
      {formOpen && (
        <NewBookingForm
          players={playerOptions}
          services={serviceOptions}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse font-sans">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[130px]" />
            <col className="w-[132px]" />
            <col className="w-[170px]" />
            <col className="w-[138px]" />
            <col className="w-[124px]" />
          </colgroup>
          <thead>
            <tr>
              {["Spiller", "Dato", "Tid", "Coach", "Type", "Credits", "Lokasjon", "Status"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border bg-card px-3 py-2.5 text-left font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <Calendar className="mx-auto h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
                  <p className="mt-3 text-[13px] text-muted-foreground">Ingen bookinger i perioden.</p>
                  <button
                    type="button"
                    onClick={() => setFormOpen(true)}
                    className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
                    Opprett første booking
                  </button>
                </td>
              </tr>
            ) : (
              groups.map((g) => {
                const head = g.items[0];
                const paa = g.items.filter((r) => r.status === "pagaar").length;
                const uten = g.items.filter(
                  (r) => r.coachId == null && r.status !== "avbestilt" && r.status !== "fullf",
                ).length;
                return (
                  <ByDay key={g.key} head={head} count={g.items.length} paa={paa} uten={uten} rows={g.items} />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-border bg-secondary px-5 py-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          <span>
            Viser <b className="text-foreground">{showingFrom}–{showingTo}</b> av{" "}
            <b className="text-foreground">{filtered.length}</b> · {periodLabel.toLowerCase()}
          </span>
          <div className="inline-flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Forrige side"
              className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground disabled:opacity-40 hover:enabled:bg-secondary"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={2} aria-hidden />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={cn(
                  "inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-md border px-2 font-mono text-[11px] font-extrabold",
                  i === safePage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              aria-label="Neste side"
              className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground disabled:opacity-40 hover:enabled:bg-secondary"
            >
              <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function labelForType(kind: TypeKind): string {
  return { coach: "Coaching", tm: "TrackMan", gruppe: "Gruppe", bane: "Bane" }[kind];
}

// ── Dag-gruppe (datehead + rader) ───────────────────────────────
function ByDay({
  head,
  count,
  paa,
  uten,
  rows,
}: {
  head: BookingRow;
  count: number;
  paa: number;
  uten: number;
  rows: BookingRow[];
}) {
  return (
    <>
      <tr>
        <td
          colSpan={8}
          className="border-y border-border bg-secondary px-5 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                head.isToday ? "bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" : "bg-muted-foreground",
              )}
            />
            {head.dayLabel}
            {head.isToday && " · I DAG"}
            <span className="font-bold text-muted-foreground">
              {" · "}
              <b className="text-foreground">{count}</b> bookinger
              {paa > 0 && (
                <>
                  {" · "}
                  <b className="text-foreground">{paa}</b> pågår
                </>
              )}
              {uten > 0 && (
                <>
                  {" · "}
                  <b className="text-foreground">{uten}</b> uten coach
                </>
              )}
            </span>
          </span>
        </td>
      </tr>
      {rows.map((r) => (
        <BookingTr key={r.id} r={r} />
      ))}
    </>
  );
}

function BookingTr({ r }: { r: BookingRow }) {
  const TypeIcon = typeMeta[r.type.kind].icon;
  const st = statusMeta[r.status];
  const playerTone: "default" | "pri" | "lime" =
    r.status === "pagaar" ? "pri" : r.type.kind === "bane" ? "lime" : "default";

  return (
    <tr className="cursor-pointer transition hover:bg-primary/[0.03]">
      {/* Spiller */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <Link href={`/admin/gjennomfore/okter/${r.id}`} className="flex items-center gap-2.5">
          <Avatar initials={r.playerInitials} tone={playerTone} size="md" />
          <span className="text-[13px] font-bold tracking-[-0.005em] text-foreground">
            {r.playerName}
            <span className="mt-px block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
              {r.playerSub || "—"}
            </span>
          </span>
        </Link>
      </td>
      {/* Dato */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {r.dow}
          </span>
          <span className="font-mono text-[13px] font-extrabold tracking-[-0.005em] text-foreground tabular-nums">
            {r.dateShort}
          </span>
        </span>
      </td>
      {/* Tid */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="inline-flex items-baseline gap-1.5 font-mono tabular-nums">
          <span className="text-[13px] font-extrabold tracking-[-0.01em] text-foreground">{r.time}</span>
          <span className="text-[10px] font-bold tracking-[0.04em] text-muted-foreground">{r.durMin} m</span>
        </span>
      </td>
      {/* Coach */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        {r.coachName ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
            <Avatar initials={r.coachInitials ?? "—"} size="sm" />
            {r.coachName}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
            <UserX className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Tildel coach
          </span>
        )}
      </td>
      {/* Type */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span
          className={cn(
            "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full py-0 pl-[7px] pr-[9px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em]",
            typeMeta[r.type.kind].cls,
          )}
        >
          <TypeIcon className="h-2.5 w-2.5 shrink-0" strokeWidth={2} aria-hidden />
          {r.type.label}
        </span>
      </td>
      {/* Credits */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <CreditCell credit={r.credit} />
      </td>
      {/* Lokasjon */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="inline-flex items-center gap-1.5 text-xs tracking-[-0.005em] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
          {r.location}
        </span>
      </td>
      {/* Status */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span
          className={cn(
            "inline-flex h-[22px] items-center gap-1.5 rounded-full py-0 pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
            st.cls,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
          {st.label}
        </span>
      </td>
    </tr>
  );
}
