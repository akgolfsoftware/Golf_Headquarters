/**
 * PILOT — Auth · Velg organisasjon (multi-tilhørighet)
 * Bygd direkte fra wireframe/design-files-v2/screens/65-auth-velg-organisasjon.html
 * URL: /auth-org-demo
 *
 * Anti-state-katalog: én produksjonsskjerm — etter login, før app-shell.
 * Viser alle tilhørigheter for en bruker som er coach, eier, forelder.
 */

import { Search, LogOut, ChevronRight, Command } from "lucide-react";

type Role = "coach" | "player" | "admin" | "parent";

type Org = {
  initials: string;
  name: string;
  detail: string;
  role: Role;
  roleLabel: string;
  tier?: "Pro" | "Free";
  sso?: string;
  active?: boolean;
  crest: "primary" | "amber" | "red" | "slate" | "purple";
};

const featured: Org[] = [
  {
    initials: "GF",
    name: "Gamle Fredrikstad Golfklubb",
    detail: "gfgk.no · 14 aktive spillere · medlem siden 2019",
    role: "coach",
    roleLabel: "Hovedcoach",
    tier: "Pro",
    sso: "SAML SSO",
    active: true,
    crest: "primary",
  },
  {
    initials: "AK",
    name: "AK Golf · personlig virksomhet",
    detail: "akgolf.no · 4 eksterne spillere · org.nr 928 451 002",
    role: "coach",
    roleLabel: "Eier",
    tier: "Pro",
    crest: "purple",
  },
];

const others: Org[] = [
  {
    initials: "MU",
    name: "Mulligan Indoor Golf Simulators",
    detail: "mulligan.no · simulator-anlegg · drift",
    role: "admin",
    roleLabel: "Drift",
    sso: "Google SSO",
    crest: "amber",
  },
  {
    initials: "WA",
    name: "WANG Toppidrett Fredrikstad",
    detail: "wang.no · 9 elever · idrettslinje golf",
    role: "coach",
    roleLabel: "Coach",
    sso: "FEIDE",
    crest: "slate",
  },
  {
    initials: "NG",
    name: "Norges Golfforbund",
    detail: "golfforbundet.no · trener-lisens nivå 3",
    role: "admin",
    roleLabel: "Innsyn",
    sso: "FEIDE",
    crest: "red",
  },
];

export default function AuthOrgDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[920px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-[14px] font-semibold text-primary-foreground">
                AK
              </div>
              <div className="font-display text-[16px] font-medium tracking-tight text-foreground">
                AK Golf
                <small className="block font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  velg organisasjon
                </small>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1 pl-1 pr-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-[#1A7D56] font-display text-[11px] font-semibold text-white">
                AK
              </div>
              <div className="leading-tight">
                <b className="text-[13px] font-semibold text-foreground">
                  Anders Kristiansen
                </b>
                <small className="block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                  akgolfgroup@gmail.com · siste login 11.05
                </small>
              </div>
              <button className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                <LogOut size={11} strokeWidth={1.5} />
                Logg ut
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="px-8 pb-2 pt-7">
            <h1 className="font-display text-[28px] font-medium leading-tight tracking-tight text-foreground">
              Hvilken organisasjon vil du jobbe i?
            </h1>
            <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
              Du har 5 tilhørigheter på 4 klubber + 1 personlig
              coach-virksomhet. Velg én — du kan bytte når som helst fra
              app-headeren.
            </p>
          </div>

          {/* Search */}
          <div className="mx-8 mt-4 flex items-center gap-2.5 rounded-md border border-border bg-background px-3.5 py-2.5">
            <Search
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <input
              defaultValue=""
              placeholder="Søk klubb, virksomhet eller rolle…"
              className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>

          {/* Mest brukt */}
          <SectionLabel title="Mest brukt" sub="siste 30 dager" />
          <div className="px-6">
            {featured.map((org) => (
              <OrgRow key={org.name} org={org} />
            ))}
          </div>

          {/* Andre */}
          <SectionLabel
            title="Andre tilhørigheter"
            sub="3 organisasjoner"
          />
          <div className="px-6 pb-2">
            {others.map((org) => (
              <OrgRow key={org.name} org={org} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border bg-background px-8 py-5">
            <div className="font-mono text-[11px] leading-[1.5] tracking-[0.02em] text-muted-foreground">
              <b className="font-semibold text-foreground">
                Mangler en organisasjon?
              </b>
              <br />
              Be klubb-admin om å invitere deg, eller koble til via
              invitasjon-lenke.
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                Koble til ny klubb
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Fortsett til GFGK
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-baseline justify-between px-8 pb-1.5 pt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
      <span>{title}</span>
      <small className="font-medium tracking-[0.02em]">{sub}</small>
    </div>
  );
}

function OrgRow({ org }: { org: Org }) {
  const crestClass: Record<Org["crest"], string> = {
    primary: "bg-gradient-to-br from-[#0A3C2F] to-[#1A7D56]",
    amber: "bg-gradient-to-br from-[#7d5814] to-[#B8852A]",
    red: "bg-gradient-to-br from-[#5e2b2b] to-[#B04444]",
    slate: "bg-gradient-to-br from-[#3a4f5c] to-[#5a7180]",
    purple: "bg-gradient-to-br from-[#39134C] to-[#6A2C8A]",
  };

  const roleClass: Record<Role, string> = {
    coach: "bg-primary/10 text-primary",
    player: "bg-[rgba(184,133,42,0.10)] text-[#7d5814]",
    admin: "bg-[rgba(57,19,76,0.10)] text-[#39134C]",
    parent: "bg-[rgba(176,68,68,0.10)] text-destructive",
  };

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-3.5 rounded-md p-2.5 transition-colors ${
        org.active
          ? "bg-accent/15 outline outline-[1.5px] -outline-offset-[1.5px] outline-primary"
          : "hover:bg-background"
      } cursor-pointer`}
    >
      <div
        className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-md font-display text-[14px] font-semibold tracking-tight text-white ${crestClass[org.crest]}`}
      >
        {org.initials}
      </div>
      <div className="min-w-0">
        <b className="block text-[14.5px] font-semibold tracking-tight text-foreground">
          {org.name}
        </b>
        <small className="block font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
          {org.detail}
        </small>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`rounded-sm px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] ${roleClass[org.role]}`}
        >
          {org.roleLabel}
        </span>
        {org.tier && (
          <span className="rounded-sm bg-[#1A1916] px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] text-white">
            {org.tier}
          </span>
        )}
        {org.sso && (
          <span className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {org.sso}
          </span>
        )}
      </div>
      <div
        className={`font-mono text-[12px] ${org.active ? "text-primary" : "text-muted-foreground"}`}
      >
        {org.active ? (
          <span className="inline-flex items-center gap-1">
            <Command size={12} strokeWidth={1.5} />↵
          </span>
        ) : (
          <ChevronRight size={14} strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
