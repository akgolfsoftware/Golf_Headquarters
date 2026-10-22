/** Prøvefil for Spiller 360 › Komplett profil i Skrå-drakten. Syntetiske data, oppdiktet navn. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { KomplettProfilAgencyOS } from "@/components/profil/KomplettProfilAgencyOS";
import type { ProfilVisning } from "@/lib/profil-kobling/visning";

export const sti = "/admin/spillere/u1/profil-komplett";
const v: ProfilVisning = {
  navn: "Eira Solvang",
  identitet: [{ etikett: "Født", verdi: "2010" }, { etikett: "Golf-ID", verdi: "12-3456" }],
  resultater: {
    tom: null,
    aar: [{ aar: 2026, rader: [
      { id: "r1", dato: "30. aug. 2026", navn: "Klubbmesterskapet med et ganske langt turneringsnavn", klasse: "Jenter 15–16", plass: "3", slag: "74", kilde: "GolfBox" },
      { id: "r2", dato: "12. aug. 2026", navn: "Høstpokalen junior", klasse: "Jenter", plass: "7", slag: "78", kilde: "GolfBox" },
    ] }],
    sesonger: [{ sesong: "2026", runder: "12", snitt: "76,4", motPar: "+4,4" }],
  },
  tester: { tom: null, rader: [{ id: "t1", navn: "Driver Basic", omraade: "Golfslag", siste: "42 p", dato: "20. sep. 2026", antall: "3" }], harTeamNorway: false },
  runder: { tom: null, tall: [{ etikett: "Runder", verdi: "14" }, { etikett: "Snitt brutto", verdi: "75,8" }], merknad: "Delte runder siste 12 måneder." },
  iup: { tom: "Ingen IUP levert.", levert: [], maaltall: null },
};
const tomV: ProfilVisning = { ...v, resultater: { tom: "Ingen offisielle resultater.", aar: [], sesonger: [] }, tester: { tom: "Ingen tester.", rader: [], harTeamNorway: false }, runder: { tom: "Ingen runder.", tall: [], merknad: "" } };
const S = (p: ProfilVisning) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><div className="agn-s">
  <Topp tilbake={{ href: "/admin/spillere/u1", tekst: "Spiller 360" }} dato="Stall · Spiller 360 · Komplett profil" tittel={p.navn}
    ingress="Offisielle resultater, tester og IUP. Samme data som Team Norway og WANG ser." />
  <div className="a2-under"><KomplettProfilAgencyOS v={p} /></div>
</div></AgencyOSSkall></AdminRolleProvider>;
export const tilstander = { data: S(v), tom: S(tomV) };
