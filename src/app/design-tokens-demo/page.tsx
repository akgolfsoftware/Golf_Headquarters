/**
 * PILOT — Design-tokens viewer
 * Bygd fra wireframe/design-files-v2/screens/24-shared-design-tokens.html
 * URL: /design-tokens-demo
 *
 * Admin-skjerm for designsystem-tokens: farger, type, spacing, radius, shadow.
 */

import { Download } from "lucide-react";

interface ColorToken {
  name: string;
  hex: string;
  role: string;
  light?: boolean;
}

const COLOR_TOKENS: ColorToken[] = [
  { name: "brand.primary", hex: "#005840", role: "Hovedfarge · CTA · accent" },
  { name: "brand.accent", hex: "#D1F843", role: "Sekundær · highlight", light: true },
  { name: "surface.base", hex: "#FAFAF7", role: "Bakgrunn (warm cream)", light: true },
  { name: "surface.card", hex: "#FFFFFF", role: "Kort · paneler", light: true },
  { name: "ink.primary", hex: "#0A1F17", role: "Hovedtekst" },
  { name: "ink.muted", hex: "#5E5C57", role: "Sekundær tekst" },
  { name: "ink.subtle", hex: "#9C9990", role: "Meta · captions", light: true },
  { name: "line.default", hex: "#E5E3DD", role: "Hairline · skiller", light: true },
  { name: "status.success", hex: "#1A7D56", role: "Bekreft · ok" },
  { name: "status.warning", hex: "#B8852A", role: "Advarsel · pending" },
  { name: "status.danger", hex: "#A32D2D", role: "Fare · destructive" },
  { name: "accent.bg.subtle", hex: "#E7F0E9", role: "Aksent-bakgrunn", light: true },
];

const TYPE_TOKENS = [
  { name: "Display XL", desc: "Hero, editorial", value: "48 / 50 · −0,02em", font: "Instrument Serif 400", sample: "Brikker. Ikke verktøy.", italic: true, size: 48 },
  { name: "Display L", desc: "h1", value: "32 / 35 · −0,02em", font: "Instrument Serif 500", sample: "Tokenene. Live-bytte.", italic: false, size: 32 },
  { name: "Heading", desc: "h2", value: "22 / 26 · −0,01em", font: "Instrument Serif 500", sample: "Farger og kontraster", italic: false, size: 22 },
  { name: "Body L", desc: "Stor brødtekst", value: "16 / 25", font: "Geist 400", sample: "Hovedfargen brukes på CTA-er og aktiv state.", italic: false, size: 16 },
  { name: "Body", desc: "p (standard)", value: "14 / 21", font: "Geist 400", sample: "Standard kropp. Brukes i tabeller og kort.", italic: false, size: 14 },
  { name: "Caption", desc: ".caption", value: "11 · +0,04em UC", font: "Geist 600", sample: "META · OPPDATERT NÅ", italic: false, size: 11 },
  { name: "Mono", desc: "Tabulære tall, kode", value: "13 / 19", font: "Geist Mono 400", sample: "player.read.own · 198 / 240", italic: false, size: 13 },
];

const SPACING = [
  { name: "space.4", value: "4px · 0,25rem", w: 4 },
  { name: "space.8", value: "8px · 0,5rem", w: 8 },
  { name: "space.12", value: "12px · 0,75rem", w: 12 },
  { name: "space.16", value: "16px · 1rem", w: 16 },
  { name: "space.24", value: "24px · 1,5rem", w: 24 },
  { name: "space.32", value: "32px · 2rem", w: 32 },
  { name: "space.48", value: "48px · 3rem", w: 48 },
  { name: "space.72", value: "72px · 4,5rem", w: 72 },
];

const RADIUS = [
  { name: "--r-none", value: "0", r: 0 },
  { name: "--r-sm", value: "6px · chips", r: 6 },
  { name: "--r-md", value: "12px · kort", r: 12 },
  { name: "--r-lg", value: "18px · paneler", r: 18 },
  { name: "--r-full", value: "pill · avatar", r: 9999 },
];

const SHADOWS = [
  { name: "--sh-xs", value: "0 1px 2px rgba(ink, .04)", sh: "0 1px 2px rgba(10,31,24,0.04)" },
  { name: "--sh-card", value: "0 4px 12px rgba(ink, .06)", sh: "0 4px 12px rgba(10,31,24,0.06)" },
  { name: "--sh-pop", value: "0 10px 28px rgba(ink, .10)", sh: "0 10px 28px rgba(10,31,24,0.10)" },
  { name: "--sh-modal", value: "0 24px 60px rgba(ink, .30)", sh: "0 24px 60px rgba(10,31,24,0.30)" },
];

export default function DesignTokensDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Admin · Design-tokens · v2.4.1
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Tokenene. <em className="font-normal italic">Plattformens grunnstoff.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            Klikk en token for å kopiere CSS-variabelen. Live forhåndsvisning oppdateres til høyre når du bytter tema eller density.
          </p>
        </header>

        <div className="grid grid-cols-[1fr_320px] items-start gap-6">
          <div className="flex flex-col gap-6">
            {/* Farger */}
            <section>
              <SectionHeader title="Farger" aux="12 tokens · 6 palette" />
              <div className="grid grid-cols-3 gap-3">
                {COLOR_TOKENS.map((c) => (
                  <div key={c.name} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="h-14 px-3 py-2.5 font-mono text-[11px]" style={{ background: c.hex, color: c.light ? "#0A1F17" : "#FFFFFF" }}>
                      --{c.name.replace(/\./g, "-")}
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="text-[12px] font-medium text-foreground">{c.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{c.hex}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Type */}
            <section>
              <SectionHeader title="Type-skala" aux="Instrument Serif · Geist · Geist Mono" />
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="divide-y divide-border">
                  {TYPE_TOKENS.map((t) => (
                    <div key={t.name} className="grid grid-cols-[140px_1fr_160px] items-center gap-4 px-5 py-4">
                      <div>
                        <div className="text-[13px] font-medium text-foreground">{t.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{t.desc}</div>
                      </div>
                      <div
                        className={`text-foreground ${t.font.startsWith("Instrument") ? "font-display" : t.font.startsWith("Geist Mono") ? "font-mono" : ""}`}
                        style={{ fontSize: `${t.size}px`, lineHeight: 1.2, fontStyle: t.italic ? "italic" : "normal" }}
                      >
                        {t.sample}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] font-medium text-foreground">{t.value}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{t.font}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Spacing */}
            <section>
              <SectionHeader title="Spacing" aux="8px-basert · 8 steg" />
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-5">
                {SPACING.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 border-b border-border py-2 last:border-b-0">
                    <div className="h-4 rounded-sm bg-primary" style={{ width: `${s.w}px` }} />
                    <div className="flex-1">
                      <div className="font-mono text-[12px] text-foreground">{s.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Radius + Shadow */}
            <section>
              <SectionHeader title="Radius og shadow" aux="5 radius-steg · 4 shadow-nivå" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Radius</div>
                  <div className="grid grid-cols-5 gap-3">
                    {RADIUS.map((r) => (
                      <div key={r.name} className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 border border-border bg-primary/10" style={{ borderRadius: `${r.r}px` }} />
                        <div className="text-center">
                          <div className="font-mono text-[10px] text-foreground">{r.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{r.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Shadow</div>
                  <div className="grid grid-cols-4 gap-3">
                    {SHADOWS.map((s) => (
                      <div key={s.name} className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-md bg-card" style={{ boxShadow: s.sh }} />
                        <div className="text-center">
                          <div className="font-mono text-[10px] text-foreground">{s.name}</div>
                          <div className="font-mono text-[9px] text-muted-foreground">{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Live preview */}
          <aside className="sticky top-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Live forhåndsvisning
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">v 2.4.1</span>
            </div>

            <div className="flex gap-1 border-b border-border">
              {["Komponenter", "CSS", "JSON"].map((tab, i) => (
                <button
                  key={tab}
                  className={`relative px-3 py-2 text-[12px] font-medium ${
                    i === 0
                      ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <ToggleRow label="Tema" options={["Light", "Dark"]} active={0} />
            <ToggleRow label="Density" options={["Cozy", "Default", "Comp"]} active={1} />
            <ToggleRow label="Scale" options={["×0,9", "×1", "×1,1"]} active={1} />

            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">Booking-kort</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Komp. M</span>
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground">
                  Tirsdag 12. mai · 14:00 — privat time med Sara.
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">Bekreft</button>
                  <button className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">Avlys</button>
                </div>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[13px] italic text-foreground">Plan-status</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#B8852A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B8852A]" />
                    Pending
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Ukens fokus</span>
                  <span className="font-mono tabular-nums text-foreground">62 %</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: "62%" }} />
                </div>
              </div>
            </div>

            <div className="mt-2 border-t border-border pt-3">
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Eksporter tokens</h4>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: "tokens.css", size: "4,2 kB" },
                  { name: "tokens.json", size: "6,8 kB" },
                  { name: "tailwind.config.ts", size: "2,1 kB" },
                  { name: "Figma · ak-tokens.json", size: "11 kB" },
                ].map((e) => (
                  <button
                    key={e.name}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left hover:bg-secondary/50"
                  >
                    <span className="font-mono text-[11px] text-foreground">{e.name}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Download className="h-3 w-3" strokeWidth={1.5} />
                      {e.size}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, aux }: { title: string; aux: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <h2 className="font-display text-[20px] font-semibold tracking-tight">{title}</h2>
      <span className="font-mono text-[11px] text-muted-foreground">{aux}</span>
    </div>
  );
}

function ToggleRow({ label, options, active }: { label: string; options: string[]; active: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-border">
        {options.map((opt, i) => (
          <button
            key={opt}
            className={`border-l border-border px-2.5 py-1 text-[11px] font-medium first:border-l-0 ${
              i === active ? "bg-secondary text-foreground" : "bg-card text-muted-foreground hover:bg-secondary/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
