"use client";

// Global Cmd+K søk-modal for PlayerHQ.
//
// Trigger: Cmd+K (Mac) / Ctrl+K (Win) hvor som helst i portal-shell,
// eller via knapp i header (dispatcher 'portal-search:open').
//
// Tastaturnavigasjon:
//   - Esc lukker
//   - ↑/↓ flytter highlight (alle kategorier flatet ut)
//   - Enter navigerer til highlightet resultat
//
// Speilet fra admin/global-search-modal — fire kategorier scoped til
// innlogget spiller: routes, plans, bookings, goals.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Compass,
  CornerDownLeft,
  Search,
  Target,
  X,
} from "lucide-react";

const ICON_STROKE = 1.5;

type Plan = {
  id: string;
  name: string;
  status: string;
  href: string;
};

type Booking = {
  id: string;
  startAt: string;
  serviceName: string;
  coachName: string | null;
  href: string;
};

type Goal = {
  id: string;
  title: string;
  type: string;
  status: string;
  href: string;
};

type Route = {
  id: string;
  label: string;
  description: string;
  href: string;
};

type ApiResponse = {
  routes: Route[];
  plans: Plan[];
  bookings: Booking[];
  goals: Goal[];
};

type FlatItem = {
  key: string;
  href: string;
  category: "plans" | "bookings" | "goals" | "routes";
  primary: string;
  secondary: string;
};

const EMPTY: ApiResponse = { routes: [], plans: [], bookings: [], goals: [] };

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PortalGlobalSearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const p of results.plans) {
      items.push({
        key: `plan-${p.id}`,
        href: p.href,
        category: "plans",
        primary: p.name,
        secondary: `Plan · ${p.status}`,
      });
    }
    for (const b of results.bookings) {
      items.push({
        key: `booking-${b.id}`,
        href: b.href,
        category: "bookings",
        primary: b.serviceName,
        secondary: `${formatDateTime(b.startAt)}${b.coachName ? ` · ${b.coachName}` : ""}`,
      });
    }
    for (const g of results.goals) {
      items.push({
        key: `goal-${g.id}`,
        href: g.href,
        category: "goals",
        primary: g.title,
        secondary: `Mål · ${g.type}`,
      });
    }
    for (const r of results.routes) {
      items.push({
        key: `route-${r.id}`,
        href: r.href,
        category: "routes",
        primary: r.label,
        secondary: r.description,
      });
    }
    return items;
  }, [results]);

  const totalCount = flatItems.length;

  const openModal = useCallback(() => {
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
    setHighlight(0);
    abortRef.current?.abort();
    abortRef.current = null;
    requestAnimationFrame(() => lastActiveRef.current?.focus());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isCmdK) {
        e.preventDefault();
        if (open) closeModal();
        else openModal();
      }
    }
    function onCustomOpen() {
      if (!open) openModal();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("portal-search:open", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("portal-search:open", onCustomOpen);
    };
  }, [open, openModal, closeModal]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      // Reset via mikrotask for å unngå cascading renders i samme commit.
      queueMicrotask(() => {
        setResults(EMPTY);
        setLoading(false);
      });
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    queueMicrotask(() => setLoading(true));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/portal/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setResults(EMPTY);
          return;
        }
        const data = (await res.json()) as ApiResponse;
        setResults(data);
        setHighlight(0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function navigateTo(href: string) {
    closeModal();
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (totalCount > 0) setHighlight((h) => (h + 1) % totalCount);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalCount > 0) setHighlight((h) => (h - 1 + totalCount) % totalCount);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = flatItems[highlight];
      if (target) navigateTo(target.href);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-search-title"
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20 sm:pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="fixed inset-0 bg-foreground/55 backdrop-blur-sm" aria-hidden />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={ICON_STROKE} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Søk planer, bookinger, mål eller naviger…"
            aria-label="Søk i PlayerHQ"
            className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={closeModal}
            aria-label="Lukk søk"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={ICON_STROKE} />
          </button>
        </header>

        <div id="portal-search-title" className="sr-only">
          Globalt søk i PlayerHQ
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {query.trim().length < 2 ? (
            <Placeholder loading={false} />
          ) : loading && totalCount === 0 ? (
            <Placeholder loading={true} />
          ) : totalCount === 0 ? (
            <EmptyResults query={query} />
          ) : (
            <Results
              items={flatItems}
              highlight={highlight}
              onHover={setHighlight}
              onSelect={navigateTo}
            />
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-border bg-secondary/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-3">
            <Kbd>↑↓</Kbd> navigér
            <Kbd>
              <CornerDownLeft className="h-3 w-3" strokeWidth={ICON_STROKE} />
            </Kbd>{" "}
            velg
            <Kbd>Esc</Kbd> lukk
          </span>
          <span className="font-mono">PlayerHQ · Cmd+K</span>
        </footer>
      </div>
    </div>
  );
}

function Placeholder({ loading }: { loading: boolean }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-muted-foreground">
      {loading ? (
        <p className="animate-pulse">Søker…</p>
      ) : (
        <>
          <p>Skriv minst 2 tegn for å søke.</p>
          <p className="mt-2 text-xs">
            Eksempler: <span className="font-mono">«kalender»</span>,{" "}
            <span className="font-mono">«personlig»</span>,{" "}
            <span className="font-mono">«HCP 14»</span>
          </p>
        </>
      )}
    </div>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="px-4 py-10 text-center text-sm">
      <p className="text-muted-foreground">
        Fant ingenting for <em className="font-mono not-italic text-foreground">«{query}»</em>.
      </p>
    </div>
  );
}

type ResultsProps = {
  items: FlatItem[];
  highlight: number;
  onHover: (idx: number) => void;
  onSelect: (href: string) => void;
};

function Results({ items, highlight, onHover, onSelect }: ResultsProps) {
  return (
    <ul role="listbox" aria-label="Søkeresultater">
      {items.map((item, idx) => {
        const forrige = idx > 0 ? items[idx - 1].category : null;
        const visKategoriHeader = item.category !== forrige;
        return (
          <div key={item.key}>
            {visKategoriHeader ? (
              <li
                role="presentation"
                className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                {kategoriLabel(item.category)}
              </li>
            ) : null}
            <li
              role="option"
              aria-selected={highlight === idx}
              onMouseEnter={() => onHover(idx)}
              onClick={() => onSelect(item.href)}
              className={
                "mx-2 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition" +
                (highlight === idx
                  ? " bg-secondary text-foreground"
                  : " text-foreground hover:bg-secondary/60")
              }
            >
              <KategoriIkon kategori={item.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.primary}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.secondary}
                </p>
              </div>
              {highlight === idx ? (
                <CornerDownLeft
                  className="h-3 w-3 text-muted-foreground"
                  strokeWidth={ICON_STROKE}
                />
              ) : null}
            </li>
          </div>
        );
      })}
    </ul>
  );
}

function kategoriLabel(k: FlatItem["category"]): string {
  switch (k) {
    case "plans": return "Mine planer";
    case "bookings": return "Mine bookinger";
    case "goals": return "Mine mål";
    case "routes": return "Naviger til";
  }
}

function KategoriIkon({ kategori }: { kategori: FlatItem["category"] }) {
  const props = { className: "h-3.5 w-3.5 text-muted-foreground", strokeWidth: ICON_STROKE };
  switch (kategori) {
    case "plans": return <ClipboardList {...props} />;
    case "bookings": return <CalendarDays {...props} />;
    case "goals": return <Target {...props} />;
    case "routes": return <Compass {...props} />;
  }
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}
