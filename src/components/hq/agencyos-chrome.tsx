import type { ReactNode } from "react";
import type { AdminScreenId } from "@/lib/hq/types";
import { cn } from "./ui";

export const AOS_TOP: { id: AdminScreenId; label: string }[] = [
  { id: "hjem", label: "Hjem" },
  { id: "stall", label: "Stall" },
  { id: "kalender-uke", label: "Kalender" },
  { id: "workbench", label: "Workbench" },
  { id: "innboks", label: "Innboks" },
  { id: "ko", label: "Godkjenninger" },
  { id: "spor", label: "AgenticOS" },
  { id: "stall-analyse", label: "Analyse" },
  { id: "oppsett", label: "Oppsett" },
];

const MOBILE_TABS: { id: AdminScreenId; label: string }[] = [
  { id: "hjem", label: "Hjem" },
  { id: "stall", label: "Stall" },
  { id: "workbench", label: "Uke" },
  { id: "innboks", label: "Innboks" },
  { id: "ko", label: "Mer" },
];

export function AgencyosChrome({
  current,
  path,
  onScreen,
  toolbar,
  children,
  hideMobileNav,
}: {
  current: AdminScreenId;
  path: string;
  onScreen: (id: AdminScreenId) => void;
  toolbar?: ReactNode;
  children: ReactNode;
  hideMobileNav?: boolean;
}) {
  const topActive = (id: AdminScreenId) => {
    if (id === "workbench") {
      return ["workbench", "arsplan", "periode", "maned", "oktbygger", "publiser", "stall-dag", "gruppe", "planlegge"].includes(current);
    }
    if (id === "kalender-uke") {
      return current.startsWith("kalender") || current.startsWith("okt-") || current.startsWith("live-") || current === "oppsummering-coach" || current === "min-uke";
    }
    if (id === "innboks") return current === "innboks" || current === "trad";
    if (id === "ko") return ["ko", "forslag", "bekreft", "resultat-caddie", "forkast"].includes(current);
    if (id === "spor") return current === "spor" || current === "spor-detalj";
    if (id === "stall") return current === "stall" || current === "stall-dag";
    if (id === "stall-analyse") return current === "stall-analyse";
    if (id === "oppsett") {
      return ["oppsett", "ovelsesbibliotek", "ovelse", "program", "publiser-ovelse", "moderering", "versjon", "avpubliser", "abonnement"].includes(current);
    }
    return id === current;
  };

  return (
    <div data-brand="agencyos" className="min-h-dvh bg-page text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[1600px] flex-col bg-hevet lg:min-h-[calc(100dvh-40px)] lg:my-5 lg:rounded-[20px] lg:shadow-overlegg">
        <header className="flex h-14 shrink-0 items-center gap-6 border-b border-sand-200 px-4 lg:px-5">
          <div className="flex items-center gap-2.5">
            <img src="/ak-golf-logo.svg" alt="" className="h-[28px] w-[32px]" />
            <span className="font-display text-[15px] font-semibold uppercase tracking-[0.08em]">AgencyOS</span>
          </div>
          <nav className="hidden items-center gap-0.5 overflow-x-auto lg:flex" aria-label="AgencyOS">
            {AOS_TOP.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onScreen(item.id)}
                className={cn(
                  "h-8 shrink-0 rounded-md px-2 text-[12px] xl:px-3 xl:text-[13px]",
                  topActive(item.id) ? "bg-sand-200 font-medium text-grafitt-900" : "text-grafitt-600 hover:bg-sand-150",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 font-meta text-[11px] text-grafitt-500 lg:flex">
            <span>{path}</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-grafitt-700" />
              TILKOBLET
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-grafitt-900 text-[10px] font-semibold text-sand-100">
              AK
            </span>
          </div>
        </header>
        {toolbar}
        <div className="flex min-h-0 flex-1">{children}</div>
        {hideMobileNav ? null : (
          <nav className="sticky bottom-0 z-20 flex h-[64px] items-start border-t border-sand-200 bg-hevet px-2 pt-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
            {MOBILE_TABS.map((tab) => {
              const active = topActive(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onScreen(tab.id)}
                  className={cn(
                    "flex h-12 flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                    active ? "font-semibold text-grafitt-900" : "text-grafitt-500",
                  )}
                >
                  <span className={cn("h-0.5 w-5 rounded-full", active ? "bg-handling" : "bg-transparent")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function PlayerChip() {
  return (
    <button type="button" className="flex h-10 items-center gap-2.5 rounded-lg border border-sand-300 bg-hevet px-2.5">
      <span className="flex size-8 items-center justify-center rounded-full bg-[#6B2B1A] text-[10px] font-semibold text-sand-100">
        NB
      </span>
      <span className="hidden text-left sm:block">
        <span className="block text-[13px] font-semibold leading-tight">Nora Berg</span>
        <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-500">Jenter 16 · GFGK · Wang</span>
      </span>
      <span className="text-grafitt-400">▾</span>
    </button>
  );
}

export const WB_VIEWS: { id: AdminScreenId; label: string }[] = [
  { id: "arsplan", label: "År" },
  { id: "periode", label: "Periode" },
  { id: "maned", label: "Måned" },
  { id: "workbench", label: "Uke" },
  { id: "oktbygger", label: "Økt" },
  { id: "stall-dag", label: "Stall" },
  { id: "live-coach", label: "Live" },
  { id: "min-uke", label: "Min kalender" },
];

export function WorkbenchToolbar({
  current,
  onScreen,
  coach,
  onCoach,
  extra,
}: {
  current: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
  coach: boolean;
  onCoach: (v: boolean) => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex h-auto shrink-0 flex-wrap items-center gap-3 border-b border-sand-200 px-4 py-2 lg:h-[52px] lg:flex-nowrap lg:py-0">
      <PlayerChip />
      <div className="hidden leading-tight md:block">
        <div className="text-[12px] text-grafitt-600">
          Sesong <span className="font-medium text-grafitt-900">2026/27</span>
          <span className="mx-1.5 text-sand-500">·</span>
          Grunnperiode
        </div>
        <div className="font-meta text-[11px] text-grafitt-500">uke 38</div>
      </div>
      <div className="hidden items-center rounded-full border border-sand-300 p-0.5 lg:flex">
        {WB_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onScreen(v.id)}
            className={cn(
              "h-7 rounded-full px-2.5 text-[12px]",
              v.id === current || (current === "workbench" && v.id === "workbench")
                ? "bg-grafitt-900 font-medium text-white"
                : "text-grafitt-600",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="hidden items-center rounded-full border border-sand-300 p-0.5 xl:flex">
        <button type="button" onClick={() => onCoach(true)} className={cn("h-7 rounded-full px-3 text-[11px] font-semibold", coach ? "bg-grafitt-900 text-white" : "text-grafitt-500")}>
          COACH
        </button>
        <button type="button" onClick={() => onCoach(false)} className={cn("h-7 rounded-full px-3 text-[11px] font-semibold", !coach ? "bg-grafitt-900 text-white" : "text-grafitt-500")}>
          SPILLER SER
        </button>
      </div>
      {extra}
    </div>
  );
}
