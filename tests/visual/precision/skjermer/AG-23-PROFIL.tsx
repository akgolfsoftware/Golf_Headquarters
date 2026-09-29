/** Prøvefil for AG-23 Profil. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG23Profil, type AG23ProfilTilstand, type AG23ProfilHandlinger } from "@/components/admin/precision/AG23Profil";
import type { AdminProfilV2Data } from "@/components/admin/v2/oppsett/AdminProfilTrainLock";

export const sti = "/admin/profile";

const data: AdminProfilV2Data = {
  navn: "Test Coach", epost: "test.coach@example.com", phone: "+47 900 00 000", avatarUrl: null, hcp: 2.4,
  homeClub: "Testklubben Golfklubb med et langt navn som må brytes pent", bio: "Kort bio for prøven.",
  certifications: ["PGA Class A", "TPI Level 2"], languages: ["Norsk", "Engelsk"], clubs: ["Testklubben"],
  rolleLabel: "Administrator", abonnementLabel: "Pro (299 kr/mnd)", opprettetLabel: "01. jan. 2026",
};
const tom: AdminProfilV2Data = { ...data, phone: null, hcp: null, homeClub: null, bio: "", certifications: [], clubs: [] };
const handlinger = { lagreProfil: async () => ({ ok: true as const }), lastOppAvatar: async () => ({ ok: true as const, url: "" }) } as unknown as AG23ProfilHandlinger;
const Vis = (t: AG23ProfilTilstand, d: AdminProfilV2Data = data) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG23Profil tilstand={t} data={d} handlinger={handlinger} /></AgencyOSSkall></AdminRolleProvider>
);
export const natt = ["natt"];
export const tilstander = { data: Vis("data"), tom: Vis("data", tom), laster: Vis("laster"), feil: Vis("feil"), natt: Vis("data") };
