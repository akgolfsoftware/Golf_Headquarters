/** Prøvefil for AG-23 Oppsett (hode + fanerad). Syntetiske data. Faneinnholdet (Train-lock) er ikke med. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG23Hode } from "@/components/admin/precision/AG23Hode";
import { Kort, KortHode } from "@/components/precision/pa-a5";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import { Settings } from "lucide-react";
import "@/styles/precision-a5.css";

export const sti = "/admin/oppsett";

const alle = [
  ["akademi", "Akademi"], ["klubb", "Klubb"], ["kalender", "Kalender"], ["tilgang", "Tilgang"],
  ["sikkerhet", "Sikkerhet"], ["integrasjoner", "Integrasjoner"], ["api", "API"], ["perioder", "Perioder"],
].map(([id, label]) => ({ id: id!, label: label!, href: `/admin/oppsett?fane=${id}` }));
const coach = alle.filter((f) => ["kalender", "sikkerhet", "perioder"].includes(f.id));

const Side = (erAdmin: boolean, faner: typeof alle, innhold?: React.ReactNode) => (
  <AdminRolleProvider erAdmin={erAdmin}>
    <AgencyOSSkall navn="Test Coach">
      <div className="pa-side">
        <AG23Hode sted="oppsett" kicker="Mer · Oppsett" tittel="Oppsett" faner={faner} aktivFane={faner[0]!.id} />
        {innhold ?? <Kort><KortHode tittel="Faneinnhold" aside="EKSISTERENDE" /><p style={{ margin: 0 }}>Innholdet i fanen vises her.</p></Kort>}
      </div>
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const natt = ["natt"];
export const tilstander = {
  data: Side(true, alle),
  tom: Side(false, coach),
  laster: Side(true, alle, <LasterTilstand text="Henter oppsett …" />),
  feil: Side(true, alle, <FeilTilstand icon={Settings} title="Oppsett kunne ikke hentes" text="Ingen innstillinger er endret." code="FEIL 503 · OPPSETT" />),
  natt: Side(true, alle),
};
