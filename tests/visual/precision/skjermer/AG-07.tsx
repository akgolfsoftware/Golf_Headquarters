/** Prøvefil for AG-07 Stall. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG07Stall } from "@/components/admin/precision/AG07Stall";
import type { StallBaandRad } from "@/lib/admin/stall-precision-data";

export const sti = "/admin/spillere";

const naa = new Date();
const iDag = new Date(naa); iDag.setHours(14, 30, 0, 0);
const igaar = new Date(naa); igaar.setDate(igaar.getDate() - 1);

function rad(over: Partial<StallBaandRad> & { id: string; name: string }): StallBaandRad {
  return {
    initials: "TS",
    hcp: "12,4",
    avatarUrl: null,
    sub: "",
    group: "WANG",
    coachName: null,
    coachInitials: null,
    tier: "konk",
    tierLabel: "PRO",
    oktDone: 2,
    oktPlanned: 3,
    hours30: 8,
    sgTrend: [0.2, 0.4, 0.1],
    sgDelta: 0.1,
    sgTone: "pos",
    adherence: [],
    adhPct: 78,
    status: "aktiv",
    statusLabel: "Aktiv",
    neverLoggedIn: false,
    dagerSiden: 0,
    pakke: "Performance",
    pakkeAktiv: true,
    skylder: false,
    nesteOkt: null,
    sisteOkt: null,
    avtaleUtlopIso: null,
    paagaaende: null,
    nesteOktLabel: "Ingen økt planlagt",
    sisteAktivitetLabel: "aldri aktiv",
    ...over,
  };
}

const spiller1 = rad({ id: "p1", name: "Test Spiller A med et navn som er langt nok til å teste brekk", nesteOkt: iDag, nesteOktLabel: "Neste: i dag 14.30" });
const spiller2 = rad({ id: "p2", name: "Test Spiller B", group: "GFGK", status: "bak", statusLabel: "Bak plan", adhPct: 32, paagaaende: { id: "s1", tittel: "Wedge 50–90 m", startMinute: 780, durationMinutes: 60 } });
const spiller3 = rad({ id: "p3", name: "Test Spiller C", group: "AKA", status: "hviler", statusLabel: "Planlagt pause", adhPct: null, sgTrend: [], sisteOkt: igaar, sisteAktivitetLabel: "økt i går", avtaleUtlopIso: new Date(naa.getFullYear(), naa.getMonth() + 1, 15).toISOString() });

const alle = [spiller1, spiller2, spiller3];

const Skall = ({ children }: { children: React.ReactNode }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall>
  </AdminRolleProvider>
);

const GRUPPE_FILTER = [
  { id: "alle", label: "Alle" },
  { id: "WANG", label: "WANG" },
  { id: "GFGK", label: "GFGK" },
  { id: "AKA", label: "AKA" },
] as const;

export const tilstander = {
  data: <Skall><AG07Stall total={alle.length} iDag={[spiller1]} trenerNaa={[spiller2]} heleStallen={alle} nyttGruppeFilter={GRUPPE_FILTER} /></Skall>,
  tom: <Skall><AG07Stall tilstand="tom" total={0} iDag={[]} trenerNaa={[]} heleStallen={[]} nyttGruppeFilter={GRUPPE_FILTER} /></Skall>,
};
