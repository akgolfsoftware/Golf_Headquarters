import { GOALS, SG, TODAY_PLAYER, WEEK_PLAN } from "@/lib/hq/data";
import { useHq } from "@/lib/hq/store";
import { PORTAL_TABS } from "@/lib/hq/nav";
import type { PortalScreenId } from "@/lib/hq/types";
import { cn } from "./ui";

function tabFor(screen: PortalScreenId): PortalScreenId {
  if (screen === "plan" || screen === "oktoppskrift") return "plan";
  if (screen === "analyse" || screen === "aerlig" || screen === "fremgang") return "analyse";
  if (["i-dag", "live-slag", "live-ovelse", "oppsummering", "live-desktop"].includes(screen)) return "i-dag";
  return "meg";
}

export function PlayerhqFasit({
  screen,
  onScreen,
}: {
  screen: PortalScreenId;
  onScreen: (id: PortalScreenId) => void;
}) {
  const tab = tabFor(screen);
  const live = ["live-slag", "live-ovelse", "live-desktop"].includes(screen);

  return (
    <div data-brand="playerhq" className={cn("min-h-dvh", live ? "bg-grafitt-900 text-sand-100" : "bg-page text-ink")}>
      <div className={cn("mx-auto flex min-h-dvh max-w-lg flex-col", live ? "" : "bg-hevet lg:my-5 lg:max-w-[960px] lg:rounded-[20px] lg:shadow-overlegg")}>
        <header className={cn("flex h-14 items-center gap-2.5 px-4", live ? "border-b border-grafitt-700" : "border-b border-sand-200")}>
          <img src="/ak-golf-logo.svg" alt="" className="h-7 w-8" />
          <span className="font-display text-[14px] font-semibold uppercase tracking-[0.08em]">PlayerHQ</span>
          <span className={cn("ml-auto font-meta text-[10px]", live ? "text-natt-300" : "text-grafitt-400")}>
            Mina Løken · uke 38
          </span>
        </header>
        <main className="min-h-0 flex-1 overflow-auto px-4 py-5 pb-24">
          {screen === "i-dag" ? <IDag onScreen={onScreen} /> : null}
          {screen === "plan" || screen === "oktoppskrift" ? <Plan onScreen={onScreen} /> : null}
          {screen === "analyse" || screen === "fremgang" || screen === "aerlig" ? <Analyse /> : null}
          {screen === "meg" ? <Meg onScreen={onScreen} /> : null}
          {live ? <Live onScreen={onScreen} /> : null}
          {screen === "oppsummering" ? <Sum onScreen={onScreen} /> : null}
          {![
            "i-dag",
            "plan",
            "oktoppskrift",
            "analyse",
            "fremgang",
            "aerlig",
            "meg",
            "live-slag",
            "live-ovelse",
            "live-desktop",
            "oppsummering",
          ].includes(screen) ? (
            <div>
              <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">PlayerHQ</div>
              <h1 className="m-0 font-display text-[26px] font-semibold">{screen}</h1>
              <p className="text-[14px] text-grafitt-500">Samme tokens. Denne ruten arver skallet.</p>
              <button type="button" onClick={() => onScreen("meg")} className="mt-4 h-11 rounded-lg border border-sand-400 px-4">
                Til Meg
              </button>
            </div>
          ) : null}
        </main>
        {live ? null : (
          <nav className="sticky bottom-0 grid h-[64px] grid-cols-4 border-t border-sand-200 bg-hevet pb-[env(safe-area-inset-bottom)]">
            {PORTAL_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onScreen(t.id)}
                className={cn(
                  "flex flex-col items-center justify-center text-[11px]",
                  tab === t.id ? "font-semibold text-grafitt-900" : "text-grafitt-500",
                )}
              >
                <span className={cn("mb-1 h-0.5 w-5 rounded-full", tab === t.id ? "bg-handling" : "bg-transparent")} />
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function IDag({ onScreen }: { onScreen: (id: PortalScreenId) => void }) {
  const status = useHq((s) => s.sessionStatus);
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">I dag · onsdag</div>
      <h1 className="m-0 mt-1 font-display text-[32px] font-semibold">{TODAY_PLAYER.title}</h1>
      <p className="m-0 mt-1 text-[14px] text-grafitt-500">
        {TODAY_PLAYER.time} · {TODAY_PLAYER.place}
      </p>
      <p className="mt-3 text-[15px]">{TODAY_PLAYER.focus}</p>
      <p className="font-meta text-[11px] text-grafitt-400">
        {status === "pagar" ? "Pågår · ikke lagret" : "Planlagt · ikke startet"}
      </p>
      <button
        type="button"
        onClick={() => onScreen("oktoppskrift")}
        className="mt-4 h-12 w-full rounded-lg bg-handling text-[15px] font-semibold text-white"
      >
        Åpne oppskrift
      </button>
      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-seksjon text-grafitt-600">Uken</h2>
      {WEEK_PLAN.map((w) => (
        <button
          key={w.day}
          type="button"
          onClick={() => onScreen("plan")}
          className="flex w-full items-center justify-between border-t border-sand-200 py-3 text-left"
        >
          <span>
            <span className="block text-[14px] font-medium">{w.title}</span>
            <span className="text-[12px] text-grafitt-500">
              {w.day} · {w.time}
            </span>
          </span>
          <span className="font-meta text-[10px] uppercase text-grafitt-400">{w.status}</span>
        </button>
      ))}
    </div>
  );
}

function Plan({ onScreen }: { onScreen: (id: PortalScreenId) => void }) {
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Plan · uke 38</div>
      <h1 className="m-0 font-display text-[28px] font-semibold">Øktoppskrift</h1>
      {TODAY_PLAYER.drills.map((d) => (
        <div key={d.id} className="mt-3 rounded-xl border border-sand-200 px-4 py-3">
          <div className="font-semibold">{d.name}</div>
          <div className="font-meta text-[11px] text-grafitt-500">
            {d.dose} · {d.form}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onScreen("live-slag")} className="mt-5 h-12 w-full rounded-lg bg-grafitt-900 text-[15px] font-medium text-white">
        Start live
      </button>
    </div>
  );
}

function Analyse() {
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Analyse</div>
      <h1 className="m-0 font-display text-[28px] font-semibold">Slag spart</h1>
      <p className="text-[13px] text-grafitt-500">Egne runder. Ukjent er —.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {SG.map((s) => (
          <div key={s.cat} className="rounded-xl border border-sand-200 px-3 py-3">
            <div className="font-meta text-[10px] uppercase text-grafitt-400">{s.cat}</div>
            <div className="font-display text-[24px] font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <h2 className="mt-6 text-[11px] font-semibold uppercase tracking-seksjon">Mål</h2>
      {GOALS.map((g) => (
        <div key={g.id} className="mt-2 rounded-xl border border-sand-200 px-4 py-3">
          <div className="font-semibold">{g.title}</div>
          <div className="font-meta text-[11px] text-grafitt-500">
            {g.start} → {g.now} · mål {g.target} · {g.kind}
          </div>
        </div>
      ))}
    </div>
  );
}

function Meg({ onScreen }: { onScreen: (id: PortalScreenId) => void }) {
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Meg</div>
      <h1 className="m-0 font-display text-[28px] font-semibold">Mina Løken</h1>
      <p className="text-[14px] text-grafitt-500">HCP 8,2 · Onsøy GK · Coach Sofie Aas</p>
      {["mal", "bag", "runder", "varsler", "coachkontakt"].map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onScreen(id as PortalScreenId)}
          className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-sand-200 px-4 capitalize"
        >
          {id.replace("-", " ")}
          <span>›</span>
        </button>
      ))}
    </div>
  );
}

function Live({ onScreen }: { onScreen: (id: PortalScreenId) => void }) {
  const shots = useHq((s) => s.shots);
  const add = useHq((s) => s.addShot);
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-etikett text-sand-400">Live · slag</div>
      <h1 className="m-0 font-display text-[28px] font-semibold text-sand-100">Chip 30 m</h1>
      <p className="text-[13px] text-sand-400">{shots} forsøk · tid settes én gang per forsøk</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["Treff", "Kant", "Bom"] as const).map((l) => (
          <button key={l} type="button" onClick={() => add()} className="h-16 rounded-lg bg-grafitt-800 text-[15px] font-medium">
            {l}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onScreen("oppsummering")} className="mt-6 h-12 w-full rounded-lg bg-sand-100 text-[15px] font-semibold text-grafitt-900">
        Avslutt økt
      </button>
    </div>
  );
}

function Sum({ onScreen }: { onScreen: (id: PortalScreenId) => void }) {
  const shots = useHq((s) => s.shots);
  return (
    <div>
      <div className="font-meta text-[10px] uppercase tracking-merke text-grafitt-400">Oppsummering</div>
      <h1 className="m-0 font-display text-[28px] font-semibold">Økten er ferdig</h1>
      <p className="text-[14px] text-grafitt-500">{shots} forsøk lagret. Ikke delt med coach før du bekrefter.</p>
      <button type="button" onClick={() => onScreen("i-dag")} className="mt-4 h-12 w-full rounded-lg bg-grafitt-900 text-white">
        Til i dag
      </button>
    </div>
  );
}
