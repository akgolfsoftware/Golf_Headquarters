/**
 * PILOT — Auth · BankID (ekstern flow i AK Golf-omslag)
 * Bygd direkte fra wireframe/design-files-v2/screens/64-auth-bankid.html
 * URL: /auth-bankid-demo
 *
 * Anti-state-katalog: én produksjonsskjerm — BankID-host
 * embedded i forelder-samtykke-flow for U18-spillere.
 */

import {
  Check,
  X,
  Smartphone,
  Lock,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function AuthBankidDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
        {/* Brand-panel (mørk) */}
        <aside className="relative hidden flex-col justify-between bg-[#0A2A1F] p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary font-display text-[14px] font-semibold text-primary-foreground">
              AK
            </div>
            <div className="font-display text-[15px] font-medium tracking-tight">
              AK Golf
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.06em] text-white/55">
                / identitets-bekreftelse
              </span>
            </div>
          </div>

          <div className="max-w-[440px]">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Hvorfor BankID?
            </div>
            <h2 className="mt-4 font-display text-[34px] font-medium leading-[1.2] tracking-tight">
              Du gir{" "}
              <em className="italic text-accent">samtykke på vegne av</em> et
              mindreårig barn.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.6] text-white/70">
              Norsk lov krever sterk identifisering når foreldre samtykker til
              behandling av barns data. BankID gir oss kryptografisk bevis på
              at det er deg — uten at vi lagrer fnr eller passord.
            </p>

            <div className="mt-6 rounded-md border border-accent/20 bg-accent/8 p-4">
              <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                Hva vi henter inn
              </div>
              <ul className="space-y-2 text-[12.5px] leading-[1.5] text-white/85">
                <ConsentRow ok>
                  <b className="font-semibold text-white">Fullt navn</b> — for
                  samtykke-loggen
                </ConsentRow>
                <ConsentRow ok>
                  <b className="font-semibold text-white">Fødselsår</b> — kun
                  året, ikke dato
                </ConsentRow>
                <ConsentRow ok>
                  <b className="font-semibold text-white">Tidsstempel + IP</b>{" "}
                  — for revisjon
                </ConsentRow>
                <ConsentRow ok={false}>
                  <b className="font-semibold text-white/65">IKKE fnr</b> —
                  kun hash lagres
                </ConsentRow>
              </ul>
            </div>

            <div className="mt-5 rounded-r-md border-l-2 border-accent bg-white/5 p-4">
              <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                Tilbake-flyt
              </div>
              <p className="text-[12px] leading-[1.55] text-white/75">
                Etter signering går du tilbake til{" "}
                <code className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">
                  /onboarding/forelder/4
                </code>
                . Tar normalt 20–40 sekunder.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.04em] text-white/50">
            <span>
              Levert av{" "}
              <b className="font-semibold text-white">
                BankID v2 · Vipps MobilePay AS
              </b>
            </span>
            <a className="cursor-pointer hover:text-white">Personvern →</a>
          </div>
        </aside>

        {/* BankID-host (beige) */}
        <main className="relative flex items-center justify-center bg-[#F5F1EC] p-6">
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-sm border border-[#E8E2DA] bg-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-[#6B6457]">
            <Lock size={10} strokeWidth={1.5} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2D6B4C]" />
            Sikker · SSL/TLS 1.3
          </div>

          <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-[#E8E2DA] bg-white shadow-xl">
            {/* BankID-header */}
            <div className="flex items-center justify-between bg-[#39134C] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="rounded-sm bg-white px-2 py-1 font-mono text-[13px] font-bold tracking-tight text-[#39134C]">
                  BankID
                </span>
                <span className="font-display text-[14px] font-medium tracking-tight">
                  Personlig pålogging
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-white/70">
                eIDAS Høy
              </span>
            </div>

            {/* Body */}
            <div className="px-7 py-7">
              {/* Merchant */}
              <div className="mb-5 flex items-center gap-3 rounded-md bg-[#FAF7F2] p-3.5">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-[#1A1916] font-display text-[14px] font-semibold text-white">
                  AK
                </div>
                <div className="min-w-0">
                  <b className="block text-[14px] font-semibold text-[#1A1916]">
                    AK Golf AS (org.nr 928 451 002)
                  </b>
                  <small className="mt-0.5 block font-mono text-[10px] tracking-[0.02em] text-[#6B6457]">
                    ber om samtykke for Eira H. (f. 2009) · GDPR art. 8
                  </small>
                </div>
              </div>

              {/* Action */}
              <div className="px-2 pb-3 pt-1 text-center">
                <h2 className="font-display text-[22px] font-medium leading-snug tracking-tight text-[#1A1916]">
                  Bekreft identitet
                </h2>
                <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.55] text-[#6B6457]">
                  Du gir samtykke til behandling av data for ditt barn. Velg
                  BankID-metode under.
                </p>
              </div>

              {/* Fnr */}
              <div className="mt-4 flex flex-col gap-1.5 rounded-md border-[1.5px] border-[#39134C] bg-white px-4 py-3.5">
                <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#39134C]">
                  Personnummer (11 siffer)
                </label>
                <input
                  type="text"
                  defaultValue="14•••• ••642"
                  className="border-0 bg-transparent p-0 font-mono text-[18px] font-medium tracking-[0.06em] text-[#1A1916] outline-none"
                />
                <div className="font-mono text-[10px] tracking-[0.02em] text-[#6B6457]">
                  Tastet inn · maskert · sendes kryptert til BankID
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-3.5 grid grid-cols-2 gap-1.5">
                <BidTab active>
                  BankID på mobil
                  <small className="mt-0.5 block font-mono text-[9px] font-medium uppercase tracking-[0.04em] opacity-70">
                    anbefalt
                  </small>
                </BidTab>
                <BidTab>
                  BankID-brikke
                  <small className="mt-0.5 block font-mono text-[9px] font-medium uppercase tracking-[0.04em] opacity-70">
                    kodebrikke
                  </small>
                </BidTab>
              </div>

              {/* Mobile pending */}
              <div className="mt-4 flex items-center gap-3.5 rounded-md border border-[#E8E2DA] bg-[#FAF7F2] p-4">
                <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-[#39134C] text-white shadow-[0_0_0_0_rgba(57,19,76,0.4)] animate-pulse">
                  <Smartphone size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <b className="block text-[13px] font-semibold text-[#1A1916]">
                    Sjekk mobilen din nå.
                  </b>
                  <small className="block font-mono text-[10px] leading-[1.5] tracking-[0.02em] text-[#6B6457]">
                    En melding er sendt til mobilnummer på +47 9•• •• 218.
                    Bekreft i BankID-appen.
                  </small>
                </div>
                <div className="rounded-sm bg-white px-2.5 py-1.5 font-mono text-[13px] font-semibold tracking-[0.04em] text-[#39134C]">
                  0:47
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#39134C] px-4 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
                  Jeg har bekreftet i appen
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
                <button className="px-4 py-2.5 text-[12px] font-medium text-[#6B6457] underline transition-opacity hover:opacity-80">
                  Avbryt og gå tilbake
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8E2DA] bg-[#FAF7F2] px-5 py-3.5 font-mono text-[10px] tracking-[0.04em] text-[#6B6457]">
              <span>Token #BID-7e2a44f3 · 90s</span>
              <a className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#39134C] underline">
                <HelpCircle size={11} strokeWidth={1.5} />
                Hjelp · 815 11 030
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ConsentRow({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <Check size={14} strokeWidth={1.5} className="mt-0.5 text-accent" />
      ) : (
        <X
          size={14}
          strokeWidth={1.5}
          className="mt-0.5 text-[#ffd0d0]"
        />
      )}
      <span className={ok ? "" : "opacity-70"}>{children}</span>
    </li>
  );
}

function BidTab({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  const base =
    "rounded-md border px-3 py-2.5 text-center text-[12px] font-semibold transition-colors";
  return active ? (
    <button
      className={`${base} border-[#39134C] bg-[#39134C] text-white`}
    >
      {children}
    </button>
  ) : (
    <button
      className={`${base} border-[#E8E2DA] bg-[#FAF7F2] text-[#6B6457] hover:bg-white`}
    >
      {children}
    </button>
  );
}
