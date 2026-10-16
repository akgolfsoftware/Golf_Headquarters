/** Prøvefil for PH-11-MAL Målsetninger i nytt design (pakke 3). Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHMalsetninger } from "@/components/portal/precision/PHMalsetninger";
import type { MaalKortNy, MaalListeData } from "@/lib/portal-mal/maal-ny";

export const sti = "/portal/mal";

const kort = (m: Partial<MaalKortNy> & Pick<MaalKortNy, "id" | "navn">): MaalKortNy => ({
  kategori: "OUTCOME", niva: "AAR", nivaKilde: "valgt", fristTekst: "frist 31. mai 2027", akse: null, akseTekst: null,
  start: null, naa: null, maal: null, pst: null, burdePst: null, tempo: "i-rute", statusTekst: "", kildeTekst: null, ...m,
});

const GOALS: MaalKortNy[] = [
  kort({ id: "g1", navn: "HCP under 3,0", start: null, naa: "4,1", maal: "3,0", pst: 98, tempo: "i-rute", statusTekst: "4.1 nå · trenger 1.1 til", kildeTekst: "HCP i profilen din" }),
  kort({ id: "g2", navn: "SG Innspill til 0,0", akse: "slag", akseTekst: "SLAG · Innspill", start: "−1,20", naa: "−0,90", maal: "0,00", pst: 25, burdePst: 42, tempo: "bak", statusTekst: "Bak tidsplanen. I dette tempoet burde du vært på −0,70.", kildeTekst: "Snitt av de 10 siste rundene" }),
  kort({ id: "g3", navn: "2 FYS-økter per uke i grunnperioden, også i skoleuker med prøver", kategori: "PROCESS", niva: "PERIODE", nivaKilde: "foreslatt", fristTekst: "frist 29. november 2026", akse: "fys", akseTekst: "FYS · Fysisk", naa: "2", maal: "2", pst: 100, tempo: "nadd", statusTekst: "Målsetningen er nådd.", kildeTekst: "Gjennomførte økter siste 7 dager" }),
  kort({ id: "g4", navn: "Innspilltest: 13 av 20 innenfor 8 m", niva: "MANED", fristTekst: "frist 25. oktober 2026", maal: "13,00 p", tempo: "ingen-data", statusTekst: "Ingen testresultat registrert ennå", kildeTekst: "Siste resultat i Innspilltest 100–150 m" }),
];

const DATA: MaalListeData = { goals: GOALS, milepael: { tittel: "HCP gikk ned", dato: "4. oktober 2026" } };
const AVSLUTTET: MaalKortNy[] = [kort({ id: "a1", navn: "10 runder i sommer", tempo: "nadd", statusTekst: "Nådd 30. august 2026." })];

const Vis = (p: Parameters<typeof PHMalsetninger>[0]) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}><PHMalsetninger {...p} /></PlayerHQSkall>
);

export const tilstander = {
  data: <Vis data={DATA} avsluttede={AVSLUTTET} visIup />,
  tom: <Vis data={{ goals: [], milepael: null }} />,
  laster: <Vis data={DATA} state="laster" />,
  feil: <Vis data={DATA} state="feil" onRetry={() => {}} />,
};
