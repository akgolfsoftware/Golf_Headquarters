/**
 * AgencyOS Profil — AG-23 (fane Profil) i Precision Athletics.
 * Samme requirePortalUser-guard, samme felt-kilde (User + preferences-JSON)
 * og samme mutasjoner (oppdaterCoachProfil, uploadAvatar).
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { oppdaterCoachProfil } from "@/app/admin/(legacy)/profile/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { AG23Profil } from "@/components/admin/precision/AG23Profil";
import type { AdminProfilV2Data } from "@/components/admin/v2/oppsett/AdminProfilTrainLock";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · AgencyOS" };

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) return v.filter((s): s is string => typeof s === "string");
  return fallback;
}

export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const prefs =
    user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
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
    abonnementLabel: user.tier === "PRO" ? "Pro" : "Gratis",
    opprettetLabel: user.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" }),
  };

  const [kobling, tjenester] = await Promise.all([
    prisma.googleCalendarConnection.findUnique({ where: { userId: user.id }, select: { status: true, lastSyncAt: true } }),
    prisma.serviceType.aggregate({ where: { active: true }, _count: { _all: true }, _max: { updatedAt: true } }),
  ]);
  const dato = (d: Date) => d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
  const oversikt = {
    kalender: !kobling
      ? "Ikke koblet"
      : `${kobling.status === "ACTIVE" ? "Koblet" : kobling.status === "PAUSED" ? "Satt på pause" : "Feil ved synk"} · ${kobling.lastSyncAt ? `synket ${kobling.lastSyncAt.toLocaleString("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" })}` : "aldri synket"}`,
    tjenester: tjenester._count._all === 0 || !tjenester._max.updatedAt
      ? "—"
      : `${tjenester._count._all} tjenester · oppdatert ${dato(tjenester._max.updatedAt)}`,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG23Profil tilstand="data" data={data} oversikt={oversikt} handlinger={{ lagreProfil: oppdaterCoachProfil, lastOppAvatar: uploadAvatar }} />
    </AgencyOSSkall>
  );
}
