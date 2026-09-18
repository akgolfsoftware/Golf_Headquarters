import { useState } from "react";
import type { AdminScreenId } from "@/lib/hq/types";
import { cn } from "./ui";

const MONTHS = ["Aug", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul"];

export function ArCanvas() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Sesongstripe · seks lag</div>
          <h2 className="m-0 font-display text-[26px] font-semibold">2026/27</h2>
        </div>
        <div className="flex gap-4 font-meta text-[10px] uppercase tracking-etikett text-grafitt-500">
          <span>Planlagt</span>
          <span>Gjennomført</span>
          <span className="text-handling">Nå · uke 38</span>
        </div>
      </div>
      <div className="grid grid-cols-12 border-b border-sand-200 pb-1">
        {MONTHS.map((m) => (
          <div key={m} className="px-1 font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
            {m}
          </div>
        ))}
      </div>
      <Layer label="Volum + pyramide">
        <Bar from={0} span={4} color="#9B2415" label="SLAG" />
        <Bar from={3} span={4} color="#8A8680" label="SPILL" />
        <Bar from={7} span={3} color="#2B4C7E" label="FYS" />
      </Layer>
      <Layer label="Planlagt / gjennomført">
        <Bar from={0} span={12} color="#E4E0D8" />
        <Bar from={0} span={5.2} color="#141413" label="43 %" />
      </Layer>
      <Layer label="Turnering">
        <DotAt at={1.2} label="Srixon" />
        <DotAt at={4.1} label="NGF" />
        <DotAt at={8.4} label="Order" />
      </Layer>
      <Layer label="Tester">
        <Mark at={2} text="TN Q3" />
        <Mark at={6} text="FYS" />
      </Layer>
      <Layer label="Skole / ferie">
        <Bar from={4.2} span={1.1} color="#EDEAE3" label="Jul" />
        <Bar from={10} span={1.2} color="#EDEAE3" label="Sommer" />
      </Layer>
      <Layer label="Skade / fravær" last>
        <span className="font-meta text-[11px] text-grafitt-400">Ingen registrert</span>
      </Layer>
      <div className="relative -mt-[1px] h-0">
        <div className="absolute top-[-220px] bottom-0 w-px bg-handling" style={{ left: "31%" }}>
          <span className="absolute -top-3 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-handling" />
        </div>
      </div>
    </div>
  );
}

export function PeriodeCanvas() {
  const weeks = ["36", "37", "38", "39", "40", "41", "42", "43"];
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-5">
      <div className="mb-4">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Grunnperiode · uke 36–43</div>
        <h2 className="m-0 font-display text-[26px] font-semibold">Bygg · vedlikehold · turnering</h2>
        <p className="m-0 mt-1 max-w-[52ch] text-[13px] text-grafitt-500">
          Utviklingsuke, vedlikeholdsuke, turneringsuke. Ikke bygg/topp/deload. Uke 38 er turneringsuke — Srixon Tour #4.
        </p>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {weeks.map((w) => {
          const now = w === "38";
          const kind = w === "38" || w === "42" ? "Turnering" : Number(w) % 4 === 0 ? "Vedlikehold" : "Utvikling";
          return (
            <div
              key={w}
              className={cn(
                "rounded-lg border px-2 py-3",
                now ? "border-grafitt-900 bg-sand-100" : "border-sand-200",
              )}
            >
              <div className="font-meta text-[10px] text-grafitt-400">Uke {w}</div>
              <div className="mt-1 font-display text-[18px] font-semibold">{kind}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-200">
                <div className="h-full bg-handling" style={{ width: now ? "62%" : "28%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ManedCanvas({ onWeek }: { onWeek: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">September 2026</div>
          <h2 className="m-0 font-display text-[26px] font-semibold">Fire uker · én tett</h2>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px border border-sand-200 bg-sand-200">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="bg-hevet px-2 py-1 font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
            {d}
          </div>
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const d = i + 1;
          const inWeek = d >= 14 && d <= 20;
          const dense = d === 16 || d === 19;
          return (
            <button
              key={d}
              type="button"
              onClick={onWeek}
              className={cn(
                "min-h-[72px] bg-hevet p-2 text-left",
                inWeek && "bg-sand-100",
                d === 16 && "ring-1 ring-inset ring-grafitt-900",
              )}
            >
              <span className="font-display text-[15px]">{d}</span>
              {dense ? <span className="mt-1 block h-1 w-6 rounded-full bg-handling" /> : null}
              {d === 19 ? <span className="mt-1 block truncate text-[10px] text-amber-700">Srixon</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const OVELSER = [
  { id: "ØV-2105", name: "Chip 30 m til 4 m-sone", dose: "12 forsøk", axis: "CHIP" },
  { id: "ØV-1188", name: "Putting 2,1 m inn", dose: "3 × 8", axis: "PUTT" },
];

export function OktCanvas({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-sand-200 xl:flex">
        <div className="p-3">
          <div className="flex h-9 items-center rounded-full border border-sand-300 bg-sand-100 px-3 text-[12px] text-grafitt-500">
            Søk øvelse · 142
          </div>
        </div>
        <div className="px-4 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Pyramide</div>
        {["Teknikk", "Ferdighet", "Spill", "Fysisk"].map((x) => (
          <button key={x} type="button" className="flex h-9 items-center px-4 text-[13px]">
            {x}
          </button>
        ))}
        <div className="mt-2 border-t border-sand-200 px-4 py-3 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
          Bank
        </div>
        {OVELSER.map((o) => (
          <div key={o.id} className="mx-3 mb-2 rounded-lg border border-sand-200 px-3 py-2">
            <div className="font-meta text-[10px] text-grafitt-400">{o.id}</div>
            <div className="text-[12px] font-semibold">{o.name}</div>
            <div className="text-[11px] text-grafitt-500">{o.dose}</div>
          </div>
        ))}
      </aside>
      <div className="min-w-0 flex-1 overflow-auto px-6 py-5">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Økt · Ons 16.09 · 16:00–17:30</div>
        <h2 className="m-0 font-display text-[28px] font-semibold">Nærspill</h2>
        <p className="m-0 mt-1 text-[13px] text-grafitt-500">Kortbane · Onsøy · automatikk · observert</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[
            ["Pyramide", "Ferdighet"],
            ["Område", "Chip"],
            ["Motor", "Lav hast."],
            ["Belastning", "Treningsomr."],
            ["Press", "Alene"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-sand-200 px-3 py-2">
              <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">{k}</div>
              <div className="text-[13px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="mb-2 font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Øvelser</div>
          {OVELSER.map((o) => (
            <div key={o.id} className="mb-2 flex items-center justify-between rounded-lg border border-sand-200 px-3 py-3">
              <div>
                <div className="text-[14px] font-semibold">{o.name}</div>
                <div className="font-meta text-[11px] text-grafitt-500">
                  {o.id} · {o.dose} · {o.axis}
                </div>
              </div>
              <button type="button" className="text-[12px] text-grafitt-500">
                Dose
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onScreen("ovelsesbibliotek")}
            className="flex h-11 w-full items-center justify-center rounded-lg border border-dashed border-sand-400 text-[13px] text-grafitt-600"
          >
            Legg til øvelse fra bank
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArInspector() {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 bg-hevet lg:flex">
      <div className="px-5 pt-4">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Valgt · årsplan</div>
        <h2 className="m-0 mt-1 font-display text-[24px] font-semibold">Grunnperiode</h2>
        <p className="m-0 mt-1 text-[12px] text-grafitt-500">Uke 36–43 · Nora Berg · H rekrutt</p>
      </div>
      <div className="mx-5 mt-4 overflow-hidden rounded-lg border border-sand-200 text-[12px]">
        <Row k="Plan" v="Skall publisert" />
        <Row k="Økter" v="Tomme til serie" />
        <Row k="Snittscore" v="85 · ikke alder" last />
      </div>
      <p className="m-0 px-5 pt-4 text-[12px] leading-snug text-grafitt-500">
        Jo lavere snittscore, jo tidligere konkurranse. 85 i snitt: mer teknikk vinterstid. Amatør/proff er toggle, ikke aldersregel.
      </p>
    </aside>
  );
}

export function OktInspector({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 bg-hevet lg:flex">
      <div className="px-5 pt-4">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Valgt økt</div>
        <h2 className="m-0 mt-1 font-display text-[24px] font-semibold">Nærspill</h2>
        <p className="m-0 mt-1 text-[12px] text-grafitt-500">2 øvelser · sted først · dose på øvelse</p>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-1 gap-2">
        <button type="button" onClick={() => onScreen("workbench")} className="h-10 rounded-lg bg-grafitt-900 text-[13px] font-medium text-white">
          Lagre økt
        </button>
        <button type="button" onClick={() => onScreen("publiser")} className="h-10 rounded-lg border border-sand-400 text-[13px]">
          Publiser
        </button>
      </div>
    </aside>
  );
}

const PLAYERS = [
  { id: "nb", name: "Nora Berg", h: "H 4,1", items: [{ t: "07:00 Styrke", k: "fys" }, { t: "16:00 Nærspill", k: "okt" }] },
  { id: "ml", name: "Mina Løken", h: "H 8,2", items: [{ t: "10:00 Innspill", k: "okt" }] },
  { id: "jf", name: "Jonas Five", h: "H 12,1", items: [{ t: "12:30 Teknikk", k: "okt" }] },
  { id: "is", name: "Iver Sandnes", h: "H 1,4", items: [{ t: "Ledig", k: "tom" }] },
];

export function StallDagCanvas({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const [sel, setSel] = useState("nb");
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-auto px-5 py-5">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
        {PLAYERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSel(p.id)}
            className={cn("rounded-xl border p-3 text-left", sel === p.id ? "border-grafitt-900" : "border-sand-200")}
          >
            <div className="text-[14px] font-semibold">{p.name}</div>
            <div className="font-meta text-[10px] text-grafitt-400">{p.h}</div>
            {p.items.map((it) => (
              <div
                key={it.t}
                className={cn("mt-2 rounded-lg px-2 py-2 text-[12px]", it.k === "okt" ? "bg-sand-100" : "bg-sand-150 text-grafitt-500")}
              >
                {it.t}
              </div>
            ))}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onScreen("workbench")} className="sr-only">
        uke
      </button>
    </div>
  );
}

export function LiveCanvas({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-auto px-5 py-5">
      <div className="grid w-full gap-3 lg:grid-cols-2">
        <button type="button" onClick={() => onScreen("live-coach")} className="rounded-xl border border-grafitt-900 bg-hevet p-4 text-left">
          <div className="font-meta text-[10px] uppercase tracking-etikett text-rust-500">Pågår</div>
          <div className="font-display text-[22px] font-semibold">Teknikk · Jonas Five</div>
          <div className="text-[13px] text-grafitt-500">Studio 2 · 12:30 · 18 min inne</div>
        </button>
        <button type="button" onClick={() => onScreen("okt-individuell")} className="rounded-xl border border-sand-200 p-4 text-left">
          <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">Ikke startet</div>
          <div className="font-display text-[22px] font-semibold">Nærspill · Nora Berg</div>
          <div className="text-[13px] text-grafitt-500">Kortbane · 16:00</div>
        </button>
      </div>
    </div>
  );
}

function Layer({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 py-2", !last && "border-b border-sand-200")}>
      <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">{label}</span>
      <div className="relative h-8">{children}</div>
    </div>
  );
}

function Bar({ from, span, color, label }: { from: number; span: number; color: string; label?: string }) {
  return (
    <div
      className="absolute top-1.5 h-5 rounded-sm"
      style={{ left: `${(from / 12) * 100}%`, width: `${(span / 12) * 100}%`, background: color }}
    >
      {label ? <span className="px-1 font-meta text-[9px] text-white">{label}</span> : null}
    </div>
  );
}

function DotAt({ at, label }: { at: number; label: string }) {
  return (
    <span className="absolute top-1 text-[10px] font-medium" style={{ left: `${(at / 12) * 100}%` }}>
      <span className="mb-0.5 block size-2 rounded-full bg-amber-600" />
      {label}
    </span>
  );
}

function Mark({ at, text }: { at: number; text: string }) {
  return (
    <span className="absolute top-1.5 rounded bg-sand-200 px-1.5 py-0.5 font-meta text-[10px]" style={{ left: `${(at / 12) * 100}%` }}>
      {text}
    </span>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={cn("flex h-9 items-center justify-between px-3", !last && "border-b border-sand-200")}>
      <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">{k}</span>
      <span>{v}</span>
    </div>
  );
}
