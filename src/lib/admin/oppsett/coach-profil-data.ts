import type { UserMedTilgang } from "@/lib/auth/getCurrentUser";
import type { CoachProfileData } from "@/components/admin/precision/agency-completion/CoachProfile";
export function byggCoachProfilData(user: UserMedTilgang): CoachProfileData {
  const prefs = user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences) ? user.preferences : {};
  const liste = (key: string) => { const value = key in prefs ? prefs[key] : null; return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []; };
  return { navn: user.name ?? "", epost: user.email, phone: user.phone, homeClub: user.homeClub, hcp: user.hcp, bio: user.ambition ?? "", certifications: liste("certifications"), languages: liste("languages"), clubs: liste("clubs"), avatarUrl: user.avatarUrl, rolleLabel: user.role === "ADMIN" ? "Administrator" : "Coach", opprettetLabel: user.createdAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" }) };
}
