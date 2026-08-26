/**
 * AgencyOS Konto (Min coach-profil) — Train-lock (T13, 26.08.2026).
 *
 * Porter fra AdminProfilV2 (Paper T.*) til AdminProfilTrainLock (TL.*) —
 * fasit: designsystem/train-lock/AG-05 Mer-ark.dc.html («Konto»-mønsteret),
 * se AdminProfilTrainLock for begrunnelse. Samme requirePortalUser-guard,
 * samme felt-kilde (User-modellen + preferences-JSON) og samme mutasjoner
 * (oppdaterCoachProfil, uploadAvatar) — designport, ikke funksjonsendring.
 * Nav-punktet lever i Cmd+K-søket («Min coach-profil»), ikke i hovedrailen —
 * `aktiv` utledes derfor av URL-en (samme mønster som /admin/team/inviter
 * og /admin/settings).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminProfilTrainLock, type AdminProfilV2Data } from "@/components/admin/v2/oppsett/AdminProfilTrainLock";

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
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AdminProfilTrainLock data={data} />
    </V2Shell>
  );
}
