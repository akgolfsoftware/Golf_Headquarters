/**
 * PILOT — Auth · Logg inn (split-skjerm)
 * Bygd direkte fra wireframe/design-files-v2/screens/62-auth-logg-inn.html
 * URL: /auth-login-demo
 *
 * Anti-state-katalog: én produksjonsskjerm — split med brand-panel
 * (mørk venstre) og login-form (lys høyre).
 */

import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function AuthLoginDemo() {
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
                / coaching · spiller · forelder
              </span>
            </div>
          </div>

          <div className="max-w-[460px]">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Coaching · gjort enklere
            </div>
            <h2 className="mt-4 font-display text-[40px] font-medium leading-[1.15] tracking-tight">
              Hver økt, hvert mål, hver{" "}
              <em className="italic text-accent">milepæl</em> — på ett sted.
            </h2>
            <p className="mt-5 max-w-[440px] text-[14px] leading-[1.6] text-white/70">
              Plattformen som binder sammen spillere, coacher, foreldre og
              klubber. Live Session, Coaching Board og rapporter — bygd for
              norsk junior-golf.
            </p>

            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5">
              <p className="font-display text-[16px] font-medium italic leading-[1.55] tracking-tight text-white">
                «Vi sparer 6 timer i uken på rapportering. Foreldrene er mer
                engasjert enn noensinne, og spillerne ser sin egen progresjon
                hver dag.»
              </p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.04em] text-white/55">
                <b className="font-semibold text-accent">Anders K.</b> ·
                Hovedcoach, GFGK
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
              <Stat value="340+" label="Aktive coacher" />
              <Stat value="2 800" label="Spillere" />
              <Stat value="+62" label="Foreldre-NPS" />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.04em] text-white/50">
            <span>
              AK Golf · v3.4.2 · status:{" "}
              <span className="text-[#4ade80]">●</span> alle systemer
            </span>
            <a className="cursor-pointer hover:text-white">
              norsk · english →
            </a>
          </div>
        </aside>

        {/* Login-form (lys) */}
        <main className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight">
              Velkommen tilbake.
            </h1>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Logg inn for å fortsette. Har du ikke konto?{" "}
              <a className="cursor-pointer font-medium text-primary hover:underline">
                Opprett en →
              </a>
            </p>

            <div className="mt-8 space-y-4">
              <Field
                id="email"
                label="E-post"
                icon={<Mail size={16} strokeWidth={1.5} />}
                value="akgolfgroup@gmail.com"
                type="email"
                hint={
                  <>
                    Vi har gjenkjent deg som{" "}
                    <b className="font-semibold text-primary">
                      Anders K. · coach @ GFGK
                    </b>
                  </>
                }
                focused
              />

              <Field
                id="password"
                label="Passord"
                icon={<Lock size={16} strokeWidth={1.5} />}
                value="••••••••••••"
                type="password"
                trailing={
                  <a className="cursor-pointer text-[12px] font-medium text-primary hover:underline">
                    Glemt det?
                  </a>
                }
              />

              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Hold meg innlogget på denne enheten
              </label>

              <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Logg inn
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                eller fortsett med
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SsoButton>
                <Mail size={16} strokeWidth={1.5} className="text-primary" />
                Magisk lenke
              </SsoButton>
              <SsoButton>
                <span className="rounded-sm bg-[#FF5B24] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white">
                  vipps
                </span>
                Vipps Logg inn
              </SsoButton>
              <button className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-[#39134C] bg-[#39134C] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
                <span className="rounded-sm bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#39134C]">
                  BankID
                </span>
                Logg inn med BankID
              </button>
            </div>

            <p className="mt-6 text-center font-mono text-[10px] leading-[1.6] tracking-[0.02em] text-muted-foreground">
              Ved innlogging samtykker du til{" "}
              <a className="cursor-pointer text-primary hover:underline">
                brukervilkår
              </a>{" "}
              og{" "}
              <a className="cursor-pointer text-primary hover:underline">
                personvern
              </a>
              . Underdomenenavn vises etter login.
            </p>

            <div className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
              <ShieldCheck size={12} strokeWidth={1.5} />
              SSL/TLS 1.3 · sikker tilkobling
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[22px] font-medium leading-none -tracking-tight text-accent">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.06em] text-white/55">
        {label}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  value,
  type,
  hint,
  trailing,
  focused = false,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  type: "email" | "password" | "text";
  hint?: React.ReactNode;
  trailing?: React.ReactNode;
  focused?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          {label}
        </label>
        {trailing}
      </div>
      <div
        className={`mt-1.5 flex items-center gap-2.5 rounded-md border bg-card px-3 py-2.5 transition-colors ${
          focused ? "border-primary ring-2 ring-primary/20" : "border-input"
        }`}
      >
        <span className="text-muted-foreground">{icon}</span>
        <input
          id={id}
          type={type}
          defaultValue={value}
          autoComplete="off"
          className="w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {hint && (
        <div className="mt-1.5 text-[12px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

function SsoButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
      {children}
    </button>
  );
}
