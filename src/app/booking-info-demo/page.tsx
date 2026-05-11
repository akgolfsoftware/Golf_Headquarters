/**
 * Booking — Info-skjema (steg 3 av 5)
 * Bygd fra wireframe/design-files-v2/screens/booking/05-booking-info.html
 * URL: /booking-info-demo
 *
 * Info-side forbruker. Skjema venstre, ordresammendrag høyre.
 * Pre-utfylt for Markus Roinås Pedersen (forbruker-kunde).
 */

interface OrderRow {
  label: string;
  value: string;
  italic?: boolean;
}

const ORDER: OrderRow[] = [
  { label: "Tjeneste", value: "Personlig coaching · 60 min" },
  { label: "Coach", value: "Anders Kristiansen", italic: true },
  { label: "Tid", value: "Tirsdag 13. mai · 09:00 — 10:00", italic: true },
  { label: "Sted", value: "Mulligan Indoor Borre · Bay 3" },
  { label: "Kunde", value: "Markus Roinås Pedersen · HCP 4,2 · GFGK Bossum" },
];

const STEPS = [
  { num: "✓", label: "Tjeneste", state: "done" as const },
  { num: "✓", label: "Tid", state: "done" as const },
  { num: "3", label: "Info", state: "active" as const },
  { num: "4", label: "Betaling", state: "todo" as const },
  { num: "5", label: "Bekreftelse", state: "todo" as const },
];

export default function BookingInfoDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1000px] px-12 pb-16 pt-12">
        <div className="text-center">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Anders Kristiansen · Tir 13. mai · 09:00 · Mulligan Borre
          </div>
          <h1 className="mt-3 font-display text-[44px] font-normal leading-tight tracking-tight">
            Din <em className="italic text-primary">info</em>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Vi trenger noen detaljer for å bekrefte timen. HCP og mål hjelper Anders forberede økten.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[1.2fr_0.9fr] items-start gap-8">
          <form className="flex flex-col gap-8">
            <Section title="Kontakt" hint="Bekreftelse + reminder sendes på e-post og SMS.">
              <Row>
                <Field label="Fornavn" required>
                  <input
                    type="text"
                    defaultValue="Markus"
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Etternavn" required>
                  <input
                    type="text"
                    defaultValue="Roinås Pedersen"
                    className={INPUT_CLASS}
                  />
                </Field>
              </Row>
              <Field label="E-post" required>
                <input
                  type="email"
                  defaultValue="markus.r.pedersen@example.no"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Mobil" required>
                <input
                  type="tel"
                  defaultValue="+47 412 88 921"
                  className={INPUT_CLASS}
                />
              </Field>
            </Section>

            <Section title="Spillerprofil" hint="Hjelper Anders skreddersy økten. Du kan hoppe over feltene.">
              <Row>
                <Field label="Handicap" hint="Valgfritt">
                  <input type="text" defaultValue="4,2" className={INPUT_CLASS} />
                </Field>
                <Field label="Klubb">
                  <input
                    type="text"
                    defaultValue="GFGK Bossum"
                    className={INPUT_CLASS}
                  />
                </Field>
              </Row>
              <Field label="Hva vil du jobbe med?" hint="Maks 500 tegn">
                <textarea
                  defaultValue="Avstandskontroll med kort jern (PW–8). Treffer for kort fra 100 m."
                  className={`${INPUT_CLASS} min-h-[88px] resize-y`}
                />
              </Field>
            </Section>

            <Section title="Samtykker">
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-[18px] w-[18px] accent-foreground"
                  />
                  <span className="text-[13px] leading-[1.5]">
                    Jeg har lest og godtar{" "}
                    <a
                      href="#"
                      className="underline decoration-border underline-offset-2"
                    >
                      avbestillingsreglene
                    </a>{" "}
                    (gratis avbestilling fram til 24 t før, 50 % inntil 6 t før, deretter full pris).
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-[18px] w-[18px] accent-foreground"
                  />
                  <span className="text-[13px] leading-[1.5]">
                    Ja takk, send meg{" "}
                    <a
                      href="#"
                      className="underline decoration-border underline-offset-2"
                    >
                      nyhetsbrev
                    </a>{" "}
                    med treningstips og kampanjer (valgfritt, du kan melde deg av når som helst).
                  </span>
                </label>
              </div>
            </Section>
          </form>

          <aside className="sticky top-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-[20px] font-normal italic">
              Din bestilling
            </h3>
            <div>
              {ORDER.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-dashed border-border py-3 last:border-b-0"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-right text-[13px]">
                    {row.italic ? (
                      <em className="font-display italic">{row.value}</em>
                    ) : (
                      row.value
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-display text-[18px] italic">Total</span>
              <span className="font-mono text-[18px] font-medium">1 500 kr</span>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-3.5 py-3 text-[14px] text-foreground outline-none transition-colors focus:border-foreground";

function TopNav() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-border px-12">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>AK Golf</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Booking</span>
      </div>
      <a href="#" className="text-[13px] font-medium hover:text-primary">
        Min side →
      </a>
    </nav>
  );
}

function ProgressBar() {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-secondary/40 px-12 py-4">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              step.state === "active"
                ? "bg-primary text-primary-foreground"
                : step.state === "done"
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${
                step.state === "active"
                  ? "bg-primary-foreground/20"
                  : step.state === "done"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary"
              }`}
            >
              {step.num}
            </span>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-border">→</span>}
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-display text-[20px] font-normal italic leading-tight tracking-tight">
          {title}
        </h3>
        {hint && (
          <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>
          {label} {required && <span className="text-primary">*</span>}
        </span>
      </label>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground/70">{hint}</span>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-5">
      <button
        type="button"
        className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium hover:bg-secondary"
      >
        ← Tilbake til tid
      </button>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
      >
        Til betaling →
      </button>
    </footer>
  );
}
