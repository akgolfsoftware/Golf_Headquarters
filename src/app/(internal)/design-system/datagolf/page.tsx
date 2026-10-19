/**
 * Visningsside for Data Golf-komponentene — /design-system/datagolf.
 * Bare ADMIN (layouten) og Data Golf-porten. Alle tall her er syntetiske eksempler laget for å vise
 * tilstandene; de er ikke Data Golf-data og forlater aldri denne siden.
 */
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { ApproachSkill, RundeTrend, SgProfil, SpillerKort, TourDekning } from "@/components/datagolf";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import type { ApproachRaa, DgSgRunde, SpillerKortData, TourDekningRad } from "@/lib/datagolf/visning";
import "@/styles/agencyos-ny.css";

export const metadata = { title: "Data Golf-komponenter · AK Golf HQ (intern)" };

const EKS_RUNDER: DgSgRunde[] = Array.from({ length: 36 }, (_, i) => {
  const total = Math.round((Math.sin(i / 4) * 1.4 + (i % 5) * 0.25 - 0.4) * 100) / 100;
  const kat = i % 4 !== 3;
  return {
    id: i + 1, dato: `2026-${String(1 + Math.floor(i / 6)).padStart(2, "0")}-${String(3 + (i % 6) * 4).padStart(2, "0")}`,
    tour: "pga", arrangement: `Eksempelturnering ${Math.floor(i / 4) + 1}`, runde: (i % 4) + 1,
    total: i === 9 ? null : total,
    ott: kat ? Math.round(total * 30) / 100 : null, app: kat ? Math.round(total * 40) / 100 : null,
    arg: kat ? Math.round(total * 10) / 100 : null, putt: kat ? Math.round(total * 20) / 100 : null,
  };
});
const EKS_UTEN_KATEGORI: DgSgRunde[] = EKS_RUNDER.map(r => ({ ...r, tour: "euro", ott: null, app: null, arg: null, putt: null }));
const EKS_DEKNING: TourDekningRad[] = [
  { tour: "pga", antallRunder: 1000, medTotal: 1000, medKategori: 710, fraAar: 2017, tilAar: 2026 },
  { tour: "euro", antallRunder: 600, medTotal: 600, medKategori: 0, fraAar: 2017, tilAar: 2026 },
  { tour: "ngl", antallRunder: 240, medTotal: 180, medKategori: 0, fraAar: 2019, tilAar: 2026 },
  { tour: "liv", antallRunder: 90, medTotal: 90, medKategori: 90, fraAar: 2022, tilAar: 2026 },
];
const EKS_APPROACH: ApproachRaa = {
  asOf: "2026-10-19", period: "l24",
  payload: {
    "50_100_fw_sg_per_shot": 0.06, "50_100_fw_proximity_per_shot": 14.2, "50_100_fw_gir_rate": 0.88, "50_100_fw_shot_count": 410,
    "100_150_fw_sg_per_shot": 0.11, "100_150_fw_proximity_per_shot": 19.8, "100_150_fw_gir_rate": 0.84, "100_150_fw_shot_count": 980,
    "150_200_fw_sg_per_shot": -0.04, "150_200_fw_proximity_per_shot": 33.1, "150_200_fw_gir_rate": 0.62, "150_200_fw_shot_count": 720,
    "under_150_rgh_sg_per_shot": -0.09, "under_150_rgh_proximity_per_shot": 27.4, "under_150_rgh_gir_rate": 0.7, "under_150_rgh_shot_count": 18,
  },
};
const EKS_SPILLER: SpillerKortData = {
  dgId: 1, navn: "Eksempel Spiller", land: "NOR", fodselsaar: 1998, amator: false, norsk: true, dgRang: 42, owgrRang: 55,
  primaerTour: "euro", sgTotal: 0.83, kildedato: "2026-10-19", antallRunder: 612, fraAar: 2017, tilAar: 2026,
};

function Del({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return <section style={{ display: "grid", gap: 16 }}><h2 className="undertittel" style={{ fontSize: 16 }}>{tittel}</h2>{children}</section>;
}

export default async function DataGolfKomponenterSide() {
  await krevDataGolfBruker("/design-system/datagolf");
  return <div className="agn-s" style={{ padding: "24px 16px", display: "grid", gap: 40, maxWidth: 1040, margin: "0 auto" }}>
    <Topp dato="Intern · bare coach og admin" tittel="Data Golf-komponenter"
      ingress="Alle tall på denne siden er syntetiske eksempler som viser tilstandene. Komponentene skal bare brukes bak Data Golf-porten (krevDataGolfBruker)." />

    <Del tittel="Spillerkort med SG-profil og rundeserie">
      <SpillerKort resultat={{ tilstand: "klar", data: EKS_SPILLER }}>
        <SgProfil resultat={{ tilstand: "klar", data: EKS_RUNDER }} />
        <RundeTrend resultat={{ tilstand: "klar", data: EKS_RUNDER }} />
      </SpillerKort>
    </Del>

    <Del tittel="SG-profil: tour uten kategori-SG (DP World Tour)">
      <SgProfil resultat={{ tilstand: "klar", data: EKS_UTEN_KATEGORI }} />
    </Del>

    <Del tittel="Tour-dekning"><TourDekning resultat={{ tilstand: "klar", data: EKS_DEKNING }} /></Del>

    <Del tittel="Approach-skill (fire bøtter mangler, én har tynt grunnlag)">
      <ApproachSkill resultat={{ tilstand: "klar", data: EKS_APPROACH }} />
    </Del>

    <Del tittel="Laster">
      <SgProfil resultat={{ tilstand: "laster" }} /><RundeTrend resultat={{ tilstand: "laster" }} />
    </Del>
    <Del tittel="Tom">
      <SgProfil resultat={{ tilstand: "tom" }} /><TourDekning resultat={{ tilstand: "tom" }} /><ApproachSkill resultat={{ tilstand: "tom" }} />
    </Del>
    <Del tittel="Datasett ikke satt opp">
      <ApproachSkill resultat={{ tilstand: "ikke-konfigurert" }} />
    </Del>
    <Del tittel="Feil">
      <RundeTrend resultat={{ tilstand: "feil" }} />
    </Del>
    <Del tittel="Ingen tilgang (rendrer ingenting)">
      <p className="forklar">Under denne linjen skal det ikke stå noe.</p>
      <SpillerKort resultat={{ tilstand: "ingen-tilgang" }} />
      <hr style={{ border: 0, borderTop: "1px solid var(--sand-300)", width: "100%" }} />
    </Del>
  </div>;
}
