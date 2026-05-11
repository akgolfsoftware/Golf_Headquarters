/**
 * Onboarding 3/4 — Coach-profil & verifisering
 * Bygd fra wireframe/design-files-v2/screens/33-onboarding-coach.html
 * URL: /onboarding-coach-demo
 */

import { Check, FileUp, Calendar } from "lucide-react";

export default function OnboardingCoachDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEAE2] to-[#F5F2EA] p-8 sm:p-9">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl bg-background shadow-[0_24px_60px_-20px_rgba(10,31,24,0.18)]">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
          {/* Narrative */}
          <aside className="flex flex-col gap-8 bg-[#0A1F18] p-10 text-[#F5F4EE]">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-[13px] font-semibold text-[#0A1F18]">
                AK
              </div>
              <div className="font-display text-[15px] font-semibold tracking-tight">
                Coach HQ
              </div>
            </div>

            <div>
              <h2 className="font-display text-[28px] font-medium leading-[1.1] tracking-tight">
                Vi <em className="italic font-normal text-accent">verifiserer hver coach</em> før første klient.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-[rgba(245,244,238,0.80)]">
                Foreldre og klubber stoler på AK Golf HQ fordi vi sjekker PGA-medlemsskap,
                politiattest og forsikring. Det tar normalt 1–2 virkedager etter at du har
                lastet opp dokumenter.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Sjekkliste
              </div>
              <VerifyItem state="done">PGA Norge-medlemsskap</VerifyItem>
              <VerifyItem state="pending">Politiattest (under behandling)</VerifyItem>
              <VerifyItem state="idle">Ansvarsforsikring (valgfritt)</VerifyItem>
            </div>

            <div className="mt-auto rounded-lg border-l-2 border-accent bg-[rgba(245,244,238,0.04)] p-4 text-[13px] italic leading-[1.6] text-[rgba(245,244,238,0.85)]">
              «Coach-verifisering er det viktigste tilliten i HQ-en — vi gjør den nøye, og raskt.»
              <span className="mt-2 block font-mono text-[10px] not-italic uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Tillit & Sikkerhet · AK Golf
              </span>
            </div>
          </aside>

          {/* Form */}
          <main className="flex flex-col gap-8 p-10">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                Steg <span className="font-semibold text-foreground">03</span> / 04
              </div>
              <div className="flex items-center gap-2">
                <Dot done />
                <Dot done />
                <Dot active />
                <Dot />
              </div>
              <button className="rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                Lagre & fortsett senere
              </button>
            </div>

            <div>
              <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-tight">
                Sett opp <em className="italic font-normal text-muted-foreground">coach-profilen din.</em>
              </h1>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                Klientene dine ser navn, klubber, kvalifikasjoner og prising når de booker. Du
                kan finjustere alt under <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">/admin/settings/profil</code> etter onboarding.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Visningsnavn">
                <input
                  type="text"
                  defaultValue="Anders Kristiansen"
                  className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[13px] text-foreground"
                />
              </Field>
              <Field label="Hjemmebane">
                <select className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[13px] text-foreground">
                  <option>Mulligan Indoor Borre · 4 simulatorer</option>
                </select>
              </Field>
              <Field label="Spesialiseringer (1–3)">
                <div className="flex flex-wrap gap-2">
                  <Chip active>Putting</Chip>
                  <Chip active>Short game</Chip>
                  <Chip>Driving</Chip>
                  <Chip>Junior</Chip>
                  <Chip>Mental</Chip>
                  <Chip>Turnering</Chip>
                </div>
              </Field>
              <Field label="Språk">
                <div className="flex flex-wrap gap-2">
                  <Chip active>Norsk</Chip>
                  <Chip active>Engelsk</Chip>
                  <Chip>Svensk</Chip>
                </div>
              </Field>
            </div>

            {/* Kvalifikasjoner */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Kvalifikasjoner
                </span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  Vi henter automatisk fra PGA Norge der vi kan
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <CertRow
                  checked
                  name="PGA Norge — Class A Pro"
                  meta="Medlemsnr 12-4839 · gyldig til 2027"
                  year="2018"
                  badge="Verifisert ✓"
                />
                <CertRow
                  checked
                  name="TPI — Titleist Performance Institute Level 2"
                  meta="ID TPI-22904"
                  year="2022"
                  badge="Verifisert ✓"
                />
                <CertRow
                  checked
                  name="NIH Idrettsmental coaching — 30 stp"
                  meta="Vedlegg lastet opp · diplom_2024.pdf"
                  year="2024"
                  badge="Manuelt godkjent"
                />
                <CertRow
                  name="Politiattest for arbeid med mindreårige"
                  meta="Påkrevd for junior-klienter (U18)"
                  year="—"
                  badge="Last opp"
                  pending
                />
              </div>
            </div>

            {/* Calendar + price */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Koble kalender" help="Vi blokkerer av kalenderen din mot dobbeltbooking — vi leser kun «opptatt»-status.">
                <div className="flex flex-wrap gap-2">
                  <CalPill connected>
                    <span className="grid h-[18px] w-[18px] place-items-center rounded-sm bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
                      G
                    </span>
                    Google · anders@akgolf.no
                  </CalPill>
                  <CalPill>
                    <span className="grid h-[18px] w-[18px] place-items-center rounded-sm bg-secondary font-mono text-[9px] font-semibold text-muted-foreground">
                      i
                    </span>
                    + iCal
                  </CalPill>
                  <CalPill>
                    <span className="grid h-[18px] w-[18px] place-items-center rounded-sm bg-secondary font-mono text-[9px] font-semibold text-muted-foreground">
                      O
                    </span>
                    + Outlook
                  </CalPill>
                </div>
              </Field>
              <Field label="Time-takst" help="Du kan tilby gratis intro-økter og pakkepris. Settes på /admin/tjenester.">
                <div className="flex flex-wrap gap-2">
                  <PriceInput value="1450" suffix="kr / 60 min" />
                  <PriceInput value="2400" suffix="kr / 90 min" />
                </div>
              </Field>
            </div>

            {/* Politiattest upload */}
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary px-4 py-3">
              <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg border border-border bg-card text-primary">
                <FileUp size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-[12px] leading-[1.5] text-muted-foreground">
                <b className="font-medium text-foreground">Last opp politiattest</b> · PDF eller
                bilde · maks 8 MB. Vi krypterer dokumentet og oppbevarer i 12 mnd før automatisk
                sletting.
              </div>
              <button className="rounded-md border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
                Velg fil
              </button>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-[11px] text-muted-foreground">
                2 av 3 verifiseringer fullført · konto aktiveres etter politiattest
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
                  ← Tilbake
                </button>
                <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                  Send til verifisering →
                </button>
              </div>
            </div>
          </main>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-6 py-3.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>Verifiserings-batch · forrige kjøring 11.05.2026 04:00 (T+18 min behandlingstid avg)</span>
          <div className="flex gap-4">
            <span>
              <b className="font-medium text-foreground">PGA-API:</b> live
            </span>
            <span>
              <b className="font-medium text-foreground">Dok-storage:</b> S3-Frankfurt (kryptert)
            </span>
            <span className="text-primary">● auto-revisit hvert 6. mnd</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  return (
    <span
      className={`h-1.5 w-8 rounded-full ${
        done ? "bg-primary/60" : active ? "bg-primary" : "bg-border"
      }`}
    />
  );
}

function VerifyItem({
  state,
  children,
}: {
  state: "done" | "pending" | "idle";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-[13px] ${
        state === "idle" ? "text-[rgba(245,244,238,0.55)]" : "text-[rgba(245,244,238,0.85)]"
      }`}
    >
      <span
        className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold ${
          state === "done"
            ? "bg-accent text-[#0A1F18]"
            : state === "pending"
              ? "border-[1.5px] border-[rgba(245,244,238,0.30)] text-[rgba(245,244,238,0.5)]"
              : "border-[1.5px] border-[rgba(245,244,238,0.20)]"
        }`}
      >
        {state === "done" ? "✓" : state === "pending" ? "!" : ""}
      </span>
      {children}
    </div>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </label>
      {children}
      {help && <span className="text-[11px] text-muted-foreground">{help}</span>}
    </div>
  );
}

function Chip({ active = false, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function CertRow({
  checked = false,
  pending = false,
  name,
  meta,
  year,
  badge,
}: {
  checked?: boolean;
  pending?: boolean;
  name: string;
  meta: string;
  year: string;
  badge: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div
        className={`grid h-5.5 w-5.5 place-items-center rounded-md border-[1.5px] ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-secondary text-transparent"
        }`}
        style={{ width: "22px", height: "22px" }}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <div>
        <div className="text-[13px] font-medium text-foreground">{name}</div>
        <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          {meta}
        </div>
      </div>
      <div className="rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
        {year}
      </div>
      <span
        className={`rounded-md px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${
          pending ? "bg-[#FFF0D6] text-[#B8852A]" : "bg-[#E5F1EA] text-[#1A7D56]"
        }`}
      >
        {badge}
      </span>
    </div>
  );
}

function CalPill({
  connected = false,
  children,
}: {
  connected?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] ${
        connected
          ? "border-primary bg-primary/5 font-medium text-primary"
          : "border-border bg-card text-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function PriceInput({ value, suffix }: { value: string; suffix: string }) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-input bg-card">
      <input
        type="text"
        defaultValue={value}
        className="w-[60px] border-none bg-transparent px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-foreground outline-none"
      />
      <span className="px-2.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}
