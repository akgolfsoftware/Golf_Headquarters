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
  Activity,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Compass,
  CornerDownLeft,
  Dumbbell,
  Flag,
  FlaskConical,
  LineChart,
  LogOut,
  MessageSquare,
  Search,
  Target,
  TrendingUp,
  UserCog,
  X,
  Zap,
} from "lucide-react";

const ICON_STROKE = 1.5;

// Hurtig-handlinger for PlayerHQ. Statiske, filtreres lokalt på label +
// description + keywords. Vises ALLTID øverst i modalen — også når query
// er tom — som onboarding-/discoverability-hint.
//
// Skiller mellom ren navigasjon og custom handler (view-mode bytte, theme
// toggle, logg-ut etc.).

type ActionKind =
  | { type: "navigate"; href: string }
  | { type: "view-mode-coach" }
  | { type: "toggle-theme" }
  | { type: "logout" };

type Action = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  kind: ActionKind;
  // Kun synlig for ADMIN/COACH-roller. Brukes for "Bytt til Coach-view".
  requireCoachRole?: boolean;
};

const ACTIONS: Action[] = [
  // --- Logg / spill-handlinger ---
  {
    id: "log-training",
    label: "Logg trening",
    description: "Registrer en ny treningsøkt",
    keywords: ["logg", "trening", "ny", "økt", "session", "registrer"],
    icon: Dumbbell,
    kind: { type: "navigate", href: "/portal/ny-okt" },
  },
  {
    id: "request-session",
    label: "Be om økt fra coach",
    description: "Send ønske om coaching-time",
    keywords: ["be om", "ønske", "coach", "time", "request", "spørr"],
    icon: CalendarCheck,
    kind: { type: "navigate", href: "/portal/onskeligokt" },
  },
  {
    id: "book-time",
    label: "Book time",
    description: "Velg coach og ledig tid",
    keywords: ["book", "booking", "time", "bestill", "reserver"],
    icon: CalendarDays,
    kind: { type: "navigate", href: "/portal/booking" },
  },
  {
    id: "message-coach",
    label: "Send melding til coach",
    description: "Skriv direkte til din coach",
    keywords: ["melding", "coach", "skriv", "chat", "kontakt", "message"],
    icon: MessageSquare,
    kind: { type: "navigate", href: "/portal/coach" },
  },
  // --- Plan / fremgang ---
  {
    id: "active-plan",
    label: "Min aktive plan",
    description: "Se denne ukens treningsplan",
    keywords: ["plan", "treningsplan", "aktiv", "uke", "økter"],
    icon: ClipboardList,
    kind: { type: "navigate", href: "/portal/tren" },
  },
  {
    id: "year-plan",
    label: "Årsplan",
    description: "Sesongoversikt med periodisering",
    keywords: ["årsplan", "sesong", "periodisering", "år", "year"],
    icon: Flag,
    kind: { type: "navigate", href: "/portal/tren/aarsplan" },
  },
  {
    id: "tournaments",
    label: "Mine turneringer",
    description: "Planlagte og fullførte turneringer",
    keywords: ["turnering", "konkurranse", "tournament", "match"],
    icon: TrendingUp,
    kind: { type: "navigate", href: "/portal/tren/turneringer" },
  },
  {
    id: "tests",
    label: "Mine tester",
    description: "SG- og fys-tester med score",
    keywords: ["test", "score", "sg", "fys", "resultat"],
    icon: FlaskConical,
    kind: { type: "navigate", href: "/portal/tren/tester" },
  },
  {
    id: "drill-library",
    label: "Drill-bibliotek",
    description: "Søk i øvelser og favoritter",
    keywords: ["drill", "øvelse", "bibliotek", "mal", "exercise"],
    icon: BookOpen,
    kind: { type: "navigate", href: "/portal/tren/ovelser" },
  },
  {
    id: "analysis",
    label: "Treningsanalyse",
    description: "SG-trend og innsikter",
    keywords: ["analyse", "sg", "innsikt", "tall", "stat"],
    icon: Activity,
    kind: { type: "navigate", href: "/portal/analyse" },
  },
  {
    id: "stats",
    label: "Statistikk",
    description: "Runder, scoring og HCP",
    keywords: ["statistikk", "stats", "score", "hcp", "runder"],
    icon: LineChart,
    kind: { type: "navigate", href: "/portal/statistikk" },
  },
  {
    id: "challenges",
    label: "Utfordringer",
    description: "Aktive drill-konkurranser",
    keywords: ["utfordring", "challenge", "konkurranse", "spill"],
    icon: Target,
    kind: { type: "navigate", href: "/portal/utfordringer" },
  },
  // --- System ---
  {
    id: "profile",
    label: "Min profil",
    description: "HCP, klubb, mål og innstillinger",
    keywords: ["profil", "min side", "innstillinger", "hcp", "klubb"],
    icon: UserCog,
    kind: { type: "navigate", href: "/portal/meg" },
  },
  // Tema-toggle deaktivert i første runde — kun light tema.
  // Beholder dark-tokens i globals.css for senere bruk.
  // {
  //   id: "toggle-theme",
  //   label: "Bytt tema",
  //   description: "Bytt mellom lyst og mørkt tema",
  //   keywords: ["tema", "dark", "light", "mørkt", "lyst", "theme", "mode"],
  //   icon: Moon,
  //   kind: { type: "toggle-theme" },
  // },
  {
    id: "view-mode-coach",
    label: "Bytt til Coach-view",
    description: "Hopp tilbake til CoachHQ (kun for coach/admin)",
    keywords: ["coach", "coachhq", "admin", "bytt", "view"],
    icon: UserCog,
    kind: { type: "view-mode-coach" },
    requireCoachRole: true,
  },
  {
    id: "logout",
    label: "Logg ut",
    description: "Avslutt økten og gå til innlogging",
    keywords: ["logg ut", "logout", "sign out", "avslutt"],
    icon: LogOut,
    kind: { type: "logout" },
  },
];

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
  category: "actions" | "plans" | "bookings" | "goals" | "routes";
  primary: string;
  secondary: string;
  href?: string;
  action?: Action;
};

// Tabs vises kun når det finnes resultater (ikke ved tom spørring).
type SearchTab = "alle" | "planer" | "bookinger" | "mal" | "ruter";

const SEARCH_TABS: { id: SearchTab; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "planer", label: "Planer" },
  { id: "bookinger", label: "Bookinger" },
  { id: "mal", label: "Mål" },
  { id: "ruter", label: "Naviger" },
];

/**
 * Filtrer ACTIONS lokalt på label + description + keywords.
 * Tom query gir 8 første (etter role-filter).
 */
function matchActions(query: string, canSwitchToCoach: boolean): Action[] {
  const available = canSwitchToCoach
    ? ACTIONS
    : ACTIONS.filter((a) => !a.requireCoachRole);
  const q = query.trim().toLowerCase();
  if (q.length === 0) return available.slice(0, 8);
  return available
    .filter((a) => {
      if (a.label.toLowerCase().includes(q)) return true;
      if (a.description.toLowerCase().includes(q)) return true;
      return a.keywords.some((k) => k.includes(q));
    })
    .slice(0, 8);
}

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

export function PortalGlobalSearchModal({
  canSwitchToCoach = false,
}: {
  canSwitchToCoach?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [aktifTab, setAktifTab] = useState<SearchTab>("alle");

  const inputRef = useRef<HTMLInputElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hurtig-handlinger filtreres lokalt og vises alltid øverst.
  const matchedActions = useMemo(
    () => matchActions(query, canSwitchToCoach),
    [query, canSwitchToCoach]
  );

  const alleItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const a of matchedActions) {
      items.push({
        key: `action-${a.id}`,
        category: "actions",
        primary: a.label,
        secondary: a.description,
        action: a,
      });
    }
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
  }, [results, matchedActions]);

  const flatItems = useMemo<FlatItem[]>(() => {
    if (aktifTab === "alle") return alleItems;
    const katMap: Record<Exclude<SearchTab, "alle">, FlatItem["category"][]> = {
      planer: ["actions", "plans"],
      bookinger: ["bookings"],
      mal: ["goals"],
      ruter: ["routes"],
    };
    const tillatte = katMap[aktifTab];
    return alleItems.filter((i) => tillatte.includes(i.category));
  }, [alleItems, aktifTab]);

  const tabAntall = useMemo(() => ({
    alle: alleItems.length,
    planer: alleItems.filter((i) => (["actions", "plans"] as FlatItem["category"][]).includes(i.category)).length,
    bookinger: alleItems.filter((i) => i.category === "bookings").length,
    mal: alleItems.filter((i) => i.category === "goals").length,
    ruter: alleItems.filter((i) => i.category === "routes").length,
  }), [alleItems]);

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
    setAktifTab("alle");
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

  /**
   * Håndter valg av FlatItem (Enter eller klikk).
   * Action har enten navigate-href eller custom handler
   * (view-mode-coach, toggle-theme, logout).
   */
  async function handleSelect(item: FlatItem) {
    if (item.action) {
      const action = item.action;
      switch (action.kind.type) {
        case "navigate":
          navigateTo(action.kind.href);
          return;
        case "view-mode-coach": {
          closeModal();
          try {
            const res = await fetch("/api/view-mode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mode: "coach" }),
            });
            if (res.ok) {
              const data = (await res.json()) as { redirect?: string };
              router.push(data.redirect ?? "/admin");
            }
          } catch {
            // Stille feil — bruker kan prøve igjen
          }
          return;
        }
        case "toggle-theme": {
          closeModal();
          // Toggle .dark-klassen på <html>-elementet og persister i localStorage.
          // Samme mekanisme som ThemeToggle-komponenten bruker.
          const root = document.documentElement;
          const isDark = root.classList.contains("dark");
          if (isDark) {
            root.classList.remove("dark");
            try {
              localStorage.setItem("akgolf-theme", "light");
            } catch {
              // Ignorer hvis storage er blokkert (private mode etc.)
            }
          } else {
            root.classList.add("dark");
            try {
              localStorage.setItem("akgolf-theme", "dark");
            } catch {
              // Ignorer hvis storage er blokkert
            }
          }
          return;
        }
        case "logout": {
          closeModal();
          // POST-form til /api/auth/logout
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/auth/logout";
          document.body.appendChild(form);
          form.submit();
          return;
        }
      }
    }
    if (item.href) navigateTo(item.href);
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
      if (target) void handleSelect(target);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-search-title"
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-4 sm:pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="fixed inset-0 bg-foreground/55 backdrop-blur-sm" aria-hidden />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={ICON_STROKE} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Søk planer, bookinger, mål eller naviger…"
            aria-label="Søk i PlayerHQ"
            className="flex-1 bg-transparent text-base text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
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

        {/* Tab-bar — kun synlig når det finnes resultater */}
        {alleItems.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-b border-border px-4 pb-2 pt-2 scrollbar-none">
            {SEARCH_TABS.map((tab) => {
              const antall = tabAntall[tab.id];
              if (tab.id !== "alle" && antall === 0) return null;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setAktifTab(tab.id); setHighlight(0); }}
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold leading-none transition-colors ${
                    aktifTab === tab.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className={`font-mono text-[9.5px] font-semibold ${aktifTab === tab.id ? "text-foreground/65" : "text-muted-foreground/70"}`}>
                    {antall}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {totalCount === 0 && loading ? (
            <Placeholder loading={true} />
          ) : totalCount === 0 ? (
            query.trim().length >= 2 ? (
              <EmptyResults query={query} />
            ) : (
              <Placeholder loading={false} />
            )
          ) : (
            <Results
              items={flatItems}
              highlight={highlight}
              onHover={setHighlight}
              onSelect={(item) => void handleSelect(item)}
            />
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-border bg-secondary/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
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
        <p>Skriv for å søke eller velg en hurtig-handling…</p>
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
  onSelect: (item: FlatItem) => void;
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
                className="px-4 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                {kategoriLabel(item.category)}
              </li>
            ) : null}
            <li
              role="option"
              aria-selected={highlight === idx}
              onMouseEnter={() => onHover(idx)}
              onClick={() => onSelect(item)}
              className={
                "mx-2 flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm transition" +
                (highlight === idx
                  ? " bg-secondary text-foreground"
                  : " text-foreground hover:bg-secondary/60")
              }
            >
              <ItemIkon item={item} />
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

function ItemIkon({ item }: { item: FlatItem }) {
  // Action har eget ikon, fall back til kategori-ikon for andre.
  if (item.action) {
    const Icon = item.action.icon;
    return (
      <Icon
        className="h-3.5 w-3.5 text-muted-foreground"
        strokeWidth={ICON_STROKE}
        aria-hidden
      />
    );
  }
  return <KategoriIkon kategori={item.category} />;
}

function kategoriLabel(k: FlatItem["category"]): string {
  switch (k) {
    case "actions": return "Hurtig-handlinger";
    case "plans": return "Mine planer";
    case "bookings": return "Mine bookinger";
    case "goals": return "Mine mål";
    case "routes": return "Naviger til";
  }
}

function KategoriIkon({ kategori }: { kategori: FlatItem["category"] }) {
  const props = { className: "h-3.5 w-3.5 text-muted-foreground", strokeWidth: ICON_STROKE };
  switch (kategori) {
    case "actions": return <Zap {...props} />;
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
