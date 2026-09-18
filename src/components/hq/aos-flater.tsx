import { useState } from "react";
import { CADDIE_QUEUE, STALL, THREADS } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import type { AdminScreenId } from "@/lib/hq/types";
import { AgencyosChrome } from "./agencyos-chrome";
import { cn } from "./ui";

export function StallFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const [id, setId] = useState("nora-berg");
  const p = STALL.find((x) => x.id === id) ?? STALL[0]!;
  return (
    <AgencyosChrome current="stall" path="/admin/stall" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Stall · 5 spillere</div>
              <h1 className="m-0 font-display text-[28px] font-semibold">Oppfølging</h1>
            </div>
            <button type="button" onClick={() => onScreen("stall-dag")} className="h-10 rounded-lg border border-sand-400 px-3 text-[13px]">
              I dag
            </button>
          </div>
          {STALL.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setId(row.id)}
              className={cn(
                "mb-2 flex w-full items-center gap-3 rounded-xl border bg-hevet p-3 text-left",
                row.id === id ? "border-grafitt-900" : "border-sand-200",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-sand-200 text-[11px] font-semibold">
                {row.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{row.name}</span>
                <span className="block text-[12px] text-grafitt-500">HCP {row.hcp} · {row.next}</span>
              </span>
              {row.flag ? <span className="max-w-[40%] text-right font-meta text-[10px] uppercase tracking-etikett text-amber-700">{row.flag}</span> : null}
            </button>
          ))}
        </main>
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-sand-200 p-5 lg:flex">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Spillerkort</div>
          <h2 className="m-0 mt-1 font-display text-[24px] font-semibold">{p.name}</h2>
          <p className="m-0 mt-1 text-[12px] text-grafitt-500">HCP {p.hcp} · {p.next}</p>
          {p.flag ? <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-[12px] text-amber-700">{p.flag}</p> : null}
          <div className="mt-4 grid grid-cols-1 gap-2">
            <button type="button" onClick={() => onScreen("workbench")} className="h-10 rounded-lg bg-grafitt-900 text-[13px] font-medium text-white">
              Åpne workbench
            </button>
            <button type="button" onClick={() => onScreen("innboks")} className="h-10 rounded-lg border border-sand-400 text-[13px]">
              Skriv til spiller
            </button>
          </div>
        </aside>
      </div>
    </AgencyosChrome>
  );
}

export function StallDagFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const cols = [
    { name: "Nora Berg", items: ["07:00 Styrke", "16:00 Nærspill"] },
    { name: "Mina Løken", items: ["10:00 Innspill", "—"] },
    { name: "Jonas Five", items: ["12:30 Teknikk"] },
    { name: "Iver Sandnes", items: ["Ledig"] },
  ];
  return (
    <AgencyosChrome current="stall" path="/admin/stall/dag/2026-09-16" onScreen={onScreen}>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-5 py-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Stall-dag</div>
            <h1 className="m-0 font-display text-[26px] font-semibold">Onsdag 16.09</h1>
          </div>
          <button type="button" onClick={() => onScreen("stall")} className="h-10 rounded-lg border border-sand-400 px-3 text-[13px]">
            Alle spillere
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cols.map((c) => (
            <div key={c.name} className="rounded-xl border border-sand-200 p-3">
              <div className="text-[14px] font-semibold">{c.name}</div>
              {c.items.map((it) => (
                <button
                  key={it}
                  type="button"
                  onClick={() => onScreen("workbench")}
                  className="mt-2 block w-full rounded-lg bg-sand-100 px-2 py-2 text-left text-[12px]"
                >
                  {it}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AgencyosChrome>
  );
}

export function InnboksFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const [filter, setFilter] = useState("alle");
  const [sel, setSel] = useState(THREADS[0]!.id);
  const rows = THREADS.filter((t) => filter === "alle" || t.kind.toLowerCase() === filter);
  const t = THREADS.find((x) => x.id === sel) ?? THREADS[0]!;
  return (
    <AgencyosChrome current="innboks" path="/admin/innboks" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Innboks</div>
          <h1 className="m-0 mb-3 font-display text-[26px] font-semibold">Tre trådtyper</h1>
          <div className="mb-4 flex gap-2">
            {["alle", "spiller", "foresatt", "system"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn("h-8 rounded-full px-3 text-[12px] capitalize", filter === f ? "bg-grafitt-900 text-white" : "border border-sand-300")}
              >
                {f}
              </button>
            ))}
          </div>
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSel(row.id)}
              className={cn(
                "mb-2 flex w-full flex-col rounded-xl border p-3 text-left",
                row.id === sel ? "border-grafitt-900" : "border-sand-200",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
                  {row.kind}
                  {row.unread ? " · ulest" : ""}
                </span>
                <span className="font-meta text-[11px] text-grafitt-400">{row.time}</span>
              </span>
              <span className="text-[15px] font-semibold">{row.from}</span>
              <span className="text-[13px] text-grafitt-500">{row.preview}</span>
            </button>
          ))}
        </main>
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-sand-200 p-5 lg:flex">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{t.id} · låst mottaker</div>
          <h2 className="m-0 mt-1 font-display text-[22px] font-semibold">{t.from}</h2>
          <p className="mt-3 rounded-lg bg-sand-100 p-3 text-[14px]">{t.preview}</p>
          <p className="text-[12px] text-grafitt-400">Sendt · levert til kø. Ikke «levert til spiller» uten bevis.</p>
          <textarea className="mt-4 min-h-24 w-full rounded-lg border border-sand-300 p-3 text-[14px]" placeholder="Svar…" />
          <button type="button" className="mt-2 h-11 rounded-lg bg-grafitt-900 text-[14px] font-medium text-white">
            Send
          </button>
        </aside>
      </div>
    </AgencyosChrome>
  );
}

export function KoFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const caddie = useHq((s) => s.caddie);
  const set = useHq((s) => s.setCaddie);
  const [sel, setSel] = useState(CADDIE_QUEUE[0]!.id);
  const row = CADDIE_QUEUE.find((x) => x.id === sel) ?? CADDIE_QUEUE[0]!;
  const st = caddie[row.id] ?? "venter";
  return (
    <AgencyosChrome current="ko" path="/admin/godkjenninger" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Godkjenninger</div>
          <h1 className="m-0 mb-4 font-display text-[26px] font-semibold">Caddie-utkast</h1>
          {CADDIE_QUEUE.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSel(r.id)}
              className={cn(
                "mb-2 w-full rounded-xl border p-3 text-left",
                r.id === sel ? "border-grafitt-900" : "border-sand-200",
              )}
            >
              <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
                {r.id} · {caddie[r.id] ?? "venter"}
              </span>
              <span className="mt-0.5 block text-[15px] font-semibold">{r.title}</span>
              <span className="block text-[12px] text-grafitt-500">{r.sub}</span>
            </button>
          ))}
        </main>
        <aside className="hidden w-[320px] shrink-0 flex-col border-l border-sand-200 p-5 lg:flex">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{row.id}</div>
          <h2 className="m-0 mt-1 font-display text-[22px] font-semibold">{row.title}</h2>
          <p className="mt-3 text-[13px] text-grafitt-600">
            Utkast fra AI. Ikke sendt. «Levert» finnes ikke. Utførelse skjer først etter bekreftelse.
          </p>
          <p className="font-meta text-[11px] uppercase tracking-etikett text-amber-700">{st}</p>
          {st === "utfort" ? (
            <p className="text-[13px]">Utført · audit skrevet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => set(row.id, "utfort")}
                className="h-11 rounded-lg bg-grafitt-900 text-[14px] font-medium text-white"
              >
                Bekreft sending
              </button>
              <button type="button" onClick={() => set(row.id, "forkastet")} className="h-11 rounded-lg border border-sand-300 text-[13px] text-handling">
                Forkast
              </button>
            </div>
          )}
        </aside>
      </div>
    </AgencyosChrome>
  );
}

export function PubliserFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  const plan = useHq((s) => s.publishPlan);
  const exec = useHq((s) => s.publishExec);
  const save = useHq((s) => s.publishSave);
  const setPublish = useHq((s) => s.setPublish);
  return (
    <AgencyosChrome current="workbench" path="/admin/workbench/publiser" onScreen={onScreen}>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-5 py-8">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Publiser uke 38 · Nora Berg</div>
        <h1 className="m-0 font-display text-[28px] font-semibold">Tre statuser, ikke én grønn</h1>
        <p className="m-0 text-[14px] text-grafitt-500">Plan, gjennomføring og lagring er separate. Overlapp gir advarsel, ikke auto-stopp.</p>
        <section className="rounded-xl border border-sand-200 p-4">
          <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">Plan</div>
          <p className="m-0 mt-1 text-[15px] font-medium">{plan ? "Plan synlig for spiller" : "Utkast · ikke synlig"}</p>
          <button type="button" onClick={() => setPublish("plan", !plan)} className="mt-3 h-10 rounded-lg border border-sand-400 px-4 text-[13px]">
            {plan ? "Trekk plan" : "Publiser plan"}
          </button>
        </section>
        <section className="rounded-xl border border-sand-200 p-4">
          <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">Gjennomføring</div>
          <p className="m-0 mt-1 text-[15px] font-medium">{exec ? "Åpen for live" : "Ikke åpnet"}</p>
          <button type="button" onClick={() => setPublish("exec", !exec)} className="mt-3 h-10 rounded-lg border border-sand-400 px-4 text-[13px]">
            Åpne gjennomføring
          </button>
        </section>
        <section className="rounded-xl border border-sand-200 p-4">
          <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">Lagring</div>
          <p className="m-0 mt-1 text-[15px] font-medium">
            {save === "idle" ? "Ikke bekreftet" : save === "ukjent" ? "Sendt · ukjent utfall · Kontroller" : save}
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setPublish("save", "lagret")} className="h-10 rounded-lg bg-handling px-4 text-[13px] font-semibold text-white">
              Publiser 3
            </button>
            <button type="button" onClick={() => setPublish("save", "ukjent")} className="h-10 rounded-lg border border-sand-400 px-4 text-[13px]">
              Simuler ukjent
            </button>
          </div>
        </section>
        <button type="button" onClick={() => onScreen("workbench")} className="h-10 text-[13px] text-grafitt-500">
          Tilbake til uke
        </button>
      </div>
    </AgencyosChrome>
  );
}
