/** Prøvefil for AG-19 Jarvis i nytt design. Syntetiske data; samtalen sender ingenting i prøven. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG19Jarvis } from "@/components/admin/precision/AG19Jarvis";
import type { AG19Data } from "@/components/admin/precision/AG19CaddieHub";

export const sti = "/admin/jarvis";

const data: AG19Data = {
  runs: [
    { id: "r1", agent: "Morgenbrief", st: "Kjørt", t: "17.10 06:00", dur: "4 s" },
    { id: "r2", agent: "Plan-vakt med et langt navn som må brytes pent", st: "Feilet", t: "17.10 05:30", dur: "—", err: "Kjøringen feilet. Detaljer ligger i feilloggen." },
  ],
  projects: [],
  skills: [["s1", "Ukesrapport", "Lager utkast hver fredag", true], ["s2", "Lead-oppfølging", "Utkast etter booking", false]],
};

export const tilstander = {
  headcoach: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG19Jarvis conversationId="prove" data={data} /></AgencyOSSkall></AdminRolleProvider>,
  coach: <AdminRolleProvider erAdmin={false}><AgencyOSSkall navn="Test Assistent"><AG19Jarvis conversationId={null} data={{ ...data, runs: [] }} /></AgencyOSSkall></AdminRolleProvider>,
};
