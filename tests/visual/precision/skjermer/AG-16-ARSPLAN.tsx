/** Prøvefil for Gruppe · Årsplan (/admin/grupper/[id]/arsplan). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { GruppeFanerNy } from "@/components/admin/precision/AG16Gruppe";
import { AG16Arsplan } from "@/components/admin/precision/AG16Arsplan";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

export const sti = "/admin/grupper/g1/arsplan";

const idag = new Date();
const aar = idag.getUTCMonth() >= 7 ? idag.getUTCFullYear() : idag.getUTCFullYear() - 1;
const d = (m: number, dag: number) => new Date(Date.UTC(aar + (m < 7 ? 1 : 0), m, dag)).toISOString();
const iM = (dag: number, t = "16:00") => new Date(Date.UTC(idag.getUTCFullYear(), idag.getUTCMonth(), dag, Number(t.slice(0, 2)) - 2, 0)).toISOString();

const data: GruppeKalenderData = {
  gruppeId: "g1",
  gruppeNavn: "Testgruppe Utvikling",
  faste: [
    { id: "f1", weekday: 1, startTime: "14:00", endTime: "15:30", title: "Gruppetrening" },
    { id: "f2", weekday: 4, startTime: "15:00", endTime: "16:30", title: "Gruppetrening" },
  ],
  perioder: [
    { id: "p1", name: "Grunnperiode", startDate: d(9, 1), endDate: d(11, 1), tone: "primary", note: null, kompetansemal: [] },
    { id: "p2", name: "Spesialperiode", startDate: d(0, 1), endDate: d(3, 1), tone: "accent", note: "Mer spill på bane", kompetansemal: [{ id: "k1", classYear: "VG1", curriculumCode: "IDR", goalNumber: 2, text: "Planlegge og gjennomføre treningsøkter" }] },
    { id: "p3", name: "Turneringsperiode", startDate: d(3, 1), endDate: d(8, 1), tone: "primary", note: null, kompetansemal: [] },
  ],
  samlinger: [
    { id: "s1", title: "Spill på banen, ni hull", startAt: iM(22), endAt: iM(22, "18:00"), kind: "SAMLING", location: "Bossum" },
    { id: "s2", title: "Heldagssamling vinterbane", startAt: iM(24, "10:00"), endAt: iM(24, "16:00"), kind: "HELDAGSSAMLING", location: "Mulligan" },
  ],
  skoleHendelser: [
    { id: "h1", classYear: "VG1", date: new Date(Date.UTC(idag.getUTCFullYear(), idag.getUTCMonth(), 12)).toISOString(), category: "PROVE", title: "Norsk", note: null },
    { id: "h2", classYear: null, date: new Date(Date.UTC(idag.getUTCFullYear(), idag.getUTCMonth(), 19)).toISOString(), category: "FERIE", title: "Høstferie", note: null },
  ],
  turneringer: [
    { id: "t1", navn: "Regionscup finale", serie: "Østlandstour", tone: "primary", startDate: new Date(Date.UTC(idag.getUTCFullYear(), idag.getUTCMonth(), 8)).toISOString(), endDate: null, slug: null, location: "Bossum" },
  ],
};

const Vis = (g: GruppeKalenderData | null) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/grupper/g1", tekst: "Gruppa" }} dato="Testgruppe Utvikling · årsplan" tittel="Årsplan" />
        <GruppeFanerNy groupId="g1" aktiv="arsplan" />
        {g ? <AG16Arsplan groupId="g1" data={g} trinn={null} /> : null}
      </div>
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis(data),
  tom: Vis({ ...data, perioder: [], samlinger: [], faste: [], skoleHendelser: [], turneringer: [] }),
};
