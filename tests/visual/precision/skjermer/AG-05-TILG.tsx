/** Prøvefil for AG-05-TILG (/admin/availability). Syntetiske data, ingen ekte spillere. */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, LasterTilstand, Meta } from "@/components/precision/pa";
import { Kort, Side, SideHode } from "@/components/precision/pa-a4";
import { AG05Tilgjengelighet, Vinduskjema, type TilgjengelighetData, type VinduRad } from "@/components/admin/precision/AG05Tilgjengelighet";

export const sti = "/admin/availability";
export const natt = ["data-natt", "uke-natt"];

const STEDER = [{ id: "s1", name: "Studio 1" }, { id: "s2", name: "Utebane" }];

const vindu = (id: string, tid: string, meta: string, av = false): VinduRad => {
  const [startTime, endTime] = tid.split("–");
  return {
    id, tidLabel: tid, metaLabel: meta, slukket: av,
    skjema: { id, weekday: 1, date: null, startTime, endTime, active: !av, locationId: "s1", validFrom: null, validTo: null, recurrenceInterval: 1 },
  };
};

const VINDUER: VinduRad[] = [
  vindu("v1", "15:00–19:00", "Man · Studio 1"),
  vindu("v2", "15:00–19:00", "Tir · Studio 1"),
  vindu("v3", "10:00–14:00", "Lør · Utebane · (av)", true),
];

// Oktober 2026 starter på torsdag.
const CELLER = Array.from({ length: 35 }, (_, i) => {
  const dag = i - 3 + 1;
  if (dag < 1 || dag > 31) return { dag: null, range: null, erIdag: false };
  const ukedag = i % 7;
  return { dag, range: ukedag === 0 || ukedag === 1 ? "15:00–19:00" : null, erIdag: dag === 1 };
});

const faner = (v: "maaned" | "uke" | "aar") => [
  { href: "?v=maaned", navn: "Måned", aktiv: v === "maaned" },
  { href: "?v=uke", navn: "Uke", aktiv: v === "uke" },
  { href: "?v=aar", navn: "År", aktiv: v === "aar" },
];

const data = (v: "maaned" | "uke" | "aar", tom = false): TilgjengelighetData => ({
  visning: v, aar: 2026, mndNavn: "Oktober 2026", forrigeHref: "#", nesteHref: "#",
  celler: tom ? CELLER.map((c) => ({ ...c, range: null })) : CELLER,
  steder: STEDER,
  ukeVinduer: tom ? [] : [
    { id: "v1", weekday: 0, startTime: "15:00", endTime: "19:00", locationName: "Studio 1" },
    { id: "v2", weekday: 1, startTime: "15:00", endTime: "19:00", locationName: "Studio 1" },
  ],
  aarsVinduer: tom ? [] : [
    { id: "v1", locationName: "Studio 1", label: "Man · 15:00–19:00", fraAndel: 0, tilAndel: 1 },
    { id: "v2", locationName: "Utebane", label: "Lør · 10:00–14:00 · annenhver uke", fraAndel: 0.25, tilAndel: 0.7 },
  ],
  aarForrigeHref: "#", aarNesteHref: "#", faner: faner(v),
  vinduer: tom ? [] : VINDUER,
});

const Sync = () => (
  <Kort gap={12}>
    <span className="kicker">Google Calendar</span>
    <h2 style={{ margin: 0, font: "600 17px/1.3 var(--font-sans)" }}>Koble kalender og velg hva som blokkerer booking</h2>
    <Meta>FAMILIE-, JOBB- OG MØTEKALENDERE DU HUKER AV BLOKKERER BOOKING-TID</Meta>
  </Kort>
);

const Skjelett = ({ children }: { children: React.ReactNode }) => (
  <AgencyOSSkall navn="Test Coach">
    <Side max={1200}>
      <SideHode kicker="Kalender · Tilgjengelighet" title="Tilgjengelighet" sub="Sett tidsvinduene du er tilgjengelig, per anlegg. Grønne dager er åpne for booking. Du kan aldri være tilgjengelig to steder samtidig." />
      {children}
    </Side>
  </AgencyOSSkall>
);

export const tilstander = {
  data: <Skjelett><AG05Tilgjengelighet data={data("maaned")} /><Sync /></Skjelett>,
  "data-natt": <Skjelett><AG05Tilgjengelighet data={data("maaned")} /><Sync /></Skjelett>,
  uke: <Skjelett><AG05Tilgjengelighet data={data("uke")} /><Sync /></Skjelett>,
  "uke-natt": <Skjelett><AG05Tilgjengelighet data={data("uke")} /><Sync /></Skjelett>,
  aar: <Skjelett><AG05Tilgjengelighet data={data("aar")} /><Sync /></Skjelett>,
  tom: <Skjelett><AG05Tilgjengelighet data={data("maaned", true)} /><Sync /></Skjelett>,
  skjema: <Skjelett><AG05Tilgjengelighet data={data("maaned")} /><Vinduskjema steder={STEDER} initial={VINDUER[0].skjema} open onClose={() => {}} /></Skjelett>,
  laster: <AgencyOSSkall navn=""><div className="pa-side"><LasterTilstand text="Henter tilgjengeligheten …" /></div></AgencyOSSkall>,
  feil: <AgencyOSSkall navn=""><div className="pa-side"><FeilTilstand icon={CalendarX} title="Tilgjengeligheten kunne ikke hentes" text="Ingen tidsvinduer er endret. Bookinger fra spillere tas vare på." /></div></AgencyOSSkall>,
};
