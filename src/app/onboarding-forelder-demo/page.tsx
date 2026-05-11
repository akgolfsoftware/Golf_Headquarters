/**
 * Onboarding 4/4 — Forelder-samtykke (U18)
 * Bygd fra wireframe/design-files-v2/screens/34-onboarding-forelder-samtykke.html
 * URL: /onboarding-forelder-demo
 */

import { Mail } from "lucide-react";

export default function OnboardingForelderDemo() {
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
                AK Golf HQ
              </div>
            </div>

            <div>
              <h2 className="font-display text-[28px] font-medium leading-[1.1] tracking-tight">
                Du er foreldre — <em className="italic font-normal text-accent">du bestemmer.</em>
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-[rgba(245,244,238,0.80)]">
                Markus (16) har laget en spiller-profil. Før vi aktiverer noe som deler dataene
                hans med coach eller klubb, trenger vi din signatur — og du kan trekke samtykket
                når som helst.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Slik fungerer det
              </div>
              <HowItem n={1}>Velg hvilke formål du tillater</HowItem>
              <HowItem n={2}>Signer med BankID (sikkert & sporbar)</HowItem>
              <HowItem n={3}>Få varsel hver gang scope endres</HowItem>
            </div>

            <div className="mt-auto rounded-lg border-l-2 border-accent bg-[rgba(245,244,238,0.04)] p-4 text-[13px] italic leading-[1.6] text-[rgba(245,244,238,0.85)]">
              «Foreldre eier samtykket — ikke klubben, ikke coachen, ikke oss. Det er kjernen i
              hvordan vi bygger HQ-en.»
              <span className="mt-2 block font-mono text-[10px] not-italic uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Anders Kristiansen · Founder
              </span>
            </div>
          </aside>

          {/* Form */}
          <main className="flex flex-col gap-8 p-10">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                Steg <span className="font-semibold text-foreground">04</span> / 04
              </div>
              <div className="flex items-center gap-2">
                <Dot done />
                <Dot done />
                <Dot done />
                <Dot active />
              </div>
              <button className="rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                Avbryt & lukk
              </button>
            </div>

            <div>
              <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-tight">
                Samtykke for <em className="italic font-normal text-muted-foreground">Markus Roinås Pedersen (16)</em>
              </h1>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted-foreground">
                Vi sendte denne lenken til{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">
                  forelder.rp@vipps.no
                </code>
                . Velg granulært hva som er greit — og signer nederst. Standardvalgene er det
                vi anbefaler for en juniorspiller med klubb-tilknytning.
              </p>
            </div>

            {/* Magic-link box */}
            <div className="flex items-center gap-4 rounded-lg border border-[rgba(0,88,64,0.20)] bg-primary/5 px-4 py-4">
              <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-[13px] leading-[1.55] text-foreground">
                <b className="font-medium">Magic-link verifisert.</b> Du er pålogget som
                forelder/foresatt. Lenken utløper 13.05.2026 14:08, og kan ikke brukes på flere
                enheter samtidig.
              </div>
              <span className="rounded-md border border-[rgba(0,88,64,0.18)] bg-card px-2 py-1 font-mono text-[10px] tracking-[0.04em] text-primary">
                token tk_ek72…f81 · TTL 47:51
              </span>
            </div>

            {/* Scope list */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Velg formål du tillater
                </span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  4 valgt · 1 påkrevd
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <ScopeRow
                  on
                  required
                  name="Konto & profil"
                  description="Lagre navn, klubb, alder og handicap for å kunne logge inn og se egen progresjon."
                  meta={["Lovgrunnlag: avtale", "Lagres: kontoens levetid"]}
                />
                <ScopeRow
                  on
                  name="Deling med coach"
                  description="Tildelt coach kan se økt-notater, treningsplan og kommentarer fra coaching-board."
                  meta={["Lovgrunnlag: samtykke", "Trekkbart når som helst", "Audit-log på hver visning"]}
                />
                <ScopeRow
                  on
                  name="Video- og lydopptak fra økter"
                  description="Coach kan ta swing-video som lagres til opptaks-galleriet. Markus og du eier opptakene og kan slette dem."
                  meta={["Lovgrunnlag: samtykke", "Retention: 24 mnd", "BankID-signering kreves"]}
                />
                <ScopeRow
                  on
                  name="Helse- og bevegelsesdata"
                  description="Smerter, søvn, RPE og bevegelses-screening lagres for å justere belastning. Coach ser kun aggregater — ikke fritekst."
                  meta={["Lovgrunnlag: samtykke", "Særlig kategori", "BankID-signering kreves"]}
                />
                <ScopeRow
                  name="Deling med klubb (Gamle Fredrikstad GK)"
                  description="Klubbens trener-team får aggregerte resultater for landslags-utvelgelse og turneringsoppfølging."
                  meta={["Lovgrunnlag: samtykke", "Kun aggregert, ikke fritekst"]}
                />
                <ScopeRow
                  name="Markedsføring (e-post & nyhetsbrev)"
                  description="AK Golf HQ kan kontakte deg om nye funksjoner, klubbtilbud og turneringer. Du kan melde deg av når som helst."
                  meta={["Lovgrunnlag: samtykke", "Frekvens: maks 2/mnd"]}
                />
              </div>
            </div>

            {/* Signering */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Signering
                </span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  BankID på mobil · 2 av 2 påkrevd
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SigCard
                  label="Forelder / foresatt"
                  initials="FP"
                  name="Frode Roinås Pedersen"
                  email="forelder.rp@vipps.no"
                  signed
                />
                <SigCard
                  label="Spiller (medsamtykke fra 12 år)"
                  initials="MR"
                  name="Markus Roinås Pedersen"
                  email="markus.rp@vipps.no"
                  signed={false}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary px-4 py-3.5 text-[11px] leading-[1.7] text-muted-foreground">
              Ved å signere bekrefter du at du er foreldre eller juridisk verge for Markus
              Roinås Pedersen (f. 2010), at du har lest{" "}
              <a className="text-primary underline">personvernerklæringen</a> og{" "}
              <a className="text-primary underline">databehandleravtalen</a>, og at du kan
              trekke samtykket når som helst i Foreldre-portalen. AK Golf HQ er
              behandlingsansvarlig sammen med Gamle Fredrikstad GK (felles ansvar for
              klubb-scopes). Vi sender deg automatisk en kvittering på e-post med PDF-versjon
              av dette samtykket.
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-[11px] text-muted-foreground">
                Audit-log: consent.parental.signed · stempel registrert i Datatilsynets format
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
                  Lagre uten å signere
                </button>
                <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                  Fullfør samtykke →
                </button>
              </div>
            </div>
          </main>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-6 py-3.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>U18 · GDPR §8 (NO senker aldersgrense fra 16 til 13 for noen tjenester)</span>
          <div className="flex gap-4">
            <span>
              <b className="font-medium text-foreground">Token:</b> tk_ek72f81
            </span>
            <span>
              <b className="font-medium text-foreground">BankID:</b> live (no.bankid.no)
            </span>
            <span className="text-[#1A7D56]">● 1 av 2 signert</span>
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

function HowItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[12px] leading-[1.5] text-[rgba(245,244,238,0.80)]">
      <span className="min-w-[14px] font-mono text-[12px] font-semibold text-accent">{n}.</span>
      {children}
    </div>
  );
}

function ScopeRow({
  on = false,
  required = false,
  name,
  description,
  meta,
}: {
  on?: boolean;
  required?: boolean;
  name: string;
  description: string;
  meta: string[];
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border border-border bg-card px-4 py-3.5">
      <div
        className={`relative mt-0.5 h-5 w-9 rounded-full border-[1.5px] ${
          on
            ? required
              ? "border-[var(--ink-disabled,#C4C0B8)] bg-[var(--ink-disabled,#C4C0B8)] opacity-70"
              : "border-primary bg-primary"
            : "border-border bg-secondary"
        }`}
      >
        <span
          className={`absolute top-[1px] h-3.5 w-3.5 rounded-full border bg-white transition-all ${
            on ? "left-[18px] border-primary" : "left-[1px] border-border"
          }`}
        />
      </div>
      <div>
        <div className="text-[13px] font-medium leading-tight text-foreground">{name}</div>
        <div className="mt-1 max-w-[560px] text-[12px] leading-[1.5] text-muted-foreground">
          {description}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
          {meta.map((m, i) => (
            <span key={m} className="flex items-center gap-3">
              {i > 0 && <span className="text-border">·</span>}
              {m}
            </span>
          ))}
        </div>
      </div>
      {required && (
        <span className="self-start rounded-md bg-[#FFF0D6] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-[#B8852A]">
          Påkrevd
        </span>
      )}
    </div>
  );
}

function SigCard({
  label,
  initials,
  name,
  email,
  signed,
}: {
  label: string;
  initials: string;
  name: string;
  email: string;
  signed: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span
          className={`grid h-8 w-8 place-items-center rounded-full font-display text-[11px] font-semibold ${
            signed
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-primary"
          }`}
        >
          {initials}
        </span>
        <div>
          <div className="text-[13px] font-medium text-foreground">{name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{email}</div>
        </div>
      </div>
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-[12px] ${
          signed
            ? "border-border bg-secondary text-foreground"
            : "border-[rgba(184,133,42,0.20)] bg-[#FFF0D6] text-[#6F500B]"
        }`}
      >
        <span
          className={`grid h-6 w-6 place-items-center rounded-md font-mono text-[9px] font-bold text-white ${
            signed ? "bg-[#0058A3]" : "bg-[#B8852A]"
          }`}
        >
          BID
        </span>
        <span className="flex-1">
          {signed ? "Signert med BankID — 11.05.2026 14:11" : "Venter på Markus signatur"}
        </span>
      </div>
      <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        {signed ? (
          <>
            <span className="font-semibold text-[#1A7D56]">✓ verifisert</span> · sha-256 d9c7…42b8 · IP 84.214.…
          </>
        ) : (
          "Notifikasjon sendt 14:09 · varsel også til foreldre ved fullføring"
        )}
      </span>
    </div>
  );
}
