"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── CreditBar ─────────────────────────────────────────────────────────── */

export function CreditBar({
  used,
  total,
  className,
}: {
  used: number;
  total: number;
  className?: string;
}) {
  const ok = used <= total;
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex gap-0.5" role="img" aria-label={`${used} av ${total} credits brukt`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-2.5 w-1.5 rounded-[1px]", i < used ? "bg-primary" : "bg-secondary")} />
        ))}
      </span>
      <span className={cn("font-mono text-[10px] font-bold tabular-nums", ok ? "text-muted-foreground" : "text-destructive")}>
        {used} / {total}
      </span>
    </div>
  );
}

/* ── AutocompleteInput ─────────────────────────────────────────────────── */

export type AcOption = { id: string; initials: string; name: string; sub?: string; avatarClass?: string };

export function AutocompleteInput({
  options,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: {
  options: AcOption[];
  value: string;
  onChange: (q: string) => void;
  onSelect: (opt: AcOption) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const q = value.toLowerCase();
  const filtered = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-md border border-border bg-card shadow-md">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(o); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left hover:bg-secondary"
            >
              <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full font-display text-[9px] font-bold", o.avatarClass ?? "bg-secondary text-foreground")}>
                {o.initials}
              </span>
              <span className="flex-1 text-xs font-semibold text-foreground">{o.name}</span>
              {o.sub && <span className="font-mono text-[10px] text-muted-foreground">{o.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── InlineBookingForm ─────────────────────────────────────────────────── */

const fieldLabel = "mb-1 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground";
const fieldInput =
  "w-full rounded-md border border-border bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary";

export function InlineBookingForm({
  players,
  coaches,
  types,
  onSubmit,
  onCancel,
}: {
  players: AcOption[];
  coaches: string[];
  types: string[];
  onSubmit?: () => void;
  onCancel?: () => void;
}) {
  const [player, setPlayer] = useState<AcOption | null>(null);
  const [query, setQuery] = useState("");

  return (
    <div className="rounded-[12px] border border-accent/50 bg-accent/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">Ny booking</span>
        {player && <CreditBar used={4} total={6} />}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className={fieldLabel}>Spiller</label>
          <AutocompleteInput
            options={players}
            value={player ? player.name : query}
            onChange={(q) => { setQuery(q); setPlayer(null); }}
            onSelect={(o) => { setPlayer(o); setQuery(o.name); }}
            placeholder="Søk spiller …"
          />
        </div>
        <div>
          <label className={fieldLabel}>Coach</label>
          <select className={fieldInput} defaultValue="">
            <option value="" disabled>Velg coach</option>
            {coaches.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabel}>Type</label>
          <select className={fieldInput} defaultValue="">
            <option value="" disabled>Velg type</option>
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabel}>Dato</label>
          <input type="date" className={fieldInput} />
        </div>
        <div>
          <label className={fieldLabel}>Tid</label>
          <input type="time" className={fieldInput} />
        </div>
        <div>
          <label className={fieldLabel}>Varighet</label>
          <select className={fieldInput} defaultValue="60">
            <option value="30">30 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground hover:bg-secondary hover:text-foreground">
          <X className="h-3 w-3" strokeWidth={2} />Avbryt
        </button>
        <button type="button" onClick={onSubmit} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground">
          <Check className="h-3 w-3" strokeWidth={2} />Opprett booking
        </button>
      </div>
    </div>
  );
}
