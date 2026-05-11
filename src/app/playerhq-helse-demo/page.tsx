/**
 * PILOT — PlayerHQ Helse
 * Bygd fra wireframe/design-files-v2/screens/17-playerhq-helse.html
 * URL: /playerhq-helse-demo
 *
 * Mock-data: Markus Roinås Pedersen (PRO, 1 pågående skade — venstre håndledd).
 * Anti-state-katalog: én produksjonsskjerm — Pro-tier, full data, lyst tema.
 */

import { AlertTriangle, Plus } from "lucide-react";

export default function PlayerHQHelseDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        {/* Page-head */}
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Helse
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Hvordan har du det <em className="italic">egentlig?</em>
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-muted-foreground">
            Logg skader, sykdom og daglig restitusjon. Coach Anders ser disse
            dataene.
          </p>
        </header>

        {/* Hero — pågående skade */}
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[#B8852A]/25 bg-[#FFF0D6] p-5">
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-[#B8852A] text-white">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="font-display text-[17px] font-medium italic text-foreground">
              Pågående: Strekk i venstre håndledd
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              Uke 2 av 3 i rehab-protokollen. Begrenset full sving — putting og
              chip OK.
            </div>
            <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span>Rehab-progresjon</span>
              <div className="relative h-1.5 w-[200px] overflow-hidden rounded-full bg-white/60">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#B8852A]"
                  style={{ width: "66%" }}
                />
              </div>
              <span>14 av 21 dager</span>
            </div>
          </div>
          <button className="whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
            Oppdater status →
          </button>
        </div>

        {/* KPI-strip */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Kpi
            label="Pågående skader"
            value="1"
            sub="Strekk · venstre håndledd"
            tone="warn"
          />
          <Kpi
            label="Snitt søvn 7d"
            value="7,4"
            unit="t"
            sub="+0,3 vs forrige uke"
            tone="up"
          />
          <Kpi
            label="Snitt energi 7d"
            value="7,2"
            unit="/10"
            sub="stabilt"
            tone="muted"
          />
          <Kpi
            label="Avlyste økter (helse)"
            value="6"
            sub="av 84 økter YTD"
            tone="muted"
          />
        </div>

        {/* Siste 7 dager */}
        <Section title="Siste 7 dager" aux="Søvn + restitusjon">
          <div className="grid grid-cols-7 gap-2 p-6">
            <DayCard day="Tor" hours="6,8" tone="y" />
            <DayCard day="Fre" hours="7,2" tone="g" />
            <DayCard day="Lør" hours="8,1" tone="g" />
            <DayCard day="Søn" hours="7,5" tone="g" />
            <DayCard day="Man" hours="6,2" tone="r" />
            <DayCard day="Tir" hours="7,8" tone="g" />
            <DayCard day="Ons · i dag" hours="8,4" tone="g" today />
          </div>
        </Section>

        <div className="h-8" />

        {/* Skader */}
        <Section
          title="Skader"
          aux="Sortert nyest først"
          rightAction={
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-3 w-3" strokeWidth={1.5} />
              Logg ny skade
            </button>
          }
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-6 py-3">Dato</th>
                <th className="px-6 py-3">Område</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Varighet</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60 bg-[#FFF0D6]/30">
                <td className="px-6 py-3 font-mono">18. apr 2026</td>
                <td className="px-6 py-3">Venstre håndledd</td>
                <td className="px-6 py-3">Strekk</td>
                <td className="px-6 py-3">
                  <Chip tone="warn">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-destructive" />
                    Pågående
                  </Chip>
                </td>
                <td className="px-6 py-3 text-right font-mono">14 dager</td>
                <td className="px-6 py-3 text-right">
                  <a className="cursor-pointer text-[12px] font-medium text-primary">
                    Detaljer →
                  </a>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-6 py-3 font-mono">22. feb 2026</td>
                <td className="px-6 py-3">Høyre kne</td>
                <td className="px-6 py-3">Smerte (overbelastning)</td>
                <td className="px-6 py-3">
                  <Chip tone="success">Helbredet</Chip>
                </td>
                <td className="px-6 py-3 text-right font-mono">21 dager</td>
                <td className="px-6 py-3 text-right">
                  <a className="cursor-pointer text-[12px] font-medium text-primary">
                    Detaljer →
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-mono">5. nov 2025</td>
                <td className="px-6 py-3">Nedre rygg</td>
                <td className="px-6 py-3">Stivhet</td>
                <td className="px-6 py-3">
                  <Chip tone="success">Helbredet</Chip>
                </td>
                <td className="px-6 py-3 text-right font-mono">7 dager</td>
                <td className="px-6 py-3 text-right">
                  <a className="cursor-pointer text-[12px] font-medium text-primary">
                    Detaljer →
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <div className="h-8" />

        {/* Sykdom */}
        <Section title="Sykdom" aux="Påvirker oppmøte">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-6 py-3">Dato</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Varighet</th>
                <th className="px-6 py-3">Påvirkning på trening</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="px-6 py-3 font-mono">12. mar 2026</td>
                <td className="px-6 py-3">Forkjølelse</td>
                <td className="px-6 py-3 font-mono">4 dager</td>
                <td className="px-6 py-3">
                  <Chip tone="warn">2 økter avlyst</Chip>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-mono">28. jan 2026</td>
                <td className="px-6 py-3">Mage</td>
                <td className="px-6 py-3 font-mono">2 dager</td>
                <td className="px-6 py-3">
                  <Chip tone="muted">Ingen påvirkning</Chip>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <div className="h-8" />

        {/* Daglig logg */}
        <Section
          title="Daglig logg — onsdag"
          aux="Tar 20 sekunder · sendes til coach kl 21:00"
        >
          <div className="flex flex-col">
            <SliderRow
              label="Søvn forrige natt"
              hint="0–12 timer"
              percent={70}
              value="8,4"
              unit="t"
            />
            <SliderRow
              label="Energi nå"
              hint="1 (utslitt) – 10 (topp)"
              percent={80}
              value="8"
              unit="/10"
            />
            <SliderRow
              label="Stivhet / smerte"
              hint="1 (ingen) – 10 (ekstrem)"
              percent={30}
              value="3"
              unit="/10"
              warn
            />
            <SliderRow
              label="Stress"
              hint="Skole, forventninger, søvn"
              percent={40}
              value="4"
              unit="/10"
            />
            <div className="flex flex-col gap-2 border-t border-border/60 px-6 py-4">
              <label className="flex flex-col text-[12px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  Notat
                  <span className="text-[11px] text-muted-foreground/70">
                    Valgfritt — coach leser
                  </span>
                </span>
              </label>
              <textarea
                className="min-h-[64px] resize-y rounded-md border border-input bg-card px-3 py-2.5 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                defaultValue="Håndledd kjennes 80 % — kjørte putting i 45 min uten ubehag."
              />
            </div>
          </div>
        </Section>

        <div className="h-8" />

        {/* Coach-tilgang */}
        <Section title="Coach-tilgang til helsedata" aux="Hva Anders kan se">
          <ToggleRow
            label="Full historikk"
            hint="Alle skader, sykdom og daglige logger"
            on
          />
          <ToggleRow
            label="Kun siste 7 dager"
            hint='Strengere — overstyrer "Full historikk"'
          />
          <ToggleRow
            label="Varsel ved ny skade"
            hint="SMS til coach umiddelbart"
            on
          />
          <ToggleRow label="Del med foreldre (mor)" on />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  aux,
  rightAction,
  children,
}: {
  title: string;
  aux?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[15px] font-semibold text-foreground">
            {title}
          </h2>
          {aux && (
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {aux}
            </span>
          )}
        </div>
        {rightAction}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  tone?: "warn" | "up" | "muted";
}) {
  const subStyle =
    tone === "warn"
      ? "text-[#B8852A]"
      : tone === "up"
        ? "text-[#1A7D56]"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 font-mono text-[28px] font-medium leading-none -tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="ml-0.5 text-[14px] text-muted-foreground/70">
            {unit}
          </span>
        )}
      </div>
      <div className={`mt-2 text-[11px] font-medium ${subStyle}`}>{sub}</div>
    </div>
  );
}

function DayCard({
  day,
  hours,
  tone,
  today = false,
}: {
  day: string;
  hours: string;
  tone: "g" | "y" | "r";
  today?: boolean;
}) {
  const dotColor =
    tone === "g"
      ? "bg-[#1A7D56]"
      : tone === "y"
        ? "bg-[#B8852A]"
        : "bg-destructive";
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 ${
        today
          ? "border-primary bg-primary/8"
          : "border-border bg-card"
      }`}
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.06em] ${
          today ? "font-semibold text-primary" : "text-muted-foreground"
        }`}
      >
        {day}
      </span>
      <span className="font-mono text-[16px] font-medium text-foreground">
        {hours}
        <span className="ml-0.5 text-[10px] text-muted-foreground/70">t</span>
      </span>
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
    </div>
  );
}

function Chip({
  tone = "muted",
  children,
}: {
  tone?: "success" | "warn" | "muted";
  children: React.ReactNode;
}) {
  const style =
    tone === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}
    >
      {children}
    </span>
  );
}

function SliderRow({
  label,
  hint,
  percent,
  value,
  unit,
  warn = false,
}: {
  label: string;
  hint: string;
  percent: number;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_64px] items-center gap-5 border-b border-border/60 px-6 py-4 last:border-b-0">
      <div className="flex flex-col text-[13px] font-medium text-foreground">
        {label}
        <span className="mt-0.5 text-[11px] font-normal text-muted-foreground/70">
          {hint}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-secondary">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${
            warn ? "bg-[#B8852A]" : "bg-primary"
          }`}
          style={{ width: `${percent}%` }}
        />
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow ${
            warn ? "ring-2 ring-[#B8852A]" : "ring-2 ring-primary"
          }`}
          style={{ left: `${percent}%` }}
        />
      </div>
      <span className="text-right font-mono text-[14px] text-foreground">
        {value}
        <span className="ml-0.5 text-[11px] text-muted-foreground/70">
          {unit}
        </span>
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on = false,
}: {
  label: string;
  hint?: string;
  on?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <span className="flex flex-col text-[13px] text-foreground">
        {label}
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </span>
      <Toggle on={on} />
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-secondary"
      }`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-card shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

