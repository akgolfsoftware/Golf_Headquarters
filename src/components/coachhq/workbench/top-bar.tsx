"use client";

/**
 * CoachWorkbenchTopBar — øverste rad i Coach Workbench.
 *
 * Inneholder:
 *  - Tilbake-link til /admin/agencyos
 *  - Combobox-velger for spiller eller gruppe (client-side søk)
 *  - Toggle mellom Individuelt og Gruppe-modus
 *
 * URL-state styres via search params:
 *   ?modus=individuelt&spiller=<id>
 *   ?modus=gruppe&gruppe=<id>
 *
 * Pure presentational — data sendes som props fra koordinator.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Search,
  User as UserIcon,
  Users,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export type CoachWorkbenchModus = "individuelt" | "gruppe";

export type CoachWorkbenchSpiller = {
  id: string;
  name: string;
  avatarUrl?: string;
  hcp?: number | null;
};

export type CoachWorkbenchGruppe = {
  id: string;
  name: string;
};

export type CoachWorkbenchTopBarProps = {
  modus: CoachWorkbenchModus;
  valgtSpillerId?: string;
  valgtGruppeId?: string;
  spillere: Array<CoachWorkbenchSpiller>;
  grupper: Array<CoachWorkbenchGruppe>;
  className?: string;
};

// ---------- Helpers ----------

function buildUrl(params: {
  modus: CoachWorkbenchModus;
  spiller?: string;
  gruppe?: string;
}): string {
  const search = new URLSearchParams();
  search.set("modus", params.modus);
  if (params.spiller) search.set("spiller", params.spiller);
  if (params.gruppe) search.set("gruppe", params.gruppe);
  return `/admin/agencyos?${search.toString()}`;
}

// ---------- Komponent ----------

export function CoachWorkbenchTopBar({
  modus,
  valgtSpillerId,
  valgtGruppeId,
  spillere,
  grupper,
  className,
}: CoachWorkbenchTopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleModusChange = (next: CoachWorkbenchModus) => {
    if (next === modus) return;
    // Bytt modus, behold ev. valgt id for den nye modusen
    if (next === "individuelt") {
      router.push(buildUrl({ modus: next, spiller: valgtSpillerId }));
    } else {
      router.push(buildUrl({ modus: next, gruppe: valgtGruppeId }));
    }
  };

  const handleSpillerSelect = (id: string) => {
    router.push(buildUrl({ modus: "individuelt", spiller: id }));
  };

  const handleGruppeSelect = (id: string) => {
    router.push(buildUrl({ modus: "gruppe", gruppe: id }));
  };

  // Marker eksisterende query-params som "lest" (no-op men dokumenterer intensjon).
  useEffect(() => {
    void searchParams;
  }, [searchParams]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Venstre: Tilbake + velger */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/agencyos"
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium",
            "text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          aria-label="Tilbake til AgencyOS"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Tilbake
        </Link>

        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {modus === "individuelt" ? "Spiller" : "Gruppe"}:
        </span>

        {modus === "individuelt" ? (
          <SpillerCombobox
            spillere={spillere}
            valgtId={valgtSpillerId}
            onSelect={handleSpillerSelect}
          />
        ) : (
          <GruppeCombobox
            grupper={grupper}
            valgtId={valgtGruppeId}
            onSelect={handleGruppeSelect}
          />
        )}
      </div>

      {/* Høyre: Modus-toggle */}
      <ModusToggle modus={modus} onChange={handleModusChange} />
    </div>
  );
}

// ---------- Sub: Combobox for spiller ----------

type SpillerComboboxProps = {
  spillere: Array<CoachWorkbenchSpiller>;
  valgtId?: string;
  onSelect: (id: string) => void;
};

function SpillerCombobox({ spillere, valgtId, onSelect }: SpillerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const valgt = useMemo(
    () => spillere.find((s) => s.id === valgtId),
    [spillere, valgtId],
  );

  const filtrert = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return spillere;
    return spillere.filter((s) => s.name.toLowerCase().includes(q));
  }, [spillere, search]);

  // Lukk ved klikk utenfor
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Fokuser søkefeltet når åpnes
  useEffect(() => {
    if (open) {
      // Liten timeout slik at panelet er rendret før vi fokuserer
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    setSearch("");
  }, [open]);

  const triggerLabel = valgt?.name ?? "Velg spiller";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 max-w-[260px] items-center gap-2 rounded-full border border-border bg-card pl-2 pr-3 text-sm font-medium",
          "transition-colors hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        {valgt ? (
          <AvatarSmall name={valgt.name} avatarUrl={valgt.avatarUrl} />
        ) : (
          <UserIcon
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        )}
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[280px] rounded-lg border border-border bg-popover shadow-lg",
          )}
        >
          {/* Søkefelt */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk spiller..."
              className="h-7 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Liste */}
          <ul className="max-h-72 overflow-y-auto py-1" role="presentation">
            {filtrert.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Ingen treff
              </li>
            ) : (
              filtrert.map((s) => {
                const active = s.id === valgtId;
                return (
                  <li key={s.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelect(s.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                        "transition-colors hover:bg-secondary",
                        active ? "bg-secondary text-foreground" : "text-foreground",
                      )}
                    >
                      <AvatarSmall name={s.name} avatarUrl={s.avatarUrl} />
                      <span className="flex-1 truncate">{s.name}</span>
                      {s.hcp !== undefined && s.hcp !== null ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          HCP {s.hcp.toFixed(1)}
                        </span>
                      ) : null}
                      {active ? (
                        <Check
                          className="h-4 w-4 text-primary"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------- Sub: Combobox for gruppe ----------

type GruppeComboboxProps = {
  grupper: Array<CoachWorkbenchGruppe>;
  valgtId?: string;
  onSelect: (id: string) => void;
};

function GruppeCombobox({ grupper, valgtId, onSelect }: GruppeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const valgt = useMemo(
    () => grupper.find((g) => g.id === valgtId),
    [grupper, valgtId],
  );

  const filtrert = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grupper;
    return grupper.filter((g) => g.name.toLowerCase().includes(q));
  }, [grupper, search]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    setSearch("");
  }, [open]);

  const triggerLabel = valgt?.name ?? "Velg gruppe";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 max-w-[260px] items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium",
          "transition-colors hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <Users
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-lg border border-border bg-popover shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk gruppe..."
              className="h-7 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-1" role="presentation">
            {filtrert.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Ingen treff
              </li>
            ) : (
              filtrert.map((g) => {
                const active = g.id === valgtId;
                return (
                  <li key={g.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelect(g.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                        "transition-colors hover:bg-secondary",
                        active ? "bg-secondary text-foreground" : "text-foreground",
                      )}
                    >
                      <Users
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{g.name}</span>
                      {active ? (
                        <Check
                          className="h-4 w-4 text-primary"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------- Sub: Modus-toggle ----------

type ModusToggleProps = {
  modus: CoachWorkbenchModus;
  onChange: (next: CoachWorkbenchModus) => void;
};

function ModusToggle({ modus, onChange }: ModusToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Velg modus"
      className="inline-flex h-9 items-center rounded-full border border-border bg-card p-0.5"
    >
      <ModusButton
        active={modus === "individuelt"}
        onClick={() => onChange("individuelt")}
        label="Individuelt"
        Icon={UserIcon}
      />
      <ModusButton
        active={modus === "gruppe"}
        onClick={() => onChange("gruppe")}
        label="Gruppe"
        Icon={Users}
      />
    </div>
  );
}

function ModusButton({
  active,
  onClick,
  label,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: typeof UserIcon;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold tracking-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  );
}

// ---------- Sub: Liten avatar ----------

function AvatarSmall({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  const initials = initialsFromName(name);
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={
        avatarUrl
          ? {
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { background: avatarBg(name) }
      }
      aria-hidden="true"
    >
      {!avatarUrl ? initials : null}
    </span>
  );
}
