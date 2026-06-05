"use client";

// Global Cmd+K søk-modal for CoachHQ.
//
// Trigger: Cmd+K (Mac) / Ctrl+K (Win) hvor som helst i admin-shell.
// Lytter på keydown globalt og mountes én gang fra AdminShell.
//
// Tastaturnavigasjon:
//   - Esc lukker modalen
//   - ↑/↓ flytter highlight mellom resultater (alle kategorier flatet ut)
//   - Enter navigerer til highlightet resultat
//
// Resultatene grupperes per type (spillere/planer/bookinger/ruter) men
// behandles som én flat liste under tastaturnav for forutsigbar UX.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  CalendarDays,
  ClipboardList,
  Compass,
  CornerDownLeft,
  Search,
  User,
  UserPlus,
  Users,
  X,
  Zap,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  Activity,
  TrendingUp,
  Download,
  Sun,
  LogOut,
  Calendar,
  FlaskConical,
  Megaphone,
} from "lucide-react";

const ICON_STROKE = 1.5;

// Hurtig-handlinger for CoachHQ. Disse er statiske, filtreres lokalt på
// label + description + keywords (alle case-insensitive). De vises ALLTID
// øverst i modalen — også når query er tom — som onboarding-/discoverability-hint.
//
// `kind` skiller mellom ren navigasjon og custom handler. Custom-handler
// brukes for view-mode-toggle (cookie + redirect), logg-ut, etc.

type ActionKind =
  | { type: "navigate"; href: string }
  | { type: "view-mode-player" }
  | { type: "open-caddie" }
  | { type: "logout" };

type Action = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  kind: ActionKind;
};

const ACTIONS: Action[] = [
  // --- Opprett-handlinger ---
  {
    id: "new-plan",
    label: "Ny treningsplan",
    description: "Opprett plan for en spiller",
    keywords: ["plan", "trening", "ny", "create", "lag"],
    icon: ClipboardList,
    kind: { type: "navigate", href: "/admin/plans/new" },
  },
  {
    id: "ai-plan",
    label: "Generer AI-plan",
    description: "La Caddie lage forslag til treningsplan",
    keywords: ["ai", "plan", "generer", "auto", "caddie", "ml", "claude"],
    icon: Sparkles,
    kind: { type: "navigate", href: "/admin/plans/new?ai=1" },
  },
  {
    id: "new-player",
    label: "Registrer ny spiller",
    description: "Legg til ny spiller i porteføljen",
    keywords: ["spiller", "elev", "ny", "create", "register", "legg til"],
    icon: UserPlus,
    kind: { type: "navigate", href: "/admin/spillere/ny" },
  },
  {
    id: "send-message",
    label: "Send melding",
    description: "Skriv til spiller eller gruppe",
    keywords: ["melding", "message", "chat", "send", "skriv"],
    icon: MessageSquare,
    kind: { type: "navigate", href: "/admin/messages" },
  },
  {
    id: "bulk-broadcast",
    label: "Bulk-melding",
    description: "Send samme melding til mange spillere",
    keywords: ["bulk", "broadcast", "alle", "gruppe", "massemelding"],
    icon: Megaphone,
    kind: { type: "navigate", href: "/admin/messages?bulk=1" },
  },
  {
    id: "new-group",
    label: "Lag ny gruppe",
    description: "Opprett treningsgruppe med medlemmer",
    keywords: ["gruppe", "team", "group", "ny", "wang"],
    icon: Users,
    kind: { type: "navigate", href: "/admin/grupper" },
  },
  {
    id: "log-test",
    label: "Logg test-resultat",
    description: "Registrer score fra SG- eller fys-test",
    keywords: ["test", "logg", "resultat", "score", "sg", "fys"],
    icon: FlaskConical,
    kind: { type: "navigate", href: "/admin/tester" },
  },
  // --- Hub-handlinger ---
  {
    id: "daily-brief",
    label: "Daglig brief",
    description: "Morgens første-stop med agent-insights",
    keywords: ["brief", "morgen", "daglig", "oversikt", "start", "dagen"],
    icon: Sun,
    kind: { type: "navigate", href: "/admin/brief" },
  },
  {
    id: "open-caddie",
    label: "Spør Caddie",
    description: "Åpne Caddie-chat for assistanse",
    keywords: ["caddie", "ai", "chat", "spør", "assistent", "claude"],
    icon: Sparkles,
    kind: { type: "open-caddie" },
  },
  {
    id: "approvals",
    label: "Godkjenninger",
    description: "Vent-på-deg agent-aksjoner og forslag",
    keywords: ["godkjenninger", "approvals", "inbox", "agent", "pending"],
    icon: ClipboardCheck,
    kind: { type: "navigate", href: "/admin/godkjenninger" },
  },
  {
    id: "trackman-import",
    label: "Importer TrackMan",
    description: "Last opp CSV eller koble TrackMan-data",
    keywords: ["trackman", "import", "csv", "data", "swing"],
    icon: Activity,
    kind: { type: "navigate", href: "/admin/trackman" },
  },
  {
    id: "wagr",
    label: "WAGR-benchmark",
    description: "Sammenlign spillere mot World Amateur ranking",
    keywords: ["wagr", "ranking", "benchmark", "amatør", "amateur", "talent"],
    icon: TrendingUp,
    kind: { type: "navigate", href: "/admin/talent/wagr-benchmark" },
  },
  {
    id: "export-report",
    label: "Eksporter rapport",
    description: "Last ned spillerrapport eller statistikk",
    keywords: ["rapport", "report", "eksport", "pdf", "last ned"],
    icon: Download,
    kind: { type: "navigate", href: "/admin/reports" },
  },
  {
    id: "next-booking",
    label: "Neste booking",
    description: "Hopp til kommende time i kalender",
    keywords: ["booking", "neste", "kalender", "time", "økt"],
    icon: Calendar,
    kind: { type: "navigate", href: "/admin/kalender" },
  },
  // --- System ---
  {
    id: "view-mode-player",
    label: "Bytt til Player-view",
    description: "Se plattformen som spilleren ser den",
    keywords: ["player", "spiller", "view", "bytt", "preview", "se som"],
    icon: User,
    kind: { type: "view-mode-player" },
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

type Player = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  href: string;
};

type Plan = {
  id: string;
  name: string;
  playerName: string;
  status: string;
  href: string;
};

type Booking = {
  id: string;
  playerName: string;
  startAt: string;
  serviceName: string;
  href: string;
};

type Route = {
  id: string;
  label: string;
  description: string;
  href: string;
};

type ApiResponse = {
  players: Player[];
  plans: Plan[];
  bookings: Booking[];
  routes: Route[];
};

type FlatItem = {
  key: string;
  category: "actions" | "players" | "plans" | "bookings" | "routes";
  primary: string;
  secondary: string;
  avatarUrl: string | null;
  // Naviger- eller action-target. Action har eget action-felt, andre har href.
  href?: string;
  action?: Action;
};

const EMPTY: ApiResponse = { players: [], plans: [], bookings: [], routes: [] };

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

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Filtrer ACTIONS lokalt på label + description + keywords.
 * Tom query gir hele lista (max 8 for ikke å oversvømme).
 */
function matchActions(query: string): Action[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return ACTIONS.slice(0, 8);
  return ACTIONS.filter((a) => {
    if (a.label.toLowerCase().includes(q)) return true;
    if (a.description.toLowerCase().includes(q)) return true;
    return a.keywords.some((k) => k.includes(q));
  }).slice(0, 8);
}

export function GlobalSearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hurtig-handlinger filtreres lokalt og vises alltid øverst.
  // Med tom query: 8 første actions som "starting point".
  const matchedActions = useMemo(() => matchActions(query), [query]);

  // Flate ut alle resultater til én liste i visnings-rekkefølge.
  // Brukes for tastaturnav (pilene) og Enter-navigasjon.
  // Actions kommer ALLTID øverst.
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const a of matchedActions) {
      items.push({
        key: `action-${a.id}`,
        category: "actions",
        primary: a.label,
        secondary: a.description,
        avatarUrl: null,
        action: a,
      });
    }
    for (const p of results.players) {
      items.push({
        key: `player-${p.id}`,
        href: p.href,
        category: "players",
        primary: p.name,
        secondary: p.email,
        avatarUrl: p.avatarUrl,
      });
    }
    for (const p of results.plans) {
      items.push({
        key: `plan-${p.id}`,
        href: p.href,
        category: "plans",
        primary: p.name,
        secondary: `${p.playerName} · ${p.status}`,
        avatarUrl: null,
      });
    }
    for (const b of results.bookings) {
      items.push({
        key: `booking-${b.id}`,
        href: b.href,
        category: "bookings",
        primary: `${b.playerName} — ${b.serviceName}`,
        secondary: formatDateTime(b.startAt),
        avatarUrl: null,
      });
    }
    for (const r of results.routes) {
      items.push({
        key: `route-${r.id}`,
        href: r.href,
        category: "routes",
        primary: r.label,
        secondary: r.description,
        avatarUrl: null,
      });
    }
    return items;
  }, [results, matchedActions]);

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
    // Returner fokus til element som åpnet modalen.
    requestAnimationFrame(() => {
      lastActiveRef.current?.focus();
    });
  }, []);

  // Global Cmd+K / Ctrl+K-lytter + custom-event for å åpne fra knapp.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isCmdK) {
        e.preventDefault();
        if (open) {
          closeModal();
        } else {
          openModal();
        }
      }
    }
    function onCustomOpen() {
      if (!open) openModal();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("global-search:open", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("global-search:open", onCustomOpen);
    };
  }, [open, openModal, closeModal]);

  // Auto-fokus input når modalen åpnes.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Hent søkeresultater med debounce + abort.
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
          `/api/admin/search?q=${encodeURIComponent(q)}`,
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
        if ((err as Error).name !== "AbortError") {
          setResults(EMPTY);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  // Body scroll lock.
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
   * Action har enten navigate-href eller custom handler (view-mode, logout, caddie).
   */
  async function handleSelect(item: FlatItem) {
    // Action med custom handler
    if (item.action) {
      const action = item.action;
      switch (action.kind.type) {
        case "navigate":
          navigateTo(action.kind.href);
          return;
        case "view-mode-player": {
          closeModal();
          try {
            const res = await fetch("/api/view-mode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mode: "player" }),
            });
            if (res.ok) {
              const data = (await res.json()) as { redirect?: string };
              router.push(data.redirect ?? "/portal");
            }
          } catch {
            // Stille feile — bruker kan klikke igjen
          }
          return;
        }
        case "open-caddie": {
          closeModal();
          // Caddie er på Hub-siden — naviger dit og dispatch event som
          // CaddieChat-komponenten kan lytte på for å auto-fokusere input.
          router.push("/admin");
          requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent("caddie:focus"));
          });
          return;
        }
        case "logout": {
          closeModal();
          // Logg ut via /api/auth/logout (route handler kalles via skjult skjema).
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/auth/logout";
          document.body.appendChild(form);
          form.submit();
          return;
        }
      }
    }
    // Standard navigasjon for ikke-action items (players, plans, bookings, routes).
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
      if (totalCount > 0) {
        setHighlight((h) => (h + 1) % totalCount);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalCount > 0) {
        setHighlight((h) => (h - 1 + totalCount) % totalCount);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = flatItems[highlight];
      if (target) void handleSelect(target);
      return;
    }
    if (e.key === "Tab") {
      // Enkel focus-trap: hold fokus inne i modalen ved å re-fokusere input
      // hvis Tab forsøker å flytte bort. Modalen har bare input + lukkeknapp +
      // resultat-knapper som naturlig fokuserbare, men input er hovedanker.
      // Vi lar Tab gjøre standard ting; bare Shift+Tab fra input går til
      // lukke-knappen.
    }
  }

  // Focus-trap: hold fokus inne i dialogen ved Tab.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const hasQuery = query.trim().length >= 2;
  // Vi viser ALDRI helt tom state lenger — actions vises alltid øverst.
  // "EmptyState" er kun et lite hint hvis ingen actions match og query er kort.
  const hasActions = matchedActions.length > 0;
  const showInitialHint = !hasQuery && !hasActions;
  const showNoResults = hasQuery && !loading && totalCount === 0;

  // Indekser per kategori for å gi riktig flat-highlight.
  let flatIndex = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 px-4 pt-4 backdrop-blur-sm sm:pt-[10vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-4">
          <Search
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={ICON_STROKE}
            aria-hidden
          />
          <label htmlFor="global-search-input" className="sr-only">
            Søk i CoachHQ
          </label>
          <input
            id="global-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Søk etter spillere, planer, bookinger eller sider..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            autoComplete="off"
            spellCheck={false}
          />
          <span
            id="global-search-title"
            className="hidden font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:inline"
          >
            ESC
          </span>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Lukk søk"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          </button>
        </div>

        {/* Resultater */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {showInitialHint && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <Search
                className="h-6 w-6 text-muted-foreground/60"
                strokeWidth={ICON_STROKE}
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                Skriv for å søke eller velg en hurtig-handling…
              </p>
            </div>
          )}

          {loading && hasQuery && totalCount === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Søker...
            </div>
          )}

          {showNoResults && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Ingen treff på «{query.trim()}».
            </div>
          )}

          {totalCount > 0 && (
            <div className="space-y-4">
              {matchedActions.length > 0 && (
                <Section
                  title="Hurtig-handlinger"
                  icon={<Zap strokeWidth={ICON_STROKE} aria-hidden />}
                >
                  {matchedActions.map((a) => {
                    const idx = flatIndex++;
                    const active = idx === highlight;
                    const Icon = a.icon;
                    return (
                      <ResultRow
                        key={`action-${a.id}`}
                        active={active}
                        onClick={() =>
                          void handleSelect({
                            key: `action-${a.id}`,
                            category: "actions",
                            primary: a.label,
                            secondary: a.description,
                            avatarUrl: null,
                            action: a,
                          })
                        }
                        leading={
                          <IconBubble>
                            <Icon
                              className="h-3.5 w-3.5"
                              strokeWidth={ICON_STROKE}
                              aria-hidden
                            />
                          </IconBubble>
                        }
                        primary={a.label}
                        secondary={a.description}
                      />
                    );
                  })}
                </Section>
              )}

              {results.players.length > 0 && (
                <Section title="Spillere" icon={<User strokeWidth={ICON_STROKE} aria-hidden />}>
                  {results.players.map((p) => {
                    const idx = flatIndex++;
                    const active = idx === highlight;
                    return (
                      <ResultRow
                        key={`player-${p.id}`}
                        active={active}
                        onClick={() => navigateTo(p.href)}
                        leading={
                          <Avatar name={p.name} url={p.avatarUrl} />
                        }
                        primary={p.name}
                        secondary={p.email}
                      />
                    );
                  })}
                </Section>
              )}

              {results.plans.length > 0 && (
                <Section
                  title="Planer"
                  icon={<ClipboardList strokeWidth={ICON_STROKE} aria-hidden />}
                >
                  {results.plans.map((p) => {
                    const idx = flatIndex++;
                    const active = idx === highlight;
                    return (
                      <ResultRow
                        key={`plan-${p.id}`}
                        active={active}
                        onClick={() => navigateTo(p.href)}
                        leading={
                          <IconBubble>
                            <ClipboardList
                              className="h-3.5 w-3.5"
                              strokeWidth={ICON_STROKE}
                              aria-hidden
                            />
                          </IconBubble>
                        }
                        primary={p.name}
                        secondary={`${p.playerName} · ${p.status}`}
                      />
                    );
                  })}
                </Section>
              )}

              {results.bookings.length > 0 && (
                <Section
                  title="Bookinger"
                  icon={<CalendarDays strokeWidth={ICON_STROKE} aria-hidden />}
                >
                  {results.bookings.map((b) => {
                    const idx = flatIndex++;
                    const active = idx === highlight;
                    return (
                      <ResultRow
                        key={`booking-${b.id}`}
                        active={active}
                        onClick={() => navigateTo(b.href)}
                        leading={
                          <IconBubble>
                            <CalendarDays
                              className="h-3.5 w-3.5"
                              strokeWidth={ICON_STROKE}
                              aria-hidden
                            />
                          </IconBubble>
                        }
                        primary={`${b.playerName} — ${b.serviceName}`}
                        secondary={formatDateTime(b.startAt)}
                      />
                    );
                  })}
                </Section>
              )}

              {results.routes.length > 0 && (
                <Section
                  title="Ruter"
                  icon={<Compass strokeWidth={ICON_STROKE} aria-hidden />}
                >
                  {results.routes.map((r) => {
                    const idx = flatIndex++;
                    const active = idx === highlight;
                    return (
                      <ResultRow
                        key={`route-${r.id}`}
                        active={active}
                        onClick={() => navigateTo(r.href)}
                        leading={
                          <IconBubble>
                            <Compass
                              className="h-3.5 w-3.5"
                              strokeWidth={ICON_STROKE}
                              aria-hidden
                            />
                          </IconBubble>
                        }
                        primary={r.label}
                        secondary={r.description}
                      />
                    );
                  })}
                </Section>
              )}
            </div>
          )}
        </div>

        {/* Footer med hints */}
        <div className="flex items-center justify-between gap-4 border-t border-border bg-background/50 px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ArrowUpDown
                className="h-3 w-3"
                strokeWidth={ICON_STROKE}
                aria-hidden
              />
              Naviger
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft
                className="h-3 w-3"
                strokeWidth={ICON_STROKE}
                aria-hidden
              />
              Velg
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="rounded border border-border bg-card px-1 text-[10px]">
                ESC
              </span>
              Lukk
            </span>
          </div>
          {totalCount > 0 && (
            <span className="tabular-nums">{totalCount} treff</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="flex h-3.5 w-3.5 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
        </span>
        {title}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  );
}

function ResultRow({
  active,
  onClick,
  leading,
  primary,
  secondary,
}: {
  active: boolean;
  onClick: () => void;
  leading: React.ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        data-active={active}
        className={`flex w-full items-center gap-4 rounded-md px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          active ? "bg-secondary" : "hover:bg-secondary/60"
        }`}
      >
        {leading}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {primary}
          </div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">
            {secondary}
          </div>
        </div>
        <CornerDownLeft
          className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
            active ? "text-foreground opacity-100" : "opacity-0"
          }`}
          strokeWidth={ICON_STROKE}
          aria-hidden
        />
      </button>
    </li>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
    >
      {initials(name)}
    </div>
  );
}

function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
    >
      {children}
    </div>
  );
}
