import { Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { COACH, STALL } from "@/lib/hq/data";
import { ADMIN_MOBILE, primaryFor, visibleAdminPrimary } from "@/lib/hq/nav";
import {
  ADMIN_TITLES,
  type AdminRole,
  type AdminScreenId,
  type UiState,
} from "@/lib/hq/types";
import { cn } from "./ui";

type InspectorCtx = {
  node: React.ReactNode;
  setNode: (node: React.ReactNode) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Ctx = createContext<InspectorCtx | null>(null);

export function InspectorPortal({
  children,
  sheet,
}: {
  children: ReactNode;
  sheet?: boolean;
}) {
  const ctx = useContext(Ctx);
  useLayoutEffect(() => {
    if (!ctx) return;
    ctx.setNode(children);
    ctx.setOpen(Boolean(sheet));
    return () => {
      ctx.setNode(null);
      ctx.setOpen(false);
    };
  });
  return null;
}

function useKlokke() {
  const [klokke, setKlokke] = useState("22:33");
  const [dato, setDato] = useState("torsdag 17. september");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setKlokke(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
      setDato(
        d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return { klokke, dato };
}

export function AdminShell({
  screen,
  onScreen,
  role,
  onRole,
  tilstand,
  children,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
  role: AdminRole;
  onRole: (role: AdminRole) => void;
  tilstand?: UiState;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [insp, setInsp] = useState<React.ReactNode>(null);
  const [sheet, setSheet] = useState(false);
  const { klokke, dato } = useKlokke();
  const nav = visibleAdminPrimary(role);
  const current = primaryFor(screen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ctx = useMemo<InspectorCtx>(
    () => ({
      node: insp,
      setNode: setInsp,
      open: sheet,
      setOpen: setSheet,
    }),
    [insp, sheet],
  );

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    const screens = Object.entries(ADMIN_TITLES).filter(
      ([id, label]) => !q || label.toLowerCase().includes(q) || id.includes(q),
    );
    const players = STALL.filter((p) => !q || p.name.toLowerCase().includes(q));
    return { screens, players };
  }, [query]);

  return (
    <Ctx.Provider value={ctx}>
      <div data-brand="agencyos" className="min-h-dvh bg-flate text-ink">
        <div className="grid min-h-dvh md:grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_372px]">
          <aside className="hidden flex-col gap-[26px] border-r border-sand-200 bg-sand-150 px-3.5 py-5 xl:flex">
            <div className="flex items-center gap-2.5 px-2">
              <img src="/ak-golf-logo.svg" alt="AK Golf" className="h-[30px] w-[34px]" />
              <span className="font-display text-md font-semibold uppercase tracking-display text-grafitt-900">
                AgencyOS
              </span>
            </div>
            <nav className="flex flex-col gap-0.5" aria-label="AgencyOS">
              <div className="px-2 pb-2">
                <span className="font-meta text-3xs uppercase tracking-merke text-grafitt-500">
                  AgencyOS
                </span>
              </div>
              {nav.map((item) => {
                const active = item.id === current;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onScreen(item.id)}
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-control px-2.5 text-left text-sm",
                      active
                        ? "bg-grafitt-900 font-medium text-sand-100"
                        : "text-grafitt-600 hover:bg-sand-200",
                    )}
                  >
                    {item.label}
                    {item.meta ? (
                      <span className={cn("font-meta text-xs", active ? "text-sand-400" : "text-grafitt-500")}>
                        {item.meta}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-2.5 border-t border-sand-200 px-2.5 pt-3.5">
              <span className="font-meta text-3xs uppercase tracking-merke text-grafitt-500">Kontekst</span>
              <div className="flex h-11 items-center gap-2.5 rounded-control border border-sand-400 bg-sand-100 px-2.5">
                <span className="size-[26px] rounded-full bg-sand-500" />
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-medium text-grafitt-900">{COACH.name}</span>
                  <span className="text-2xs text-grafitt-500">
                    {role === "ADMIN" ? "Admin" : "Coach"} · AK Golf
                  </span>
                </span>
              </div>
              <ProductLinks current="admin" />
            </div>
          </aside>

          <aside className="hidden flex-col items-center gap-4 border-r border-sand-200 bg-sand-150 py-4 md:flex xl:hidden">
            <img src="/ak-golf-logo.svg" alt="" className="h-[26px] w-[30px]" />
            {ADMIN_MOBILE.slice(0, 4).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onScreen(id)}
                className={cn(
                  "writing-vertical font-display text-xs font-semibold uppercase tracking-seksjon",
                  primaryFor(id) === current
                    ? "border-l-[3px] border-rust-500 pl-1.5 text-grafitt-900"
                    : "text-grafitt-600",
                )}
              >
                {ADMIN_TITLES[id].split(" · ")[0]}
              </button>
            ))}
          </aside>

          <div className="flex min-w-0 flex-col bg-flate">
            <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sand-200 px-4 xl:h-[60px] xl:gap-4 xl:px-7">
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-control border border-sand-400 bg-hevet md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Meny"
              >
                ☰
              </button>
              <img src="/ak-golf-logo.svg" alt="" className="h-[26px] w-[30px] md:hidden" />
              <span className="font-display text-md font-semibold uppercase tracking-display md:hidden">
                AgencyOS
              </span>
              <button
                type="button"
                onClick={() => setSearch(true)}
                className="hidden h-[34px] w-[300px] items-center gap-2 rounded-control border border-sand-400 bg-hevet px-3 text-xs text-grafitt-500 xl:flex"
              >
                <span className="size-2.5 rounded-full border-[1.5px] border-grafitt-400" />
                <span className="flex-1 text-left">Søk spiller, økt eller sak</span>
                <kbd className="font-meta text-2xs text-grafitt-500">⌘K</kbd>
              </button>
              <span className="ml-auto hidden text-xs capitalize text-grafitt-600 md:inline xl:hidden">
                {dato}
              </span>
              <span className="font-meta text-xs font-medium text-grafitt-900 max-md:ml-auto xl:hidden">
                {klokke}
              </span>
              <span className="size-[30px] rounded-full bg-sand-500 md:hidden" />
              <div className="ml-auto hidden items-center gap-4 xl:flex">
                <span className="text-xs capitalize text-grafitt-600">{dato}</span>
                <span className="font-meta text-xs font-medium text-grafitt-900">{klokke}</span>
                <span className="flex items-center gap-1.5 text-xs text-grafitt-500">
                  <span className="size-1.5 rounded-full bg-grafitt-600" />
                  Synkronisert {klokke}
                </span>
              </div>
            </header>
            <main className="flex-1 overflow-auto px-4 py-4 pb-24 md:px-7 md:py-7 md:pb-9">
              {children}
            </main>
          </div>

          <aside className="hidden min-h-0 overflow-auto border-l border-sand-200 bg-hevet xl:block">
            {insp ?? <DefaultInspector />}
          </aside>
        </div>

        {sheet && insp ? (
          <div
            className="fixed inset-0 z-30 flex items-end bg-grafitt-900/40 xl:hidden"
            onClick={() => setSheet(false)}
            role="presentation"
          >
            <div
              className="flex max-h-[96dvh] w-full flex-col gap-4 overflow-y-auto rounded-t-lg bg-hevet px-4 pb-7 pt-3 shadow-overlegg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto h-1 w-[38px] rounded-full bg-sand-400" />
              {insp}
            </div>
          </div>
        ) : null}

        {open ? (
          <div className="fixed inset-0 z-40 bg-grafitt-900/40 md:hidden" onClick={() => setOpen(false)}>
            <div className="flex h-full w-72 flex-col gap-2 overflow-y-auto bg-sand-150 p-4" onClick={(e) => e.stopPropagation()}>
              <span className="font-display text-md font-semibold uppercase">AgencyOS</span>
              {nav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex h-11 items-center text-left text-sm"
                  onClick={() => {
                    onScreen(item.id);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
              <ProductLinks current="admin" />
            </div>
          </div>
        ) : (
          <nav className="fixed inset-x-0 bottom-0 z-20 grid h-[72px] grid-cols-5 border-t border-sand-200 bg-hevet pb-2 md:hidden">
            {ADMIN_MOBILE.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onScreen(id)}
                className={cn(
                  "flex h-[52px] items-center justify-center px-1 text-center text-xs",
                  primaryFor(id) === current
                    ? "border-t-[3px] border-rust-500 font-semibold text-grafitt-900"
                    : "border-t-[3px] border-transparent text-grafitt-600",
                )}
              >
                {id === "oppsett" ? "Mer" : ADMIN_TITLES[id].split(" · ")[0]}
              </button>
            ))}
          </nav>
        )}

        {search ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-grafitt-900/40 pt-24" onClick={() => setSearch(false)}>
            <div
              className="w-full max-w-lg rounded-md border border-sand-400 bg-hevet p-4 shadow-overlegg"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk spiller, økt eller sak"
                className="h-12 w-full rounded-control border border-sand-400 bg-flate px-3 text-base"
              />
              <div className="mt-3 max-h-80 overflow-auto">
                {hits.players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex h-11 w-full items-center justify-between text-left text-sm"
                    onClick={() => {
                      onScreen("stall");
                      setSearch(false);
                    }}
                  >
                    {p.name}
                    <span className="font-meta text-2xs text-grafitt-500">HCP {p.hcp}</span>
                  </button>
                ))}
                {hits.screens.slice(0, 12).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="flex h-11 w-full items-center text-left text-sm text-grafitt-600"
                    onClick={() => {
                      onScreen(id as AdminScreenId);
                      setSearch(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <span className="hidden">
          {tilstand}
          <button type="button" onClick={() => onRole(role === "ADMIN" ? "COACH" : "ADMIN")}>
            bytt
          </button>
        </span>
      </div>
    </Ctx.Provider>
  );
}

function DefaultInspector() {
  return (
    <div className="flex h-full flex-col gap-6 p-[22px]">
      <div className="flex flex-col gap-2.5">
        <div className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
          Kontekst
        </div>
        <p className="m-0 text-base leading-normal text-grafitt-600">
          Velg en sak eller en økt for å se detaljene her uten å miste listen.
        </p>
      </div>
      <div className="flex flex-col gap-3.5 border-t border-sand-200 pt-5">
        <div className="font-display text-xs font-semibold uppercase tracking-etikett text-grafitt-500">
          Trenger oppfølging
        </div>
        {STALL.filter((p) => p.flag).map((p) => (
          <div key={p.id} className="flex flex-col gap-0.5">
            <span className="text-base font-medium">{p.name}</span>
            <span className="text-xs leading-normal text-grafitt-500">{p.flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductLinks({ current }: { current: "admin" | "portal" | "wang" | "tn" }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-meta text-3xs uppercase tracking-merke text-grafitt-500">Flater</span>
      <Link
        to="/admin"
        search={{ skjerm: "hjem", rolle: "COACH", tilstand: "normal" }}
        className={cn("h-9 rounded-control px-2.5 text-sm leading-9", current === "admin" ? "text-grafitt-900" : "text-grafitt-600")}
      >
        AgencyOS
      </Link>
      <Link
        to="/portal"
        search={{ skjerm: "i-dag", rolle: "SP", tilstand: "normal" }}
        className={cn("h-9 rounded-control px-2.5 text-sm leading-9", current === "portal" ? "text-grafitt-900" : "text-grafitt-600")}
      >
        PlayerHQ
      </Link>
      <Link
        to="/wang"
        search={{ skjerm: "oversikt", rolle: "SS" }}
        className={cn("h-9 rounded-control px-2.5 text-sm leading-9", current === "wang" ? "text-grafitt-900" : "text-grafitt-600")}
      >
        WANG
      </Link>
      <Link
        to="/team-norway"
        search={{ skjerm: "oversikt", rolle: "TR", tilstand: "suksess" }}
        className={cn("h-9 rounded-control px-2.5 text-sm leading-9", current === "tn" ? "text-grafitt-900" : "text-grafitt-600")}
      >
        Team Norway
      </Link>
    </div>
  );
}

export function openInspectorSheet() {
  /* set via context in screens */
}
