/** Prøvefil for Gruppe · Faste tider og Skoledata. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { GruppeFanerNy } from "@/components/admin/precision/AG16Gruppe";
import { AG16Timeplan, type GruppeTimeplanData, type TimeplanRad } from "@/components/admin/precision/AG16Timeplan";
import { SkoledataForm } from "@/app/admin/grupper/[id]/arsplan/skoledata/skoledata-form";

export const sti = "/admin/grupper/g1/timeplan";

const rad = (id: string, title: string, startAt: string, endAt: string, recurring: string | null): TimeplanRad => ({
  id, title, description: null, startAt, endAt, location: "Bossum", recurring, maxParticipants: 12,
});
const data: GruppeTimeplanData = {
  groupId: "g1", navn: "Testgruppe Utvikling", totaltAntall: 4, focusId: null,
  faste: [rad("f1", "Gruppetrening", "2026-10-20T12:00:00Z", "2026-10-20T13:30:00Z", "WEEKLY"), rad("f2", "Gruppetrening med et ganske langt navn som må brytes", "2026-10-23T13:00:00Z", "2026-10-23T14:30:00Z", "WEEKLY")],
  kommende: [rad("k1", "Heldagssamling", "2026-10-24T08:00:00Z", "2026-10-24T14:00:00Z", null)],
  tidligere: [rad("t1", "Spill på banen", "2026-10-08T14:00:00Z", "2026-10-08T16:00:00Z", null)],
};

const Skall = ({ tittel, aktiv, children }: { tittel: string; aktiv: "tider" | "skoledata"; children: React.ReactNode }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/grupper/g1", tekst: "Gruppa" }} dato="Testgruppe Utvikling" tittel={tittel} />
        <GruppeFanerNy groupId="g1" aktiv={aktiv} />
        {children}
      </div>
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  timeplan: <Skall tittel="Timeplan" aktiv="tider"><AG16Timeplan data={data} onOpprett={async () => ({ ok: true as const })} onDupliser={async () => {}} /></Skall>,
  skoledata: <Skall tittel="Legg inn skoledata" aktiv="skoledata"><SkoledataForm groupId="g1" /></Skall>,
};
