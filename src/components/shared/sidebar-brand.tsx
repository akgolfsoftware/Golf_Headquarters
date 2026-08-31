/**
 * SidebarBrand — sentrert merkevare-block for ALLE sidebars.
 *
 * Mønster:
 *   [ak-logo med lime-prikk]
 *   APP-NAVN · ROLLE
 *
 * Brukes konsistent i:
 *  - PlayerHQ sidebar (variant="player")
 *  - AgencyOS sidebar (variant="coach")
 *  - Foreldreportal sidebar (variant="parent")
 *  - Mobile drawers (samme komponent, justerbart via prop)
 *
 * Logo: /logos/paper/ak-golf-logo-mono-paper.svg (paper wordmark på mørk flate).
 * Bakgrunn forventes mørk (Paper rail #141413).
 */

import Link from "next/link";
import Image from "next/image";
import { TL } from "@/lib/v2/train-lock";


export type SidebarBrandVariant = "player" | "coach" | "parent";

interface SidebarBrandProps {
  /** Hva slags portal — bestemmer eyebrow-tekst */
  variant: SidebarBrandVariant;
  /** Rolle-tekst etter "·" — f.eks. "HEAD COACH", "SPILLER", "PRO", "FORELDER" */
  role?: string;
  /** Hvor logo skal lenke (default: rot-rute for varianten) */
  href?: string;
  /** Logo-bredde i piksler (default 56) */
  logoWidth?: number;
  /** Ekstra className for ytre <Link> */
  className?: string;
}

const APP_LABEL: Record<SidebarBrandVariant, string> = {
  player: "PLAYERHQ",
  coach: "AGENCYOS",
  parent: "FORELDREPORTAL",
};

const DEFAULT_HREF: Record<SidebarBrandVariant, string> = {
  player: "/portal",
  coach: "/admin",
  parent: "/forelder",
};

export function SidebarBrand({
  variant,
  role,
  href,
  logoWidth = 56,
  className = "",
}: SidebarBrandProps) {
  const linkHref = href ?? DEFAULT_HREF[variant];
  const appLabel = APP_LABEL[variant];
  const subtitle = role ? `${appLabel} · ${role}` : appLabel;

  return (
    <Link
      href={linkHref}
      aria-label={`AK Golf — ${appLabel}`}
      className={`flex flex-col items-center gap-2 py-2 no-underline ${className}`.trim()}
    >
      <Image
        src="/logos/paper/ak-golf-logo-mono-paper.svg"
        alt=""
        width={logoWidth}
        height={Math.round(logoWidth * (470 / 538))}
        priority
        aria-hidden
      />
      <span
        style={{
          fontFamily: "var(--tl-font-mono)",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: TL.fill,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {subtitle}
      </span>
    </Link>
  );
}
