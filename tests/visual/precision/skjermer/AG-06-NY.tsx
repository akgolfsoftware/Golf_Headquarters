/** Prøvefil for AG-06-NY Ny booking (/admin/bookinger/ny). Syntetiske data. */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { AG06NyBooking } from "@/components/admin/precision/AG06NyBooking";
import { nyBooking } from "./AG-06";

export const sti = "/admin/bookinger/ny";

const Ramme = ({ children }: { children: React.ReactNode }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side>
      <SideHode kicker="Booking · ny booking" title="Ny booking" sub="Team-booking: velg coach via tjenesten. Fasilitet er valgfritt." actions={<KnappLenke href="/admin/bookinger" variant="ghost">Til bookinger</KnappLenke>} />
      {children}
    </Side>
  </AgencyOSSkall>
);

const valgt = { spillerId: "p1", tjenesteId: "s1", stedId: "l1" };

export const tilstander = {
  hvem: <Ramme><AG06NyBooking data={nyBooking} /></Ramme>,
  gruppe: <Ramme><AG06NyBooking data={nyBooking} startGruppeId="g1" /></Ramme>,
  tjeneste: <Ramme><AG06NyBooking data={nyBooking} forvalg={{ ...valgt, steg: 1 }} /></Ramme>,
  sted: <Ramme><AG06NyBooking data={nyBooking} forvalg={{ ...valgt, steg: 2 }} /></Ramme>,
  tid: <Ramme><AG06NyBooking data={nyBooking} startTid="2026-10-01T17:00" forvalg={{ ...valgt, steg: 3 }} /></Ramme>,
  bekreft: <Ramme><AG06NyBooking data={nyBooking} startTid="2026-10-01T17:00" forvalg={{ ...valgt, steg: 4 }} /></Ramme>,
  bekreftUtenKlipp: <Ramme><AG06NyBooking data={nyBooking} startTid="2026-10-01T17:00" forvalg={{ ...valgt, spillerId: "p2", steg: 4 }} /></Ramme>,
  laster: <Ramme><LasterTilstand text="Henter spillere og tjenester …" /></Ramme>,
  feil: <Ramme><FeilTilstand icon={CalendarX} title="Veiviseren kunne ikke hentes" text="Ingen booking er laget." /></Ramme>,
  tom: <Ramme><AG06NyBooking data={{ ...nyBooking, spillere: [], grupper: [], tjenester: [], steder: [] }} /></Ramme>,
};
