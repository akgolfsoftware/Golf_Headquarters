/**
 * PILOT — Innstillings-layout (Arketype F)
 * Bygd fra wireframe/design-files-v2/screens/20-shared-innstillings-layout.html
 * URL: /innstillings-layout-demo
 *
 * Spec-skjerm: anatomi, komponenter, tokens, copywriting for settings.
 */

import { Check, ChevronRight } from "lucide-react";

export default function InnstillingsLayoutDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Designsystem · Arketype F
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Innstillings-layout. <em className="font-normal italic">Anatomi og regler.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            Spec-en F-arketypen følger på alle innstillings-skjermer — i CoachHQ for Anders Kristiansen
            og i PlayerHQ for spillere som Markus Roinås Pedersen.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px] text-muted-foreground">
            <span><span className="text-muted-foreground/70">CSS:</span> arketype-f.css</span>
            <span><span className="text-muted-foreground/70">Skjermer i bruk:</span> 10</span>
            <span><span className="text-muted-foreground/70">Sist endret:</span> 11.05.2026</span>
          </div>
        </header>

        {/* Anatomi-spec */}
        <section className="mb-10">
          <SectionHeader num="01" title="Anatomi — seks ankrede regioner" />
          <div className="grid grid-cols-3 gap-4">
            <SpecCard
              num="A"
              title="Global nav"
              desc="240px fast bredde. Identisk på alle innstillings-skjermer. Logo + 6 hovedtabs + footer-avatar."
              code=".nav · width 240px"
            />
            <SpecCard
              num="B"
              title="Page-head"
              desc="Crumb + H1 + sub. H1 er alltid en setning — aldri en tittel som «Innstillinger»."
              code=".page-head h1 · Instrument Serif 36px"
            />
            <SpecCard
              num="C"
              title="Subnav"
              desc="200px. Liste over alle kategorier i ett område. Maks 8 elementer per gruppe."
              code=".subnav · width 200px"
            />
            <SpecCard
              num="D"
              title="Form-area"
              desc="Maks 720px bred for lesbar linjelengde. Padding 32px topp, 28–36px sider."
              code=".form-area · max-w 720"
            />
            <SpecCard
              num="E"
              title="Section + field-list"
              desc="Hver section: section-head (h2 + aux) + field-list. Felt har label (med hint), value og kontroll."
              code=".section · margin-top 32"
            />
            <SpecCard
              num="F"
              title="Save-bar"
              desc="Skjult i clean-state. Sticky bar i bunn ved dirty-state med antall endringer + lagre/forkast."
              code=".save-bar · dirty trigger"
            />
          </div>
        </section>

        {/* Felt-komponenter */}
        <section className="mb-10">
          <SectionHeader num="02" title="Felt-komponenter — 8 typer dekker alle innstillinger" />
          <div className="grid grid-cols-2 gap-4">
            <FieldDemo title="Display + edit-link" desc="Lese-modus med inline edit-link. Standard for tekstfelt som sjeldent endres.">
              <DisplayRow label="E-post" value="markus@example.no" />
              <DisplayRow label="Telefon" value="+47 412 34 567" />
            </FieldDemo>

            <FieldDemo title="Toggle" desc="På/av-bryter. Tar effekt umiddelbart eller ved Lagre — avgjøres per skjerm.">
              <ToggleRow label="Push-varsler" hint="På denne enheten · iPhone 16" on />
              <ToggleRow label="E-post-sammendrag" on={false} />
            </FieldDemo>

            <FieldDemo title="Chip-velger" desc="Dropdown for store sett, chip-rad for små sett (maks 6).">
              <DisplayRow label="Språk" value="Norsk (bokmål)" />
              <ChipRow label="Spesialisering" chips={[{ label: "Tee" }, { label: "Iron" }, { label: "Putting", active: true }]} />
            </FieldDemo>

            <FieldDemo title="Slider" desc="Brukes til subjektive målinger 0–10 og varighet/tid.">
              <SliderRow label="Søvn forrige natt" pct={70} value="8,4 t" />
              <SliderRow label="Stress nå" pct={40} value="4 / 10" />
            </FieldDemo>

            <FieldDemo title="Avatar + handlinger" desc="Display av kontoens identitets-bilde med bytt/slett-handlinger.">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-[13px] text-foreground">Profilbilde</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">PNG/JPG · maks 5 MB · 1:1 anbefalt</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-[14px] font-bold text-primary-foreground">
                    MR
                  </div>
                  <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">Bytt</button>
                  <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-destructive hover:bg-secondary">Slett</button>
                </div>
              </div>
            </FieldDemo>

            <FieldDemo title="Status med pill" desc="For sikkerhets-status. Pill bærer state-fargen.">
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-foreground">2-faktor autentisering</span>
                <div className="flex items-center gap-2">
                  <Pill tone="success">På · Authy</Pill>
                  <button className="text-[12px] font-medium text-primary hover:underline">Endre</button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[13px]">
                <span className="text-foreground">Sist innlogget</span>
                <span className="font-mono text-[12px] text-muted-foreground">For 12 min siden · Fredrikstad</span>
              </div>
            </FieldDemo>

            <FieldDemo title="Destruktiv handling" desc="Egen section «Farlig sone» nederst. Aldri primary button.">
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <div>
                  <span className="text-destructive">Slett konto</span>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Permanent · kan ikke angres etter 30 dager</div>
                </div>
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-destructive hover:bg-secondary">
                  Slett konto
                </button>
              </div>
            </FieldDemo>

            <FieldDemo title="Notat / textarea" desc="For dagslogg, kommentarer og forklaringer. Auto-resize, ingen tegngrense.">
              <div className="px-4 py-3">
                <div className="mb-1.5 text-[13px] text-foreground">
                  Notat <span className="text-[11px] text-muted-foreground">Valgfritt</span>
                </div>
                <div className="min-h-[44px] rounded-md border border-input bg-card px-3 py-2 text-[13px] text-muted-foreground">
                  Hvordan kjennes det ut i dag?
                </div>
              </div>
            </FieldDemo>
          </div>
        </section>

        {/* Layout-tokens */}
        <section className="mb-10">
          <SectionHeader num="03" title="Layout- og typografi-tokens" />
          <div className="grid grid-cols-2 gap-4">
            <TokenTable
              title="Layout"
              rows={[
                { name: "--nav-w", value: "240px", desc: "Global nav-bredde" },
                { name: ".subnav", value: "200px", desc: "Kategori-sidebar" },
                { name: ".form-area", value: "maks 720px", desc: "Lesbar linjelengde" },
                { name: "--gutter-page", value: "28–36px", desc: "Padding i form-area" },
                { name: "--section-gap", value: "32px", desc: "Mellom sections" },
                { name: ".field", value: "grid 200px 1fr auto", desc: "Felt-radstruktur" },
              ]}
            />
            <TokenTable
              title="Typografi"
              rows={[
                { name: "H1", value: "Instrument Serif 36/40", desc: ".page-head h1" },
                { name: "H2", value: "Instrument Serif 22/26", desc: ".section-head h2" },
                { name: "Label", value: "Geist 13/16 500", desc: ".field .lbl" },
                { name: "Hint", value: "Geist 11/15 400", desc: ".field .hint" },
                { name: "verdi.mono", value: "Geist Mono 13/16", desc: "ID, datoer, beløp" },
                { name: "META-TAG", value: "Mono 10/13 .08em UC", desc: ".aux, .crumb-meta" },
              ]}
            />
          </div>
        </section>

        {/* Tilstander */}
        <section className="mb-10">
          <SectionHeader num="04" title="7 tilstander hver skjerm må håndtere" />
          <div className="flex flex-col gap-3">
            {STATES.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4 rounded-lg border border-border bg-card px-5 py-4">
                <div className="font-mono text-[14px] font-medium text-primary tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-foreground">{s.title}</div>
                  <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Copywriting */}
        <section>
          <SectionHeader num="05" title="Tone of voice — H1 på innstillings-skjermer" />
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Skjerm</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Bruk</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Ikke bruk</th>
                </tr>
              </thead>
              <tbody>
                {COPY_ROWS.map((r) => (
                  <tr key={r.screen} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">{r.screen}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{r.good}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground/70 line-through decoration-destructive/40">{r.bad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

const STATES = [
  { title: "Default / clean", desc: "Alle felt på lagrede verdier. Save-bar er skjult. Subnav viser aktiv kategori." },
  { title: "Dirty (ikke lagret)", desc: "Save-bar vises sticky nederst med antall endringer + liste over endrede felt navngitt i kursiv. Dirty felt får accent-bakgrunn." },
  { title: "Loading / lagrer", desc: "Save-bar-knappen får disabled-state og spinner. Hele form-arealet blir 0,6 opacity før success-toast vises øverst." },
  { title: "Empty-state", desc: "Brukes når en liste er tom (skader, fakturaer, sesjoner). Sentrert ikon, 14px tittel, 12px beskrivelse, valgfri CTA." },
  { title: "Tier-gate", desc: "Free-bruker som prøver Pro-funksjon: section blurres med 0,6 opacity, oppå legges overlay med lås-ikon, tier-tag, H2, verdi-løfte og CTA." },
  { title: "Validerings-feil", desc: "Per-felt: rød border + rød hint-tekst under (12px). Save-bar erstattes med error-bar «Rett feltene før du kan lagre» + scroll-to-error." },
  { title: "Destruktiv bekreftelse", desc: "Modal med to ledd: 1) advarsel + konsekvenser, 2) input-felt der brukeren skriver «SLETT» eller kontonavn for å aktivere knappen." },
];

const COPY_ROWS = [
  { screen: "Profil", good: "«Dette er deg på AK Golf.»", bad: "Profilinnstillinger" },
  { screen: "Helse", good: "«Hvordan har du det egentlig?»", bad: "Helse-data" },
  { screen: "Varsler", good: "«Bare det du faktisk vil bli forstyrret av.»", bad: "Varselsinnstillinger" },
  { screen: "Abonnement", good: "«Du er på Pro siden 12. januar.»", bad: "Abonnementsdetaljer" },
  { screen: "Sikkerhet", good: "«Hvem som kan komme inn — og hvordan.»", bad: "Sikkerhetsinnstillinger" },
];

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="font-mono text-[11px] font-medium text-primary tabular-nums">{num}</span>
      <h2 className="font-display text-[22px] font-medium leading-snug tracking-tight">{title}</h2>
    </div>
  );
}

function SpecCard({ num, title, desc, code }: { num: string; title: string; desc: string; code: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <span className="rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] text-primary-foreground">
          {num}
        </span>
        {title}
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
      <code className="w-fit rounded-md bg-secondary/60 px-2 py-1 font-mono text-[11px] text-primary">{code}</code>
    </div>
  );
}

function FieldDemo({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
      <div className="text-[13px] font-semibold text-foreground">{title}</div>
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="divide-y divide-border">{children}</div>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-[13px]">
      <span className="text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[12px] text-muted-foreground">{value}</span>
        <button className="text-[12px] font-medium text-primary hover:underline">Endre</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, on }: { label: string; hint?: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-[13px] text-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`} role="switch" aria-checked={on}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </div>
  );
}

function ChipRow({ label, chips }: { label: string; chips: { label: string; active?: boolean }[] }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-[13px]">
      <span className="text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`rounded-full px-2.5 py-0.5 text-[11px] ${c.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SliderRow({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr_60px] items-center gap-3 px-4 py-3">
      <span className="text-[13px] text-foreground">{label}</span>
      <div className="relative h-1.5 rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-card" style={{ left: `calc(${pct}% - 7px)` }} />
      </div>
      <span className="text-right font-mono text-[12px] tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Pill({ tone, children }: { tone: "success" | "warn" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-accent/40 text-accent-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
      {children}
    </span>
  );
}

function TokenTable({ title, rows }: { title: string; rows: { name: string; value: string; desc: string }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="font-display text-[16px] font-semibold tracking-tight">{title}</h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[160px_140px_1fr] items-center gap-3 px-5 py-3">
            <span className="font-mono text-[12px] text-foreground">{r.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{r.value}</span>
            <span className="text-[12px] text-muted-foreground">{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
