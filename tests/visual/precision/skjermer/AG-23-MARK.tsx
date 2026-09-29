/** Prøvefil for AG-23 Markedsføring. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG23Markedsforing, type AG23MarkedsTilstand, type MarketingPostRad } from "@/components/admin/precision/AG23Markedsforing";

export const sti = "/admin/marketing";

const poster: MarketingPostRad[] = [
  { id: "m1", tittel: "Vintertrening i simulatoren", kanal: "IG", datoLabel: "Man 5. okt", passert: false, brief: "Kort video fra simulatoren", status: "UTKAST" },
  { id: "m2", tittel: "Tittel som er lang nok til at den må brytes over flere linjer i kortvisningen", kanal: "LINKEDIN", datoLabel: "Ons 7. okt", passert: false, brief: null, status: "KLAR" },
  { id: "m3", tittel: "Sesongoppsummering", kanal: "FB", datoLabel: "Fre 25. sep", passert: true, brief: "Tall fra sesongen", status: "PUBLISERT" },
];
const Vis = (t: AG23MarkedsTilstand, p: MarketingPostRad[] = poster) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG23Markedsforing tilstand={t} poster={p} /></AgencyOSSkall></AdminRolleProvider>
);
export const natt = ["natt"];
export const tilstander = { data: Vis("data"), tom: Vis("tom", []), laster: Vis("laster"), feil: Vis("feil"), natt: Vis("data") };
