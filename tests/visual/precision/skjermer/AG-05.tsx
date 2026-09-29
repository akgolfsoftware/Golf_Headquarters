/** Prøvefil for AG-05 Kalender (+UKE, MND, AR, stall-dag, tilgjengelighet). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import { CalendarX } from "lucide-react";
import { Side, SideHode, FanerLenker } from "@/components/precision/pa-a4";
import { AG05Uke, AG05Maned, AG05Aar, AG05Periode, AG05Verktoylinje } from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import { AG05StallDag, AG05StallFeil } from "@/components/admin/precision/AG05StallDag";
import type { KalenderAarData, KalenderLagUkeData } from "@/app/admin/kalender/lag/data";
import type { TilgData } from "@/app/admin/kalender/tilg-data";
import type { StallDagViewModel } from "@/lib/domain/workbench/stall-dag";

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
    { id: "okt-1", lag: "OEKTER", dato: "2026-09-29", tittel: "Wedge 50–90 m", undertekst: "Ola Testesen", startMin: 9 * 60, sluttMin: 10 * 60, heldag: false, href: "/admin/workbench/p1", akse: "slag", coachId: "c1", flytt: { type: "okt", id: "o1", spillerSer: true } },
    { id: "okt-2", lag: "OEKTER", dato: "2026-10-01", tittel: "Styrke B", undertekst: "Kari Prøvesen", startMin: 16 * 60, sluttMin: 17 * 60, heldag: false, href: "/admin/workbench/p2", akse: "fys", coachId: "c2", flytt: { type: "okt", id: "o2", spillerSer: false } },
    { id: "booking-1", lag: "BOOKING", dato: "2026-09-29", tittel: "Ola Testesen", undertekst: "Privattime 60 min", startMin: 17 * 60, sluttMin: 18 * 60, heldag: false, href: "/admin/bookinger/b1", coachId: "c1", flytt: { type: "booking", id: "b1", harSpiller: true, foreslaatt: null } },
    { id: "booking-2", lag: "BOOKING", dato: "2026-09-30", tittel: "Per Gjest", undertekst: "Drop-in", startMin: 12 * 60, sluttMin: 13 * 60, heldag: false, href: "/admin/bookinger/b2", coachId: "c1", flytt: { type: "booking", id: "b2", harSpiller: true, foreslaatt: "2026-10-02 12:00" } },
    { id: "skole-1", lag: "SKOLE", dato: "2026-09-30", tittel: "Heldagsprøve", undertekst: "VG2", startMin: null, sluttMin: null, heldag: true, lesevisning: true },
    { id: "turn-1", lag: "TURNERING", dato: "2026-10-02", tittel: "Testturnering · runde 1", undertekst: "Kari Prøvesen", startMin: null, sluttMin: null, heldag: true },
  ],
  kollisjoner: [], kollidererIder: [],
  turneringslag: {
    dager: [[], [], [], [{ planId: "t1", type: "REISE", tittel: "Testturnering", spiller: "Kari Prøvesen" }], [{ planId: "t1", type: "TURNERING", tittel: "Testturnering", spiller: "Kari Prøvesen" }], [{ planId: "t1", type: "TURNERING", tittel: "Testturnering", spiller: "Kari Prøvesen" }], []],
    varsler: [{ planId: "t1", dato: "2026-10-01", spiller: "Kari Prøvesen", spillerId: "p2", turnering: "Testturnering", okter: ["Styrke B"] }],
  },
  coacher: [{ id: "c1", navn: "Test Coach" }, { id: "c2", navn: "Annen Coach" }],
  nav: NAV,
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
  hendelser: ukeData.hendelser.map((h) => ({ ...h, dato: h.dato.replace("2026-09-29", "2026-10-06").replace("2026-09-30", "2026-10-07") })),
};

const aarData: KalenderAarData = {
  aar: 2026,
  maaneder: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"].map((navn, i) => ({ nokkel: `2026-${String(i + 1).padStart(2, "0")}`, navn, bookinger: [12, 14, 20, 31, 44, 38, 10, 22, 41, 36, 0, 0][i], okter: [30, 28, 40, 52, 60, 58, 20, 45, 70, 64, 3, 0][i] })),
  nav: { forrige: "#", neste: "#", idag: "#" },
};

const tilgData: TilgData = {
  idag: "2026-09-29",
  steder: [{ id: "l1", navn: "Teststudio" }, { id: "l2", navn: "Testbanen" }],
  vinduer: [
    { id: "s1", ukedag: 0, dato: null, start: "15:00", slutt: "19:00", aktiv: true, stedId: "l1", stedNavn: "Teststudio", gyldigFra: null, gyldigTil: null, repetisjon: null, gjelderNaa: true },
    { id: "s2", ukedag: 1, dato: null, start: "09:00", slutt: "11:00", aktiv: true, stedId: "l2", stedNavn: "Testbanen", gyldigFra: "2026-08-01", gyldigTil: "2026-12-31", repetisjon: 2, gjelderNaa: true },
    { id: "s3", ukedag: 1, dato: null, start: "15:00", slutt: "19:00", aktiv: false, stedId: null, stedNavn: null, gyldigFra: null, gyldigTil: null, repetisjon: null, gjelderNaa: true },
    { id: "s4", ukedag: 3, dato: null, start: "16:00", slutt: "20:00", aktiv: true, stedId: "l1", stedNavn: "Teststudio", gyldigFra: "2027-01-01", gyldigTil: null, repetisjon: null, gjelderNaa: false },
    { id: "s5", ukedag: null, dato: "2026-10-14", start: "10:00", slutt: "14:00", aktiv: false, stedId: null, stedNavn: null, gyldigFra: null, gyldigTil: null, repetisjon: null, gjelderNaa: true },
  ],
};

const stallData: StallDagViewModel = {
  dato: "2026-09-29",
  spillere: [
    { id: "p1", navn: "Ola Testesen", okter: [{ id: "o1", tittel: "Wedge 50–90 m", status: "PUBLISHED", blockType: "OEKT", startMinute: 540, durationMinutes: 60, erUtkast: false, pyramid: "SLAG" }] },
    { id: "p2", navn: "Kari Prøvesen", okter: [{ id: "o2", tittel: "Styrke B", status: "DRAFT", blockType: "OEKT", startMinute: 960, durationMinutes: 60, erUtkast: true, pyramid: "FYS" }] },
    { id: "p3", navn: "Per Eksempel", okter: [] },
  ],
};

const FANE_IDER = [["uke", "Uke"], ["maned", "Måned"], ["ar", "År"], ["dag", "Dag"], ["stall", "Stall-dag"], ["tilg", "Tilgjengelighet"]] as const;
const faner = (aktiv: string) => FANE_IDER.map(([id, navn]) => ({ href: `?fane=${id}`, navn, aktiv: id === aktiv }));

const Skjelett = ({ children, periode, fane, nav = true }: { children: React.ReactNode; periode: string; fane: string; nav?: boolean }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side max={1480}>
      <SideHode kicker={`Kalender · ${periode}`} title="Kalender" sub="Dra en økt eller booking til ny dag og tid, eller åpne den og velg Flytt. Økter flyttes med en gang; bookinger får et forslag spilleren godtar." actions={<AG05Verktoylinje nyHendelseHref="/admin/kalender/hendelse/ny" nyBookingHref="/admin/bookinger/ny" />} />
      <FanerLenker faner={faner(fane)} />
      {nav && <AG05Periode forrige="#" idag="#" neste="#" />}
      {children}
    </Side>
  </AgencyOSSkall>
);

export const tilstander = {
  uke: <Skjelett periode={ukeData.periode} fane="uke"><AG05Uke data={ukeData} /></Skjelett>,
  dag: <Skjelett periode={dagData.periode} fane="dag"><AG05Uke data={dagData} dagIso="2026-09-29" /></Skjelett>,
  maned: <Skjelett periode={manedData.periode} fane="maned"><AG05Maned data={manedData} /></Skjelett>,
  ar: <Skjelett periode="År 2026" fane="ar"><AG05Aar data={aarData} /></Skjelett>,
  stall: <Skjelett periode="Stall-dag · 2026-09-29" fane="stall" nav={false}><AG05StallDag dato="2026-09-29" data={stallData} erIdag /></Skjelett>,
  tilg: <Skjelett periode="Tilgjengelighet" fane="tilg" nav={false}><AG05Tilg data={tilgData} /></Skjelett>,
  laster: <Skjelett periode={ukeData.periode} fane="uke"><LasterTilstand text="Henter kalenderen …" /></Skjelett>,
  feil: <Skjelett periode={ukeData.periode} fane="uke"><FeilTilstand icon={CalendarX} title="Kalenderen kunne ikke hentes" text="Ingen hendelser er endret." /></Skjelett>,
  stallFeil: <Skjelett periode="Stall-dag" fane="stall" nav={false}><AG05StallFeil melding="Ugyldig dato." /></Skjelett>,
  tom: <Skjelett periode={ukeData.periode} fane="uke"><AG05Uke data={{ ...ukeData, hendelser: [], turneringslag: { dager: DAGER.map(() => []), varsler: [] } }} /></Skjelett>,
  tomAar: <Skjelett periode="År 2027" fane="ar"><AG05Aar data={{ ...aarData, aar: 2027, maaneder: aarData.maaneder.map((m) => ({ ...m, bookinger: 0, okter: 0 })) }} /></Skjelett>,
  tomTilg: <Skjelett periode="Tilgjengelighet" fane="tilg" nav={false}><AG05Tilg data={{ ...tilgData, vinduer: [] }} /></Skjelett>,
};
