"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Eye,
  LogOut,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import { logout } from "@/lib/auth/logout";
import { AdminThemeToggle } from "./admin-theme-toggle";

/**
 * AgencyOS-topbar — port av fasit `agencyos-app/core.jsx` (Topbar + ScopeSwitcher).
 * Spiller↔gruppe-veksler med søk-popover, ⌘K-søk, «Vis som spiller», varsler og coach-avatar.
 */

export type ScopePlayer = {
  id: string;
  name: string;
  initials: string;
  meta: string;
  /** pri = uthevet (lime) — spilleren har økt i dag (fasit-tonen på Øyvind). */
  tone?: "pri" | "neu";
};

export type ScopeGroup = {
  id: string;
  name: string;
  players: number;
  initials: string[];
};

type Props = {
  players: ScopePlayer[];
  groups: ScopeGroup[];
  coachInitials: string;
  hasUnread: boolean;
  initialDark: boolean;
};

function AvatarBadge({ initials, size, tone = "neu" }: { initials: string; size: number; tone?: "pri" | "neu" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ${
        tone === "pri" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      }`}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size / 2.6)) }}
    >
      {initials}
    </span>
  );
}

function ScopeSwitcher({ players, groups }: { players: ScopePlayer[]; groups: ScopeGroup[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"player" | "group">("player");
  const [open, setOpen] = useState(false);
  const [playerIx, setPlayerIx] = useState(0);
  const [groupIx, setGroupIx] = useState(0);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const player = players[playerIx];
  const group = groups[groupIx];
  if (!player) return null;

  const ql = q.trim().toLowerCase();
  const fGroups = groups.filter((g) => g.name.toLowerCase().includes(ql));
  const fPlayers = players.filter((p) => p.name.toLowerCase().includes(ql));

  const pickPlayer = (ix: number) => {
    setPlayerIx(ix);
    setMode("player");
    setOpen(false);
  };
  const pickGroup = (ix: number) => {
    setGroupIx(ix);
    setMode("group");
    setOpen(false);
  };
  const openInWorkbench = () => {
    setOpen(false);
    if (mode === "player") router.push(`/admin/spillere/${player.id}/workbench`);
    else if (group) router.push(`/admin/grupper/${group.id}`);
  };

  const stack = (initials: string[]) => (
    <span className="inline-flex">
      {initials.slice(0, 3).map((a, i) => (
        <span
          key={i}
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-card bg-secondary font-display text-[9px] font-bold text-secondary-foreground"
          style={{ marginLeft: i ? -8 : 0, zIndex: 3 - i }}
        >
          {a}
        </span>
      ))}
    </span>
  );

  return (
    <div className="relative flex items-center gap-2" ref={wrapRef}>
      {/* Segmentert Spiller | Gruppe */}
      <div role="tablist" className="flex items-center gap-[3px] rounded-[9px] bg-secondary p-[3px]">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "player"}
          onClick={() => setMode("player")}
          className={`inline-flex h-[30px] items-center gap-[6px] rounded-[7px] px-3 font-mono text-[11px] font-bold uppercase tracking-[0.05em] ${
            mode === "player" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <User className="h-[13px] w-[13px]" strokeWidth={1.5} /> Spiller
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "group"}
          onClick={() => setMode("group")}
          className={`inline-flex h-[30px] items-center gap-[6px] rounded-[7px] px-3 font-mono text-[11px] font-bold uppercase tracking-[0.05em] ${
            mode === "group" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Users className="h-[13px] w-[13px]" strokeWidth={1.5} /> Gruppe
        </button>
      </div>

      {/* Valgt entitet */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-10 max-w-[260px] items-center gap-[9px] rounded-[10px] border border-border bg-card py-0 pl-[6px] pr-3 text-foreground hover:border-ring"
      >
        {mode === "player" ? (
          <AvatarBadge initials={player.initials} size={26} tone={player.tone} />
        ) : (
          stack(group?.initials ?? [])
        )}
        <span className="flex min-w-0 flex-col text-left text-[13px] font-semibold leading-[1.1] tracking-[-0.01em]">
          <span className="truncate">{mode === "player" ? player.name : group?.name}</span>
          <span className="mt-[1px] truncate font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {mode === "player" ? player.meta : `${group?.players ?? 0} spillere`}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 self-center text-muted-foreground" strokeWidth={1.5} />
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[340px] rounded-xl border border-border bg-popover p-2 shadow-2xl">
          <div className="mb-[6px] flex h-[38px] items-center gap-[9px] rounded-[9px] border border-border bg-background px-[11px]">
            <Search className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={1.5} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søk spiller eller gruppe"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="rounded border border-border px-[5px] py-[1px] font-mono text-[9px] font-bold text-muted-foreground">
              ⌘K
            </span>
          </div>

          {fGroups.length > 0 && (
            <div className="px-2 pb-1 pt-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Grupper
            </div>
          )}
          {fGroups.map((g) => {
            const ix = groups.indexOf(g);
            const cur = mode === "group" && groupIx === ix;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => pickGroup(ix)}
                className={`flex w-full items-center gap-[10px] rounded-lg px-2 py-[7px] text-left hover:bg-foreground/5 ${cur ? "bg-foreground/5" : ""}`}
              >
                {stack(g.initials)}
                <span className="flex min-w-0 flex-1 flex-col text-[13.5px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground">
                  {g.name}
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {g.players} spillere
                  </span>
                </span>
                {cur && <Check className="h-[15px] w-[15px] text-accent" strokeWidth={2} />}
              </button>
            );
          })}

          {fPlayers.length > 0 && (
            <div className="px-2 pb-1 pt-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Nylig sett
            </div>
          )}
          {fPlayers.map((p) => {
            const ix = players.indexOf(p);
            const cur = mode === "player" && playerIx === ix;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pickPlayer(ix)}
                className={`flex w-full items-center gap-[10px] rounded-lg px-2 py-[7px] text-left hover:bg-foreground/5 ${cur ? "bg-foreground/5" : ""}`}
              >
                <AvatarBadge initials={p.initials} size={28} tone={p.tone} />
                <span className="flex min-w-0 flex-1 flex-col text-[13.5px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground">
                  {p.name}
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {p.meta}
                  </span>
                </span>
                {cur && <Check className="h-[15px] w-[15px] text-accent" strokeWidth={2} />}
              </button>
            );
          })}

          {fGroups.length === 0 && fPlayers.length === 0 && (
            <div className="px-2 py-4 text-center text-[13px] text-muted-foreground">
              Ingen treff på «{q}»
            </div>
          )}

          <div className="mt-1 border-t border-border pt-1">
            <button
              type="button"
              onClick={openInWorkbench}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-[8px] text-left text-[13px] font-semibold text-accent hover:bg-foreground/5"
            >
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
              Åpne {mode === "player" ? player.name : group?.name} i Workbench
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CoachMenu({ initials }: { initials: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Coach-meny"
        className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary font-display text-[13px] font-bold text-primary-foreground"
      >
        {initials}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl border border-border bg-popover p-1 shadow-2xl"
        >
          <Link
            href="/admin/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground hover:bg-foreground/5"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} /> Innstillinger
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-foreground hover:bg-foreground/5"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Logg ut
          </button>
        </div>
      )}
    </div>
  );
}

export function AgencyosTopbar({ players, groups, coachInitials, hasUnread, initialDark }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const visSomSpiller = () => {
    startTransition(async () => {
      const res = await fetch("/api/view-mode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "player" }),
      });
      const data = (await res.json().catch(() => ({}))) as { redirect?: string };
      if (data.redirect) router.push(data.redirect);
      else router.push("/portal");
    });
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("global-search:open"));
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-[hsl(var(--background)/0.92)] px-6 backdrop-blur-[14px]"
    >
      <ScopeSwitcher players={players} groups={groups} />
      <div className="flex-1" />
      <button
        type="button"
        onClick={openSearch}
        aria-label="Hurtigsøk"
        className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-border bg-card px-3 text-muted-foreground hover:border-ring"
      >
        <Search className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-mono text-[10px] font-bold">⌘K</span>
      </button>
      <button
        type="button"
        onClick={visSomSpiller}
        className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-primary bg-transparent px-[14px] font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary/10"
      >
        <Eye className="h-[15px] w-[15px]" strokeWidth={1.5} />
        <span className="underline underline-offset-1">Vis som spiller</span>
      </button>
      <AdminThemeToggle initialDark={initialDark} />
      <Link
        href="/admin/foresporsler"
        aria-label="Varsler"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-foreground/5"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {hasUnread && (
          <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full border-2 border-background bg-[var(--color-alert-coral)]" />
        )}
      </Link>
      <CoachMenu initials={coachInitials} />
    </header>
  );
}
