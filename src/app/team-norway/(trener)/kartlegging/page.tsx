import { KartleggingSkjerm } from "@/components/team-norway/tn-daglig-spillere/kartlegging-skjerm";

export const metadata = {
  title: "Team Norway Golf · Kartlegging",
  description: "Testdata for spillerne: hvem som har levert, og alle resultater.",
};

function forste(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Kartlegging (tegningens id «kartlegging», uten TN-kode). Fasit: «Team Norway App.dc.html». */
export default async function TnKartleggingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const s = await searchParams;
  return <KartleggingSkjerm sok={{ skole: forste(s.skole), klasse: forste(s.klasse), test: forste(s.test), periode: forste(s.periode) }} />;
}
