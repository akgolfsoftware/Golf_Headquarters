/** Prøvefil for AG-15 Tester. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG15Tester } from "@/components/admin/precision/AG15Tester";
import type { AdminTesterV2Data } from "@/components/admin/v2/AdminTesterV2";
import { byggTesterOversikt, type OversiktResultat } from "@/lib/admin/tester/oversikt-bygg";
import type { TesterOversiktSide } from "@/lib/admin/tester/oversikt-data";

export const sti = "/admin/tester";

const data: AdminTesterV2Data = {
  kpis: [
    { label: "Tester utført", value: "24" },
    { label: "Tester i bruk", value: "6", accent: true },
    { label: "Sist uke", value: "5" },
    { label: "Pågår nå", value: "1", varsle: true },
  ],
  tester: ["9 hull lengde", "Putt Speed", "Wedge Gate"],
  rader: [
    { key: "s1", spillerId: "p1", navn: "Test Spiller En", test: "Wedge Gate", resultat: "—", delta: null, deltaDir: null, dato: "28.09", status: "Pågår" },
    { key: "r1", spillerId: "p2", navn: "Test Spiller To", test: "9 hull lengde", resultat: "212 m", delta: "+4 m", deltaDir: "up", dato: "24.09", status: "Bedre" },
    { key: "r2", spillerId: "p3", navn: "Ingrid Berg med et langt navn som må brytes", test: "Putt Speed", resultat: "1,8 m/s", delta: "−0,1 m/s", deltaDir: "down", dato: "20.09", status: "Svakere" },
    { key: "r3", spillerId: "p4", navn: "Emil Solberg", test: "9 hull lengde", resultat: "198 m", delta: null, deltaDir: null, dato: "18.09", status: "Stabilt" },
  ],
};

const tom: AdminTesterV2Data = { ...data, rader: [] };

/** Syntetisk stall: oppdiktede navn, bygget med den ekte byggefunksjonen. */
const now = new Date("2026-10-20T10:00:00Z");
const navnListe = ["Henrik Aas", "Emma Berg", "Mats Lie", "Ida Strand", "Øyvind Rohjan", "Tobias Lindvik med et langt etternavn", "Jonas Bakke", "Sara Holm"];
const testNavn = ["Driver Basic", "Inspill Basis", "Wedge Variation", "8-ball Variation", "Putt 1-3m", "Golfslag på banen", "18 hulls inspill", "9 hull lengde", "Driver Gate", "Wedge Gate", "TN Putt Gate", "TN Nærspill Gate", "TN VISA Express", "Putt Speed 1x5", "Benkpress", "Trapbar Deadlift", "Standing Long Jump", "Ball Throw", "Clubhead Speed (CHS)"];
let n = 0;
const res: OversiktResultat[] = navnListe.flatMap((_, s) => testNavn.flatMap((t, i): OversiktResultat[] => {
  const k = (s * 7 + i * 3) % 11;
  if (k === 0 || k === 5) return [];
  const dagerSiden = k === 3 ? 60 : 2 + ((s + i) % 30);
  const ganger = i < 5 ? 1 + ((s + i) % 3) : 1;
  return Array.from({ length: ganger }, (_, g) => ({
    id: `r${++n}`, userId: `p${s}`, takenAt: new Date(now.getTime() - (dagerSiden + g * 3) * 86_400_000), test: { id: `d${i}`, name: t },
    recordedById: k % 2 ? "coach" : null, witnessStatus: k === 4 ? "ATTESTED" : "PENDING", visning: i === 10 ? "7 / 10 OK" : "PEI 3,1 %",
  }));
}));
const oversikt: TesterOversiktSide = {
  ...byggTesterOversikt(navnListe.map((navn, i) => ({ id: `p${i}`, navn })), res, now),
  grupper: [{ id: "g1", navn: "GFGK Junior Utvikling", antall: 8 }, { id: "g2", navn: "WANG Toppidrett", antall: 11 }],
  gruppeId: "g1",
  spillerValg: navnListe.map((navn, i) => ({ id: `p${i}`, navn })),
  nesteTestdag: { dato: "29.10", ukedag: "torsdag", sted: "Mulligan", tittel: "Testdag", gruppe: "GFGK Junior Utvikling", deltakere: 8, dagerTil: 9 },
};
const oversiktTom: TesterOversiktSide = { ...byggTesterOversikt([], [], now), grupper: [], gruppeId: null, spillerValg: [], nesteTestdag: null };

const Vis = (d: AdminTesterV2Data = data, o: TesterOversiktSide | null = oversikt) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG15Tester data={d} oversikt={o} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

const valg = {
  tester: [{ id: "t1", navn: "Nærspill Gate" }, { id: "t2", navn: "Driver Basic" }, { id: "t3", navn: "Putt 1–3 m" }],
  spillere: [{ id: "p1", navn: "Test Spiller A" }, { id: "p2", navn: "Test Spiller B" }],
};

export const tilstander = {
  data: Vis(),
  tom: Vis(tom, oversiktTom),
  tildel: (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Test Coach">
        <AG15Tester data={data} valg={valg} tildelSpillerId="p1" oversikt={oversikt} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  ),
};
