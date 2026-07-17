/**
 * v2 — AgencyOS Min coach-profil (retning C). Egen top-level route (utenfor
 * AdminShell) — V2Shell leverer all chrome (IkonRail/BunnNav) i mørk
 * v2-scope. Nav-punktet ligger i AGENCYOS_MER (gruppe "Drift" → "min-profil"),
 * ikke i hovedrailen — `aktiv` utledes derfor av URL-en (samme mønster som
 * /admin/team/inviter og /admin/settings).
 *
 * Coachens EGEN profil — selvbetjening, ikke admin-styrt spillerprofil.
 * Port av /admin/(legacy)/profile/page.tsx: samme requirePortalUser-guard
 * og samme felt-kilde (User-modellen + preferences-JSON for sertifiseringer/
 * språk/klubber). Mutasjonene (oppdaterCoachProfil, uploadAvatar) gjenbrukes
 * 1:1 fra legacy-actionsene — ingen nye actions.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminProfilV2, type AdminProfilV2Data } from "@/components/admin/v2/AdminProfilV2";

export const dynamic = "force-dynamic";

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) return v.filter((s): s is string => typeof s === "string");
  return fallback;
}

export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const prefs =
    user.preferences &&
    typeof user.preferences === "object" &&
    !Array.isArray(user.preferences)
      ? (user.preferences as Record<string, unknown>)
      : {};

  const data: AdminProfilV2Data = {
    navn: user.name,
    epost: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    hcp: user.hcp,
    homeClub: user.homeClub,
    bio: user.ambition ?? "",
    certifications: asStringArray(prefs.certifications, []),
    languages: asStringArray(prefs.languages, ["Norsk"]),
    clubs: asStringArray(prefs.clubs, user.homeClub ? [user.homeClub] : []),
    rolleLabel: user.role === "ADMIN" ? "Administrator" : "Coach",
    abonnementLabel: user.tier === "PRO" ? "Pro (299 kr/mnd)" : "Gratis",
    opprettetLabel: user.createdAt.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminProfilV2 data={data} />
    </V2Shell>
  );
}
