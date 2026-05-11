/**
 * PILOT — PlayerHQ Abonnement
 * Bygd fra wireframe/design-files-v2/screens/19-playerhq-abonnement.html
 * URL: /playerhq-abonnement-demo
 *
 * Tier-modell: 2-tier (FREE basis + PRO 300 kr/mnd · 3 000 kr/år). ELITE er fjernet fra UI.
 * Mock-data: Markus Roinås Pedersen (PRO aktiv, foreldre-betaler Tor).
 * Anti-state-katalog: én produksjonsskjerm — Pro aktiv, lyst tema.
 */

import { Check, ChevronDown, AlertTriangle } from "lucide-react";

export default function PlayerHQAbonnementDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        {/* Page-head */}
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Abonnement
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Din plan, betaling og <em className="italic">faktura.</em>
          </h1>
          <p className="mt-2 max-w-[700px] text-[14px] leading-[1.55] text-muted-foreground">
            Du er på Pro. Far Tor mottar fakturaer på e-post — du ser dem her uten
            ansvar for selve betalingen.
          </p>
        </header>

        {/* Hero plan */}
        <div className="relative mb-8 grid grid-cols-[1fr_300px] gap-8 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[300px]"
            style={{
              background:
                "linear-gradient(135deg,rgba(0,88,64,0.05) 0%,rgba(209,248,67,0.10) 100%)",
            }}
          />
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                Pro
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1A7D56]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A7D56]" />
                Aktiv siden 4. mar 2026
              </span>
            </div>
            <h2 className="mb-1.5 font-display text-[36px] font-medium italic leading-none tracking-tight text-foreground">
              Pro
            </h2>
            <div className="mb-5 font-mono text-[18px] text-foreground">
              <span className="text-[24px] font-medium">300</span>{" "}
              <span className="text-[14px] text-muted-foreground">
                kr/mnd · faktureres månedlig
              </span>
            </div>
            <div className="mb-5 flex flex-col gap-2">
              <Feature>3 aktive treningsplaner samtidig</Feature>
              <Feature>Ubegrenset coaching-historikk og AI-anbefalinger</Feature>
              <Feature>TrackMan-import, helse-logg, restitusjon</Feature>
              <Feature>50 coach-meldinger per måned (33 brukt)</Feature>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
                Endre plan
              </button>
              <button className="rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
                Pause i 1 mnd
              </button>
              <button className="rounded-md border border-destructive/20 bg-card px-3 py-2 text-[12px] font-medium text-destructive hover:bg-destructive/10">
                Kanseller
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-center gap-4 border-l border-border pl-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Neste belastning
              </span>
              <div className="mt-1.5 font-mono text-[14px] font-medium text-foreground">
                1. juni 2026 · om 22 dager
                <span className="mt-0.5 block text-[18px] font-semibold text-primary">
                  300 kr
                </span>
              </div>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Coach-meldinger denne måneden
              </span>
              <div className="mt-1.5 font-mono text-[13px] font-medium text-foreground">
                33 / 50 brukt
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "66%" }}
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Årspris (om du velger årlig)
              </span>
              <div className="mt-1.5 font-mono text-[13px] text-muted-foreground">
                3 000 kr/år · spar 600 kr
              </div>
            </div>
          </div>
        </div>

        {/* Foreldre-info */}
        <div className="mb-8 flex items-center gap-3.5 rounded-xl border border-primary/20 bg-primary/8 p-5">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary text-[12px] font-semibold text-accent">
            TP
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium text-foreground">
              Tor Pedersen (far) er betaler
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              Fakturaer sendes til tor.pedersen@example.no — du ser dem her uten
              å være ansvarlig.
            </div>
          </div>
          <a className="cursor-pointer whitespace-nowrap text-[13px] font-medium text-primary">
            Bytt betaler →
          </a>
        </div>

        {/* Sammenligning Free vs Pro */}
        <Section title="Sammenlign planer" aux="Pro er din nåværende">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[34%] bg-secondary/60 px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Funksjon
                </th>
                <th className="px-4 py-4">
                  <ColHead name="Free" price="0" unit="kr" />
                </th>
                <th className="px-4 py-4">
                  <ColHead
                    name="Pro"
                    price="300"
                    unit="kr/mnd"
                    badge="Din plan"
                    current
                  />
                </th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              <CompareRow
                feature="Antall planer samtidig"
                desc="Aktive treningsplaner du jobber på parallelt"
                free={<Num>1</Num>}
                pro={<Num>3</Num>}
              />
              <CompareRow
                feature="Coaching-historikk"
                desc="Hvor langt tilbake du kan se notater og runder"
                free={<Num>30 dager</Num>}
                pro={<Num>Ubegrenset</Num>}
              />
              <CompareRow
                feature="AI-anbefalinger"
                desc="Foreslåtte øvelser fra coach-agenten"
                free={<Dash />}
                pro={<CheckMark />}
              />
              <CompareRow
                feature="TrackMan-import"
                desc="Sync data fra dine økter automatisk"
                free={<Dash />}
                pro={<CheckMark />}
              />
              <CompareRow
                feature="Helse + restitusjon"
                desc="Søvn, skader, daglig logg"
                free={<Dash />}
                pro={<CheckMark />}
              />
              <CompareRow
                feature="1:1 coach-melding"
                desc="Direktemeldinger til Anders"
                free={<Num>5 / mnd</Num>}
                pro={<Num>50 / mnd</Num>}
              />
              <tr className="border-t border-border">
                <td className="bg-secondary/60 px-6 py-5 font-semibold text-foreground">
                  Pris
                </td>
                <td className="px-4 py-5 text-center">
                  <div className="font-mono text-[18px] font-medium text-foreground">
                    0 kr
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      gratis
                    </span>
                  </div>
                </td>
                <td className="bg-primary/8 px-4 py-5 text-center">
                  <div className="font-mono text-[18px] font-medium text-primary">
                    300 kr
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      per måned · 3 000 kr/år
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="bg-secondary/60 px-6 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Handling
                </td>
                <td className="px-4 py-5 text-center">
                  <button className="rounded-md border border-destructive/20 bg-card px-3 py-2 text-[12px] font-medium text-destructive hover:bg-destructive/10">
                    Nedgrader
                  </button>
                </td>
                <td className="bg-primary/8 px-4 py-5 text-center">
                  <span className="inline-flex items-center rounded-md border border-primary bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">
                    Du er her
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <div className="h-8" />

        {/* Betaling */}
        <Section title="Betaling" aux="Betalingskort registrert på Tor">
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3.5">
              <div
                className="flex h-9 w-[54px] items-end justify-end rounded-md px-2 pb-1 font-display text-[11px] font-bold italic tracking-wider text-white shadow"
                style={{
                  background:
                    "linear-gradient(135deg,#1A1F71 0%,#0036A0 100%)",
                }}
              >
                VISA
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[14px] font-medium tracking-wider text-foreground">
                  VISA •••• 4242
                </span>
                <span className="text-[12px] text-muted-foreground">
                  Utløper 09 / 2027 · registrert av Tor Pedersen (far)
                </span>
              </div>
            </div>
            <a className="cursor-pointer text-[13px] font-medium text-primary">
              Endre kort →
            </a>
          </div>
        </Section>

        <div className="h-8" />

        {/* Faktura-historikk */}
        <Section title="Faktura-historikk" aux="Alle betalt · last ned PDF">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-6 py-3">Dato</th>
                <th className="px-6 py-3">Beskrivelse</th>
                <th className="px-6 py-3">Beløp</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              <InvoiceRow
                date="1. mai 2026"
                desc="Pro · månedlig · Markus Pedersen"
                amount="300 kr"
                badge="Betalt 1. mai"
                current
              />
              <InvoiceRow
                date="1. apr 2026"
                desc="Pro · månedlig"
                amount="300 kr"
                badge="Betalt"
              />
              <InvoiceRow
                date="1. mar 2026"
                desc="Pro · månedlig"
                amount="300 kr"
                badge="Betalt"
              />
              <InvoiceRow
                date="1. feb 2026"
                desc="Pro · månedlig"
                amount="300 kr"
                badge="Betalt"
              />
            </tbody>
          </table>
        </Section>

        <div className="h-8" />

        {/* Farezone */}
        <section className="rounded-xl border border-destructive/30 bg-destructive/4 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              className="h-4 w-4 text-destructive"
              strokeWidth={1.5}
            />
            <h3 className="font-display text-[15px] font-semibold text-foreground">
              Farezone
            </h3>
          </div>
          <div className="flex items-center justify-between gap-6 border-t border-destructive/20 py-4 first:border-t-0 first:pt-0">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-foreground">
                Kanseller abonnement
              </span>
              <span className="text-[12px] text-muted-foreground">
                Du beholder Pro ut perioden (til 1. juni). Deretter går du
                tilbake til Free.
              </span>
            </div>
            <button className="whitespace-nowrap rounded-md border border-destructive/30 bg-card px-3 py-2 text-[12px] font-medium text-destructive hover:bg-destructive/10">
              Kanseller →
            </button>
          </div>
          <div className="flex items-center justify-between gap-6 border-t border-destructive/20 py-4">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-foreground">
                Slett alle data ved oppsigelse
              </span>
              <span className="text-[12px] text-muted-foreground">
                Av default. Runder, helse-logg og notater bevares så coach kan
                returnere deg ved gjenåpning.
              </span>
            </div>
            <Toggle on={false} />
          </div>
        </section>
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
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-[15px] font-semibold text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-foreground">
      <Check
        className="h-3.5 w-3.5 flex-shrink-0 text-[#1A7D56]"
        strokeWidth={1.5}
      />
      {children}
    </div>
  );
}

function ColHead({
  name,
  price,
  unit,
  badge,
  current = false,
}: {
  name: string;
  price: string;
  unit: string;
  badge?: string;
  current?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-md px-3 py-3 ${
        current
          ? "border-b-2 border-primary bg-primary/8"
          : "border-b border-border bg-card"
      }`}
    >
      {badge && (
        <span
          className={`rounded-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] ${
            current
              ? "bg-primary text-accent"
              : "bg-foreground text-background"
          }`}
        >
          {badge}
        </span>
      )}
      <span className="font-display text-[22px] font-semibold italic leading-none tracking-tight text-foreground">
        {name}
      </span>
      <span className="font-mono text-[13px] text-muted-foreground">
        <span className="text-[22px] font-medium text-foreground -tracking-tight">
          {price}
        </span>{" "}
        {unit}
      </span>
    </div>
  );
}

function CompareRow({
  feature,
  desc,
  free,
  pro,
}: {
  feature: string;
  desc: string;
  free: React.ReactNode;
  pro: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/60">
      <td className="bg-secondary/60 px-6 py-3.5 align-middle font-medium text-foreground">
        {feature}
        <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground/80">
          {desc}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">{free}</td>
      <td className="bg-primary/8 px-4 py-3.5 text-center">{pro}</td>
    </tr>
  );
}

function Num({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[13px] text-foreground">{children}</span>
  );
}

function Dash() {
  return <span className="font-mono text-muted-foreground/50">—</span>;
}

function CheckMark() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary">
      <Check className="h-3 w-3" strokeWidth={1.5} />
    </span>
  );
}

function InvoiceRow({
  date,
  desc,
  amount,
  badge,
  current = false,
}: {
  date: string;
  desc: string;
  amount: string;
  badge: string;
  current?: boolean;
}) {
  return (
    <tr
      className={`border-b border-border/60 last:border-b-0 ${
        current ? "bg-primary/4" : ""
      }`}
    >
      <td className="px-6 py-3 font-mono">{date}</td>
      <td className="px-6 py-3">{desc}</td>
      <td className="px-6 py-3 font-mono">{amount}</td>
      <td className="px-6 py-3">
        <span className="inline-flex items-center rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[11px] font-medium text-[#1A7D56]">
          {badge}
        </span>
      </td>
      <td className="px-6 py-3 text-right">
        <a className="cursor-pointer text-[12px] font-medium text-primary">
          Last ned →
        </a>
      </td>
    </tr>
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
