/** Prøvefil for AG-16b Gruppas årsplan. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG16bArsplan, type AG16bTilstand } from "@/components/admin/precision/AG16bArsplan";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

export const sti = "/admin/grupper/g1/arsplan";
export const natt = ["data-natt"];

const gruppe = { id: "g1", navn: "Testgruppe A med et langt navn som må kunne brytes" };
const data: GruppeKalenderData = {
  gruppeId: "g1", gruppeNavn: gruppe.navn,
  faste: [
    { id: "f1", weekday: 1, startTime: "08:00", endTime: "10:00", title: "Fast trening på Testbanen range med langt navn" },
    { id: "f2", weekday: 3, startTime: "08:00", endTime: "10:00", title: "Fast trening" },
  ],
  perioder: [
    { id: "p1", name: "Grunnperiode", startDate: "2026-08-17T00:00:00.000Z", endDate: "2026-11-01T00:00:00.000Z", tone: "primary", note: "Teknikk og fysisk grunnlag", kompetansemal: [{ id: "k1", classYear: "VG1", curriculumCode: "IDR05-02", goalNumber: 1, text: "Test" }] },
    { id: "p2", name: "Spesialisering", startDate: "2026-11-01T00:00:00.000Z", endDate: "2027-03-01T00:00:00.000Z", tone: "accent", note: null, kompetansemal: [] },
  ],
  samlinger: [{ id: "s1", title: "Høstsamling", startAt: "2026-10-10T07:00:00.000Z", endAt: "2026-10-10T15:00:00.000Z", kind: "HELDAGSSAMLING", location: "Testanlegget" }],
  skoleHendelser: [
    { id: "h1", classYear: "VG1", date: "2026-10-05T00:00:00.000Z", category: "PROVE", title: "Norsk hovedmål", note: null },
    { id: "h2", classYear: null, date: "2026-10-19T00:00:00.000Z", category: "FERIE", title: "Høstferie", note: "Hele uken" },
  ],
  turneringer: [{ id: "t1", navn: "Testturnering junior med langt navn som må brytes over flere linjer", serie: "Østlandstour", tone: "primary", startDate: "2026-10-12T00:00:00.000Z", endDate: "2026-10-14T00:00:00.000Z", slug: "test", location: "Testbanen" }],
};

const Vis = (t: AG16bTilstand, d: GruppeKalenderData | null = data, trinn: string | null = null) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AG16bArsplan tilstand={t} gruppe={gruppe} data={d} trinn={trinn} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis("data"),
  "data-natt": Vis("data", data, "VG1"),
  tom: Vis("tom", null),
  laster: Vis("laster", null),
  feil: Vis("feil", null),
};
