/** Prøvefil for AG-05 Kalender. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Side, SideHode, FanerLenker } from "@/components/precision/pa-a4";
import { AG05Uke, AG05Maned, AG05Verktoylinje } from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import type { UkedagRad } from "@/app/admin/kalender/tilg-data";

export const sti = "/admin/kalender";

const DAGER = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"];

const NAV = {
  forrige: "#", neste: "#", idag: "#", dagHref: "#", ukeHref: "#", manedHref: "#",
  nyBookingHref: "/admin/bookinger/ny", tilgjengelighetHref: "/admin/kalender?fane=tilg", nyHendelseHref: "/admin/kalender/hendelse/ny",
};

const ukeData: KalenderLagUkeData = {
  visning: "uke", ukeNr: 40, periode: "Uke 40 · 28.09–04.10",
  dager: DAGER, rutenett: DAGER.map((dato) => ({ dato, iManed: true })), idagIso: "2026-09-29",
  hendelser: [
    { id: "okt-1", lag: "OEKTER", dato: "2026-09-29", tittel: "Wedge 50–90 m", undertekst: "Tobias Lindvik", startMin: 9 * 60, sluttMin: 10 * 60, heldag: false, href: "/admin/workbench/p1" },
    { id: "booking-1", lag: "BOOKING", dato: "2026-09-29", tittel: "Ola Testesen", undertekst: "Privattime 60 min", startMin: 17 * 60, sluttMin: 18 * 60, heldag: false, href: "/admin/bookinger/b1" },
    { id: "skole-1", lag: "SKOLE", dato: "2026-09-30", tittel: "Heldagsprøve", undertekst: "VG2", startMin: null, sluttMin: null, heldag: true, lesevisning: true },
    { id: "turn-1", lag: "TURNERING", dato: "2026-10-02", tittel: "Srixon Tour · runde 2", undertekst: "Lea Brekke", startMin: null, sluttMin: null, heldag: true },
  ],
  kollisjoner: [], kollidererIder: [], nav: NAV,
};

const dagData: KalenderLagUkeData = { ...ukeData, visning: "dag" };

const manedData: KalenderLagUkeData = {
  ...ukeData,
  visning: "maned",
  periode: "Oktober 2026",
  rutenett: Array.from({ length: 35 }, (_, i) => {
    const dag = i - 3 + 1;
    const iManed = dag >= 1 && dag <= 31;
    return { dato: iManed ? `2026-10-${String(dag).padStart(2, "0")}` : `2026-09-${String(30 - (2 - i)).padStart(2, "0")}`, iManed };
  }),
};

const tilgRader: UkedagRad[] = [
  { ukedag: 0, navn: "Mandag", slotId: "s1", paa: true, range: "15:00–19:00" },
  { ukedag: 1, navn: "Tirsdag", slotId: "s2", paa: true, range: "15:00–19:00" },
  { ukedag: 2, navn: "Onsdag", slotId: null, paa: false, range: "—" },
  { ukedag: 3, navn: "Torsdag", slotId: "s3", paa: true, range: "16:00–20:00" },
  { ukedag: 4, navn: "Fredag", slotId: null, paa: false, range: "—" },
  { ukedag: 5, navn: "Lørdag", slotId: null, paa: false, range: "—" },
  { ukedag: 6, navn: "Søndag", slotId: null, paa: false, range: "—" },
];

const FANER = [
  { href: "?fane=uke", navn: "Uke", aktiv: true },
  { href: "?fane=maned", navn: "Måned", aktiv: false },
  { href: "?fane=dag", navn: "Dag", aktiv: false },
  { href: "?fane=stall", navn: "Stall-dag", aktiv: false },
  { href: "?fane=tilg", navn: "Tilgjengelighet", aktiv: false },
];

const Skjelett = ({ children, periode }: { children: React.ReactNode; periode: string }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side max={1480}>
      <SideHode kicker={periode} title="Kalender" sub="Dra en hendelse for å flytte den, eller åpne den og velg Flytt." actions={<AG05Verktoylinje nyHendelseHref="/admin/kalender/hendelse/ny" nyBookingHref="/admin/bookinger/ny" />} />
      <FanerLenker faner={FANER} />
      {children}
    </Side>
  </AgencyOSSkall>
);

export const tilstander = {
  uke: <Skjelett periode={ukeData.periode}><AG05Uke data={ukeData} /></Skjelett>,
  dag: <Skjelett periode={dagData.periode}><AG05Uke data={dagData} dagIso="2026-09-29" /></Skjelett>,
  maned: <Skjelett periode={manedData.periode}><AG05Maned data={manedData} /></Skjelett>,
  tilg: <Skjelett periode="Tilgjengelighet"><AG05Tilg rader={tilgRader} /></Skjelett>,
  tom: <Skjelett periode={ukeData.periode}><AG05Uke data={{ ...ukeData, hendelser: [] }} /></Skjelett>,
};
