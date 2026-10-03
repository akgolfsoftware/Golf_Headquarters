/** Prøvefil for AG-16b AK-stigen. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG16bAkStigen, type AG16bStigeTilstand } from "@/components/admin/precision/AG16bAkStigen";
import { AK_STIGEN_TRINN, type AkStigenData, type AkStigenGruppeData } from "@/lib/agencyos/ak-stigen-data";

export const sti = "/admin/agencyos/ak-stigen";
export const natt = ["data-natt"];

const g = (id: string, navn: string, medlemmer: number): AkStigenGruppeData => ({ id, navn, level: "Junior", coachNavn: "Test Coach", medlemmer, tider: ["tor 16:00–17:00", "søn 10:00–11:30"] });
const data: AkStigenData = {
  trinn: AK_STIGEN_TRINN,
  grupper: {
    "GFGK Junior Mini U10": g("a", "GFGK Junior Mini U10", 8),
    "GFGK Junior Basis U13": g("b", "GFGK Junior Basis U13", 0),
    "GFGK Junior Utvikling U15": g("c", "GFGK Junior Utvikling U15", 6),
  },
  vedSidenAv: [g("k", "GFGK Junior Knøtt U12", 4), g("w", "WANG Toppidrett Fredrikstad med et svært langt gruppenavn som må brytes", 11)],
  rester: [{ id: "r", navn: "Gammel testgruppe", level: null, maks: null }],
  ukartlagt: [{ id: "u", navn: "Testgruppe uten trinn", level: null, medlemmer: 3 }],
};

const Vis = (t: AG16bStigeTilstand, d: AkStigenData | null = data) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG16bAkStigen tilstand={t} data={d} /></AgencyOSSkall></AdminRolleProvider>
);

export const tilstander = { data: Vis("data"), "data-natt": Vis("data"), tom: Vis("tom", null), laster: Vis("laster", null), feil: Vis("feil", null) };
