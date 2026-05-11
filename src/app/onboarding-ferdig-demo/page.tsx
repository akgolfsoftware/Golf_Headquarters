/**
 * Onboarding 5/5 — Ferdig & første sesjon
 * Bygd fra wireframe/design-files-v2/screens/35-onboarding-ferdig.html
 * URL: /onboarding-ferdig-demo
 */

import {
  Check,
  Clock,
  ListTodo,
  Calendar,
  Activity,
  Mail,
  FileText,
  HelpCircle,
  Shield,
  Globe,
  AlertCircle,
} from "lucide-react";

export default function OnboardingFerdigDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEAE2] to-[#F5F2EA] p-8 sm:p-9">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl bg-background shadow-[0_24px_60px_-20px_rgba(10,31,24,0.18)]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-[#0A1F18] px-10 pb-12 pt-14 text-[#F5F4EE] sm:px-16">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(209,248,67,0.20) 0%, transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-[280px] w-[280px] rounded-full border border-[rgba(245,244,238,0.06)]"
          />

          {/* Confetti */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute h-3.5 w-2 rotate-[18deg] rounded-sm bg-accent" style={{ left: "8%", top: "18%" }} />
            <span className="absolute h-1.5 w-2.5 -rotate-[22deg] rounded-sm bg-[#1A7D56]" style={{ left: "14%", top: "62%" }} />
            <span className="absolute h-3 w-1.5 rotate-[40deg] rounded-sm bg-accent opacity-55" style={{ left: "22%", top: "30%" }} />
            <span className="absolute h-1.5 w-3 -rotate-[12deg] rounded-sm bg-[#B8852A] opacity-55" style={{ left: "40%", top: "78%" }} />
            <span className="absolute h-2.5 w-1.5 rotate-[30deg] rounded-sm bg-white opacity-35" style={{ right: "18%", top: "22%" }} />
            <span className="absolute h-2 w-2.5 -rotate-[30deg] rounded-sm bg-accent" style={{ right: "32%", top: "68%" }} />
          </div>

          <div className="relative z-10 mb-9 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent font-display text-[13px] font-semibold text-[#0A1F18]">
                AK
              </div>
              <div className="font-display text-[15px] font-semibold tracking-tight">
                AK Golf HQ
              </div>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
              Steg <span className="font-semibold text-accent">04</span> / 04 · ferdig
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_360px]">
            <div>
              <h1 className="font-display text-[48px] font-medium leading-[1.02] tracking-tight sm:text-[56px]">
                Velkommen ombord,{" "}
                <em className="italic font-normal text-accent">Markus.</em>
              </h1>
              <p className="mt-4 max-w-[540px] text-[15px] leading-[1.6] text-[rgba(245,244,238,0.80)]">
                Profilen din er klar, Frode (far) har signert samtykket, og Gamle Fredrikstad
                GK er koblet på. Vi har funnet 3 coacher som matcher fokuset ditt (TEK ·
                putting/short game). Velg den første økten under når du er klar.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <HeroChip>PlayerHQ aktiv</HeroChip>
                <HeroChip>U18 · forelder-samtykke ✓</HeroChip>
                <HeroChip dim>Klubb: Gamle Fredrikstad GK</HeroChip>
                <HeroChip dim>HCP 14.0</HeroChip>
                <HeroChip dim>TEK-fokus</HeroChip>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <CheckRow
                title="Konto opprettet"
                meta="PlayerHQ · markus.rp@vipps.no · NO-region"
              />
              <CheckRow
                title="Profil & pyramide kalibrert"
                meta="HCP 14.0 · fokus TEK · 4 spesialiseringer"
              />
              <CheckRow
                title="Forelder-samtykke signert"
                meta="5 scopes aktivert · BankID 11.05.2026 14:11"
              />
              <CheckRow
                title="Markus medsamtykke venter"
                meta="notifikasjon sendt · forfaller 13.05 14:09"
                warn
              />
            </div>
          </div>
        </div>

        {/* Next actions */}
        <div className="grid grid-cols-1 gap-8 px-10 py-10 sm:px-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tre ting du kan gjøre nå
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <NextCard
                featured
                icon={<Clock size={20} strokeWidth={1.5} />}
                title="Book første økt"
                titleEm="med Anders"
                description="PGA Class A pro, hjemmebane Mulligan Borre. Vi har 4 ledige tider denne uka som matcher fokuset ditt."
                metaLeft="60 min · fra 1450 kr"
                metaRight="Book →"
              />
              <NextCard
                icon={<ListTodo size={20} strokeWidth={1.5} />}
                title="Sett opp"
                titleEm="treningsplan"
                description="Periodiserings-agenten lager et 8-ukers løp basert på TEK-fokus og turneringen din 22.06."
                metaLeft="Tar 3 min · AK-Mentor"
                metaRight="Start →"
              />
              <NextCard
                icon={<Calendar size={20} strokeWidth={1.5} />}
                title="Sjekk"
                titleEm="kalender"
                description="Vi har lagt inn turneringen 22.06 og forberedelses-blokker. Juster fri-dager og varsler."
                metaLeft="3 events · 1 reminder"
                metaRight="Åpne →"
              />
              <NextCard
                icon={<Activity size={20} strokeWidth={1.5} />}
                title="Sjekk inn"
                titleEm="fysisk form"
                description="Første helse-baseline tar 2 minutter. RPE, søvn, smerter — danner grunnlaget for belastnings-modellen."
                metaLeft="Helse-scope aktiv"
                metaRight="Start →"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ResBlock label="Vi har sendt deg" count="3 e-poster">
              <ResRow icon={<Mail size={14} strokeWidth={1.5} />} name="Velkommen til AK Golf HQ" sub="markus.rp@vipps.no · 14:11" />
              <ResRow icon={<FileText size={14} strokeWidth={1.5} />} name="Samtykke-kvittering (PDF)" sub="forelder.rp@vipps.no · 14:11" />
              <ResRow icon={<Calendar size={14} strokeWidth={1.5} />} name="Kalender-invitasjon: NM Junior" sub="iCal · 22.06.2026" />
            </ResBlock>
            <ResBlock label="Hjelp & ressurser" count="always-on">
              <ResRow icon={<HelpCircle size={14} strokeWidth={1.5} />} name="Spør AK-Mentor" sub="chat · øverst til høyre" />
              <ResRow icon={<Shield size={14} strokeWidth={1.5} />} name="Personvern & rettigheter" sub="/forelder/samtykke" />
              <ResRow icon={<Globe size={14} strokeWidth={1.5} />} name="Bytt språk eller region" sub="NO · EU-residency" />
            </ResBlock>
          </div>
        </div>

        {/* Footer band */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-secondary px-10 py-4 sm:px-16">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Auto-redirect til /dashboard om{" "}
              <b className="font-mono font-medium text-foreground">11s</b>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              first_run.completed · audit-log
            </span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
              Stopp auto-redirect
            </button>
            <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
              Gå til dashboard nå →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroChip({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
        dim
          ? "bg-[rgba(245,244,238,0.10)] text-[rgba(245,244,238,0.75)]"
          : "bg-accent text-[#0A1F18]"
      }`}
    >
      {children}
    </span>
  );
}

function CheckRow({
  title,
  meta,
  warn = false,
}: {
  title: string;
  meta: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 text-[13px] leading-[1.5] text-[rgba(245,244,238,0.85)]">
      <span
        className={`mt-0.5 grid h-5.5 w-5.5 flex-shrink-0 place-items-center rounded-full ${
          warn
            ? "bg-[rgba(184,133,42,0.20)] text-[#F5C557]"
            : "bg-[rgba(209,248,67,0.22)] text-accent"
        }`}
        style={{ width: "22px", height: "22px" }}
      >
        {warn ? (
          <AlertCircle size={13} strokeWidth={2} />
        ) : (
          <Check size={13} strokeWidth={3} />
        )}
      </span>
      <div>
        <b className="font-medium text-[#F5F4EE]">{title}</b>
        <span className="mt-0.5 block font-mono text-[10px] tracking-[0.04em] text-[rgba(245,244,238,0.55)]">
          {meta}
        </span>
      </div>
    </div>
  );
}

function NextCard({
  featured = false,
  icon,
  title,
  titleEm,
  description,
  metaLeft,
  metaRight,
}: {
  featured?: boolean;
  icon: React.ReactNode;
  title: string;
  titleEm: string;
  description: string;
  metaLeft: string;
  metaRight: string;
}) {
  return (
    <button
      className={`flex flex-col gap-2.5 rounded-lg border p-5 text-left transition-all hover:-translate-y-0.5 ${
        featured
          ? "border-[#003B2A] bg-gradient-to-br from-primary to-[#003B2A] text-[#F5F4EE] hover:shadow-[0_8px_20px_rgba(0,88,64,0.30)]"
          : "border-border bg-card text-foreground hover:border-primary hover:shadow-[0_8px_20px_rgba(0,88,64,0.10)]"
      }`}
    >
      <div
        className={`grid h-9 w-9 place-items-center rounded-lg ${
          featured ? "bg-accent text-[#0A1F18]" : "bg-primary/5 text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="font-display text-[18px] font-medium leading-tight tracking-tight">
        {title}{" "}
        <em
          className={`italic font-normal ${
            featured ? "text-[rgba(255,255,255,0.65)]" : "text-muted-foreground"
          }`}
        >
          {titleEm}
        </em>
      </h3>
      <p
        className={`text-[12px] leading-[1.55] ${
          featured ? "text-[rgba(255,255,255,0.75)]" : "text-muted-foreground"
        }`}
      >
        {description}
      </p>
      <div
        className={`mt-2 flex items-center justify-between border-t pt-2 font-mono text-[10px] tracking-[0.04em] ${
          featured
            ? "border-[rgba(255,255,255,0.10)] text-[rgba(255,255,255,0.6)]"
            : "border-border text-muted-foreground"
        }`}
      >
        <span>{metaLeft}</span>
        <span
          className={`font-semibold tracking-[0.04em] ${
            featured ? "text-accent" : "text-primary"
          }`}
        >
          {metaRight}
        </span>
      </div>
    </button>
  );
}

function ResBlock({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-4">
      <div className="mb-2.5 flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function ResRow({
  icon,
  name,
  sub,
}: {
  icon: React.ReactNode;
  name: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/40 py-2 last:border-b-0">
      <span className="grid h-6.5 w-6.5 flex-shrink-0 place-items-center rounded-md border border-border bg-card text-primary" style={{ width: "26px", height: "26px" }}>
        {icon}
      </span>
      <div className="flex-1 text-[12px] font-medium leading-tight text-foreground">
        {name}
        <small className="mt-0.5 block font-mono text-[11px] font-normal tracking-[0.02em] text-muted-foreground">
          {sub}
        </small>
      </div>
      <span className="font-mono text-[13px] text-muted-foreground/60">→</span>
    </div>
  );
}
