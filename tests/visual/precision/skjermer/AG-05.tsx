/** Prøvefil for AG-05 Kalender. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Feil, KnappLenke, Laster, Topp } from "@/components/admin/agencyos-ny/ny";
import { AG05Aar, AG05Dag, AG05Uke, AG05Maned, AG05Periode } from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import type { KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import type { TilgData } from "@/app/admin/kalender/tilg-data";
import type { KalenderAarData } from "@/app/admin/kalender/aar-data";
import { summerAar } from "@/lib/domain/kalender-aar";

export const sti = "/admin/kalender";

const DAGER = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"];

const NAV = {
  forrige: "#", neste: "#", idag: "#", dagHref: "#", ukeHref: "#", manedHref: "#",
  nyBookingHref: "/admin/bookinger/ny", tilgjengelighetHref: "/admin/kalender?fane=tilg", nyHendelseHref: "/admin/kalender/hendelse/ny",
};

const ukeData: KalenderLagUkeData = {
  visning: "uke", ukeNr: 40, periode: "Uke 40 · 28.09–04.10",
  dager: DAGER, rutenett: DAGER.map((dato) => ({ dato, iManed: true })), idagIso: "2026-09-29",
  coacher: [{ id: "c1", navn: "Test Coach" }, { id: "c2", navn: "Prøve Assistent" }],
  hendelser: [
    { id: "okt-1", lag: "OEKTER", dato: "2026-09-29", tittel: "Wedge 50–90 m", undertekst: "Ola Testesen", startMin: 9 * 60, sluttMin: 10 * 60, heldag: false, href: "/admin/workbench/p1", coachId: "c1", akse: "slag", flyttOktId: "o1" },
    { id: "booking-1", lag: "BOOKING", dato: "2026-09-29", tittel: "Ola Testesen", undertekst: "Privattime 60 min", startMin: 17 * 60, sluttMin: 18 * 60, heldag: false, href: "/admin/bookinger/b1", coachId: "c1", akse: "tek" },
    { id: "booking-2", lag: "BOOKING", dato: "2026-09-29", tittel: "Kari Prøvesen med et langt navn", undertekst: "Flex 50 min · Simulator 1", startMin: 10 * 60, sluttMin: 10 * 60 + 50, heldag: false, href: "/admin/bookinger/b2", coachId: "c2", akse: null },
    { id: "gruppe-1", lag: "OEKTER", dato: "2026-09-29", tittel: "Juniorgruppe Utvikling", undertekst: "Ni hull", startMin: 15 * 60 + 30, sluttMin: 17 * 60, heldag: false, href: "/admin/grupper/g1", coachId: "c2", akse: "spill", gruppe: true, antallSpillere: 8 },
    { id: "skole-1", lag: "SKOLE", dato: "2026-09-30", tittel: "Heldagsprøve", undertekst: "VG2", startMin: null, sluttMin: null, heldag: true, lesevisning: true },
    { id: "turn-1", lag: "TURNERING", dato: "2026-10-02", tittel: "Srixon Tour · runde 2", undertekst: "Kari Prøvesen", startMin: null, sluttMin: null, heldag: true },
  ],
  kollisjoner: [], kollidererIder: [], nav: NAV,
};

const dagData: KalenderLagUkeData = { ...ukeData, visning: "dag" };
const assData: KalenderLagUkeData = {
  ...dagData,
  hendelser: dagData.hendelser.map((h) => h.coachId === "c1" && h.lag === "BOOKING" ? { id: h.id, lag: h.lag, dato: h.dato, tittel: "Opptatt", startMin: h.startMin, sluttMin: h.sluttMin, heldag: false, coachId: "c1", opptatt: true } : h).filter((h) => h.id !== "okt-1"),
};
const aar = summerAar([
  ...Array.from({ length: 40 }, (_, i) => ({ dato: `2026-0${(i % 9) + 1}-10`, minutter: 60, akse: (["fys", "tek", "slag", "spill", "turn"] as const)[i % 5] })),
  { dato: "2026-10-05", minutter: 90, akse: null },
], 2026, "2026-10-17");
const aarData: KalenderAarData = { aar: 2026, ...aar, nav: { forrige: "#", neste: "#", idag: "#" } };

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

const tilg: TilgData = {
  vinduer: [
    { id: "s1", weekday: 0, date: null, startTime: "15:00", endTime: "19:00", locationId: null, stedNavn: null, validFrom: null, validTo: null, recurrenceInterval: null, active: true },
    { id: "s2", weekday: 1, date: null, startTime: "15:00", endTime: "19:00", locationId: "l1", stedNavn: "Prøvestudio 1", validFrom: "2026-08-01", validTo: "2027-06-30", recurrenceInterval: 2, active: true },
    { id: "s4", weekday: 4, date: null, startTime: "16:00", endTime: "20:00", locationId: null, stedNavn: null, validFrom: null, validTo: null, recurrenceInterval: null, active: false },
    { id: "s5", weekday: null, date: "2026-10-24", startTime: "09:00", endTime: "13:00", locationId: "l1", stedNavn: "Prøvestudio 1", validFrom: null, validTo: null, recurrenceInterval: null, active: true },
  ],
  fridager: [{ id: "f1", dato: "2026-12-24", grunn: "Juleaften" }, { id: "f2", dato: "2026-12-31", grunn: null }],
  steder: [{ id: "l1", navn: "Prøvestudio 1" }],
};

const FANER = [
  { href: "?fane=dag", navn: "Dag", aktiv: false },
  { href: "?fane=uke", navn: "Uke", aktiv: true },
  { href: "?fane=maned", navn: "Måned", aktiv: false },
  { href: "?fane=ar", navn: "År", aktiv: false },
  { href: "?fane=stall", navn: "Stall-dag", aktiv: false },
  { href: "?fane=tilg", navn: "Tilgjengelighet", aktiv: false },
];

const Skjelett = ({ children, periode }: { children: React.ReactNode; periode: string }) => (
  <AgencyOSSkall navn="Test Coach">
    <div className="agn-s">
      <Topp dato={`Alle coacher · ${periode}`} tittel="Kalender" handlinger={<><KnappLenke variant="pri" href="/admin/bookinger?fane=ny">Ny booking</KnappLenke><KnappLenke href="/admin/kalender/hendelse/ny">Ny hendelse</KnappLenke></>} />
      <nav className="valg" aria-label="Visning">{FANER.map((f) => <a key={f.href} href={f.href} aria-current={f.aktiv ? "page" : undefined}>{f.navn}</a>)}</nav>
      {periode !== "Tilgjengelighet" && <AG05Periode forrige="#" idag="#" neste="#" tekst={periode} />}
      <div className="pa-root kal-innhold">{children}</div>
    </div>
  </AgencyOSSkall>
);

export const tilstander = {
  uke: <Skjelett periode={ukeData.periode}><AG05Uke data={ukeData} /></Skjelett>,
  dag: <Skjelett periode="Tirsdag 29. sep."><AG05Dag data={dagData} dagIso="2026-09-29" erHeadCoach /></Skjelett>,
  ass: <Skjelett periode="Tirsdag 29. sep."><AG05Dag data={assData} dagIso="2026-09-29" erHeadCoach={false} /></Skjelett>,
  ar: <Skjelett periode="2026"><AG05Aar data={aarData} /></Skjelett>,
  maned: <Skjelett periode={manedData.periode}><AG05Maned data={manedData} /></Skjelett>,
  tilg: <Skjelett periode="Tilgjengelighet"><AG05Tilg data={tilg} /></Skjelett>,
  laster: <Skjelett periode={ukeData.periode}><Laster tekst="Henter kalenderen …" /></Skjelett>,
  feil: <Skjelett periode={ukeData.periode}><Feil tittel="Kalenderen kunne ikke hentes" tekst="Ingen hendelser er endret." /></Skjelett>,
  tom: <Skjelett periode={ukeData.periode}><AG05Uke data={{ ...ukeData, hendelser: [] }} /></Skjelett>,
};
