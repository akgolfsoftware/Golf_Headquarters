/** Prøvefil for AG-11 Workbench (coach), nivå Uke. Syntetiske data, ingen ekte spillere. */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG11Workbench, type AG11Niva, type AG11Side } from "@/components/admin/precision/AG11Workbench";
import { FYS, GRUPPER, KILDER, MAL, ROSTER, SPILLER, TOM_FYS, uke } from "./_wb-data";

export const sti = "/admin/workbench/p1";

export const Vis = ({ tom = false, niva = "uke", side, valgtOktId }: { tom?: boolean; niva?: AG11Niva; side?: AG11Side; valgtOktId?: string }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11Workbench playerId="p1" spillerNavn={SPILLER} uke={uke(tom)} kilder={tom ? [] : KILDER} roster={ROSTER} grupper={GRUPPER}
        goals={tom ? [] : MAL} fys={tom ? TOM_FYS : FYS} niva={niva} side={side} valgtOktId={valgtOktId} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const Laster = () => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter planen …" /></div></AgencyOSSkall></AdminRolleProvider>
);

export const Feil = () => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side">
    <FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text="Ingen økter er endret. Prøv igjen, eller gå tilbake til stallen." code="FEIL 503 · WORKBENCH"
      retry={<Knapp variant="secondary">Prøv igjen</Knapp>} />
  </div></AgencyOSSkall></AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
};
