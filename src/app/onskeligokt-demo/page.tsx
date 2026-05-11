/**
 * PILOT — PlayerHQ Be om økt med Anders
 * Bygd direkte fra wireframe/design-files-v2/playerhq-C/07-onskeligokt.html
 * URL: /onskeligokt-demo
 *
 * Mock-data for Markus Roinaas Pedersen. Coach: Anders Kristiansen.
 */

import { Plus, Send } from "lucide-react";

export default function OnskeligOktDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[820px] px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              /min/onskeligokt
            </span>
            <h1 className="mt-2 font-display text-[40px] font-normal italic leading-[1.05] -tracking-[0.02em]">
              «Be om økt med{" "}
              <em className="font-normal italic text-primary">Anders</em>»
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Anders svarer typisk innen 4 timer på hverdager.
            </p>
          </div>
          <CoachPill />
        </header>

        <div className="flex flex-col gap-6">
          {/* 01 TYPE */}
          <FormSection num="01 · TYPE" title="Hva slags økt?">
            <div className="flex flex-col gap-2">
              <RadioCard
                title="1:1 Coaching"
                tag="60 min"
                sub="Standard 1:1 — Anders observerer, gir feedback, dere jobber sammen."
                selected
              />
              <RadioCard
                title="Mini-økt"
                tag="30 min"
                sub="Fokus på ett spesifikt tema — typisk fra forrige runde eller test."
              />
              <RadioCard
                title="Range-besøk sammen"
                tag="90 min"
                sub="Anders kommer til rangen — fri form, ofte for å sette opp ukens fokus."
              />
              <RadioCard
                title="Spille runde sammen"
                tag="Elite · 4 t"
                tagTone="warning"
                sub="9 eller 18 hull. Anders går med — observerer beslutningstaking og rutiner."
                locked
              />
            </div>
          </FormSection>

          {/* 02 TEMA */}
          <FormSection
            num="02 · TEMA"
            title="Hva vil du jobbe med?"
            help="Velg én eller flere. Anders bruker dette til å forberede."
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: "TEK", tier: "tek" as const },
                { label: "SLAG", tier: "slag" as const, active: true },
                { label: "SPILL", tier: "spill" as const, active: true },
                { label: "PUTT" },
                { label: "FYS", tier: "fys" as const },
                { label: "Mental" },
                { label: "Turneringsforberedelse" },
                { label: "Annet" },
              ].map((c) => (
                <Chip key={c.label} tier={c.tier} active={c.active}>
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Mer detalj (valgfritt)
              </label>
              <textarea
                className="w-full min-h-[96px] rounded-md border border-input bg-card px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Beskriv mer hvis du vil … (eks. 'Jeg sliter med høyre-misser fra 100 m på Bossum sist')"
                defaultValue="Jeg sliter med høyre-misser fra 100 m – ble veldig tydelig på Bossum sist lørdag. Vil gjerne se på set-up og vektoverføring."
              />
            </div>
          </FormSection>

          {/* 03 TID */}
          <FormSection
            num="03 · TID"
            title="Når passer det best?"
            help="Foreslå opp til 3 alternativer — eller velg «Helt fleksibel»."
          >
            <div className="flex flex-col gap-2.5">
              <TimeRow num="01" date="Ons 13. mai 2026" time="14:00" showLabels />
              <TimeRow num="02" date="Tor 14. mai 2026" time="10:00" />
              <button className="mt-1 inline-flex items-center gap-1.5 self-start rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Plus className="h-4 w-4" />
                Legg til alternativ (1 igjen)
              </button>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[13px] text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
              />
              Helt fleksibel — Anders foreslår tid
            </label>
          </FormSection>

          {/* 04 FASILITET */}
          <FormSection num="04 · FASILITET" title="Hvor?">
            <div className="flex flex-col gap-2">
              <RadioCard
                title="Mulligan Studio"
                titleSuffix="— din vanlige"
                sub="TrackMan + video. 800 kr/time delt."
                selected
              />
              <RadioCard title="GFGK Range" sub="Utendørs. Gratis for medlem." />
              <RadioCard title="Bossum Golfklubb" sub="Range + korthold. 200 kr." />
              <RadioCard
                title="Du velger"
                sub="Anders foreslår basert på fokus."
              />
              <RadioCard
                title="Online video-økt"
                sub="Du sender klipp, Anders gjennomgår live på 30 min."
              />
            </div>
          </FormSection>

          {/* 05 MELDING */}
          <FormSection num="05 · MELDING" title="Noe Anders bør vite? (valgfritt)">
            <textarea
              className="w-full min-h-[96px] rounded-md border border-input bg-card px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Skriv en kort melding hvis du vil … "
            />
            <div className="mt-1 flex justify-end font-mono text-[11px] text-muted-foreground">
              0 / 500
            </div>
          </FormSection>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-6">
            <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Avbryt
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
              Send forespørsel
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachPill() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#3A5BB0] text-[11px] font-semibold text-white">
        AK
      </div>
      <div className="text-[12.5px] leading-tight">
        <div className="font-semibold">Anders K.</div>
        <div className="text-[11px] text-muted-foreground">Hovedcoach</div>
      </div>
      <span className="h-2 w-2 rounded-full bg-[#1A7D56]" aria-label="Online" />
      <span className="text-[11px] font-semibold text-[#1A7D56]">Online</span>
    </div>
  );
}

function FormSection({
  num,
  title,
  help,
  children,
}: {
  num: string;
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {num}
        </div>
        <h2 className="mt-1 font-display text-[18px] font-semibold leading-snug">
          {title}
        </h2>
        {help && (
          <p className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground">
            {help}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function RadioCard({
  title,
  titleSuffix,
  tag,
  tagTone,
  sub,
  selected,
  locked,
}: {
  title: string;
  titleSuffix?: string;
  tag?: string;
  tagTone?: "warning";
  sub: string;
  selected?: boolean;
  locked?: boolean;
}) {
  const tagStyle =
    tagTone === "warning"
      ? "bg-[rgba(244,196,48,0.20)] text-[#7A5800]"
      : "bg-secondary text-muted-foreground";
  return (
    <button
      type="button"
      className={`flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 ${
        selected ? "border-primary ring-2 ring-primary/15" : "border-border"
      } ${locked ? "opacity-70" : ""}`}
    >
      <span
        className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[14px] font-semibold">
            {title}
            {titleSuffix && (
              <span className="ml-1.5 text-[12.5px] font-normal text-muted-foreground">
                {titleSuffix}
              </span>
            )}
          </div>
          {tag && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold ${tagStyle}`}
            >
              {tag}
            </span>
          )}
        </div>
        <div className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground">
          {sub}
        </div>
      </div>
    </button>
  );
}

function Chip({
  children,
  tier,
  active,
}: {
  children: React.ReactNode;
  tier?: "fys" | "tek" | "slag" | "spill" | "turn";
  active?: boolean;
}) {
  const tierMap: Record<NonNullable<typeof tier>, string> = {
    fys: "border-[var(--color-pyr-fys)] text-[var(--color-pyr-fys)]",
    tek: "border-[var(--color-pyr-tek)] text-[var(--color-pyr-tek)]",
    slag: "border-[#B8852A] text-[#B8852A]",
    spill: "border-[var(--color-pyr-spill)] text-[var(--color-pyr-spill)]",
    turn: "border-[var(--color-pyr-turn)] text-[var(--color-pyr-turn)]",
  };
  const base = tier
    ? `bg-card ${tierMap[tier]}`
    : "border-border bg-card text-foreground";
  const activeStyle = active
    ? tier
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-primary text-primary-foreground border-primary"
    : base;
  return (
    <button
      type="button"
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors hover:opacity-90 ${activeStyle}`}
    >
      {children}
    </button>
  );
}

function TimeRow({
  num,
  date,
  time,
  showLabels,
}: {
  num: string;
  date: string;
  time: string;
  showLabels?: boolean;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr] items-end gap-2.5">
      <span className="font-mono text-[12.5px] text-muted-foreground">
        {num}
      </span>
      <div>
        {showLabels && (
          <label className="mb-1 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Dato
          </label>
        )}
        <input
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-[13.5px] text-foreground"
          defaultValue={date}
          readOnly
        />
      </div>
      <div>
        {showLabels && (
          <label className="mb-1 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Klokkeslett
          </label>
        )}
        <input
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-[13.5px] text-foreground"
          defaultValue={time}
          readOnly
        />
      </div>
    </div>
  );
}
