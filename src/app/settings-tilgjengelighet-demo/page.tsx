/**
 * PILOT — Settings · Tilgjengelighet
 * Bygd direkte fra wireframe/design-files-v2/screens/15-settings-tilgjengelighet.html
 * URL: /settings-tilgjengelighet-demo
 *
 * Én produksjonsskjerm: lyst tema, default-preferanser + live preview sticky høyre.
 */

import { Check } from "lucide-react";

export default function SettingsTilgjengelighetDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Innstillinger · Tilgjengelighet
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Slik leser du <em className="font-normal italic">CoachHQ</em> best.
          </h1>
          <p className="mt-3 max-w-[640px] text-[14px] text-muted-foreground">
            Justeringer her gjelder bare for deg. Spillerne dine har sine egne preferanser.
          </p>
        </header>

        <div className="grid grid-cols-[200px_1fr] gap-8">
          <aside>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Innstillinger
            </div>
            <nav className="flex flex-col">
              {[
                { label: "Profil" },
                { label: "Bruker" },
                { label: "Sikkerhet" },
                { label: "Varsler" },
                { label: "API" },
                { label: "Abonnement" },
                { label: "Tilgjengelighet", active: true },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    item.active
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="grid grid-cols-[1fr_280px] items-start gap-6">
            <div className="flex flex-col gap-6">
              {/* Tekst */}
              <Section title="Tekst" aux="Endrer base-størrelsen i hele appen">
                <div className="grid grid-cols-3 gap-3 p-4">
                  <SizeCard size={14} label="Liten" />
                  <SizeCard size={16} label="Standard" active />
                  <SizeCard size={21} label="Stor" sizeLabel="20px" />
                </div>
                <FieldRow
                  label="Linjeavstand"
                  value={
                    <span className="inline-flex items-center gap-2">
                      Komfortabel
                      <span className="font-mono text-[11px] text-muted-foreground">1.5×</span>
                    </span>
                  }
                  action="Endre"
                />
                <ToggleRow label="Dyslexie-vennlig font" hint="OpenDyslexic / Atkinson Hyperlegible" on={false} />
                <ToggleRow label="Fet body-tekst" on={false} />
              </Section>

              {/* Kontrast */}
              <Section title="Kontrast" aux="WCAG-ratios beregnes for valgt par">
                <div className="grid grid-cols-3 gap-3 p-4">
                  <ContrastCard name="Standard" ratio="8,4:1" active variant="std" />
                  <ContrastCard name="Forsterket" ratio="12,1:1" variant="med" />
                  <ContrastCard name="Maks kontrast" ratio="21:1" variant="high" />
                </div>
                <ToggleRow label="Tykkere borders" hint="2px i stedet for 1px på alle kantlinjer" on={false} />
                <ToggleRow label="Underline lenker" hint="Også i tekstavsnitt — alltid" on />
              </Section>

              {/* Bevegelse */}
              <Section title="Bevegelse">
                <FieldRow
                  label="Reduser animasjon"
                  hint="Følger systemnivå: prefers-reduced-motion"
                  value={<span className="text-muted-foreground">Følger system</span>}
                  action="Endre"
                />
                <ToggleRow label="Auto-spill av video" on />
                <ToggleRow label="Parallax + scrubber-effekter" on />
                <ToggleRow label="Skjul fartstøter" hint="Subtile push-effekter på cards og knapper" on={false} />
              </Section>

              {/* Skjermleser */}
              <Section title="Skjermleser og fokus">
                <ToggleRow label="Synlig fokus-ring" hint="3px lime-ring rundt fokusert element" on />
                <ToggleRow label="Hopp-til-innhold-lenker" on />
                <ToggleRow label="Hurtig-kommandoer" hint="⌘K åpner palette med alle handlinger" on />
                <FieldRow
                  label="Annonser oppdateringer"
                  hint="aria-live for live-data og toasts"
                  value={
                    <span className="inline-flex items-center gap-3">
                      Polite
                      <span className="font-mono text-[11px] text-muted-foreground">vs assertive</span>
                    </span>
                  }
                  action="Endre"
                />
              </Section>

              {/* Farger */}
              <Section title="Farger og kart">
                <FieldRow label="Fargeblindhet-filter" value="Av" action="Endre" />
                <ToggleRow
                  label="Ikke bare farge"
                  hint="Pyramide-status vises også med tegn (▲ ◆ ●) — ikke kun grønn/oransje/rød"
                  on
                />
                <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-3.5">
                  <span className="text-[13px] text-muted-foreground">Datavisualisering — palett</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {["#1A7D56", "#B47B1E", "#A32D2D", "#005840", "#0A1F18"].map((c) => (
                        <span
                          key={c}
                          className="h-6 w-6 rounded-sm border border-border"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] text-muted-foreground">Brand · standard</span>
                  </div>
                  <button className="text-[12px] font-medium text-primary hover:underline">Endre →</button>
                </div>
              </Section>

              <div className="flex items-center gap-3 rounded-lg bg-accent/30 px-5 py-3 text-[13px] text-[#0A1F18]">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="flex-1">Alle endringer lagres automatisk for deg</span>
                <button className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
                  Tilbakestill til standard
                </button>
              </div>
            </div>

            {/* Live preview sticky */}
            <aside className="sticky top-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Live preview
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0A1F18]">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Standard
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/40 p-4">
                <div className="font-display text-[18px] font-semibold tracking-tight">Linnea, 16</div>
                <div className="text-[13px] leading-relaxed text-muted-foreground">
                  Hadde en god sesjon i går — pyramide-status grønn på fysisk, gul på mental. Sjekk søvn på onsdag.
                </div>
                <div className="mt-1 flex gap-2">
                  <span className="rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-medium text-[#1A7D56]">
                    ▲ Fysisk
                  </span>
                  <span className="rounded-full bg-[#FFF0D6] px-2 py-0.5 text-[10px] font-medium text-[#B8852A]">
                    ◆ Mental
                  </span>
                </div>
                <button className="mt-2 h-9 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                  Åpne sesjon →
                </button>
              </div>
              <div className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                Det er sånn appen ser ut for deg når du går tilbake til dashbordet.
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-mono text-[10px] text-muted-foreground">
                <span>Body 16px</span>
                <span>Kontrast 8,4:1</span>
                <span className="font-semibold text-[#1A7D56]">AAA</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  aux,
  children,
}: {
  title: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-baseline gap-3 border-b border-border px-6 py-4">
        <h2 className="font-display text-[18px] font-semibold tracking-tight">{title}</h2>
        {aux && <span className="text-[12px] text-muted-foreground">{aux}</span>}
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function SizeCard({
  size,
  label,
  active,
  sizeLabel,
}: {
  size: number;
  label: string;
  active?: boolean;
  sizeLabel?: string;
}) {
  return (
    <div
      className={`flex cursor-pointer flex-col gap-3 rounded-md border-[1.5px] p-4 transition-all ${
        active ? "border-primary shadow-[0_0_0_3px_rgba(0,88,64,0.10)]" : "border-border bg-card"
      }`}
    >
      <div
        className="flex h-16 items-center justify-center rounded-sm bg-secondary/50 font-display text-foreground"
        style={{ fontSize: `${size}px` }}
      >
        Aa Anders
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{sizeLabel ?? `${size}px`}</span>
        {active && (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
}

function ContrastCard({
  name,
  ratio,
  active,
  variant,
}: {
  name: string;
  ratio: string;
  active?: boolean;
  variant: "std" | "med" | "high";
}) {
  const demoStyle =
    variant === "std"
      ? { background: "var(--color-card, #FFFFFF)", color: "#0A1F18" }
      : variant === "med"
        ? { background: "#FFFFFF", color: "#0A1F18" }
        : { background: "#FFFFFF", color: "#000000", borderBottom: "2px solid #000" };
  const btnStyle =
    variant === "std"
      ? "bg-primary text-white"
      : variant === "med"
        ? "text-white"
        : "border-2 border-black bg-black text-white";
  const btnBg = variant === "med" ? { background: "#004030" } : undefined;

  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-md border-[1.5px] ${
        active ? "border-primary shadow-[0_0_0_3px_rgba(0,88,64,0.10)]" : "border-border"
      }`}
    >
      <div className="flex h-24 flex-col justify-between p-3" style={demoStyle}>
        <div className="font-display text-[14px] font-semibold">Sesjon-rapport</div>
        <div className="text-[11px] leading-tight">38 spillere · 12 økter</div>
        <span
          className={`self-start rounded-sm px-2 py-0.5 text-[10px] font-semibold ${btnClass(variant, btnStyle)}`}
          style={btnBg}
        >
          Åpne →
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-3 py-2">
        <span className="text-[12px] font-medium text-foreground">{name}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          <span className="font-semibold text-[#1A7D56]">{ratio}</span> AAA
        </span>
      </div>
    </div>
  );
}

function btnClass(_variant: "std" | "med" | "high", base: string) {
  return base;
}

function FieldRow({
  label,
  hint,
  value,
  action,
}: {
  label: string;
  hint?: string;
  value: React.ReactNode;
  action?: string;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-3.5">
      <div>
        <div className="text-[13px] text-muted-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</div>}
      </div>
      <div className="text-[14px] text-foreground">{value}</div>
      {action && (
        <button className="text-[12px] font-medium text-primary hover:underline">{action} →</button>
      )}
    </div>
  );
}

function ToggleRow({ label, hint, on }: { label: string; hint?: string; on: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-3.5">
      <div>
        <div className="text-[13px] text-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
        aria-pressed={on}
        role="switch"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
    </div>
  );
}
