import { useState } from "react";
import type { AdminScreenId } from "@/lib/hq/types";
import { AgencyosChrome } from "./agencyos-chrome";
import { cn } from "./ui";

const DAYS = [
  { key: "man", label: "MAN", date: 14 },
  { key: "tir", label: "TIR", date: 15 },
  { key: "ons", label: "ONS", date: 16 },
  { key: "tor", label: "TOR", date: 17 },
  { key: "fre", label: "FRE", date: 18 },
  { key: "lor", label: "LØR", date: 19, weekend: true },
  { key: "son", label: "SØN", date: 20, weekend: true },
];
const HOURS = Array.from({ length: 14 }, (_, i) => 7 + i);
const H = 44;

const BLOCKS = [
  { id: "j-tek", day: "fre", start: 12.5, end: 13.35, title: "Teknikk", who: "Jonas Five", place: "Studio 2", tone: "okt", collide: true },
  { id: "n-naer", day: "ons", start: 16, end: 17.5, title: "Nærspill", who: "Nora Berg", place: "Kortbane", tone: "okt", collide: false },
  { id: "m-styrke", day: "fre", start: 7, end: 8, title: "Styrke", who: "Mina Løken", place: "Fys", tone: "okt", collide: false },
  { id: "g-spill", day: "fre", start: 15, end: 16, title: "Spillsimulering", who: "GFGK 3", place: "Bane", tone: "gruppe", collide: false },
  { id: "srixon", day: "lor", start: 8, end: 16, title: "Srixon Tour #4", who: "Turnering", place: "Onsøy", tone: "turnering", collide: false },
];

export function KalenderFasit({
  onScreen,
  screen = "kalender-uke",
}: {
  onScreen: (id: AdminScreenId) => void;
  screen?: AdminScreenId;
}) {
  const [sel, setSel] = useState("j-tek");
  const [layers, setLayers] = useState({ mine: true, grupper: true, skole: true, turnering: true });
  const b = BLOCKS.find((x) => x.id === sel) ?? BLOCKS[0]!;
  const view = screen === "kalender-dag" ? "dag" : screen === "kalender-maned" ? "måned" : "uke";

  return (
    <AgencyosChrome current={screen} path="/admin/kalender/uke/2026-38" onScreen={onScreen}>
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-sand-200 px-4">
        <div>
          <div className="text-[12px] font-semibold">Uke 38</div>
          <div className="font-meta text-[10px] text-grafitt-500">Sofie Aas · egen kalender</div>
        </div>
        <div className="flex rounded-full border border-sand-300 p-0.5">
          {([
            ["kalender-dag", "Dag"],
            ["kalender-uke", "Uke"],
            ["kalender-maned", "Måned"],
          ] as const).map(([id, l]) => (
            <button
              key={id}
              type="button"
              onClick={() => onScreen(id)}
              className={cn("h-7 rounded-full px-3 text-[12px]", screen === id || (id === "kalender-uke" && view === "uke" && screen === "min-uke") ? "bg-grafitt-900 text-white" : "text-grafitt-600")}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {(
            [
              ["mine", "Mine økter"],
              ["grupper", "Grupper"],
              ["skole", "Skole"],
              ["turnering", "Turnering"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setLayers((s) => ({ ...s, [k]: !s[k] }))}
              className={cn("h-7 rounded-full border px-2.5 text-[11px]", layers[k] ? "border-grafitt-900" : "border-sand-300 text-grafitt-400")}
            >
              {l}
            </button>
          ))}
          <button type="button" onClick={() => onScreen("oktbygger")} className="h-8 rounded-lg border border-sand-400 px-3 text-[12px]">
            Ny økt
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto">
          <div className="sticky top-0 z-10 grid grid-cols-[48px_repeat(7,minmax(0,1fr))] border-b border-sand-200 bg-hevet">
            <div />
            {DAYS.map((d) => (
              <div key={d.key} className={cn("px-2 py-2", d.weekend && "bg-sand-150")}>
                <div className="font-meta text-[10px] text-grafitt-400">{d.label}</div>
                <div className="font-display text-[18px] font-semibold">{d.date}</div>
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[48px_repeat(7,minmax(0,1fr))]">
            <div>
              {HOURS.map((h) => (
                <div key={h} className="border-b border-sand-200 px-1 font-meta text-[10px] text-grafitt-400" style={{ height: H }}>
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {DAYS.map((d) => (
              <div key={d.key} className={cn("relative border-l border-sand-200", d.weekend && "bg-sand-150/40")}>
                {layers.skole && !d.weekend ? (
                  <div className="absolute inset-x-0 bg-[#E8E0D2]/70" style={{ top: H, height: H * 7 }} />
                ) : null}
                {HOURS.map((h) => (
                  <div key={h} className="border-b border-sand-200" style={{ height: H }} />
                ))}
                {BLOCKS.filter((x) => x.day === d.key).map((x) => {
                  if (x.tone === "gruppe" && !layers.grupper) return null;
                  if (x.tone === "turnering" && !layers.turnering) return null;
                  if (x.tone === "okt" && !layers.mine) return null;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => {
                        setSel(x.id);
                        if (x.collide) onScreen("okt-individuell");
                      }}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md border px-1.5 py-1 text-left",
                        x.tone === "turnering" && "border-amber-600 bg-amber-50",
                        x.tone === "gruppe" && "border-sand-400 bg-sand-100",
                        x.tone === "okt" && !x.collide && "border-sand-400 bg-hevet",
                        x.collide && "border-handling bg-rust-100",
                        x.id === sel && "ring-1 ring-grafitt-900",
                      )}
                      style={{ top: (x.start - 7) * H + 2, height: (x.end - x.start) * H - 4 }}
                    >
                      <span className="block truncate text-[11px] font-semibold">{x.title}</span>
                      <span className="block truncate font-meta text-[9px] text-grafitt-500">{x.who}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 lg:flex">
          <div className="px-5 pt-4">
            <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
              {b.collide ? "Kollisjon" : "Valgt økt"}
            </div>
            <h2 className="m-0 mt-1 font-display text-[22px] font-semibold">{b.title}</h2>
            <p className="m-0 text-[12px] text-grafitt-500">
              {b.who} · {b.place}
            </p>
          </div>
          {b.collide ? (
            <p className="mx-5 mt-3 rounded-lg bg-rust-100 px-3 py-2 text-[12px] text-handling">
              Teknikk 12:30 overlapper en annen blokk. Flytt eller kort varighet. Overlapp stopper ikke lagring.
            </p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2 px-5">
            <button type="button" onClick={() => onScreen("okt-individuell")} className="h-10 rounded-lg bg-grafitt-900 text-[13px] text-white">
              Åpne økt
            </button>
            <button type="button" onClick={() => onScreen("workbench")} className="h-10 rounded-lg border border-sand-400 text-[13px]">
              Åpne i workbench
            </button>
          </div>
        </aside>
      </div>
    </AgencyosChrome>
  );
}
