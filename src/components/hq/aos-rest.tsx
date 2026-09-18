import { useState } from "react";
import { DRILLS, RUNS, SG, STALL, WEEK_BLOCKS } from "@/lib/hq/data";
import type { AdminScreenId } from "@/lib/hq/types";
import { AgencyosChrome } from "./agencyos-chrome";
import { cn } from "./ui";

export function AosRest({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  if (screen.startsWith("kalender") || screen === "min-uke") {
    return <KalenderFasit screen={screen} onScreen={onScreen} />;
  }
  if (screen.startsWith("okt-") || screen.startsWith("live-") || screen === "oppsummering-coach") {
    return <OktLiveFasit screen={screen} onScreen={onScreen} />;
  }
  if (screen === "stall-analyse") return <AnalyseFasit onScreen={onScreen} />;
  if (screen === "spor" || screen === "spor-detalj") return <SporFasit screen={screen} onScreen={onScreen} />;
  if (screen === "ovelsesbibliotek" || screen === "ovelse" || screen === "program") {
    return <BankFasit screen={screen} onScreen={onScreen} />;
  }
  if (screen === "gruppe" || screen === "planlegge") return <GruppeFasit screen={screen} onScreen={onScreen} />;
  if (screen === "abonnement" || screen === "oppsett") return <OppsettFasit screen={screen} onScreen={onScreen} />;
  if (["publiser-ovelse", "moderering", "versjon", "avpubliser"].includes(screen)) {
    return <PubOvelseFasit screen={screen} onScreen={onScreen} />;
  }
  if (["forslag", "bekreft", "resultat-caddie", "forkast", "trad"].includes(screen)) {
    return <KoDetaljFasit screen={screen} onScreen={onScreen} />;
  }
  return (
    <AgencyosChrome current={screen} path={`/admin/${screen}`} onScreen={onScreen}>
      <div className="p-8">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{screen}</div>
        <h1 className="m-0 mt-2 font-display text-[28px] font-semibold">Ikke tegnet som egen fasit</h1>
        <p className="text-[14px] text-grafitt-500">Skallet er på plass. Innhold kommer når mønsteret er nytt.</p>
      </div>
    </AgencyosChrome>
  );
}

function KalenderFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const view = screen === "kalender-dag" ? "dag" : screen === "kalender-maned" ? "måned" : "uke";
  return (
    <AgencyosChrome current={screen} path={`/admin/kalender/${view}`} onScreen={onScreen}>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-5 py-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kalender · uke 38</div>
            <h1 className="m-0 font-display text-[26px] font-semibold">
              {view === "dag" ? "Onsdag 16.09" : view === "måned" ? "September 2026" : "Man 14 — Søn 20"}
            </h1>
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
                className={cn("h-8 rounded-full px-3 text-[12px]", screen === id ? "bg-grafitt-900 text-white" : "text-grafitt-600")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {view === "uke"
          ? WEEK_BLOCKS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onScreen(b.player.includes("Jonas") ? "okt-individuell" : "okt-gruppe")}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-sand-200 px-4 py-3 text-left"
              >
                <span>
                  <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
                    {b.day} · {b.start}–{b.end} · {b.pub}
                  </span>
                  <span className="block text-[15px] font-semibold">
                    {b.title} · {b.player}
                  </span>
                  <span className="text-[12px] text-grafitt-500">{b.place}</span>
                </span>
                <span className="text-grafitt-400">›</span>
              </button>
            ))
          : null}
        {view === "dag"
          ? WEEK_BLOCKS.filter((b) => b.day === "Ons" || b.day === "Fre").map((b) => (
              <div key={b.id} className="mb-2 rounded-xl border border-sand-200 px-4 py-3">
                <div className="font-meta text-[11px] text-grafitt-400">
                  {b.start}–{b.end}
                </div>
                <div className="font-semibold">{b.title}</div>
              </div>
            ))
          : null}
        {view === "måned" ? (
          <button type="button" onClick={() => onScreen("kalender-uke")} className="rounded-xl border border-sand-200 p-4 text-left">
            Uke 38 er tett. Åpne ukevisning.
          </button>
        ) : null}
      </div>
    </AgencyosChrome>
  );
}

function OktLiveFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const gruppe = screen.includes("gruppe");
  const live = screen.startsWith("live");
  const sum = screen === "oppsummering-coach";
  const oversikt = screen === "live-oversikt";
  return (
    <AgencyosChrome current={screen} path={`/admin/${screen}`} onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
            {oversikt ? "Live-oversikt" : sum ? "Oppsummering" : live ? "Gjennomføring" : "Øktdetalj"}
            {gruppe ? " · gruppe" : " · individuell"}
          </div>
          <h1 className="m-0 mt-1 font-display text-[28px] font-semibold">
            {oversikt ? "Pågående økter" : gruppe ? "Spillsimulering · GFGK 3" : "Teknikk · Jonas Five"}
          </h1>
          <p className="m-0 mt-2 text-[14px] text-grafitt-500">
            {sum
              ? "Økten er ferdig. Ingenting er delt før du bekrefter."
              : live
                ? "To klokker. Aktiv øvelse. Status er en setning."
                : "Studio 2 · 50 min · planlagt · 12:30"}
          </p>
          {oversikt ? (
            <div className="mt-4 flex flex-col gap-2">
              {["Jonas Five · teknikk · pågår", "Mina Løken · nærspill · ikke startet"].map((r) => (
                <button key={r} type="button" onClick={() => onScreen("live-coach")} className="rounded-xl border border-sand-200 px-4 py-3 text-left">
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-sand-200 p-4">
              <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">Fokus</div>
              <p className="m-0 mt-1 text-[15px]">Kontakt og lavpunkt jern 7. Video to vinkler.</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {!live && !sum ? (
              <button type="button" onClick={() => onScreen(gruppe ? "live-gruppe" : "live-coach")} className="h-11 rounded-lg bg-handling px-4 text-[14px] font-semibold text-white">
                Start gjennomføring
              </button>
            ) : null}
            {live ? (
              <button type="button" onClick={() => onScreen("oppsummering-coach")} className="h-11 rounded-lg bg-grafitt-900 px-4 text-[14px] font-medium text-white">
                Avslutt økt
              </button>
            ) : null}
            {sum ? (
              <button type="button" onClick={() => onScreen("kalender-uke")} className="h-11 rounded-lg border border-sand-400 px-4 text-[14px]">
                Til kalender
              </button>
            ) : null}
          </div>
        </main>
      </div>
    </AgencyosChrome>
  );
}

function AnalyseFasit({ onScreen }: { onScreen: (id: AdminScreenId) => void }) {
  return (
    <AgencyosChrome current="stall-analyse" path="/admin/analyse" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Analyse · stallreise</div>
          <h1 className="m-0 font-display text-[28px] font-semibold">Slag spart</h1>
          <p className="text-[13px] text-grafitt-500">Kilde: egne runder. Ukjent vises som — , ikke 0.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SG.map((s) => (
              <div key={s.cat} className="rounded-xl border border-sand-200 px-4 py-3">
                <div className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">{s.cat}</div>
                <div className="font-display text-[26px] font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onScreen("stall")} className="mt-4 h-10 text-[13px] text-grafitt-500">
            Til stall
          </button>
        </main>
      </div>
    </AgencyosChrome>
  );
}

function SporFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const [id, setId] = useState(RUNS[0]!.id);
  const run = RUNS.find((r) => r.id === id) ?? RUNS[0]!;
  return (
    <AgencyosChrome current="spor" path="/admin/agenticos" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">AgenticOS · spor</div>
          <h1 className="m-0 font-display text-[26px] font-semibold">Kjøringer</h1>
          <p className="text-[13px] text-grafitt-500">Ingenting er publisert uten din godkjenning. AgenticOS er ikke egen app.</p>
          {RUNS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setId(r.id);
                onScreen("spor-detalj");
              }}
              className={cn("mb-2 w-full rounded-xl border p-3 text-left", r.id === id ? "border-grafitt-900" : "border-sand-200")}
            >
              <span className="font-meta text-[10px] uppercase tracking-etikett text-grafitt-400">
                {r.id} · {r.state} · startet {r.started}
              </span>
              <span className="block text-[15px] font-semibold">{r.name}</span>
              <span className="text-[12px] text-grafitt-500">{r.wrote ? "Data skrevet" : "Ingen data skrevet"}</span>
            </button>
          ))}
        </main>
        {screen === "spor-detalj" ? (
          <aside className="hidden w-[300px] shrink-0 border-l border-sand-200 p-5 lg:block">
            <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Kjøring</div>
            <h2 className="m-0 mt-1 font-display text-[22px] font-semibold">{run.name}</h2>
            <p className="text-[13px] text-grafitt-500">Forsøkt mot bekreftet. Ukjent vises som ukjent.</p>
            <button type="button" onClick={() => onScreen("ko")} className="mt-4 h-10 w-full rounded-lg bg-grafitt-900 text-[13px] text-white">
              Åpne i godkjenninger
            </button>
          </aside>
        ) : null}
      </div>
    </AgencyosChrome>
  );
}

function BankFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const [id, setId] = useState(DRILLS[0]!.id);
  const d = DRILLS.find((x) => x.id === id) ?? DRILLS[0]!;
  return (
    <AgencyosChrome current="oppsett" path="/admin/ovelsesbank" onScreen={onScreen}>
      <div className="flex min-h-0 min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto px-5 py-5">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Øvelsesbank</div>
          <h1 className="m-0 font-display text-[26px] font-semibold">{screen === "program" ? "Program i økt" : "Søk og pyramide"}</h1>
          {DRILLS.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                setId(row.id);
                onScreen("ovelse");
              }}
              className={cn("mb-2 w-full rounded-xl border p-3 text-left", row.id === id ? "border-grafitt-900" : "border-sand-200")}
            >
              <span className="font-meta text-[10px] text-grafitt-400">{row.id} · {row.pyramid}</span>
              <span className="block font-semibold">{row.name}</span>
            </button>
          ))}
        </main>
        <aside className="hidden w-[300px] shrink-0 border-l border-sand-200 p-5 lg:block">
          <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{d.id}</div>
          <h2 className="m-0 mt-1 font-display text-[22px] font-semibold">{d.name}</h2>
          <p className="text-[13px] text-grafitt-500">
            {d.area} · {d.motor} · belastning {d.load} · press {d.press}
          </p>
          <button type="button" onClick={() => onScreen("oktbygger")} className="mt-4 h-10 w-full rounded-lg bg-grafitt-900 text-[13px] text-white">
            Legg i økt
          </button>
          <button type="button" onClick={() => onScreen("publiser-ovelse")} className="mt-2 h-10 w-full rounded-lg border border-sand-400 text-[13px]">
            Publiser til felles bank
          </button>
        </aside>
      </div>
    </AgencyosChrome>
  );
}

function GruppeFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <AgencyosChrome current="workbench" path="/admin/gruppe" onScreen={onScreen}>
      <div className="px-5 py-5">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">
          {screen === "planlegge" ? "Planlegge" : "Gruppe-gren"}
        </div>
        <h1 className="m-0 font-display text-[26px] font-semibold">GFGK 3</h1>
        <p className="text-[14px] text-grafitt-500">
          Medlemsøkter materialiseres. Lokal spillerendring gir konflikt, ikke stille overskriving.
        </p>
        {STALL.slice(0, 3).map((p) => (
          <div key={p.id} className="mb-2 rounded-xl border border-sand-200 px-4 py-3">
            {p.name} · {p.next}
          </div>
        ))}
        <button type="button" onClick={() => onScreen("workbench")} className="mt-3 h-10 rounded-lg border border-sand-400 px-4 text-[13px]">
          Til uke
        </button>
      </div>
    </AgencyosChrome>
  );
}

function OppsettFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const items: { id: AdminScreenId; t: string; s: string }[] = [
    { id: "ovelsesbibliotek", t: "Øvelsesbank", s: "Søk, pyramide, dose" },
    { id: "abonnement", t: "Abonnement", s: "Oversikt uten Tripletex" },
    { id: "min-uke", t: "Min uke", s: "Privat, lesende" },
  ];
  return (
    <AgencyosChrome current="oppsett" path="/admin/oppsett" onScreen={onScreen}>
      <div className="px-5 py-5">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Oppsett</div>
        <h1 className="m-0 font-display text-[26px] font-semibold">
          {screen === "abonnement" ? "Abonnementsoversikt" : "Flater og bank"}
        </h1>
        {screen === "abonnement" ? (
          <p className="text-[14px] text-grafitt-500">Player HQ 299 kr/mnd. Ingen regnskap her. Økonomi er uavklart (AOS-11).</p>
        ) : (
          items.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => onScreen(i.id)}
              className="mb-2 flex w-full items-center justify-between rounded-xl border border-sand-200 px-4 py-3 text-left"
            >
              <span>
                <span className="block font-semibold">{i.t}</span>
                <span className="text-[12px] text-grafitt-500">{i.s}</span>
              </span>
              <span>›</span>
            </button>
          ))
        )}
      </div>
    </AgencyosChrome>
  );
}

function PubOvelseFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  const title: Record<string, string> = {
    "publiser-ovelse": "Publiser til felles bank",
    moderering: "Moderering",
    versjon: "Versjonering",
    avpubliser: "Avpublisering og eierskap",
  };
  return (
    <AgencyosChrome current="oppsett" path={`/admin/${screen}`} onScreen={onScreen}>
      <div className="px-5 py-5">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{screen}</div>
        <h1 className="m-0 font-display text-[26px] font-semibold">{title[screen]}</h1>
        <p className="text-[14px] text-grafitt-500">Coach kan publisere. Moderering, versjon og eierskap ved avslutning. Ingen spillerdata i malen.</p>
        <button type="button" onClick={() => onScreen("ovelsesbibliotek")} className="mt-4 h-10 rounded-lg bg-grafitt-900 px-4 text-[13px] text-white">
          Tilbake til bank
        </button>
      </div>
    </AgencyosChrome>
  );
}

function KoDetaljFasit({
  screen,
  onScreen,
}: {
  screen: AdminScreenId;
  onScreen: (id: AdminScreenId) => void;
}) {
  return (
    <AgencyosChrome current={screen} path={`/admin/${screen}`} onScreen={onScreen}>
      <div className="mx-auto max-w-[640px] px-5 py-8">
        <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">{screen}</div>
        <h1 className="m-0 font-display text-[26px] font-semibold">
          {screen === "trad" ? "Mina Løken · TR-7101" : "Caddie-utkast · Iver Sandnes"}
        </h1>
        <p className="text-[14px] text-grafitt-500">
          {screen === "resultat-caddie"
            ? "Utført · audit skrevet. Ikke «levert» uten bevis."
            : "Utkast. Ikke sendt. Mennesket bekrefter før mutasjon."}
        </p>
        <div className="mt-4 flex gap-2">
          {screen === "forslag" ? (
            <>
              <button type="button" onClick={() => onScreen("bekreft")} className="h-11 rounded-lg bg-grafitt-900 px-4 text-white">
                Godkjenn
              </button>
              <button type="button" onClick={() => onScreen("forkast")} className="h-11 rounded-lg border border-sand-300 text-handling">
                Forkast
              </button>
            </>
          ) : null}
          {screen === "bekreft" ? (
            <button type="button" onClick={() => onScreen("resultat-caddie")} className="h-11 rounded-lg bg-handling px-4 font-semibold text-white">
              Bekreft sending
            </button>
          ) : null}
          <button type="button" onClick={() => onScreen(screen === "trad" ? "innboks" : "ko")} className="h-11 rounded-lg border border-sand-400 px-4">
            Tilbake
          </button>
        </div>
      </div>
    </AgencyosChrome>
  );
}
