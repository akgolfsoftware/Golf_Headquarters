"use client";

// Globalt Cmd+K søkefelt for PlayerHQ.
//
// Aktiveres med Cmd+K (Mac) / Ctrl+K (Win) eller via knapp som dispatcher
// CustomEvent('cmd-palette:open').
//
// ESC for å lukke, ↑/↓ for å navigere, Enter for å velge.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CornerDownLeft,
  FileText,
  Flag,
  Search,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";

type ItemKategori = "Sider" | "Spillere" | "Drills" | "Mål" | "Turneringer";

type PaletteItem = {
  id: string;
  kategori: ItemKategori;
  label: string;
  hint?: string;
  href: string;
};

const ITEMS: ReadonlyArray<PaletteItem> = [
  // Sider
  { id: "p-1", kategori: "Sider", label: "Hjem", href: "/portal" },
  { id: "p-2", kategori: "Sider", label: "Trening", href: "/portal/tren" },
  { id: "p-3", kategori: "Sider", label: "Statistikk", href: "/portal/statistikk" },
  { id: "p-4", kategori: "Sider", label: "Coach", href: "/portal/coach" },
  { id: "p-5", kategori: "Sider", label: "Min profil", href: "/portal/meg" },
  { id: "p-6", kategori: "Sider", label: "Varsler", href: "/portal/varsler" },
  // Spillere (dummy)
  { id: "sp-1", kategori: "Spillere", label: "Markus Roinås Pedersen", hint: "Hcp 4.2", href: "/portal/coach" },
  { id: "sp-2", kategori: "Spillere", label: "Emma Lien", hint: "Hcp 8.7", href: "/portal/coach" },
  // Drills (dummy)
  { id: "d-1", kategori: "Drills", label: "Tempo-drill 3:1", hint: "Slag", href: "/portal/drills" },
  { id: "d-2", kategori: "Drills", label: "Putting-gate 1m", hint: "Spill", href: "/portal/drills" },
  { id: "d-3", kategori: "Drills", label: "Wedge-yardage 30-90m", hint: "Slag", href: "/portal/drills" },
  // Mål
  { id: "m-1", kategori: "Mål", label: "Hcp under 4 innen høst", href: "/portal/mal" },
  { id: "m-2", kategori: "Mål", label: "SG-Putting +0.3", href: "/portal/mal" },
  // Turneringer
  { id: "t-1", kategori: "Turneringer", label: "Sørlandsåpent", hint: "Juni 2026", href: "/portal/tren/turneringer" },
  { id: "t-2", kategori: "Turneringer", label: "NM Junior", hint: "August 2026", href: "/portal/tren/turneringer" },
];

const KATEGORI_IKON: Record<ItemKategori, typeof FileText> = {
  Sider: FileText,
  Spillere: Users,
  Drills: Target,
  Mål: Flag,
  Turneringer: Trophy,
};

export function CmdPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger: Cmd+K / Ctrl+K, eller egendefinert event fra search-button.
  useEffect(() => {
    function reset() {
      setQuery("");
      setActive(0);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) reset();
          return !v;
        });
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      reset();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("cmd-palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cmd-palette:open", onOpen);
    };
  }, []);

  // Fokus input når den åpnes.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  const filtrert = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((it) => {
      const hay = `${it.label} ${it.hint ?? ""} ${it.kategori}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const gruppert = useMemo(() => {
    const map = new Map<ItemKategori, PaletteItem[]>();
    for (const it of filtrert) {
      const list = map.get(it.kategori) ?? [];
      list.push(it);
      map.set(it.kategori, list);
    }
    return Array.from(map.entries());
  }, [filtrert]);

  const flatList = filtrert;

  const select = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router],
  );

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(flatList.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatList[active];
      if (item) select(item);
    }
  }

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-stretch justify-center bg-black/40 backdrop-blur-sm sm:items-start sm:px-4 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Søk og kommandoer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="flex w-full flex-col overflow-hidden border border-border bg-card shadow-2xl sm:max-h-[80vh] sm:max-w-xl sm:flex-none sm:rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search
            width={18}
            height={18}
            strokeWidth={1.75}
            aria-hidden
            className="text-muted-foreground"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Søk etter sider, spillere, drills, mål, turneringer…"
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
            aria-label="Søk"
          />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
            ESC
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Lukk"
            className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
          >
            <X width={18} height={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 sm:max-h-[60vh] sm:flex-none">
          {gruppert.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Ingen treff
            </div>
          )}
          {gruppert.map(([kategori, items]) => {
            const KategoriIkon = KATEGORI_IKON[kategori];
            return (
              <div key={kategori} className="mb-2">
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <KategoriIkon
                    width={12}
                    height={12}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {kategori}
                </div>
                <ul role="listbox">
                  {items.map((it) => {
                    runningIdx += 1;
                    const isActive = runningIdx === active;
                    return (
                      <li key={it.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActive(flatList.indexOf(it))}
                          onClick={() => select(it)}
                          className={[
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-secondary text-foreground"
                              : "text-foreground hover:bg-secondary/60",
                          ].join(" ")}
                        >
                          <CalendarDays
                            width={14}
                            height={14}
                            strokeWidth={1.75}
                            aria-hidden
                            className="opacity-0"
                          />
                          <span className="flex-1 truncate">{it.label}</span>
                          {it.hint && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                              {it.hint}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft
                              width={14}
                              height={14}
                              strokeWidth={1.75}
                              aria-hidden
                              className="text-muted-foreground"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span>↑↓ for å navigere</span>
          <span>↵ for å velge</span>
          <span>⌘K for å lukke</span>
        </div>
      </div>
    </div>
  );
}
