/**
 * AgencyOS — Coach/admin-profil (`/admin/profile`), v2.
 * Port av `(legacy)/profile/page.tsx` (2026-07-14, AgencyOS Bølge 3.15) —
 * samme `User`-felter og `oppdaterCoachProfil`-kontrakt.
 * `(legacy)/profile/actions.ts` bor fortsatt der — delt server action, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminProfilV2 } from "@/components/admin/v2/AdminProfilV2";

export const dynamic = "force-dynamic";

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) return v.filter((s): s is string => typeof s === "string");
  return fallback;
}

export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const personFelter = [
    { label: "Fullt navn", value: user.name },
    { label: "E-post", value: user.email, mono: true },
    { label: "Mobil", value: user.phone ?? "Ikke registrert", mono: true },
    { label: "Handicap", value: user.hcp != null ? String(user.hcp) : "Ikke registrert", mono: true },
    { label: "Hjemmeklubb", value: user.homeClub ?? "Ikke registrert" },
  ];

  const prefs = user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
    ? (user.preferences as Record<string, unknown>)
    : {};

  const bioStored = user.ambition ?? "";
  const certifications = asStringArray(prefs.certifications, []);
  const languages = asStringArray(prefs.languages, ["Norsk"]);
  const clubs = asStringArray(prefs.clubs, user.homeClub ? [user.homeClub] : []);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminProfilV2
        navn={user.name}
        rolle={user.role}
        tier={user.tier}
        opprettetTekst={user.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" })}
        homeClub={user.homeClub}
        personFelter={personFelter}
        bio={bioStored}
        certifications={certifications}
        languages={languages}
        clubs={clubs}
        initial={{
          navn: user.name,
          epost: user.email,
          phone: user.phone ?? "",
          hcp: user.hcp != null ? String(user.hcp).replace(".", ",") : "",
          homeClub: user.homeClub ?? "",
          bio: bioStored,
          certifications: certifications.join(", "),
          languages: languages.join(", "),
          clubs: clubs.join(", "),
        }}
      />
    </V2Shell>
  );
}
