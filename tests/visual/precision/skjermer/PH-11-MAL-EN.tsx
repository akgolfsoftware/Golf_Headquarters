/** Prøvefil for Én målsetning i nytt design. Syntetiske data, ingen database. */
import { useEffect, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHMalsetning } from "@/components/portal/precision/PHMalsetning";
import type { MaalEnNy } from "@/lib/portal-mal/maal-ny";

export const sti = "/portal/mal/goal/g2";

const DATA: MaalEnNy = {
  id: "g2", navn: "SG Innspill til 0,0", kategori: "OUTCOME", status: "ACTIVE",
  overlinje: "Målsetning · År · frist 31. mai 2027", akse: "slag", akseTekst: "SLAG · Innspill",
  naa: "−0,90", enhet: "slag per runde", tempo: "bak", trendTekst: "Bak tidsplanen",
  fremdrift: { pst: 25, burdePst: 42, start: "−1,20", burde: "−0,70", maal: "0,00" },
  start: "−1,20", maal: "0,00",
  forklar: "Bak tidsplanen. I dette tempoet burde du vært på −0,70.", kildeTekst: "Snitt av de 10 siste rundene",
  kurve: {
    tittel: "Utviklingen", kilde: "SG Innspill per runde · 6 runder slag for slag",
    punkter: [["2026-06-02", -1.4], ["2026-06-20", -1.1], ["2026-07-15", -1.2], ["2026-08-10", -0.8], ["2026-09-27", -1.1], ["2026-10-04", -0.6]]
      .map(([dato, verdi]) => ({ dato: `${dato}T12:00:00Z`, verdi: verdi as number })),
  },
  malinger: [
    { id: "r1", tekst: "Runde, Fredrikstad GK", verdi: "−0,60", kilde: "4. okt. · slag for slag" },
    { id: "r2", tekst: "Runde, Gamle Fredrikstad Golfklubb", verdi: "−1,10", kilde: "27. sep. · slag for slag" },
    { id: "r3", tekst: "Runde, Fredrikstad GK", verdi: "—", kilde: "20. sep. · bare score, ikke slag for slag" },
  ],
  malingerTom: "Ingen målinger ennå. Fremdriften regnes ut når du har registrert en runde slag for slag.",
  okter: null, avsluttTekst: null, erEget: true,
  initial: { title: "SG Innspill til 0,0", category: "OUTCOME", type: "SG_AREA", targetValue: 0, targetDate: "2027-05-31", linkedPyramidArea: null, linkedTestId: null, sgOmrade: "APP", planNivaa: "AAR" },
};

const FREKVENS: MaalEnNy = {
  ...DATA, id: "g3", navn: "2 FYS-økter per uke", kategori: "PROCESS", overlinje: "Målsetning · Periode · uten frist",
  akse: "fys", akseTekst: "FYS · Fysisk", naa: null, enhet: "økter siste 7 dager", tempo: "ingen-data", trendTekst: "Ingen målinger",
  fremdrift: null, start: null, maal: "2", forklar: "Ingen fysisk-økter logget ennå", kildeTekst: "Gjennomførte økter siste 7 dager",
  kurve: null, malinger: [], malingerTom: "Ingen målinger over tid ennå. Fremdriften er antallet i det rullerende vinduet.",
  okter: { kilde: "Ingen fysisk-økter logget ennå", liste: [
    { id: "o1", tid: "Tor 22. okt. · 16:00", navn: "Styrke og rotasjon", info: ["60 min", "Treningssenteret"], akse: "fys" },
    { id: "o2", tid: "Man 26. okt. · 07:00", navn: "Mobilitet hofte", info: ["45 min"], akse: "fys" },
  ] },
  initial: { ...DATA.initial, type: "SESSION_FREQUENCY", category: "PROCESS", linkedPyramidArea: "FYS", sgOmrade: null },
};

function Klikk({ velger, children }: { velger: string; children: ReactNode }) {
  useEffect(() => {
    const [sel, tekst] = velger.split("::");
    setTimeout(() => [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.textContent?.includes(tekst))?.click(), 0);
  }, [velger]);
  return <>{children}</>;
}

const Vis = (p: Parameters<typeof PHMalsetning>[0]) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}><PHMalsetning testOptions={[{ id: "t1", name: "Innspilltest 100–150 m" }]} {...p} /></PlayerHQSkall>
);

export const tilstander = {
  data: <Vis data={DATA} />,
  tom: <Vis data={FREKVENS} />,
  endre: <Klikk velger="button::Endre målsetning"><Vis data={DATA} /></Klikk>,
  avslutt: <Klikk velger="button::Avslutt"><Vis data={DATA} /></Klikk>,
  laster: <Vis data={null} state="laster" />,
  feil: <Vis data={null} state="feil" onRetry={() => {}} />,
};
