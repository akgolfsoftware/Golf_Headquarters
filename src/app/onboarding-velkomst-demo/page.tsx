/**
 * Onboarding 1/4 — Velkomst & rolle
 * Bygd fra wireframe/design-files-v2/screens/31-onboarding-velkomst.html
 * URL: /onboarding-velkomst-demo
 */

import { User, GraduationCap, Users, Info, LogOut } from "lucide-react";

export default function OnboardingVelkomstDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEAE2] to-[#F5F2EA] p-8 sm:p-9">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl bg-background shadow-[0_24px_60px_-20px_rgba(10,31,24,0.18)]">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
          {/* Narrative pane */}
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
              <h2 className="font-display text-[32px] font-medium leading-[1.05] tracking-tight">
                La oss <em className="italic font-normal text-accent">finne din vei</em> inn i AK Golf HQ.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-[rgba(245,244,238,0.80)]">
                Vi tilpasser hva du ser, hvilke verktøy som er aktive og hvordan vi spør om
                samtykke — basert på rollen din. Du kan endre dette senere i innstillinger.
              </p>
            </div>

            <div className="mt-auto rounded-lg border-l-2 border-accent bg-[rgba(245,244,238,0.04)] p-4 text-[13px] italic leading-[1.6] text-[rgba(245,244,238,0.85)]">
              «Hver spiller, coach og forelder skal kjenne at HQ-en er bygget for akkurat
              dem — ikke for et generelt golftilbud.»
              <span className="mt-2 block font-mono text-[10px] not-italic uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Anders Kristiansen · Founder
              </span>
            </div>
          </aside>

          {/* Form pane */}
          <main className="flex flex-col gap-8 p-10">
            {/* Top: progress */}
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                Steg <span className="font-semibold text-foreground">01</span> / 04
              </div>
              <div className="flex items-center gap-2">
                <Dot active />
                <Dot />
                <Dot />
                <Dot />
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                <LogOut size={14} strokeWidth={1.5} />
                Logg ut
              </button>
            </div>

            <div>
              <h1 className="font-display text-[36px] font-medium leading-[1.1] tracking-tight">
                Hei Markus — <em className="italic font-normal text-muted-foreground">hvem er du her som?</em>
              </h1>
              <p className="mt-3 max-w-[560px] text-[14px] leading-[1.6] text-muted-foreground">
                Vi gjenkjenner e-posten din (markus.rp@vipps.no) — men vi vet ikke ennå om du
                selv er spiller, coach eller forelder på vegne av en spiller under 18 år.
                Velg én — du kan koble på flere roller senere.
              </p>
            </div>

            {/* Roles */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <RoleCard active icon={<User size={22} strokeWidth={1.5} />} tag="Player HQ" title="Jeg er spiller">
                Jeg trener, spiller turneringer og vil følge min egen progresjon i pyramiden.
              </RoleCard>
              <RoleCard icon={<GraduationCap size={22} strokeWidth={1.5} />} tag="Coach HQ" title="Jeg er coach">
                Jeg holder økter, har klienter og bruker AI-agenter til planlegging og oppfølging.
              </RoleCard>
              <RoleCard icon={<Users size={22} strokeWidth={1.5} />} tag="Foreldre-portal" title="Jeg er forelder">
                Mitt barn (under 18) trener her. Jeg håndterer samtykke, varsler og medlemskap.
              </RoleCard>
            </div>

            {/* Info banner */}
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-border bg-secondary px-4 py-3.5 text-[12px] leading-[1.55] text-muted-foreground">
              <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg border border-border bg-card text-primary">
                <Info size={14} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <b className="font-medium text-foreground">Flere roller?</b> En coach kan også
                være forelder for en juniorspiller — vi kobler på den andre rollen i
                innstillinger etter onboarding.
              </div>
              <button className="font-mono text-[11px] tracking-[0.04em] text-primary underline">
                Les mer
              </button>
            </div>

            {/* Foot */}
            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-[11px] text-muted-foreground">
                Roller-byttet logges i CBAC-historikken (audit-row event=role.assigned)
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
                  Hopp over
                </button>
                <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                  Fortsett som spiller →
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Meta strip */}
        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-6 py-3.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>Magic-link: markus.rp@vipps.no · verifisert 11.05.2026 14:02</span>
          <div className="flex gap-4">
            <span>
              <b className="font-medium text-foreground">cookies:</b> kun nødvendige
            </span>
            <span>
              <b className="font-medium text-foreground">språk:</b> NO
            </span>
            <span>
              <b className="font-medium text-foreground">region:</b> NO/EU
            </span>
            <span className="text-primary">● privacy-by-default</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`h-1.5 w-8 rounded-full ${active ? "bg-primary" : "bg-border"}`}
      aria-hidden="true"
    />
  );
}

function RoleCard({
  active = false,
  icon,
  tag,
  title,
  children,
}: {
  active?: boolean;
  icon: React.ReactNode;
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`flex flex-col gap-3 rounded-lg border-2 p-6 text-left transition-colors ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg ${
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {icon}
      </div>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {tag}
      </span>
      <h3 className="font-display text-[18px] font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-[12px] leading-[1.55] text-muted-foreground">{children}</p>
    </button>
  );
}
