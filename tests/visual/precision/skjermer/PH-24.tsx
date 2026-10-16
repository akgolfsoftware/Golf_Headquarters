/** Prøvefil for PH-24 Meg i nytt design. Syntetiske data, demo: Øyvind Rohjan. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Meg, type PH24Props } from "@/components/portal/precision/PH24Meg";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg";

const hrefs: PH24Props["hrefs"] = { profil: "#", fasiliteter: "#", utstyr: "#", helse: "#", coach: "#", bookinger: "#", mal: "#", foreldre: "#", deling: "#", venner: "#", abo: "#", innstillinger: "#", hjelp: "#" };
const base: PH24Props = {
  tilstand: "data",
  navn: "Øyvind Rohjan",
  undertekst: "Gamle Fredrikstad Golfklubb med et langt navn · coach Anders Kristiansen",
  gruppe: "WANG Toppidrett Fredrikstad",
  kategori: null,
  hcp: "3,6",
  pakke: { navn: "Performance Pro", igjen: 2, totalt: 4 },
  niva: { navn: "Full", tekst: "inkludert i Performance Pro" },
  deling: 2,
  fasiliteter: { valgte: 7, totalt: 10, steder: 2 },
  utstyr: 8,
  helse: "Ingen skade registrert",
  coach: { navn: "Anders Kristiansen", program: "AK Golf Academy" },
  nesteBooking: "fredag 9. oktober kl. 16:00",
  foreldre: { navn: "Hilde Rohjan", antall: 1 },
  venner: 5,
  utfordringer: 1,
  hrefs,
};
const tom: Partial<PH24Props> = {
  undertekst: null, gruppe: null, hcp: null, pakke: null, niva: { navn: "Gratis", tekst: "Full gir Plan, Workbench og Caddie" }, deling: 0,
  fasiliteter: { valgte: 0, totalt: 10, steder: 0 }, utstyr: 0, helse: "Helse-loggen er slått av", coach: null, nesteBooking: null,
  foreldre: { navn: null, antall: 0 }, venner: 0, utfordringer: 0,
};
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
export const tilstander = {
  data: <Skall><PH24Meg {...base} /></Skall>,
  tom: <Skall><PH24Meg {...base} {...tom} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Profilen kunne ikke hentes" /></Skall>,
};
