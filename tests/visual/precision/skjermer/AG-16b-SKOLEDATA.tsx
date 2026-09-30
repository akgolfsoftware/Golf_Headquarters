/** Prøvefil for AG-16b Skoledata. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG16bSkoledata } from "@/components/admin/precision/AG16bSkoledata";

export const sti = "/admin/grupper/g1/arsplan/skoledata";
export const natt = ["feil-rader-natt"];

const gruppe = { id: "g1", navn: "Testgruppe A med et langt navn som må kunne brytes" };
const stub = async () => ({ ok: true as const, antall: 0, feil: [] });
const Vis = ({ t = "data", r = null }: { t?: "data" | "laster" | "feil"; r?: { ok: boolean; melding: string; feil: string[] } | null }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AG16bSkoledata gruppe={gruppe} tilstand={t} importer={stub} startResultat={r} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  "resultat-ok": <Vis r={{ ok: true, melding: "3 rader lagt inn.", feil: [] }} />,
  "feil-rader": <Vis r={{ ok: false, melding: "Importen feilet. Ingenting er lagt inn.", feil: ["Linje 4: ukjent kategori «PRØVEX» (må være TIME/PROVE/HELDAGSPROVE/EKSAMEN/FERIE/SKOLETUR/ANNET)", "Linje 7: ugyldig dato «2026-13-40»"] }} />,
  "feil-rader-natt": <Vis r={{ ok: false, melding: "Importen feilet. Ingenting er lagt inn.", feil: ["Linje 7: ugyldig dato «2026-13-40»"] }} />,
  laster: <Vis t="laster" />,
  feil: <Vis t="feil" />,
};
