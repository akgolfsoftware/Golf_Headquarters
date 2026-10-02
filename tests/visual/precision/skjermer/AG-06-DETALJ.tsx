/** Prøvefil for /admin/bookinger/[id] i Precision. Syntetiske data. */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { AG06BookingDetalj, type AG06BookingDetaljData } from "@/components/admin/precision/AG06BookingDetalj";

export const sti = "/admin/bookinger/b1";

const data: AG06BookingDetaljData = {
  id: "b1",
  tjeneste: "Privattime 60 min",
  varighetMin: 60,
  status: "CONFIRMED",
  spiller: { id: "p1", navn: "Ola Testesen" },
  gjest: null,
  coachNavn: "Test Coach",
  dato: "Torsdag 1. oktober 2026",
  tid: "17:00–18:00",
  sted: "Bås 1 · Teststudio",
  prisOre: 80000,
  betaling: "Betalt",
  notat: "Vil jobbe med wedge.",
  opprettet: "Fredag 25. september 2026",
  forslag: null,
  handling: { id: "b1", who: "Ola Testesen", date: "01.10", t: "17:00", dato: "2026-10-01", st: "Bekreftet", pay: "Betalt", harSpiller: true, forslag: null, guardian: null },
};

const Ramme = ({ d, children }: { d: AG06BookingDetaljData; children?: React.ReactNode }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side>
      <SideHode kicker={`Booking · ${d.dato}`} title={d.tjeneste} sub={`${d.tid} · ${d.sted}`} actions={<KnappLenke href="/admin/bookinger" variant="ghost">Til bookinger</KnappLenke>} />
      {children ?? <AG06BookingDetalj data={d} />}
    </Side>
  </AgencyOSSkall>
);

const gjest: AG06BookingDetaljData = {
  ...data,
  status: "PENDING",
  spiller: null,
  gjest: { navn: "Kari Gjest", epost: "kari@eksempel.no", telefon: "+47 000 00 000" },
  betaling: "Ikke betalt",
  handling: { ...data.handling, st: "Venter", pay: "Ikke betalt", harSpiller: false, guardian: "kari@eksempel.no", who: "Kari Gjest" },
};

export const tilstander = {
  data: <Ramme d={data} />,
  forslag: <Ramme d={{ ...data, forslag: "Fredag 2. oktober 2026 11:00", handling: { ...data.handling, forslag: "02.10 11:00" } }} />,
  venterGjest: <Ramme d={gjest} />,
  avlyst: <Ramme d={{ ...data, status: "CANCELLED" }} />,
  laster: <Ramme d={data}><LasterTilstand text="Henter bookinger …" /></Ramme>,
  feil: <Ramme d={data}><FeilTilstand icon={CalendarX} title="Bookingene kunne ikke hentes" text="Ingen bookinger er endret." /></Ramme>,
  tom: <Ramme d={{ ...data, notat: null, coachNavn: null, status: "COMPLETED" }} />,
};
