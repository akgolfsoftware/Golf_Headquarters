"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Tier } from "@/generated/prisma/client";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { FEATURES } from "@/lib/features";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = { href: string; label: string; badge?: boolean };
type NavSection = { label?: string; items: NavItem[] };

// ---------------------------------------------------------------------------
// Navigation structure — workflow-basert: Planlegge → Gjennomføre → Evaluere
// ---------------------------------------------------------------------------

const BASE_SECTIONS: NavSection[] = [
  {
    items: [{ href: "/portal", label: "Hjem" }],
  },
  {
    label: "Planlegge",
    items: [
      { href: "/portal/tren",             label: "Treningsplan" },
      { href: "/portal/tren/aarsplan",    label: "Årsplan" },
      { href: "/portal/tren/turneringer", label: "Turneringer" },
      { href: "/portal/tren/kalender",    label: "Kalender" },
      { href: "/portal/booking/ny",       label: "Book økt" },
    ],
  },
  {
    label: "Gjennomføre",
    items: [
      { href: "/portal/tren/ovelser",  label: "Øvelser" },
      { href: "/portal/tren/tester",   label: "Tester" },
      { href: "/portal/ny-okt",        label: "Ny økt" },
      { href: "/portal/utfordringer",  label: "Utfordringer" },
    ],
  },
  {
    label: "Evaluere",
    items: [
      { href: "/portal/mal",          label: "Resultater" },
      { href: "/portal/mal/runder",   label: "Runder" },
      { href: "/portal/mal/trackman", label: "TrackMan" },
    ],
  },
  {
    label: "Coach",
    items: [
      { href: "/portal/coach",         label: "Oversikt" },
      { href: "/portal/coach/plans",   label: "Min plan" },
      { href: "/portal/coach/melding", label: "Meldinger" },
      { href: "/portal/coach/ai",      label: "AI-coach" },
      { href: "/portal/onskeligokt",   label: "Ønske om økt" },
    ],
  },
  {
    label: "Konto",
    items: [
      { href: "/portal/varsler",        label: "Varsler", badge: true },
      { href: "/portal/meg",            label: "Profil" },
      { href: "/portal/meg/abonnement", label: "Abonnement" },
    ],
  },
];

const TALENT_SECTION: NavSection = {
  label: "Talent",
  items: [
    { href: "/portal/talent/min-plan",      label: "Min plan" },
    { href: "/portal/talent/mitt-niva",     label: "Mitt nivå" },
    { href: "/portal/talent/sammenligning", label: "Sammenligning" },
  ],
};

// ---------------------------------------------------------------------------
// Active-link helper
// Bruker exact match når et href har barn i listen (for å unngå at
// f.eks. "Treningsplan" lyser opp på /portal/tren/kalender).
// ---------------------------------------------------------------------------

function buildIsActive(allHrefs: string[]) {
  return function isActive(path: string, href: string): boolean {
    if (href === "/portal") return path === href;
    const hasChildren = allHrefs.some(
      (h) => h !== href && h.startsWith(href + "/"),
    );
    if (hasChildren) return path === href;
    return path === href || path.startsWith(href + "/");
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PortalSidebar({
  tier,
  varslerUlest = 0,
}: {
  tier: Tier;
  varslerUlest?: number;
}) {
  const path = usePathname();

  const sections: NavSection[] = FEATURES.TALENT
    ? [...BASE_SECTIONS, TALENT_SECTION]
    : BASE_SECTIONS;

  const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
  const isActive = buildIsActive(allHrefs);

  return (
    <aside
      aria-label="PlayerHQ sidemeny"
      className="flex w-52 shrink-0 flex-col bg-[var(--color-player-sidebar)] text-white lg:w-64"
    >
      {/* Logo */}
      <div className="px-6 py-8">
        <Link
          href="/portal"
          aria-label="AK Golf — PlayerHQ"
          className="inline-flex flex-col gap-2"
        >
          <AkGolfLogo variant="white" width={48} />
          <span className="font-display text-base font-bold leading-none tracking-tight">
            <em className="font-normal text-accent md:italic">player</em>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav
        aria-label="Hovednavigasjon"
        className="flex-1 overflow-y-auto px-4 pb-4"
      >
        {sections.map((seksjon, i) => (
          <div key={seksjon.label ?? "__hjem__"} className={i > 0 ? "mt-6" : ""}>
            {seksjon.label && (
              <div className="px-4 pb-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-white/40">
                {seksjon.label}
              </div>
            )}
            <div className="space-y-0.5">
              {seksjon.items.map((item) => {
                const aktiv = isActive(path, item.href);
                const visBadge = item.badge && varslerUlest > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={aktiv ? "page" : undefined}
                    className={`flex items-center justify-between rounded-md px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-player-sidebar)] ${
                      aktiv
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {visBadge && (
                      <span
                        aria-label={`${varslerUlest} uleste varsler`}
                        className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 font-mono text-[10px] font-semibold text-destructive-foreground"
                      >
                        {varslerUlest}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Tier-badge */}
      <div
        aria-label={`Abonnement: ${tier}`}
        className="m-4 rounded-md bg-accent/10 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        {tier}
      </div>
    </aside>
  );
}
