/**
 * PlayerHQ — Min bag & utstyrs-spec
 * Bygd fra wireframe/design-files-v2/screens/56-playerhq-utstyrsbag.html
 * URL: /playerhq-utstyrsbag-demo
 */

import { CircleDot } from "lucide-react";

type Club = { ic: string; name: string; spec: string; dist: string; fitted?: boolean; putter?: boolean };

const clubs: Club[] = [
  { ic: "D", name: "TSR3 driver · 9°", spec: "Ventus Black 6X · 45.25\"", dist: "268 m", fitted: true },
  { ic: "3w", name: "TSR3 fairway · 15°", spec: "Ventus Blue 7X", dist: "238 m", fitted: true },
  { ic: "3h", name: "TSi 3 hybrid · 19°", spec: "Project X HZRDUS 90", dist: "218 m" },
  { ic: "4i", name: "T100 utility 4i", spec: "DG Tour 120 X · std", dist: "200 m", fitted: true },
  { ic: "5i", name: "T100 5i", spec: "DG Tour 120 X · −0.5°", dist: "188 m", fitted: true },
  { ic: "6i", name: "T100 6i", spec: "DG Tour 120 X · −0.5°", dist: "175 m", fitted: true },
  { ic: "7i", name: "T100 7i", spec: "DG Tour 120 X · −0.5°", dist: "162 m", fitted: true },
  { ic: "8i", name: "T100 8i", spec: "DG Tour 120 X · −0.5°", dist: "148 m", fitted: true },
  { ic: "9i", name: "T100 9i", spec: "DG Tour 120 X · −0.5°", dist: "135 m", fitted: true },
  { ic: "P", name: "T100 PW · 46°", spec: "DG Tour 120 X", dist: "120 m", fitted: true },
  { ic: "50", name: "Vokey SM10 · 50° · F", spec: "DG Tour 120 X", dist: "102 m", fitted: true },
  { ic: "54", name: "Vokey SM10 · 54° · S", spec: "DG Tour 120 X", dist: "85 m", fitted: true },
  { ic: "60", name: "Vokey SM10 · 60° · M", spec: "DG Tour 120 X", dist: "62 m", fitted: true },
  { ic: "P", name: "Scotty Cameron Phantom X 5.5", spec: "34\" · standard loft", dist: "—", putter: true },
];

const distanceTable = [
  { name: "Driver · TSR3", sub: "9° · low-spin", carry: "252", total: "268", ball: "82,1 m/s", smash: "1,49", hi: true },
  { name: "3-wood", sub: "15° · stinger-spec", carry: "225", total: "238", ball: "75,4 m/s", smash: "1,46", hi: false },
  { name: "3-hybrid", sub: "19°", carry: "205", total: "218", ball: "71,8 m/s", smash: "1,44", hi: false },
  { name: "7-iron", sub: "", carry: "158", total: "162", ball: "59,2 m/s", smash: "1,40", hi: true },
  { name: "PW", sub: "", carry: "118", total: "120", ball: "52,1 m/s", smash: "1,32", hi: false },
  { name: "54° wedge", sub: "", carry: "85", total: "85", ball: "42,8 m/s", smash: "1,28", hi: false },
];

const otherItems = [
  { t: "Ball — Pro V1x", subs: ["4-lags · sponset av Titleist · 5 esker/mnd"] },
  { t: "Hanske — FootJoy Pure Touch", subs: ["cabretta-skinn · str M · skifter v/12 runder", "Snart bytte (10/12)"], warn: true },
  { t: "Sko — FJ Pro/SLX", subs: ["str 43 EU · spikeless · fitted"] },
  { t: "GPS — Garmin S70", subs: ["siste sync 14.05 09:14"] },
  { t: "Trolly — Big Max IQ", subs: ["e-trolly · sponset · serv 03.04"] },
  { t: "Avstandsmåler — Bushnell Pro X3", subs: ["slope on/off · siste cal 12.03"] },
];

const serviceLog = [
  { t: "Fitting m/ TrackMan", sub: "18.03.26 · GFGK pro shop · re-shaft iron set til DG Tour X" },
  { t: "Bytte grip · alle iron + wedges", sub: "11.03.26 · Bryant Cord · jevn slitasje etter 320 runder" },
  { t: "Loft og lie justering", sub: "11.03.26 · iron 5–9 satt til −0.5° fra std" },
  { t: "Distanse-validering · TrackMan", sub: "08.03.26 · oppdatert PIQ-baseline · 28 svinger snitt" },
  { t: "Bytte putter-grip", sub: "22.02.26 · SuperStroke Flatso 1.0 black" },
  { t: "Forrige fitting (jr-set)", sub: "14.06.25 · oppgradert til voksen-spec" },
];

export default function PlayerHqUtstyrsbagDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Utstyr
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Slik er <em className="italic text-primary">bagen din</em> satt opp.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          14 godkjente køller, alle fitted i mars. Distanse-tabellen oppdateres automatisk fra Live Tapper.
        </p>
      </header>

      <div className="grid grid-cols-[340px_1fr] items-start gap-5">
        {/* Bag visual */}
        <div className="sticky top-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#005840] to-[#0A3C2F] p-6 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
            Bag · sesong 2026
          </div>
          <h3 className="mt-1 font-display text-[18px] font-medium tracking-tight">
            Titleist staffbag — &quot;Markus 2026&quot;
          </h3>
          <p className="mt-2 text-[12px] leading-[1.5] text-white/60">
            14 køller · fitted hos GFGK pro shop · TrackMan-validert. Bryant grip på alle iron og wedges.
          </p>

          <div className="mt-4 flex flex-col gap-1.5">
            {clubs.map((c, i) => (
              <div
                key={i}
                className={`grid grid-cols-[36px_1fr_60px] items-center gap-2 rounded-sm border px-2.5 py-2 text-[12px] ${c.fitted ? "border-accent/30 bg-accent/8" : "border-white/10 bg-white/5"}`}
              >
                <div className={`grid h-9 w-9 place-items-center rounded-sm font-display text-[11px] font-semibold text-accent ${c.putter ? "bg-accent/20" : "bg-white/10"}`}>
                  {c.ic}
                </div>
                <div>
                  <div className="font-medium leading-tight text-white">{c.name}</div>
                  <small className="mt-0.5 block font-mono text-[9px] tracking-[0.04em] text-white/55">{c.spec}</small>
                </div>
                <div className="text-right font-mono text-[11px] font-medium tracking-[0.02em] text-accent">{c.dist}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            <Total v="14" l="Køller" />
            <Total v="+2,4" l="HCP" />
            <Total v="12" l="Fitted" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Panel title="Distanse-tabell · gjennomsnitt fra 28 runder" sub="oppdatert daglig">
            <div className="overflow-hidden rounded-sm border border-border">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-card font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <div className="border-b border-border p-3">Kølle</div>
                <div className="border-b border-border p-3 text-right">Carry</div>
                <div className="border-b border-border p-3 text-right">Total</div>
                <div className="border-b border-border p-3 text-right">Ball-speed</div>
                <div className="border-b border-border p-3 text-right">Smash</div>
              </div>
              {distanceTable.map((r) => (
                <div key={r.name} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-[var(--surface-alt,#F1EEE5)]">
                  <div className="border-b border-border p-3 text-[13px] font-medium">
                    {r.name}
                    {r.sub && <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{r.sub}</small>}
                  </div>
                  <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.carry}</div>
                  <div className={`border-b border-border p-3 text-right font-mono text-[12px] ${r.hi ? "font-semibold text-primary" : ""}`}>
                    {r.total}
                  </div>
                  <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.ball}</div>
                  <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.smash}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Annet utstyr">
            <div className="grid grid-cols-3 gap-2.5">
              {otherItems.map((it) => (
                <div key={it.t} className="flex flex-col gap-1.5 rounded-sm border border-border bg-[var(--surface-alt,#F1EEE5)] p-3.5">
                  <div className="mb-1 grid h-9 w-9 place-items-center rounded-sm border border-border bg-card">
                    <CircleDot size={16} strokeWidth={1.5} />
                  </div>
                  <b className="text-[13px] font-semibold">{it.t}</b>
                  {it.subs.map((s, i) => (
                    <small
                      key={i}
                      className={`font-mono text-[10px] tracking-[0.02em] ${it.warn && i === it.subs.length - 1 ? "font-semibold text-[#B8852A]" : "text-muted-foreground"}`}
                    >
                      {s}
                    </small>
                  ))}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Service-historikk" sub="siste 6 mnd">
            <div className="ml-1.5 flex flex-col gap-0 border-l-2 border-border pl-3.5">
              {serviceLog.map((s) => (
                <div key={s.t} className="relative py-2 pl-3.5 text-[12px]">
                  <span className="absolute -left-[21px] top-[11px] h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                  <b className="font-semibold">{s.t}</b>
                  <small className="mt-0.5 block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{s.sub}</small>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Total({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-sm bg-white/5 p-2 text-center">
      <div className="font-display text-[18px] font-medium tracking-tight text-accent">{v}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-white/55">{l}</div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-5">
      <h3 className="mb-3.5 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
        {title}
        {sub && (
          <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            {sub}
          </small>
        )}
      </h3>
      {children}
    </section>
  );
}
