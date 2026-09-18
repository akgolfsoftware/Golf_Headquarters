import { useEffect, useMemo, useState } from "react";
import type { AdminScreenId } from "@/lib/hq/types";
import { cn } from "./ui";
import { ArCanvas, ArInspector, LiveCanvas, ManedCanvas, OktCanvas, OktInspector, PeriodeCanvas, StallDagCanvas } from "./workbench-views";

const TOP_NAV: { id: AdminScreenId; label: string }[] = [
  { id: "hjem", label: "Hjem" },
  { id: "innboks", label: "Innboks" },
  { id: "kalender-uke", label: "Kalender" },
  { id: "stall", label: "Stall" },
  { id: "workbench", label: "Workbench" },
  { id: "ko", label: "Godkjenninger" },
];

const VIEWS: { id: AdminScreenId; label: string }[] = [
  { id: "arsplan", label: "År" },
  { id: "periode", label: "Periode" },
  { id: "maned", label: "Måned" },
  { id: "workbench", label: "Uke" },
  { id: "oktbygger", label: "Økt" },
  { id: "stall-dag", label: "Stall" },
  { id: "live-oversikt", label: "Live" },
  { id: "min-uke", label: "Min kalender" },
];

const DAYS: { key: string; label: string; date: number; weekend: boolean; note?: string }[] = [
  { key: "man", label: "MAN", date: 14, weekend: false },
  { key: "tir", label: "TIR", date: 15, weekend: false },
  { key: "ons", label: "ONS", date: 16, weekend: false },
  { key: "tor", label: "TOR", date: 17, weekend: false },
  { key: "fre", label: "FRE", date: 18, weekend: false },
  { key: "lor", label: "LØR", date: 19, weekend: true, note: "TURN · SRIXON…" },
  { key: "son", label: "SØN", date: 20, weekend: true },
] as const;

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const HOUR_H = 52;
const GRID_START = 7;

type BlockKind = "okt" | "skole" | "turnering" | "test";

type Block = {
  id: string;
  day: (typeof DAYS)[number]["key"];
  start: string;
  end: string;
  title: string;
  sub?: string;
  kind: BlockKind;
  dashed?: boolean;
  series?: boolean;
  accent?: "navy" | "red" | "gold" | "gray";
};

const BLOCKS: Block[] = [
  { id: "styrke", day: "man", start: "07:00", end: "08:00", title: "Styrke & mobilitet", sub: "07:00 · 1 t", kind: "okt", accent: "navy" },
  { id: "putt", day: "man", start: "16:00", end: "17:00", title: "Putting-drill", sub: "16:00 · 1 t", kind: "okt", series: true },
  { id: "tek", day: "tir", start: "15:30", end: "16:30", title: "Teknikk-drill", sub: "15:30 · 1 t", kind: "okt", accent: "gray" },
  { id: "naer", day: "ons", start: "16:00", end: "17:30", title: "Nærspill", sub: "16:00 · 1 t 30", kind: "okt", accent: "red" },
  { id: "scoring", day: "ons", start: "17:00", end: "19:00", title: "9 hull scoring", sub: "17:00 · 2 t", kind: "okt" },
  { id: "kort", day: "tor", start: "13:00", end: "14:00", title: "Kortblokk", sub: "13:00 · 1 t", kind: "okt", dashed: true },
  { id: "inn", day: "fre", start: "16:00", end: "17:00", title: "Innspill 50–80 m", sub: "16:00 · 1 t", kind: "okt", series: true },
  { id: "warm", day: "lor", start: "08:00", end: "09:30", title: "Oppvarming · Srixon #4", sub: "08:00 · 1 t 30", kind: "okt" },
  { id: "tour", day: "lor", start: "09:30", end: "13:30", title: "Srixon Tour #4 · runde 1", sub: "09:30 · 4 t", kind: "turnering", accent: "gold" },
];

const PROGRAMS = [
  { title: "Innspill 4 uker", meta: "12 økter · v2", note: "3 økter/uke · stige 50–70–90 → gapping" },
  { title: "Skarpsliping 8 uker", meta: "24 økter · v3", note: "Brukt 31 ganger · SG nærspill +0,41 etter" },
  { title: "Retur etter skade", meta: "9 økter · v1", note: "Utkast · aldri brukt" },
];

const BALANCE = [
  { id: "SLAG", hours: "4,5 t", pct: 43, color: "#9B2415", dot: true },
  { id: "SPILL", hours: "2 t", pct: 19, color: "#8A8680" },
  { id: "FYS", hours: "1,5 t", pct: 14, color: "#2B4C7E" },
  { id: "TURN", hours: "1,5 t", pct: 14, color: "#8A6A12" },
  { id: "TEK", hours: "1 t", pct: 10, color: "#141413" },
];

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function topPx(t: string) {
  return ((toMin(t) - GRID_START * 60) / 60) * HOUR_H;
}

function heightPx(start: string, end: string) {
  return Math.max(((toMin(end) - toMin(start)) / 60) * HOUR_H - 4, 28);
}

export function WorkbenchFasit({
  onScreen,
  screen = "workbench",
}: {
  onScreen: (id: AdminScreenId) => void;
  screen?: AdminScreenId;
}) {
  const [sel, setSel] = useState("naer");
  const [coach, setCoach] = useState(true);
  const [sources, setSources] = useState(true);
  const [progOpen, setProgOpen] = useState(true);
  const [layers, setLayers] = useState({ okt: true, skole: true, turnering: true, test: true });
  const [day, setDay] = useState("ons");
  const [sheet, setSheet] = useState<"insp" | "kilder" | null>("insp");
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        onScreen("oktbygger");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setSources((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onScreen]);

  const block = BLOCKS.find((b) => b.id === sel) ?? BLOCKS[3]!;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((Math.min(Math.max(nowMin, GRID_START * 60), 21 * 60) - GRID_START * 60) / 60) * HOUR_H;

  const visible = useMemo(
    () =>
      BLOCKS.filter((b) => {
        if (b.kind === "okt") return layers.okt;
        if (b.kind === "turnering") return layers.turnering;
        if (b.kind === "test") return layers.test;
        return true;
      }),
    [layers],
  );

  return (
    <>
    <div data-brand="agencyos" className="hidden min-h-dvh bg-page p-3 text-ink md:p-5 lg:block">
      <div className="mx-auto flex min-h-[calc(100dvh-24px)] max-w-[1600px] flex-col overflow-hidden rounded-[20px] bg-hevet shadow-overlegg md:min-h-[calc(100dvh-40px)]">
        <header className="flex h-14 shrink-0 items-center gap-6 border-b border-sand-200 px-5">
          <div className="flex items-center gap-2.5">
            <img src="/ak-golf-logo.svg" alt="" className="h-[28px] w-[32px]" />
            <span className="font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-grafitt-900">
              AgencyOS
            </span>
          </div>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="AgencyOS">
            {TOP_NAV.map((item) => {
              const active = item.id === "workbench";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onScreen(item.id)}
                  className={cn(
                    "h-8 rounded-md px-3 text-[13px]",
                    active ? "bg-sand-200 font-medium text-grafitt-900" : "text-grafitt-600 hover:bg-sand-150",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="ml-auto hidden items-center gap-3 font-meta text-[11px] text-grafitt-500 lg:flex">
            <span>
              {screen === "arsplan"
                ? "/admin/workbench/ar/2026-27"
                : screen === "periode"
                  ? "/admin/workbench/periode/grunn"
                  : screen === "maned"
                    ? "/admin/workbench/maned/2026-09"
                    : screen === "oktbygger"
                      ? "/admin/workbench/okt/naerspill"
                      : "/admin/workbench/uke/2026-38"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-grafitt-700" />
              TILKOBLET
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-grafitt-900 text-[10px] font-semibold text-sand-100">
              AK
            </span>
          </div>
        </header>

        <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-sand-200 px-4">
          <button
            type="button"
            className="flex h-10 items-center gap-2.5 rounded-lg border border-sand-300 bg-hevet px-2.5"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#6B2B1A] text-[10px] font-semibold text-sand-100">
              NB
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[13px] font-semibold leading-tight">Nora Berg</span>
              <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-500">
                Jenter 16 · GFGK · Wang
              </span>
            </span>
            <span className="text-grafitt-400">▾</span>
          </button>
          <div className="hidden leading-tight md:block">
            <div className="text-[12px] text-grafitt-600">
              Sesong <span className="font-medium text-grafitt-900">2026/27</span>
              <span className="mx-1.5 text-sand-500">·</span>
              Grunnperiode
            </div>
            <div className="font-meta text-[11px] text-grafitt-500">uke 38</div>
          </div>
          <div className="hidden items-center rounded-full border border-sand-300 p-0.5 lg:flex">
            {VIEWS.map((v) => {
              const active = v.id === screen || (v.id === "workbench" && screen === "workbench");
              return (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => onScreen(v.id)}
                  className={cn(
                    "h-7 rounded-full px-2.5 text-[12px]",
                    active ? "bg-grafitt-900 font-medium text-white" : "text-grafitt-600",
                  )}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
          <div className="hidden items-center rounded-full border border-sand-300 p-0.5 xl:flex">
            <button
              type="button"
              onClick={() => setCoach(true)}
              className={cn("h-7 rounded-full px-3 text-[11px] font-semibold tracking-etikett", coach ? "bg-grafitt-900 text-white" : "text-grafitt-500")}
            >
              COACH
            </button>
            <button
              type="button"
              onClick={() => setCoach(false)}
              className={cn("h-7 rounded-full px-3 text-[11px] font-semibold tracking-etikett", !coach ? "bg-grafitt-900 text-white" : "text-grafitt-500")}
            >
              SPILLER SER
            </button>
          </div>
          <span className="hidden font-meta text-[12px] text-amber-700 xl:inline">3 utkast · 0 endret</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onScreen("oktbygger")}
              className="h-9 rounded-lg border border-sand-400 bg-hevet px-3 text-[13px] font-medium"
            >
              Ny økt <span className="ml-1 font-meta text-[10px] text-grafitt-400">⌘N</span>
            </button>
            <button
              type="button"
              onClick={() => onScreen("publiser")}
              className="h-9 rounded-lg bg-handling px-3.5 text-[13px] font-semibold text-white hover:bg-handling-hover"
            >
              Publiser 3
            </button>
          </div>
        </div>

        {screen === "arsplan" ? (
          <div className="flex min-h-0 flex-1">
            <ArCanvas />
            <ArInspector />
          </div>
        ) : screen === "periode" ? (
          <div className="flex min-h-0 flex-1">
            <PeriodeCanvas />
            <ArInspector />
          </div>
        ) : screen === "maned" ? (
          <div className="flex min-h-0 flex-1">
            <ManedCanvas onWeek={() => onScreen("workbench")} />
            <ArInspector />
          </div>
        ) : screen === "oktbygger" ? (
          <div className="flex min-h-0 flex-1">
            <OktCanvas onScreen={onScreen} />
            <OktInspector onScreen={onScreen} />
          </div>
        ) : screen === "stall-dag" ? (
          <div className="flex min-h-0 flex-1">
            <StallDagCanvas onScreen={onScreen} />
            <ArInspector />
          </div>
        ) : screen === "live-oversikt" ? (
          <div className="flex min-h-0 flex-1">
            <LiveCanvas onScreen={onScreen} />
            <OktInspector onScreen={onScreen} />
          </div>
        ) : (
        <div className="flex min-h-0 flex-1">
          {sources ? (
            <aside className="hidden w-[240px] shrink-0 flex-col border-r border-sand-200 bg-hevet xl:flex">
              <div className="p-3">
                <div className="flex h-9 items-center gap-2 rounded-full border border-sand-300 bg-sand-100 px-3 text-[12px] text-grafitt-500">
                  <span>⌕</span>
                  <span className="flex-1">Søk i kilder</span>
                  <span className="font-meta text-grafitt-400">169</span>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="mb-1 grid grid-cols-7 text-center font-meta text-[9px] uppercase tracking-etikett text-grafitt-400">
                  {["M", "T", "O", "T", "F", "L", "S"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center font-meta text-[10px] text-grafitt-500">
                  {[31, ...Array.from({ length: 30 }, (_, i) => i + 1)].map((d, i) => {
                    const inWeek = d >= 14 && d <= 20;
                    const today = d === 16;
                    return (
                      <span
                        key={`${d}-${i}`}
                        className={cn(
                          "flex size-[22px] items-center justify-center justify-self-center rounded-full",
                          today && "bg-grafitt-900 text-white",
                          inWeek && !today && "bg-sand-200 text-grafitt-800",
                        )}
                      >
                        {d}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-sand-200 px-4 py-3">
                <div className="mb-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kontekst</div>
                {(
                  [
                    ["okt", "Økter", "alltid på", "#9B2415", true],
                    ["skole", "Skole", "på", "#C9C5BC", false],
                    ["turnering", "Turneringer", "på", "#8A6A12", false],
                    ["test", "Tester", "på", "#141413", false],
                  ] as const
                ).map(([key, label, state, color, locked]) => (
                  <button
                    key={key}
                    type="button"
                    disabled={locked}
                    onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                    className="flex h-8 w-full items-center gap-2 text-[12px]"
                  >
                    <span className="size-2 rounded-[2px]" style={{ background: color }} />
                    <span className="flex-1 text-left font-medium uppercase tracking-etikett">{label}</span>
                    <span className="text-[11px] text-grafitt-400">{locked || layers[key] ? state : "av"}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto border-t border-sand-200 px-4 py-3">
                <div className="mb-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
                  Sett inn · dra til rutenettet
                </div>
                <RailRow title="Ukemaler" count="6" />
                <button type="button" onClick={() => setProgOpen((v) => !v)} className="flex h-8 w-full items-center text-[13px] font-semibold">
                  <span className="flex-1 text-left">Programmer</span>
                  <span className="font-meta text-[11px] font-normal text-grafitt-400">4 {progOpen ? "⌃" : "▾"}</span>
                </button>
                {progOpen
                  ? PROGRAMS.map((p) => (
                      <div key={p.title} className="mb-2 rounded-lg border border-sand-200 bg-sand-100 px-2.5 py-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[12px] font-semibold">{p.title}</span>
                          <span className="font-meta text-[10px] text-grafitt-400">{p.meta}</span>
                        </div>
                        <p className="m-0 mt-0.5 text-[11px] leading-snug text-grafitt-500">{p.note}</p>
                      </div>
                    ))
                  : null}
                <RailRow title="Månedsplaner" count="2" />
                <RailRow title="Standardøkter" count="15" />
                <RailRow title="Øvelsesbank" count="142" />
              </div>
              <button
                type="button"
                onClick={() => setSources(false)}
                className="flex h-10 items-center justify-between border-t border-sand-200 px-4 text-[12px] text-grafitt-600"
              >
                Skjul kilder
                <span className="font-meta text-[10px] text-grafitt-400">⌘\</span>
              </button>
            </aside>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="grid shrink-0 grid-cols-[48px_repeat(7,minmax(0,1fr))] border-b border-sand-200">
              <span />
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className={cn("border-l border-sand-200 px-2 py-2", d.weekend && "bg-sand-100", d.date === 16 && "bg-sand-150")}
                >
                  <div className="font-meta text-[10px] tracking-etikett text-grafitt-500">{d.label}</div>
                  <div className={cn("font-display text-[22px] leading-none", d.date === 16 ? "font-semibold" : "font-medium")}>
                    {d.date}
                  </div>
                  {d.note ? <div className="mt-0.5 truncate font-meta text-[9px] uppercase tracking-etikett text-grafitt-400">{d.note}</div> : null}
                </div>
              ))}
            </div>
            <div className="relative min-h-0 flex-1 overflow-auto">
              <div className="relative" style={{ height: HOURS.length * HOUR_H }}>
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute right-0 left-0 border-t border-sand-200"
                    style={{ top: i * HOUR_H }}
                  >
                    <span className="absolute top-[-7px] left-1 font-meta text-[10px] text-grafitt-400">
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
                <div className="absolute inset-y-0 left-12 right-0 grid grid-cols-7">
                  {DAYS.map((d) => (
                    <div
                      key={d.key}
                      className={cn("relative border-l border-sand-200", d.weekend && "bg-sand-100/80")}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const hour = GRID_START + Math.floor(y / HOUR_H);
                        setHoverSlot(`${d.key}-${hour}`);
                      }}
                      onMouseLeave={() => setHoverSlot(null)}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button[data-block]")) return;
                        onScreen("oktbygger");
                      }}
                    >
                      {layers.skole && !d.weekend ? (
                        <div
                          className="pointer-events-none absolute inset-x-0 bg-[#EDEAE3] text-[9px] font-semibold uppercase tracking-etikett text-grafitt-400"
                          style={{ top: topPx("08:00"), height: heightPx("08:00", "15:00") }}
                        >
                          <span className="absolute top-1 left-2">Skole</span>
                        </div>
                      ) : null}
                      {hoverSlot?.startsWith(d.key) ? (
                        <div className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded bg-grafitt-700 px-2 py-1 text-[11px] text-white" style={{ top: 12 * HOUR_H }}>
                          Klikk for ny økt på dette tidspunktet
                        </div>
                      ) : null}
                      {visible
                        .filter((b) => b.day === d.key)
                        .map((b) => {
                          const active = b.id === sel;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              data-block
                              onClick={(e) => {
                                e.stopPropagation();
                                setSel(b.id);
                                setDay(b.day);
                                setSheet("insp");
                              }}
                              className={cn(
                                "absolute inset-x-1 z-10 overflow-hidden rounded-[6px] border bg-hevet px-2 py-1 text-left shadow-loftet",
                                b.dashed && "border-dashed border-sand-500",
                                !b.dashed && "border-sand-300",
                                active && "z-20 border-grafitt-900 shadow-sm",
                                b.accent === "gold" && "border-amber-300 bg-[#F7F1DE]",
                                b.accent === "gray" && "bg-sand-150",
                              )}
                              style={{
                                top: topPx(b.start),
                                height: heightPx(b.start, b.end),
                                borderLeftWidth: b.accent === "red" || active ? 3 : b.accent === "navy" ? 3 : 1,
                                borderLeftColor:
                                  b.accent === "red" || active
                                    ? "#9B2415"
                                    : b.accent === "navy"
                                      ? "#141413"
                                      : b.accent === "gold"
                                        ? "#8A6A12"
                                        : undefined,
                              }}
                            >
                              <span className="block truncate text-[12px] font-semibold leading-tight">{b.title}</span>
                              <span className="block truncate font-meta text-[10px] text-grafitt-500">{b.sub}</span>
                              {b.kind === "turnering" ? (
                                <span className="absolute bottom-1 left-2 font-meta text-[9px] uppercase tracking-etikett text-amber-700">
                                  Turnering
                                </span>
                              ) : null}
                              {b.series ? <span className="absolute top-1 right-1.5 text-[10px] text-grafitt-400">↻</span> : null}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute right-0 left-12 z-30 h-px bg-handling"
                  style={{ top: nowTop }}
                >
                  <span className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-handling" />
                </div>
              </div>
            </div>
          </div>

          <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 bg-hevet lg:flex">
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
                <span className="size-2 rounded-[2px] bg-handling" />
                Valgt økt · Golfslag · Chip · Automatikk · Treningsområde · Observert
              </div>
              <h2 className="m-0 mt-2 font-display text-[28px] font-semibold tracking-tight">{block.title}</h2>
              <p className="m-0 mt-1 text-[12px] text-grafitt-500">
                {block.start}–{block.end} · {DAYS.find((d) => d.key === block.day)?.label} {DAYS.find((d) => d.key === block.day)?.date}.09
              </p>
            </div>
            <div className="mx-5 mt-4 overflow-hidden rounded-lg border border-sand-200 text-[12px]">
              <StatRow k="Plan" v="Publisert" />
              <StatRow k="Gjennomføring" v="Ikke startet" />
              <StatRow k="Lagring" v="Lagret på server" last />
            </div>
            <div className="grid grid-cols-2 gap-2 px-5 pt-4">
              <button
                type="button"
                onClick={() => onScreen("oktbygger")}
                className="col-span-1 h-10 rounded-lg bg-grafitt-900 text-[13px] font-medium text-white"
              >
                Åpne økt
              </button>
              <button type="button" className="h-10 rounded-lg border border-sand-400 text-[13px]">
                Flytt · piltaster
              </button>
              <button type="button" className="h-10 rounded-lg border border-sand-400 text-[13px]">
                Endre varighet
              </button>
              <button type="button" className="h-10 rounded-lg border border-sand-400 text-[13px]">
                Endre serie ↻
              </button>
              <button type="button" className="col-span-2 h-10 rounded-lg border border-sand-300 text-[13px] text-handling">
                Slett utkast
              </button>
            </div>
            <div className="mt-5 border-t border-sand-200 px-5 py-4">
              <div className="mb-3 flex items-baseline justify-between font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
                <span>Balanse · uke 38</span>
                <span className="text-grafitt-700">10 t 30</span>
              </div>
              {BALANCE.map((row) => (
                <div key={row.id} className="mb-1.5 flex items-center gap-2">
                  <span className="w-9 font-meta text-[10px] uppercase text-grafitt-500">{row.id}</span>
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-sand-200">
                    <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <span className="w-10 text-right font-meta text-[11px]">{row.hours}</span>
                  {row.dot ? <span className="size-1.5 rounded-full bg-handling" /> : <span className="size-1.5" />}
                </div>
              ))}
              <p className="m-0 mt-3 text-[11px] leading-snug text-grafitt-500">
                Fokus denne uka er SLAG — prikken markerer dominant område. Resten holdes lavt med vilje. Ingen faglig terskel sperrer.
              </p>
            </div>
            <div className="mt-auto border-t border-sand-200 px-5 py-4">
              <div className="mb-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Neste viktig</div>
              <NextRow title="Srixon Tour #4 · Onsøy" when="lør 19.09" />
              <NextRow title="TN-batteri Q3" when="uke 40" />
              <NextRow title="P4 · Innspill 150–175" when="uke 41" />
            </div>
            {!coach ? (
              <p className="px-5 pb-4 text-[11px] text-grafitt-500">Spiller ser publisert plan. Utkast er skjult.</p>
            ) : null}
          </aside>
        </div>
        )}
      </div>
    </div>

    <div data-brand="agencyos" className="flex min-h-dvh flex-col bg-flate text-ink lg:hidden">
      <header className="sticky top-0 z-20 border-b border-sand-200 bg-hevet px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <img src="/ak-golf-logo.svg" alt="" className="h-7 w-8" />
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.08em]">AgencyOS</span>
          <span className="ml-auto font-meta text-[10px] text-amber-700">3 utkast</span>
          <button
            type="button"
            onClick={() => onScreen("publiser")}
            className="h-9 rounded-lg bg-handling px-3 text-[12px] font-semibold text-white"
          >
            Publiser 3
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#6B2B1A] text-[10px] font-semibold text-sand-100">
            NB
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">Nora Berg</div>
            <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-500">
              Jenter 16 · Uke 38 · Grunnperiode
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSheet("kilder")}
            className="h-9 rounded-lg border border-sand-400 px-3 text-[12px]"
          >
            Kilder
          </button>
        </div>
        <div className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4">
          {DAYS.map((d) => {
            const active = d.key === day;
            const n = visible.filter((b) => b.day === d.key).length;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  setDay(d.key);
                  const first = visible.find((b) => b.day === d.key);
                  if (first) setSel(first.id);
                }}
                className={cn(
                  "flex h-14 min-w-[48px] flex-col items-center justify-center rounded-lg px-2",
                  active ? "bg-grafitt-900 text-white" : "bg-sand-150 text-grafitt-700",
                )}
              >
                <span className="font-meta text-[9px] tracking-etikett">{d.label}</span>
                <span className="font-display text-[18px] leading-none">{d.date}</span>
                <span className={cn("mt-0.5 size-1 rounded-full", n ? (active ? "bg-white" : "bg-handling") : "bg-transparent")} />
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 py-4 pb-28">
        {layers.skole && !DAYS.find((d) => d.key === day)?.weekend ? (
          <div className="mb-3 rounded-lg bg-sand-150 px-3 py-2 font-meta text-[10px] uppercase tracking-etikett text-grafitt-500">
            Skole 08:00–15:00
          </div>
        ) : null}
        {visible
          .filter((b) => b.day === day)
          .sort((a, b) => toMin(a.start) - toMin(b.start))
          .map((b) => {
            const active = b.id === sel;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSel(b.id);
                  setSheet("insp");
                }}
                className={cn(
                  "mb-2 flex w-full gap-3 rounded-xl border bg-hevet p-3 text-left",
                  active ? "border-grafitt-900" : "border-sand-200",
                  b.accent === "gold" && "bg-[#F7F1DE]",
                )}
              >
                <span className="w-12 shrink-0 font-meta text-[11px] text-grafitt-500">{b.start}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold">{b.title}</span>
                  <span className="block text-[12px] text-grafitt-500">{b.sub}</span>
                </span>
                {b.kind === "turnering" ? (
                  <span className="self-start font-meta text-[9px] uppercase tracking-etikett text-amber-700">Turn</span>
                ) : null}
              </button>
            );
          })}
        <button
          type="button"
          onClick={() => onScreen("oktbygger")}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-sand-400 text-[13px] text-grafitt-600"
        >
          Ny økt denne dagen
        </button>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[64px] items-start border-t border-sand-200 bg-hevet px-2 pt-1 pb-[env(safe-area-inset-bottom)]">
        {(
          [
            ["hjem", "Hjem"],
            ["stall", "Stall"],
            ["workbench", "Uke"],
            ["innboks", "Innboks"],
            ["ko", "Mer"],
          ] as const
        ).map(([id, label]) => {
          const active = id === "workbench";
          return (
            <button
              key={id}
              type="button"
              onClick={() => onScreen(id)}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "font-semibold text-grafitt-900" : "text-grafitt-500",
              )}
            >
              <span className={cn("h-0.5 w-5 rounded-full", active ? "bg-handling" : "bg-transparent")} />
              {label}
            </button>
          );
        })}
      </nav>

      {sheet ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Lukk" className="absolute inset-0 bg-[rgba(20,20,19,.4)]" onClick={() => setSheet(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-auto rounded-t-2xl bg-hevet pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-sand-400" />
            {sheet === "insp" ? (
              <div className="px-5 py-4">
                <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Valgt økt</div>
                <h2 className="m-0 mt-1 font-display text-[26px] font-semibold">{block.title}</h2>
                <p className="m-0 mt-1 text-[13px] text-grafitt-500">
                  {block.start}–{block.end} · {DAYS.find((d) => d.key === block.day)?.label} {DAYS.find((d) => d.key === block.day)?.date}.09
                </p>
                <div className="mt-4 overflow-hidden rounded-lg border border-sand-200">
                  <StatRow k="Plan" v="Publisert" />
                  <StatRow k="Gjennomføring" v="Ikke startet" />
                  <StatRow k="Lagring" v="Lagret på server" last />
                </div>
                <button
                  type="button"
                  onClick={() => onScreen("oktbygger")}
                  className="mt-4 h-12 w-full rounded-lg bg-grafitt-900 text-[15px] font-medium text-white"
                >
                  Åpne økt
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" className="h-11 rounded-lg border border-sand-400 text-[13px]">Endre varighet</button>
                  <button type="button" className="h-11 rounded-lg border border-sand-400 text-[13px]">Endre serie</button>
                </div>
                <div className="mt-5">
                  <div className="mb-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Balanse · uke 38 · 10 t 30</div>
                  {BALANCE.map((row) => (
                    <div key={row.id} className="mb-1.5 flex items-center gap-2">
                      <span className="w-9 font-meta text-[10px] uppercase text-grafitt-500">{row.id}</span>
                      <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-sand-200">
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                      </div>
                      <span className="w-10 text-right font-meta text-[11px]">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kilder</div>
                <div className="mt-3 flex h-11 items-center gap-2 rounded-full border border-sand-300 bg-sand-100 px-3 text-[13px] text-grafitt-500">
                  <span className="flex-1">Søk i kilder</span>
                  <span className="font-meta">169</span>
                </div>
                <div className="mt-4 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kontekst</div>
                {(["okt", "skole", "turnering", "test"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => key !== "okt" && setLayers((l) => ({ ...l, [key]: !l[key] }))}
                    className="flex h-11 w-full items-center justify-between border-b border-sand-200 text-[14px]"
                  >
                    <span className="capitalize">{key === "okt" ? "Økter" : key}</span>
                    <span className="text-grafitt-400">{layers[key] ? "på" : "av"}</span>
                  </button>
                ))}
                <div className="mt-4 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Sett inn</div>
                {PROGRAMS.map((p) => (
                  <div key={p.title} className="mt-2 rounded-lg border border-sand-200 bg-sand-100 px-3 py-2">
                    <div className="text-[13px] font-semibold">{p.title}</div>
                    <div className="text-[11px] text-grafitt-500">{p.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
    </>
  );
}

function RailRow({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex h-8 items-center text-[13px] font-semibold">
      <span className="flex-1">{title}</span>
      <span className="font-meta text-[11px] font-normal text-grafitt-400">{count} ▾</span>
    </div>
  );
}

function StatRow({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={cn("flex h-9 items-center justify-between px-3", !last && "border-b border-sand-200")}>
      <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">{k}</span>
      <span className="text-grafitt-800">{v}</span>
    </div>
  );
}

function NextRow({ title, when }: { title: string; when: string }) {
  return (
    <div className="flex h-7 items-baseline justify-between gap-2 text-[12px]">
      <span className="truncate font-medium">{title}</span>
      <span className="shrink-0 font-meta text-[11px] text-grafitt-400">{when}</span>
    </div>
  );
}
