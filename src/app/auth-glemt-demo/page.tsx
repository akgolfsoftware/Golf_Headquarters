/**
 * PILOT — Auth · Glemt passord (reset-flow, steg 2 av 3)
 * Bygd direkte fra wireframe/design-files-v2/screens/63-auth-glemt-passord.html
 * URL: /auth-glemt-demo
 *
 * Anti-state-katalog: én produksjonsskjerm — bekreftelses-steg etter
 * at e-post med reset-lenke er sendt.
 */

import {
  CheckCircle2,
  Laptop,
  Smartphone,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function AuthGlemtDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Brand-panel (mørk) */}
        <aside className="relative hidden flex-col justify-between bg-[#0A2A1F] p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary font-display text-[14px] font-semibold text-primary-foreground">
              AK
            </div>
            <div className="font-display text-[15px] font-medium tracking-tight">
              AK Golf
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.06em] text-white/55">
                / sikker tilbakestilling
              </span>
            </div>
          </div>

          <div className="max-w-[460px]">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Trygt og enkelt
            </div>
            <h2 className="mt-4 font-display text-[38px] font-medium leading-[1.15] tracking-tight">
              Hjelp deg <em className="italic text-accent">tilbake inn</em> —
              uten å miste data.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.6] text-white/70">
              Tilbakestillings-lenken utløper om 30 minutter og fungerer kun
              fra samme enhet og samme nettverk som du startet flyten fra.
              Etter reset må aktive sesjoner re-autentisere.
            </p>

            <div className="mt-8">
              <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                Aktivitet siste 24t
              </div>
              <div className="flex flex-col gap-2">
                <DeviceRow
                  icon={
                    <Laptop
                      size={16}
                      strokeWidth={1.5}
                      className="text-accent"
                    />
                  }
                  name='MacBook Pro 16" · Chrome'
                  detail="Oslo · Telenor · 81.x.x.x"
                  when="nå · denne"
                  whenAccent
                />
                <DeviceRow
                  icon={
                    <Smartphone
                      size={16}
                      strokeWidth={1.5}
                      className="text-white/65"
                    />
                  }
                  name="iPhone 15 · Safari"
                  detail="GFGK · 4G · 80.x.x.x"
                  when="i går 17:22"
                />
                <DeviceRow
                  icon={
                    <AlertTriangle
                      size={16}
                      strokeWidth={1.5}
                      className="text-[#ffd0d0]"
                    />
                  }
                  name="Ukjent enhet · Edge"
                  detail="Stockholm · 95.x.x.x"
                  when="i går 03:14"
                  danger
                />
              </div>
              <p className="mt-4 font-mono text-[10px] leading-[1.6] tracking-[0.02em] text-white/55">
                <b className="font-semibold text-[#ffd0d0]">
                  Kjenner du ikke igjen en enhet?
                </b>{" "}
                Avbryt reset og kontakt sikkerhet@akgolf.no umiddelbart.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.04em] text-white/50">
            <span>Reset-token utløper 15:48 · 28 min igjen</span>
            <a className="cursor-pointer hover:text-white">
              Avbryt &amp; logg inn →
            </a>
          </div>
        </aside>

        {/* Reset-form (lys) */}
        <main className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Step-rail */}
            <div className="mb-8 flex gap-2">
              <Step label="1 · Identifiser" state="done" />
              <Step label="2 · Bekreft" state="active" />
              <Step label="3 · Nytt passord" state="idle" />
            </div>

            <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight">
              Sjekk innboksen.
            </h1>
            <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
              Vi har sendt en tilbakestillings-lenke til{" "}
              <b className="font-semibold text-foreground">
                a••••p@akgolfgroup.no
              </b>
              . Lenken utløper om 30 minutter og fungerer bare i denne
              nettleseren.
            </p>

            {/* Sent-card */}
            <div className="mt-5 flex items-start gap-3.5 rounded-md border border-primary/15 bg-primary/5 p-5">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <CheckCircle2 size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <b className="block text-[14px] font-semibold text-foreground">
                  E-post sendt 15:18
                </b>
                <p className="mt-1 text-[13px] leading-[1.55] text-muted-foreground">
                  Sjekk innboksen og{" "}
                  <code className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    SPAM
                  </code>
                  -mappen. Ikke fått e-post innen 2 minutter?{" "}
                  <a className="cursor-pointer text-primary hover:underline">
                    Send på nytt (28 min cooldown)
                  </a>
                </p>
              </div>
            </div>

            {/* Kode-input */}
            <div className="mt-6">
              <label
                htmlFor="code"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
              >
                Eller skriv inn bekreftelses-kode fra e-posten
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                defaultValue="438 — 2"
                placeholder="• • • — • • •"
                className="mt-2 w-full rounded-md border border-input bg-card px-4 py-3.5 text-center font-mono text-[18px] tracking-[0.4em] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                6-sifret kode · sjekker auto når 6 siffer er tastet inn
              </p>
            </div>

            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Bekreft &amp; gå videre
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
            <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary">
              Endre e-post-adresse
            </button>

            <div className="mt-6 space-y-1 font-mono text-[10px] leading-[1.7] tracking-[0.04em] text-muted-foreground">
              <div>
                <b className="font-semibold uppercase text-foreground">
                  Forventer:
                </b>{" "}
                e-post fra{" "}
                <code className="rounded-sm bg-secondary px-1.5 py-0.5 text-primary">
                  noreply@akgolf.no
                </code>
              </div>
              <div>
                <b className="font-semibold uppercase text-foreground">
                  Avsender:
                </b>{" "}
                AK Golf · sikkerhet
              </div>
              <div>
                <b className="font-semibold uppercase text-foreground">
                  Token-utløp:
                </b>{" "}
                15:48 (28 min)
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Step({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "idle";
}) {
  const barClass =
    state === "done" || state === "active" ? "bg-primary" : "bg-border";
  const labelClass =
    state === "idle" ? "text-muted-foreground" : "text-primary";
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className={`relative h-[3px] rounded-sm ${barClass}`}>
        {state === "active" && (
          <span className="absolute -top-[2px] right-0 h-[7px] w-[7px] rounded-full bg-primary" />
        )}
      </div>
      <div
        className={`font-mono text-[9px] font-semibold uppercase tracking-[0.08em] ${labelClass}`}
      >
        {label}
      </div>
    </div>
  );
}

function DeviceRow({
  icon,
  name,
  detail,
  when,
  whenAccent = false,
  danger = false,
}: {
  icon: React.ReactNode;
  name: string;
  detail: string;
  when: string;
  whenAccent?: boolean;
  danger?: boolean;
}) {
  const bg = danger
    ? "bg-[rgba(176,68,68,0.10)] border-[rgba(176,68,68,0.30)]"
    : "bg-white/5 border-white/10";
  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${bg}`}
    >
      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-sm bg-white/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <b className="block text-[13px] font-semibold text-white">{name}</b>
        <small className="block font-mono text-[10px] tracking-[0.02em] text-white/55">
          {detail}
        </small>
      </div>
      <div
        className={`flex-shrink-0 font-mono text-[10px] tracking-[0.02em] ${
          whenAccent
            ? "text-accent"
            : danger
              ? "text-[#ffd0d0]"
              : "text-white/55"
        }`}
      >
        {when}
      </div>
    </div>
  );
}
