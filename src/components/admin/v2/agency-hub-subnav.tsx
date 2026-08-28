"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * AgencyOS hub-faner — forener overflødige menypunkter under de 5 primærjobbene.
 *
 * Kø ← AI-godkjenning · meldinger · varsler · oppfølging · oppgaver
 * Kalender ← ukegrid · booking-liste · uke-tavle · tilgjengelighet
 * Innsikt ← stall-analyse · tester · TrackMan · runder · rapporter · etterlevelse
 *
 * Én pill-rad (samme mønster som CaddieSubNavV2). Ekte navigasjon, ikke tabs state.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AgencyHubTab = {
  href: string;
  label: string;
  /** Exact match only (default: prefix). */
  exact?: boolean;
};

/** Primær «Kø» — alt som krever handling / oppmerksomhet. */
export const KO_HUB_TABS: AgencyHubTab[] = [
  { href: "/admin/godkjenninger", label: "Godkjenning" },
  { href: "/admin/innboks", label: "Innboks", exact: true },
  { href: "/admin/varsler", label: "Varsler" },
  { href: "/admin/queue", label: "Oppfølging" },
  { href: "/admin/handlingssenter", label: "Oppgaver" },
];

/** Primær «Kalender» — uke/måned + tilgjengelighet (T7: lista og tavla er pensjonert). */
export const KALENDER_HUB_TABS: AgencyHubTab[] = [
  { href: "/admin/kalender", label: "Uke", exact: true },
  { href: "/admin/kalender?visning=maned", label: "Måned" },
  { href: "/admin/availability", label: "Tilgjengelighet" },
];

/** Primær «Innsikt» — tall og analyse. */
export const INNSIKT_HUB_TABS: AgencyHubTab[] = [
  { href: "/admin/analyse", label: "Stall", exact: true },
  { href: "/admin/tester", label: "Tester" },
  { href: "/admin/trackman", label: "TrackMan" },
  { href: "/admin/runder", label: "Runder" },
  { href: "/admin/reports", label: "Rapporter" },
  { href: "/admin/analysere/compliance", label: "Etterlevelse" },
];

function erAktiv(path: string, tab: AgencyHubTab): boolean {
  if (tab.exact) return path === tab.href || path.startsWith(tab.href + "?");
  return path === tab.href || path.startsWith(tab.href + "/");
}

export function AgencyHubSubNav({
  tabs,
  ariaLabel,
}: {
  tabs: AgencyHubTab[];
  ariaLabel: string;
}) {
  const path = usePathname();
  // Lengste treff vinner (unngår at /admin/kalender matcher alt med prefix feil ved exact).
  let best: AgencyHubTab | undefined;
  for (const t of tabs) {
    if (!erAktiv(path, t)) continue;
    if (!best || t.href.length > best.href.length) best = t;
  }

  return (
    <nav
      aria-label={ariaLabel}
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 2,
        marginBottom: 12,
      }}
    >
      {tabs.map((t) => {
        const aktiv = best?.href === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={aktiv ? "page" : undefined}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 15px",
              minHeight: 44,
              borderRadius: 9999,
              color: aktiv ? TL.text : TL.mute,
              background: aktiv ? TL.elev : TL.dock,
              border: `1px solid ${aktiv ? TL.text : TL.hair}`,
              boxShadow: aktiv ? `inset 0 -2px 0 ${TL.fill}` : undefined,
              whiteSpace: "nowrap",
              textDecoration: "none",
              flex: "none",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function KoHubNav() {
  return <AgencyHubSubNav tabs={KO_HUB_TABS} ariaLabel="Kø-visninger" />;
}

export function KalenderHubNav() {
  return <AgencyHubSubNav tabs={KALENDER_HUB_TABS} ariaLabel="Kalender-visninger" />;
}

export function InnsiktHubNav() {
  return <AgencyHubSubNav tabs={INNSIKT_HUB_TABS} ariaLabel="Innsikt-visninger" />;
}
