/** Prøvefil for Rediger profil fra Spiller 360 (AG-08 › Rediger profil). Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG08Rediger, type AG08RedigerData } from "@/components/admin/precision/AG08Rediger";
import Loading from "@/app/admin/(legacy)/spillere/[id]/rediger/loading";
import Feil from "@/app/admin/(legacy)/spillere/[id]/rediger/error";

export const sti = "/admin/spillere/u1/rediger";
const data: AG08RedigerData = {
  spillerId: "u1", spillerNavn: "Eira Solvang", fornavn: "Eira", etternavn: "Solvang", fodselsdatoYmd: "2010-03-14",
  telefon: "400 00 000", epost: "eira@eksempel.no", hjemmeklubb: "Nordre GK", skole: "Nordre videregående", klassetrinn: "VG1",
  hcpInput: "6,1", ambisjon: "Spille college i USA", valgtCoachId: "c1",
  coacher: [{ id: "c1", navn: "Jonas Brekke" }, { id: "c2", navn: "Line Aasen" }],
  foreldre: [{ id: "f1", navn: "Kari Solvang", relasjon: "MOTHER" }],
  historikk: [{ id: "h1", datoLabel: "26. sep. 14:02", handling: "player.update", aktorNavn: "Jonas Brekke" }],
};
const S = (d: AG08RedigerData) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><AG08Rediger data={d} /></AgencyOSSkall></AdminRolleProvider>;
export const tilstander = {
  data: S(data),
  tom: S({ ...data, foreldre: [], historikk: [], telefon: "", skole: "", hjemmeklubb: "", ambisjon: "", hcpInput: "" }),
  laster: <AdminRolleProvider erAdmin><Loading /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><Feil error={Object.assign(new Error("prøve"), { digest: "502" })} reset={() => {}} /></AdminRolleProvider>,
};
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") console.error = () => {};
