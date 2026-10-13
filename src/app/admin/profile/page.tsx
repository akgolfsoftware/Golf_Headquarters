import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { SideHode } from "@/components/precision/pa-a4";
import { KnappLenke } from "@/components/precision/pa";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { CoachProfile } from "@/components/admin/precision/agency-completion/CoachProfile";
import { byggCoachProfilData } from "@/lib/admin/oppsett/coach-profil-data";
export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · AgencyOS" };
export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <AgencyOSSkall navn={user.name ?? "Coach"}><CoachContent>
    <SideHode title="Min coachprofil" sub="Kontaktinformasjon, profilbilde og profesjonell profil." actions={<KnappLenke variant="secondary" href="/admin/oppsett?fane=sikkerhet">Sikkerhet</KnappLenke>} />
    <CoachProfile data={byggCoachProfilData(user)} />
  </CoachContent></AgencyOSSkall>;
}
