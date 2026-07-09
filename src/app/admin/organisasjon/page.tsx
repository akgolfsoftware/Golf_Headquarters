/**
 * v2-preview: AgencyOS Organisasjon (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data samler de ekte organisasjons-flatene (/admin/organisasjon,
 * /admin/settings, /admin/klubb/innstillinger): samme requirePortalUser-guard
 * (ADMIN/COACH) og ekte Prisma-loader (location + facilities, ClubSettings-
 * singelton, ADMIN/COACH-brukere med gruppene sine). Mapper til AdminOrgV2Data
 * med ærlige tomrom — «—» der et felt mangler, aldri fabrikerte tall.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminOrgV2, type AdminOrgV2Data } from "@/components/admin/v2/AdminOrgV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organisasjon · AgencyOS (v2)" };

const TOM = "—";

/** Ærlige tilgangs-etiketter (samme som /admin/settings — ingen persistert av/på). */
const TILGANGSRADER = [
  "Spillere ser egen data",
  "Foreldre-tilgang (junior)",
  "Coacher ser hele stallen",
  "WAGR-synk automatisk",
  "Faktura synlig for spiller",
];

/** Snarveier til organisasjonens undersider — ekte ruter, ingen fabrikerte tall. */
const HANDLINGER: AdminOrgV2Data["handlinger"] = [
  { icon: "plug", tittel: "Integrasjoner", sub: "Se status og koble tjenester", href: "/admin/integrasjoner" },
  { icon: "bot", tittel: "AI-agenter", sub: "Caddie · Plan-bygger · Drill-foreslår", href: "/admin/agents" },
  { icon: "mail", tittel: "E-postmaler", sub: "Velkomst · Faktura · Booking · Reminder", href: "/admin/email-templates" },
  { icon: "shield", tittel: "Audit-log", sub: "Sikkerhetshendelser og systemspor", href: "/admin/audit-log" },
  { icon: "settings", tittel: "Innstillinger", sub: "Varsler · Personvern · Språk · Branding", href: "/admin/settings" },
  { icon: "user", tittel: "Min profil", sub: "Konto, rolle og kontaktinfo", href: "/admin/profile" },
];

export default async function V2AdminOrgPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [locations, settingsRow, teamBrukere] = await Promise.all([
    prisma.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        active: true,
        _count: { select: { facilities: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.clubSettings.findFirst(),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      select: {
        id: true,
        name: true,
        role: true,
        coachedGroups: { select: { members: { select: { userId: true } } } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  // ── Klubb-info fra ClubSettings-singelton (tomt felt → «—») ────
  const klubbInfo: AdminOrgV2Data["klubbInfo"] = {
    navn: settingsRow?.clubName || TOM,
    orgNr: settingsRow?.orgNr || TOM,
    dagligLeder: settingsRow?.dagligLeder || TOM,
    epost: settingsRow?.epost || TOM,
    telefon: settingsRow?.telefon || TOM,
    adresse: settingsRow?.adresse || TOM,
  };

  const klubber = locations.map((l) => ({
    id: l.id,
    navn: l.name,
    adresse: l.address,
    aktiv: l.active,
    fasiliteter: l._count.facilities,
  }));

  const team = teamBrukere.map((c) => {
    const unike = new Set<string>();
    for (const g of c.coachedGroups) for (const m of g.members) unike.add(m.userId);
    return {
      id: c.id,
      navn: c.name,
      rolle: c.role === "ADMIN" ? "Head coach" : "Coach",
      spillere: unike.size,
      eier: c.role === "ADMIN",
    };
  });

  const totalFasiliteter = klubber.reduce((sum, k) => sum + k.fasiliteter, 0);
  const coacher = teamBrukere.filter((c) => c.role === "COACH").length;
  const admin = teamBrukere.filter((c) => c.role === "ADMIN").length;

  const data: AdminOrgV2Data = {
    klubbInfo,
    redigerHref: "/admin/klubb/innstillinger",
    kpis: { klubber: klubber.length, fasiliteter: totalFasiliteter, coacher, admin },
    klubber,
    team,
    handlinger: HANDLINGER,
    tilgangRader: TILGANGSRADER,
    tilgangHref: "/admin/settings/tilgang",
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminOrgV2 data={data} />
    </V2Shell>
  );
}
