/**
 * PILOT — Settings · Bruker
 * Bygd direkte fra wireframe/design-files-v2/screens/12-settings-bruker.html
 * URL: /settings-bruker-demo
 *
 * Én produksjonsskjerm: lyst tema, default-tilstand, read-only oversikt.
 */

import { Check, AlertTriangle } from "lucide-react";

export default function SettingsBrukerDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach HQ · Konto · Innstillinger · Bruker
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Slik vil du ha det. <em className="font-normal italic text-muted-foreground">Bare dine preferanser.</em>
          </h1>
        </header>

        <div className="grid grid-cols-[200px_1fr] gap-8">
          {/* Subnav */}
          <aside>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-3">
              Innstillinger
            </div>
            <nav className="flex flex-col">
              {[
                { label: "Profil" },
                { label: "Bruker", active: true },
                { label: "Sikkerhet" },
                { label: "Varsler" },
                { label: "API", count: 3 },
                { label: "Abonnement" },
                { label: "Tilgjengelighet" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    item.active
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count != null && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Form area */}
          <div className="flex flex-col gap-8">
            {/* Konto */}
            <Section title="Konto" aux="Innlogging og identitet">
              <FieldRow label="Brukernavn" value="anders.k" mono readOnly />
              <FieldRow
                label="E-post"
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono">anders@akgolf.no</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-medium text-[#1A7D56]">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                      Verifisert
                    </span>
                  </span>
                }
                action="Endre"
              />
              <FieldRow
                label="Passord"
                value={
                  <span className="inline-flex items-center gap-3">
                    <span className="font-mono">••••••••••••</span>
                    <span className="text-[12px] text-muted-foreground">Endret 14. mars 2026</span>
                  </span>
                }
                action="Endre"
              />
              <FieldRow
                label="2-faktor"
                value={
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F1EA] px-2.5 py-1 text-[11px] font-medium text-[#1A7D56]">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    Aktiv · SMS
                  </span>
                }
                action="Sikkerhet"
              />
            </Section>

            {/* Lokalisering */}
            <Section title="Lokalisering" aux="Format og språk">
              <FieldRow label="Språk" value="Norsk bokmål" action="Endre" />
              <FieldRow
                label="Tidssone"
                value={
                  <span className="inline-flex items-center gap-3">
                    <span className="font-mono">Europe/Oslo</span>
                    <span className="text-[12px] text-muted-foreground">UTC+1 (sommertid UTC+2)</span>
                  </span>
                }
                action="Endre"
              />
              <FieldRow label="Datoformat" value={<span className="font-mono">14. mai 2026</span>} action="Endre" />
              <FieldRow
                label="Tallformat"
                value={
                  <span className="inline-flex items-center gap-3">
                    <span className="font-mono">1 600,50</span>
                    <span className="text-[12px] text-muted-foreground">Mellomrom + komma (NO)</span>
                  </span>
                }
                action="Endre"
              />
              <FieldRow label="Førstedag i uka" value="Mandag" action="Endre" />
            </Section>

            {/* Preferanser */}
            <Section title="CoachHQ-preferanser" aux="Hvordan appen oppfører seg">
              <FieldRow label="Default-visning ved innlogging" value="Hub" action="Endre" />
              <ToggleRow label="Tett tabellvisning" hint="Mer data per skjerm, mindre luft" on={false} />
              <ToggleRow label="Auto-oppdater data" hint="Hvert 30. sekund" on />
              <ToggleRow label="Kompakt sidebar" on={false} />
              <ToggleRow label="Vis pyramide-fargekoder" on />
            </Section>

            {/* Tema */}
            <Section title="Tema" aux="Live preview">
              <div className="grid grid-cols-3 gap-3 p-4">
                <ThemeCard name="Lyst" active />
                <ThemeCard name="Mørkt" dark />
                <ThemeCard name="Følg system" system />
              </div>
            </Section>

            {/* Farlig sone */}
            <div className="rounded-lg border border-[#A32D2D]/20 bg-[#A32D2D]/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-[#A32D2D]">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                <h3 className="font-display text-[16px] font-semibold">Farlig sone</h3>
              </div>
              <DangerRow
                title="Eksporter alle data (GDPR)"
                desc="Du får en zip med alt. Tar 2–10 minutter."
                cta="Be om eksport"
              />
              <DangerRow
                title="Slett konto"
                desc="Permanent. Spillere må flyttes til ny coach først."
                cta="Slett"
                destructive
              />
            </div>
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

function FieldRow({
  label,
  value,
  action,
  mono,
  readOnly,
}: {
  label: string;
  value: React.ReactNode;
  action?: string;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-3.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={`text-[14px] text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
      {readOnly ? (
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Read-only
        </span>
      ) : action ? (
        <button className="text-[12px] font-medium text-primary hover:underline">{action} →</button>
      ) : null}
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

function ThemeCard({ name, active, dark, system }: { name: string; active?: boolean; dark?: boolean; system?: boolean }) {
  return (
    <div
      className={`flex cursor-pointer flex-col gap-3 rounded-lg border-[1.5px] p-3 transition-all ${
        active ? "border-primary shadow-[0_0_0_3px_rgba(0,88,64,0.10)]" : "border-border bg-card"
      }`}
    >
      <div className="flex h-20 overflow-hidden rounded-sm">
        <div className="flex w-[32%] flex-col gap-1 bg-[#0F2A22] p-2">
          <div className="h-1.5 w-4/5 rounded bg-accent" />
          <div className="h-1.5 w-3/5 rounded bg-white/[0.18]" />
          <div className="h-1.5 w-2/3 rounded bg-white/[0.18]" />
        </div>
        <div
          className="flex flex-1 flex-col gap-1 p-2"
          style={
            system
              ? { background: "linear-gradient(90deg, #FAFAF7 50%, #163027 50%)" }
              : dark
                ? { background: "#163027" }
                : { background: "#FAFAF7" }
          }
        >
          <div className={`h-1.5 w-1/2 rounded ${dark ? "bg-accent" : "bg-primary"}`} />
          <div className={`h-1.5 w-3/5 rounded ${dark ? "bg-[#274d41]" : "bg-border"}`} />
          <div className={`h-1.5 w-2/3 rounded ${dark ? "bg-[#274d41]" : "bg-border"}`} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{name}</span>
        {active && (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
}

function DangerRow({
  title,
  desc,
  cta,
  destructive,
}: {
  title: string;
  desc: string;
  cta: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[#A32D2D]/15 py-3 first:border-t-0">
      <div>
        <div className="text-[13px] font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <button
        className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
          destructive
            ? "border-[#A32D2D]/30 text-[#A32D2D] hover:bg-[#A32D2D]/10"
            : "border-border text-foreground hover:bg-secondary"
        }`}
      >
        {cta} →
      </button>
    </div>
  );
}
