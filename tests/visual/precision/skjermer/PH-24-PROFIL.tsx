/** Prøvefil for PH-24 Profil i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Profil, type PH24ProfilData } from "@/components/portal/precision/PH24Profil";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/profil";

const demoData: PH24ProfilData = {
  navn: "Øyvind Rohjan",
  avatarUrl: null,
  epost: "oyvind.rohjan.med.lang.adresse@eksempel.no",
  mobil: "+47 900 00 000",
  hcp: 3.6,
  homeClub: "Gamle Fredrikstad Golfklubb",
  fodselsdatoISO: "2009-03-12",
  ambition: "Spille Srixon Tour og kvalifisere meg til NM junior.",
  spillerSiden: "august 2025",
  stallNavn: "WANG Toppidrett Fredrikstad",
  runderIAar: 42,
  ngfId: "123-4567",
  hcpMaalTekst: "2,0 innen november 2026",
  turneringer: {
    koblet: true, tomGrunn: "",
    rader: [
      { id: "t1", navn: "Srixon Tour 5, Kongsberg", dato: "27. sep. 2026", runder: "72, 74", brutto: 146, plassering: "9" },
      { id: "t2", navn: "Østlandstouren 4, Larvik golfklubb med et langt navn", dato: "13. sep. 2026", runder: "71, 73", brutto: 144, plassering: "4" },
    ],
  },
};

const tomData: PH24ProfilData = {
  navn: "Ny Spiller", avatarUrl: null, epost: "spiller@eksempel.no", mobil: null, hcp: null, homeClub: null, fodselsdatoISO: null,
  ambition: null, spillerSiden: "oktober 2026", stallNavn: null, runderIAar: 0, ngfId: null, hcpMaalTekst: null,
  turneringer: { koblet: false, rader: [], tomGrunn: "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den." },
};

const lagre = async () => ({ ok: true as const });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH24Profil data={demoData} onLagre={lagre} /></Skall>,
  tom: <Skall><PH24Profil data={tomData} onLagre={lagre} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Profilen kunne ikke hentes" /></Skall>,
};
